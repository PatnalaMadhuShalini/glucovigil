import type { Express } from "express";
import { Router } from "express";
import { storage } from "./storage";
import { healthDataSchema, type HealthDataWithPrediction } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(router: Router): Promise<void> {
  router.get("/ping", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Submit health data
  router.post("/health-data", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log("Received health data:", JSON.stringify(req.body, null, 2));

      // Validate the incoming data
      const validatedData = healthDataSchema.parse(req.body);

      // Calculate risk and predictions
      const prediction = calculateDiabetesRisk(validatedData);

      // Get existing achievements
      const existingData = await storage.getHealthDataByUserId(req.user.id);
      const existingAchievements = existingData.length > 0 ? existingData[0].achievements || [] : [];

      // Check and award achievements
      const achievements = checkAndAwardAchievements(validatedData, existingAchievements);

      // Prepare the complete health data record
      const completeHealthData: HealthDataWithPrediction = {
        ...validatedData,
        prediction,
        achievements,
        createdAt: new Date().toISOString()
      };

      console.log("Saving health data:", JSON.stringify(completeHealthData, null, 2));

      // Save to database
      const savedData = await storage.createHealthData(req.user.id, completeHealthData);
      console.log("Health data saved successfully:", JSON.stringify(savedData, null, 2));

      res.status(201).json(savedData);
    } catch (err) {
      console.error("Error processing health data:", err);
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid data format",
          errors: err.errors 
        });
      }
      res.status(500).json({ 
        message: "Failed to save health data",
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  });

  // Get user's health data
  router.get("/health-data", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const data = await storage.getHealthDataByUserId(req.user.id);
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

  // Blood pressure
  if (data.physiological.bloodPressure.systolic > 140 ||
      data.physiological.bloodPressure.diastolic > 90) {
    riskScore += 1;
  }

  // Blood sugar
  if (data.physiological.bloodSugar > 126) riskScore += 2;
  else if (data.physiological.bloodSugar > 100) riskScore += 1;

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

function generateRecommendations(riskScore: number, data: any): string[] {
  const recommendations: string[] = [];

  if (data.lifestyle.diet === "poor" || data.lifestyle.diet === "fair") {
    recommendations.push(
      "Improve your diet by including more whole grains, lean proteins, and vegetables",
      "Limit processed foods and sugary beverages"
    );
  }

  if (data.lifestyle.exercise === "none" || data.lifestyle.exercise === "light") {
    recommendations.push(
      "Increase physical activity - aim for at least 150 minutes of moderate exercise per week",
      "Consider activities like brisk walking, swimming, or cycling"
    );
  }

  if (data.physiological.bloodSugar > 100) {
    recommendations.push(
      "Monitor your blood sugar levels regularly",
      "Consider consulting with a healthcare provider about glucose management"
    );
  }

  if (riskScore > 5) {
    recommendations.push(
      "Schedule regular check-ups with your healthcare provider",
      "Consider getting a comprehensive diabetes screening"
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
  const achievements = [...existingAchievements];
  const now = new Date().toISOString();

  if (!existingAchievements.length) {
    achievements.push({
      id: "first_check",
      name: "Health Pioneer",
      description: "Completed your first health assessment",
      icon: "🎯",
      unlockedAt: now
    });
  }

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

  return achievements;
}