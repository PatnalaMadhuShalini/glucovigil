import type { Express } from "express";
import { Router } from "express";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { healthDataSchema, feedbackSchema } from "@shared/schema";
import { ZodError } from "zod";
import fileUpload from 'express-fileupload';
import crypto from 'crypto';

export async function registerRoutes(router: Router): Promise<void> {
  // Add test endpoint for API verification
  router.get("/ping", (req, res) => {
    console.log("Ping endpoint hit:", {
      url: req.url,
      method: req.method,
      headers: req.headers
    });
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Add file upload middleware
  router.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
    debug: process.env.NODE_ENV === 'development'
  }));

  // Health data submission and predictions
  router.post("/health-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      console.log("Received health data:", req.body);
      const data = healthDataSchema.parse(req.body);
      const prediction = calculateDiabetesRisk(data);

      // Get existing health data to check for existing achievements
      const existingData = await storage.getHealthDataByUserId(req.user!.id);
      const existingAchievements = existingData.length > 0 ? existingData[0].achievements : [];

      // Check and award new achievements
      const achievements = checkAndAwardAchievements(data, existingAchievements);

      const healthData = await storage.createHealthData(req.user!.id, {
        ...data,
        prediction,
        achievements,
        createdAt: new Date().toISOString()
      });

      res.status(201).json(healthData);
    } catch (err) {
      console.error("Error processing health data:", err);
      if (err instanceof ZodError) {
        res.status(400).json({ message: "Invalid data format", errors: err.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get user's health data history
  router.get("/health-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const data = await storage.getHealthDataByUserId(req.user!.id);
      res.json(data);
    } catch (err) {
      console.error("Error fetching health data:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit feedback
  router.post("/feedback", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const feedback = feedbackSchema.parse(req.body);
      const result = await storage.createFeedback(req.user!.id, feedback);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: "Invalid data format", errors: err.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Medical records upload and processing
  router.post("/medical-records", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      if (!req.files || !('file' in req.files)) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const file = req.files.file;
      if (!Array.isArray(file) && file.mimetype === 'application/pdf') {
        try {
          // Dynamically import pdf-parse only when needed
          const pdfParse = await import('pdf-parse');
          const pdfData = await pdfParse.default(file.data);
          const extractedData = await extractHealthData(pdfData.text);

          res.json({
            message: 'Medical records processed successfully',
            extractedData
          });
        } catch (parseError) {
          console.error('Error parsing PDF:', parseError);
          res.status(422).json({ message: 'Could not process the PDF file' });
        }
      } else {
        res.status(400).json({ message: 'Only PDF files are supported' });
      }
    } catch (err) {
      console.error('Error processing medical records:', err);
      res.status(500).json({ message: 'Error processing medical records' });
    }
  });

  // Symptom tracking endpoint
  router.post("/symptoms", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        message: "Please login to submit symptoms",
        status: "error"
      });
    }

    try {
      const userId = req.user!.id;
      const symptomData = {
        ...req.body,
        recordedAt: new Date().toISOString()
      };

      // Get latest health data
      const healthData = await storage.getHealthDataByUserId(userId);
      const latestData = healthData[healthData.length - 1];

      if (!latestData) {
        return res.status(400).json({
          message: "Please complete health assessment first",
          status: "error"
        });
      }

      // Create a new health data entry with symptoms
      const updatedData = {
        ...latestData,
        id: undefined,
        symptoms: symptomData,
        createdAt: new Date().toISOString()
      };

      const result = await storage.createHealthData(userId, updatedData);

      return res.status(200).json({
        message: "Symptoms recorded successfully",
        status: "success",
        data: result
      });
    } catch (err) {
      console.error("Error processing symptoms:", err);
      return res.status(500).json({
        message: err instanceof Error ? err.message : "Failed to process symptoms",
        status: "error"
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

  // Ensure level is explicitly typed as one of the expected values
  const level: "low" | "moderate" | "high" =
    riskScore <= 2 ? "low" :
      riskScore <= 5 ? "moderate" :
        "high";

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