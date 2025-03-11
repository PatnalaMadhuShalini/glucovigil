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
      console.log("Received health data:", {
        body: JSON.stringify(req.body, null, 2)
      });

      let validatedData;
      try {
        validatedData = healthDataSchema.parse(req.body);
        console.log("Data validation successful");
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          const errors = validationError.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code
          }));
          console.error("Validation failed:", errors);
          return res.status(400).json({
            message: "Invalid data format",
            errors: errors.map(e => `${e.path}: ${e.message}`).join(', ')
          });
        }
        throw validationError;
      }

      const prediction = calculateDiabetesRisk(validatedData);
      const healthData = await storage.createHealthData(req.user!.id, {
        ...validatedData,
        prediction,
        createdAt: new Date().toISOString()
      });

      res.status(201).json(healthData);
    } catch (err) {
      console.error("Error processing health data:", err);
      res.status(500).json({ message: "Internal server error" });
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
  const riskFactors = [];

  // Demographic risk factors (Based on ADA guidelines)
  if (data.demographics.age > 45) {
    riskScore += 2;
    riskFactors.push("Age above 45");
  }
  if (data.demographics.age > 65) {
    riskScore += 1;
    riskFactors.push("Age above 65");
  }

  // Ethnicity risk assessment (Based on CDC statistics)
  const highRiskEthnicities = ['asian', 'african', 'hispanic', 'pacific_islander', 'native_american'];
  if (highRiskEthnicities.includes(data.demographics.ethnicity.toLowerCase())) {
    riskScore += 1;
    riskFactors.push(`${data.demographics.ethnicity} ethnicity has higher diabetes risk`);
  }

  // BMI calculation and assessment
  const heightInMeters = data.physiological.height / 100;
  const bmi = data.physiological.weight / (heightInMeters * heightInMeters);

  if (bmi > 30) {
    riskScore += 3;
    riskFactors.push("BMI indicates obesity");
  } else if (bmi > 25) {
    riskScore += 2;
    riskFactors.push("BMI indicates overweight");
  } else if (bmi < 18.5) {
    riskScore += 1;
    riskFactors.push("BMI indicates underweight");
  }

  // Blood sugar assessment (Based on ADA criteria)
  if (data.physiological.bloodSugar > 126) {
    riskScore += 4;
    riskFactors.push("Fasting blood sugar above diabetic threshold (>126 mg/dL)");
  } else if (data.physiological.bloodSugar > 100) {
    riskScore += 3;
    riskFactors.push("Fasting blood sugar indicates prediabetes (100-125 mg/dL)");
  } else if (data.physiological.bloodSugar < 70) {
    riskScore += 2;
    riskFactors.push("Blood sugar below normal range (<70 mg/dL)");
  }

  // Blood pressure assessment (Based on AHA guidelines)
  const systolic = data.physiological.bloodPressure.systolic;
  const diastolic = data.physiological.bloodPressure.diastolic;

  if (systolic > 140 || diastolic > 90) {
    riskScore += 3;
    riskFactors.push("Stage 2 hypertension");
  } else if (systolic > 130 || diastolic > 80) {
    riskScore += 2;
    riskFactors.push("Stage 1 hypertension");
  } else if (systolic > 120) {
    riskScore += 1;
    riskFactors.push("Elevated blood pressure");
  }

  // Mental health and stress assessment - Moved to top-level risk factors
  if (data.mentalHealth?.stressLevel === "severe") {
    riskScore += 3;
    riskFactors.unshift("Severe stress level - high impact on blood sugar control"); // Add to start of array
  } else if (data.mentalHealth?.stressLevel === "high") {
    riskScore += 2;
    riskFactors.unshift("High stress level - moderate impact on blood sugar"); // Add to start of array
  } else if (data.mentalHealth?.stressLevel === "moderate") {
    riskScore += 1;
    riskFactors.unshift("Moderate stress level - potential impact on blood sugar"); // Add to start of array
  }

  // Lifestyle factors assessment
  if (data.lifestyle.exercise === "none") {
    riskScore += 3;
    riskFactors.push("No regular physical activity");
  } else if (data.lifestyle.exercise === "light") {
    riskScore += 2;
    riskFactors.push("Insufficient physical activity");
  }

  if (data.lifestyle.diet === "poor") {
    riskScore += 3;
    riskFactors.push("Poor diet quality");
  } else if (data.lifestyle.diet === "fair") {
    riskScore += 2;
    riskFactors.push("Fair diet quality");
  }

  // Work style consideration
  if (data.lifestyle.workStyle === "sedentary") {
    riskScore += 2;
    riskFactors.push("Sedentary work style");
  }

  // Family history impact
  if (data.familyHistory?.diabetesInFamily) {
    riskScore += 3;
    riskFactors.push("Family history of diabetes");
  }

  // Substance use assessment
  if (data.lifestyle.smoking !== "never") {
    riskScore += 2;
    riskFactors.push("Current or past smoking history");
  }
  if (data.lifestyle.alcohol !== "never" && data.lifestyle.alcohol !== "occasional") {
    riskScore += 2;
    riskFactors.push("Regular alcohol consumption");
  }

  // Calculate normalized risk score (scale of 0-5)
  const maxPossibleScore = 40; // Updated maximum possible points including stress
  const normalizedScore = Math.min(5, (riskScore / maxPossibleScore) * 5);

  // Determine risk level based on normalized score
  const level: "low" | "moderate" | "high" =
    normalizedScore <= 2 ? "low" :
    normalizedScore <= 3.5 ? "moderate" : "high";

  return {
    score: normalizedScore,
    level,
    riskFactors,
    recommendations: generateRecommendations(normalizedScore, data, riskFactors)
  };
}

