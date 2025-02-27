import type { Express } from "express";
import { Router } from "express";
import { storage } from "./storage";
import { healthDataSchema, type HealthDataWithPrediction, type Prediction } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(router: Router): Promise<void> {
  router.post("/health-data", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Ensure user.id exists
      if (!req.user?.id) {
        return res.status(400).json({ message: "Invalid user session" });
      }

      // Log request information
      console.log('Processing health data for user:', req.user.id);
      console.log('Raw request body:', JSON.stringify(req.body, null, 2));

      // Validate the incoming data against schema
      const validatedData = healthDataSchema.parse(req.body);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));

      // Calculate health prediction
      const prediction = calculateDiabetesRisk(validatedData);
      console.log('Calculated prediction:', JSON.stringify(prediction, null, 2));

      // Prepare complete health data record
      const completeHealthData: HealthDataWithPrediction = {
        ...validatedData,
        prediction,
        createdAt: new Date().toISOString(),
        achievements: [],
        nutritionPlan: undefined,
        exercisePlan: undefined,
        medicalRecords: null
      };

      console.log('Complete health data to save:', JSON.stringify(completeHealthData, null, 2));

      // Save to database with error handling
      try {
        const savedData = await storage.createHealthData(req.user.id, completeHealthData);
        console.log('Successfully saved health data:', JSON.stringify(savedData, null, 2));
        res.status(201).json(savedData);
      } catch (dbError) {
        console.error('Database error while saving health data:', dbError);
        throw new Error('Failed to save health data to database');
      }
    } catch (err) {
      console.error('Error processing health data:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');

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

  router.get("/health-data", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.user?.id) {
        return res.status(400).json({ message: "Invalid user session" });
      }

      const data = await storage.getHealthDataByUserId(req.user.id);
      res.json(data);
    } catch (err) {
      console.error('Error fetching health data:', err);
      res.status(500).json({
        message: "Failed to fetch health data",
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  });
}

function calculateDiabetesRisk(data: {
  demographics: { age: number };
  physiological: {
    height: number;
    weight: number;
    bloodPressure: { systolic: number; diastolic: number };
    bloodSugar: number;
  };
  lifestyle: {
    exercise: string;
    diet: string;
    smoking: boolean;
    alcohol: boolean;
  };
}): Prediction {
  let riskScore = 0;

  // Calculate BMI
  const heightInMeters = data.physiological.height / 100;
  const bmi = data.physiological.weight / (heightInMeters * heightInMeters);

  // Risk factors
  if (bmi > 30) riskScore += 2;
  else if (bmi > 25) riskScore += 1;

  if (data.physiological.bloodSugar > 126) riskScore += 2;
  else if (data.physiological.bloodSugar > 100) riskScore += 1;

  if (data.physiological.bloodPressure.systolic > 140 ||
      data.physiological.bloodPressure.diastolic > 90) {
    riskScore += 1;
  }

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

function generateRecommendations(riskScore: number, data: {
  lifestyle: {
    diet: string;
    exercise: string;
  };
  physiological: {
    bloodSugar: number;
  };
}): string[] {
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

function checkAndAwardAchievements(data: HealthDataWithPrediction, existingAchievements: any[] = []): Achievement[] {
  const achievements = [...existingAchievements];
  const now = new Date().toISOString();

  if (!achievements.length) {
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

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}