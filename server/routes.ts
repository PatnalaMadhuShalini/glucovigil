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
      const healthData = await storage.createHealthData(req.user!.id, data);
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
  // Simple risk calculation logic
  let riskScore = 0;

  if (data.physiological.bloodSugar > 100) riskScore += 2;
  if (data.physiological.weight / (data.physiological.height * data.physiological.height) > 25) riskScore += 1;
  if (data.lifestyle.smoking) riskScore += 1;
  if (data.lifestyle.exercise === "none") riskScore += 1;

  return {
    score: riskScore,
    level: riskScore <= 1 ? "low" : riskScore <= 3 ? "moderate" : "high",
    recommendations: generateRecommendations(riskScore)
  };
}

function generateRecommendations(riskScore: number) {
  const recommendations = [
    "Maintain a balanced diet rich in whole grains, lean proteins, and vegetables",
    "Exercise regularly - aim for at least 150 minutes of moderate activity per week",
    "Monitor blood sugar levels regularly",
    "Stay hydrated and limit sugary beverages",
  ];

  if (riskScore > 3) {
    recommendations.push(
      "Consider consulting with a healthcare provider for personalized advice",
      "Take steps to reduce stress through meditation or other relaxation techniques"
    );
  }

  return recommendations;
}