import type { Express } from "express";
import { Router } from "express";
import { storage } from "./storage";
import { healthDataSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(router: Router): Promise<void> {
  // Basic health check endpoint
  router.get("/ping", (req, res) => {
    console.log("Ping endpoint hit");
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Submit health data
  router.post("/health-data", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      console.log("Received health data:", req.body);
      const data = healthDataSchema.parse(req.body);

      // Calculate risk and predictions
      const prediction = calculateDiabetesRisk(data);

      // Get existing achievements
      const existingData = await storage.getHealthDataByUserId(req.user!.id);
      const existingAchievements = existingData.length > 0 ? existingData[0].achievements : [];

      // Check and award achievements
      const achievements = checkAndAwardAchievements(data, existingAchievements);

      const healthData = await storage.createHealthData(req.user!.id, {
        ...data,
        prediction,
        achievements,
        createdAt: new Date().toISOString()
      });

      console.log("Health data saved successfully:", healthData);
      res.status(201).json(healthData);
    } catch (err) {
      console.error("Error processing health data:", err);
      if (err instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid data format",
          errors: err.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to save health data",
          error: err instanceof Error ? err.message : "Unknown error"
        });
      }
    }
  });

  // Get user's health data
  router.get("/health-data", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const data = await storage.getHealthDataByUserId(req.user!.id);
      res.json(data);
    } catch (err) {
      console.error("Error fetching health data:", err);
      res.status(500).json({ 
        message: "Failed to fetch health data",
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  });
}

function calculateDiabetesRisk(data: any) {
  let riskScore = 0;

  // Age factor
  if (data.demographics.age > 45) riskScore += 2;
  if (data.demographics.age > 65) riskScore += 1;

  // BMI calculation
  const heightInMeters = data.physiological.height / 100;
  const bmi = data.physiological.weight / (heightInMeters * heightInMeters);
  if (bmi > 30) riskScore += 2;
  else if (bmi > 25) riskScore += 1;

  // Blood sugar
  if (data.physiological.bloodSugar > 126) riskScore += 2;
  else if (data.physiological.bloodSugar > 100) riskScore += 1;

  // Blood pressure
  if (data.physiological.bloodPressure.systolic > 140 ||
    data.physiological.bloodPressure.diastolic > 90) {
    riskScore += 1;
  }

  // Lifestyle factors
  if (data.lifestyle.smoking) riskScore += 1;
  if (data.lifestyle.alcohol) riskScore += 1;
  if (data.lifestyle.exercise === "none") riskScore += 1;
  if (data.lifestyle.diet === "poor") riskScore += 1;

  const level = riskScore <= 2 ? "low" : riskScore <= 5 ? "moderate" : "high";

  return {
    score: riskScore,
    level,
    recommendations: generateRecommendations(riskScore, data)
  };
}

function generateRecommendations(riskScore: number, data: any) {
  const recommendations = [];

  // Diet recommendations
  if (data.lifestyle.diet === "poor" || data.lifestyle.diet === "fair") {
    recommendations.push(
      "Improve your diet by including more whole grains, lean proteins, and vegetables",
      "Limit processed foods and sugary beverages"
    );
  }

  // Exercise recommendations
  if (data.lifestyle.exercise === "none" || data.lifestyle.exercise === "light") {
    recommendations.push(
      "Increase physical activity - aim for at least 150 minutes of moderate exercise per week",
      "Consider activities like brisk walking, swimming, or cycling"
    );
  }

  // Blood sugar recommendations
  if (data.physiological.bloodSugar > 100) {
    recommendations.push(
      "Monitor your blood sugar levels regularly",
      "Consider consulting with a healthcare provider about glucose management"
    );
  }

  // Additional recommendations for high risk
  if (riskScore > 5) {
    recommendations.push(
      "Schedule regular check-ups with your healthcare provider",
      "Consider getting a comprehensive diabetes screening",
      "Look into diabetes prevention programs in your area"
    );
  }

  return recommendations;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

function checkAndAwardAchievements(data: any, existingAchievements: Achievement[] = []): Achievement[] {
  const achievements = [...(existingAchievements || [])];
  const now = new Date().toISOString();

  // First Time Health Check Achievement
  if (!existingAchievements?.length) {
    achievements.push({
      id: "first_check",
      name: "Health Pioneer",
      description: "Completed your first health assessment",
      icon: "🎯",
      unlockedAt: now
    });
  }

  // Blood Sugar Control Achievement
  if (data.physiological.bloodSugar >= 70 && data.physiological.bloodSugar <= 100) {
    const hasAchievement = achievements.some(a => a.id === "blood_sugar_control");
    if (!hasAchievement) {
      achievements.push({
        id: "blood_sugar_control",
        name: "Blood Sugar Master",
        description: "Maintained healthy blood sugar levels",
        icon: "🎯",
        unlockedAt: now
      });
    }
  }

  // Healthy BMI Achievement
  const heightInMeters = data.physiological.height / 100;
  const bmi = data.physiological.weight / (heightInMeters * heightInMeters);
  if (bmi >= 18.5 && bmi <= 24.9) {
    const hasAchievement = achievements.some(a => a.id === "healthy_bmi");
    if (!hasAchievement) {
      achievements.push({
        id: "healthy_bmi",
        name: "BMI Champion",
        description: "Maintained a healthy BMI",
        icon: "⭐",
        unlockedAt: now
      });
    }
  }

  // Lifestyle Achievement
  if (data.lifestyle.exercise !== "none" && data.lifestyle.diet === "good") {
    const hasAchievement = achievements.some(a => a.id === "healthy_lifestyle");
    if (!hasAchievement) {
      achievements.push({
        id: "healthy_lifestyle",
        name: "Wellness Warrior",
        description: "Maintained a healthy lifestyle with regular exercise and good diet",
        icon: "🏃",
        unlockedAt: now
      });
    }
  }

  // Symptom Tracking Achievement
  if (data.symptoms) {
    const hasAchievement = achievements.some(a => a.id === "symptom_tracker");
    if (!hasAchievement) {
      achievements.push({
        id: "symptom_tracker",
        name: "Health Monitor",
        description: "Started tracking your symptoms",
        icon: "📋",
        unlockedAt: now
      });
    }
  }

  return achievements;
}