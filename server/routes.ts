import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { healthDataSchema, feedbackSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Health data submission
  app.post("/api/health-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const data = healthDataSchema.parse(req.body);

      // Calculate prediction and recommendations
      const prediction = calculateDiabetesRisk(data);
      const healthData = await storage.createHealthData(req.user!.id, {
        ...data,
        prediction
      });

      res.status(201).json(healthData);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json(err.errors);
      } else {
        res.status(500).send("Internal server error");
      }
    }
  });

  // Get user's health data history
  app.get("/api/health-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const data = await storage.getHealthDataByUserId(req.user!.id);
      res.json(data);
    } catch (err) {
      res.status(500).send("Internal server error");
    }
  });

  // Submit feedback
  app.post("/api/feedback", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const feedback = feedbackSchema.parse(req.body);
      const result = await storage.createFeedback(req.user!.id, feedback);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json(err.errors);
      } else {
        res.status(500).send("Internal server error");
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateDiabetesRisk(data: any) {
  // More comprehensive risk calculation logic
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

  return {
    score: riskScore,
    level: riskScore <= 2 ? "low" : riskScore <= 5 ? "moderate" : "high",
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