function generateRecommendations(riskScore: number, data: any, riskFactors: string[]) {
  const recommendations = [];

  // Add specific recommendations based on identified risk factors
  riskFactors.forEach(factor => {
    switch (factor) {
      case "Severe stress level - high impact on blood sugar control":
      case "High stress level - moderate impact on blood sugar":
      case "Moderate stress level - potential impact on blood sugar":
        recommendations.push(
          "Consider stress management techniques like meditation or deep breathing",
          "Regular exercise can help reduce stress levels",
          "Consider consulting with a mental health professional",
          "Maintain a regular sleep schedule to help manage stress"
        );
        break;
      case "Age above 45":
      case "Age above 65":
        recommendations.push(
          "Schedule regular health screenings appropriate for your age",
          "Work closely with your healthcare provider for preventive care"
        );
        break;
      case "BMI indicates obesity":
      case "BMI indicates overweight":
        recommendations.push(
          `Your current BMI is ${(data.physiological.weight / Math.pow(data.physiological.height / 100, 2)).toFixed(1)}`,
          "Consider consulting with a nutritionist for a personalized weight management plan",
          "Focus on portion control and balanced meals",
          "Aim for gradual, sustainable weight loss of 1-2 pounds per week"
        );
        break;
      case "Fasting blood sugar above diabetic threshold (>126 mg/dL)":
        recommendations.push(
          "Immediate consultation with a healthcare provider is recommended",
          "Begin monitoring blood sugar levels regularly",
          "Consider keeping a food and blood sugar diary"
        );
        break;
      case "Fasting blood sugar indicates prediabetes (100-125 mg/dL)":
        recommendations.push(
          "Schedule a follow-up test to confirm blood sugar levels",
          "Consider joining a diabetes prevention program",
          "Make dietary changes to control blood sugar"
        );
        break;
      case "No regular physical activity":
      case "Insufficient physical activity":
        recommendations.push(
          "Start with 10-minute walks and gradually increase duration",
          "Aim for 150 minutes of moderate exercise per week",
          "Consider activities like swimming, cycling, or brisk walking",
          "Join a fitness class or work with a personal trainer"
        );
        break;
      case "Poor diet quality":
      case "Fair diet quality":
        recommendations.push(
          "Increase intake of vegetables, fruits, and whole grains",
          "Limit processed foods and sugary beverages",
          "Consider consulting with a registered dietitian",
          "Keep a food diary to track eating habits"
        );
        break;
      case "Stage 2 hypertension":
      case "Stage 1 hypertension":
        recommendations.push(
          `Your blood pressure is ${data.physiological.bloodPressure.systolic}/${data.physiological.bloodPressure.diastolic} mmHg`,
          "Consult with your healthcare provider about blood pressure management",
          "Consider the DASH diet for blood pressure control",
          "Reduce sodium intake to less than 2,300mg per day"
        );
        break;
      case "Sedentary work style":
        recommendations.push(
          "Take standing or walking breaks every hour",
          "Consider using a standing desk",
          "Do simple exercises at your desk",
          "Take walks during lunch breaks"
        );
        break;
      case "Current or past smoking history":
        recommendations.push(
          "Consider smoking cessation programs",
          "Talk to your doctor about nicotine replacement therapy",
          "Join a support group for quitting smoking"
        );
        break;
      case "Regular alcohol consumption":
        recommendations.push(
          "Limit alcohol intake",
          "Keep track of weekly alcohol consumption",
          "Consider alcohol-free alternatives"
        );
        break;
      case "Family history of diabetes":
        recommendations.push(
          "Discuss your family history with your doctor",
          "Undergo regular health screenings",
          "Adopt a healthy lifestyle to minimize risk"
        );
        break;

    }
  });

  // Add general recommendations based on overall risk score
  if (riskScore > 3.5) {
    recommendations.push(
      "Schedule a comprehensive health assessment with your healthcare provider",
      "Consider genetic testing for diabetes risk factors",
      "Join a diabetes prevention program",
      "Monitor your health metrics more frequently"
    );
  }

  return [...new Set(recommendations)]; // Remove any duplicate recommendations
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