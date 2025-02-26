import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { healthDataSchema, feedbackSchema } from "@shared/schema";
import { ZodError } from "zod";
import fileUpload from 'express-fileupload';
import crypto from 'crypto';

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Add file upload middleware
  app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
    debug: process.env.NODE_ENV === 'development'
  }));

  // Health data submission and predictions
  app.post("/api/health-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const data = healthDataSchema.parse(req.body);
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

  // Medical records upload and processing
  app.post("/api/medical-records", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      if (!req.files || !req.files.file) {
        return res.status(400).send('No file uploaded');
      }

      const file = req.files.file;

      // Validate file type
      if (file.mimetype !== 'application/pdf') {
        return res.status(400).send('Only PDF files are supported');
      }

      try {
        // Dynamically import pdf-parse only when needed
        const pdfParse = await import('pdf-parse');
        const pdfData = await pdfParse.default(file.data);
        const extractedData = await extractHealthData(pdfData.text);

        if (extractedData) {
          // Update the latest health data entry with extracted information
          const healthData = await storage.getHealthDataByUserId(req.user!.id);
          const latestData = healthData[healthData.length - 1];

          if (latestData) {
            // Merge extracted data with existing data
            const updatedData = {
              ...latestData,
              physiological: {
                ...latestData.physiological,
                ...extractedData
              }
            };

            // Calculate new prediction with updated data
            const prediction = calculateDiabetesRisk(updatedData);
            await storage.createHealthData(req.user!.id, {
              ...updatedData,
              prediction
            });
          }
        }

        res.json({ 
          message: 'Medical records processed successfully',
          extractedData 
        });
      } catch (parseError) {
        console.error('Error parsing PDF:', parseError);
        res.status(422).send('Could not process the PDF file');
      }
    } catch (err) {
      console.error('Error processing medical records:', err);
      res.status(500).send('Error processing medical records');
    }
  });

  // Inside registerRoutes function, add the new endpoint
  app.post("/api/symptoms", async (req, res) => {
    console.log("Received symptom submission request");
    console.log("Auth status:", req.isAuthenticated());
    console.log("Request body:", req.body);

    if (!req.isAuthenticated()) {
      console.log("Authentication failed");
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const symptomData = {
        ...req.body,
        recordedAt: new Date().toISOString()
      };
      console.log("Processing symptoms for user:", userId);

      // Get the latest health data for the user
      const healthData = await storage.getHealthDataByUserId(userId);
      const latestData = healthData[healthData.length - 1];

      if (!latestData) {
        console.log("No existing health data found");
        return res.status(400).json({ message: "Please complete health assessment first" });
      }

      // Update the latest health data with new symptoms
      const updatedData = {
        ...latestData,
        symptoms: symptomData
      };

      console.log("Updating health data with symptoms:", updatedData);

      // Save the updated health data
      await storage.updateHealthData(userId, updatedData);

      res.status(200).json({ message: "Symptoms recorded successfully" });
    } catch (err) {
      console.error("Error processing symptoms:", err);
      res.status(500).json({ message: "Failed to process symptoms" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, 'salt', 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString('hex'));
    })
  })
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