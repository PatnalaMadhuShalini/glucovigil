import type { Express } from "express";
import { Router } from "express";
import { storage } from "./storage";

export async function registerRoutes(router: Router): Promise<void> {
  // Basic health check endpoint
  router.get("/ping", (req, res) => {
    console.log("Ping endpoint hit");
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Basic protected endpoint to test auth
  router.get("/protected", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ message: "You have access to protected route" });
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

  // BMI-based recommendations
  const heightInMeters = data.physiological.height / 100;
  const bmi = data.physiological.weight / (heightInMeters * heightInMeters);
  if (bmi > 25) {
    recommendations.push(
      "Work on achieving a healthy weight through diet and exercise",
      "Consider consulting with a nutritionist for personalized meal planning"
    );
  }

  // Lifestyle recommendations
  if (data.lifestyle.smoking) {
    recommendations.push(
      "Consider smoking cessation programs or nicotine replacement therapy",
      "Consult your healthcare provider about smoking cessation options"
    );
  }

  if (data.lifestyle.alcohol) {
    recommendations.push(
      "Limit alcohol consumption",
      "Consider tracking your drinks and setting weekly limits"
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

function checkAndAwardAchievements(data: any, existingAchievements: any[] = []): Achievement[] {
  const achievements: Achievement[] = [...(existingAchievements || [])];
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

async function extractHealthData(text: string) {
  // Example patterns to extract health data
  const bloodSugarPattern = /blood sugar[:\s]+(\d+)/i;
  const bloodPressurePattern = /blood pressure[:\s]+(\d+)\/(\d+)/i;
  const heightPattern = /height[:\s]+(\d+(?:\.\d+)?)\s*cm/i;
  const weightPattern = /weight[:\s]+(\d+(?:\.\d+)?)\s*kg/i;

  const extractedData: any = {};

  const bloodSugarMatch = text.match(bloodSugarPattern);
  if (bloodSugarMatch) {
    extractedData.bloodSugar = parseFloat(bloodSugarMatch[1]);
  }

  const bloodPressureMatch = text.match(bloodPressurePattern);
  if (bloodPressureMatch) {
    extractedData.bloodPressure = {
      systolic: parseInt(bloodPressureMatch[1]),
      diastolic: parseInt(bloodPressureMatch[2])
    };
  }

  const heightMatch = text.match(heightPattern);
  if (heightMatch) {
    extractedData.height = parseFloat(heightMatch[1]);
  }

  const weightMatch = text.match(weightPattern);
  if (weightMatch) {
    extractedData.weight = parseFloat(weightMatch[1]);
  }

  return Object.keys(extractedData).length > 0 ? extractedData : null;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}