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
  const riskFactors = [];

  // Family History (significant risk factor according to ADA)
  if (data.demographics.familyHistory.parents) {
    riskScore += 3;
    riskFactors.push("Parent with diabetes");
  }
  if (data.demographics.familyHistory.siblings) {
    riskScore += 2;
    riskFactors.push("Sibling with diabetes");
  }
  if (data.demographics.familyHistory.children) {
    riskScore += 2;
    riskFactors.push("Child with diabetes");
  }

  // Prior Medical History
  if (data.physiological.priorPrediabetes) {
    riskScore += 4;
    riskFactors.push("History of prediabetes");
  }
  if (data.physiological.heartDisease) {
    riskScore += 2;
    riskFactors.push("History of heart disease");
  }
  if (data.demographics.gestationalDiabetes) {
    riskScore += 3;
    riskFactors.push("History of gestational diabetes");
  }

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
    riskScore += 2;
    riskFactors.push(`${data.demographics.ethnicity} ethnicity has higher diabetes risk`);
  }

  // BMI and Waist Circumference Assessment
  const heightInMeters = data.physiological.height / 100;
  const bmi = data.physiological.weight / (heightInMeters * heightInMeters);

  if (bmi > 30) {
    riskScore += 3;
    riskFactors.push("BMI indicates obesity");
  } else if (bmi > 25) {
    riskScore += 2;
    riskFactors.push("BMI indicates overweight");
  }

  // Waist circumference risk (gender-specific thresholds)
  const highRiskWaist = data.demographics.gender === 'male' ? 102 : 88; // cm
  if (data.physiological.waistCircumference > highRiskWaist) {
    riskScore += 2;
    riskFactors.push("High-risk waist circumference");
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
  }

  // Exercise assessment (Based on WHO guidelines)
  const exercise = data.lifestyle.exercise;
  if (exercise.frequency === "none") {
    riskScore += 3;
    riskFactors.push("No physical activity");
  } else {
    if (exercise.minutesPerWeek < 150) {
      riskScore += 2;
      riskFactors.push("Insufficient physical activity (less than 150 minutes/week)");
    }
    if (exercise.intensity === "light") {
      riskScore += 1;
      riskFactors.push("Low intensity exercise only");
    }
  }

  // Diet quality assessment
  const diet = data.lifestyle.diet;
  if (diet.quality === "poor") {
    riskScore += 3;
    riskFactors.push("Poor overall diet quality");
  } else if (diet.quality === "fair") {
    riskScore += 2;
    riskFactors.push("Fair diet quality");
  }

  if (diet.fruitsVegetables < 5) {
    riskScore += 1;
    riskFactors.push("Low fruit and vegetable intake");
  }
  if (diet.processedFoods > 3) {
    riskScore += 2;
    riskFactors.push("High processed food intake");
  }
  if (diet.sugaryDrinks > 2) {
    riskScore += 2;
    riskFactors.push("High sugary drink consumption");
  }

  // Sleep assessment
  const sleep = data.lifestyle.sleep;
  if (sleep.hoursPerNight < 6 || sleep.hoursPerNight > 9) {
    riskScore += 1;
    riskFactors.push("Suboptimal sleep duration");
  }
  if (sleep.quality === "poor") {
    riskScore += 1;
    riskFactors.push("Poor sleep quality");
  }

  // Stress level impact
  if (data.lifestyle.stressLevel === "severe") {
    riskScore += 2;
    riskFactors.push("Severe stress level");
  } else if (data.lifestyle.stressLevel === "high") {
    riskScore += 1;
    riskFactors.push("High stress level");
  }

  // Work style consideration
  if (data.lifestyle.workStyle === "sedentary") {
    riskScore += 2;
    riskFactors.push("Sedentary work style");
  }

  // Substance use assessment
  if (data.lifestyle.smoking) {
    riskScore += 3;
    riskFactors.push("Current smoker");
  }

  const alcohol = data.lifestyle.alcohol;
  if (alcohol.frequency === "frequent" || alcohol.drinksPerWeek > 14) {
    riskScore += 2;
    riskFactors.push("High alcohol consumption");
  } else if (alcohol.frequency === "regular" || alcohol.drinksPerWeek > 7) {
    riskScore += 1;
    riskFactors.push("Moderate alcohol consumption");
  }

  // Calculate normalized risk score (scale of 0-5)
  const maxPossibleScore = 50; // Updated max score based on all factors
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
      case "Stage 2 hypertension":
      case "Stage 1 hypertension":
        recommendations.push(
          `Your blood pressure is ${data.physiological.bloodPressure.systolic}/${data.physiological.bloodPressure.diastolic} mmHg`,
          "Consult with your healthcare provider about blood pressure management",
          "Consider the DASH diet for blood pressure control",
          "Reduce sodium intake to less than 2,300mg per day"
        );
        break;
      case "No physical activity":
      case "Insufficient physical activity (less than 150 minutes/week)":
        recommendations.push(
          "Start with 10-minute walks and gradually increase duration",
          "Aim for 150 minutes of moderate exercise per week",
          "Consider activities like swimming, cycling, or brisk walking",
          "Join a fitness class or work with a personal trainer"
        );
        break;
      case "Low intensity exercise only":
        recommendations.push(
          "Increase the intensity of your workouts gradually",
          "Consider high-intensity interval training (HIIT)"
        );
        break;
      case "Poor overall diet quality":
      case "Fair diet quality":
        recommendations.push(
          "Increase intake of vegetables, fruits, and whole grains",
          "Limit processed foods and sugary beverages",
          "Consider consulting with a registered dietitian",
          "Keep a food diary to track eating habits"
        );
        break;
      case "Low fruit and vegetable intake":
        recommendations.push(
          "Aim for at least 5 servings of fruits and vegetables per day",
          "Include a variety of colorful fruits and vegetables in your diet"
        );
        break;
      case "High processed food intake":
        recommendations.push(
          "Reduce your consumption of processed foods",
          "Choose whole, unprocessed foods whenever possible"
        );
        break;
      case "High sugary drink consumption":
        recommendations.push(
          "Reduce your consumption of sugary drinks",
          "Opt for water, unsweetened tea, or other healthy beverages"
        );
        break;
      case "Suboptimal sleep duration":
        recommendations.push(
          "Aim for 7-9 hours of sleep per night",
          "Establish a regular sleep schedule",
          "Create a relaxing bedtime routine"
        );
        break;
      case "Poor sleep quality":
        recommendations.push(
          "Improve your sleep hygiene",
          "Consider consulting with a sleep specialist"
        );
        break;
      case "Severe stress level":
      case "High stress level":
        recommendations.push(
          "Practice stress-reduction techniques like meditation or deep breathing",
          "Consider counseling or stress management programs",
          "Ensure adequate sleep (7-9 hours per night)",
          "Take regular breaks during work"
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
      case "Current smoker":
        recommendations.push(
          "Consider smoking cessation programs",
          "Talk to your doctor about nicotine replacement therapy",
          "Join a support group for quitting smoking"
        );
        break;
      case "High alcohol consumption":
        recommendations.push(
          "Limit alcohol intake",
          "Keep track of weekly alcohol consumption",
          "Consider alcohol-free alternatives"
        );
        break;
      case "Moderate alcohol consumption":
        recommendations.push(
          "Reduce alcohol consumption",
          "Be mindful of daily and weekly limits"
        );
        break;
      case "Parent with diabetes":
      case "Sibling with diabetes":
      case "Child with diabetes":
        recommendations.push(
          "Discuss your family history with your healthcare provider",
          "Schedule regular screenings to monitor your blood sugar and other health markers"
        );
        break;
      case "History of prediabetes":
        recommendations.push(
          "Follow a healthy lifestyle to prevent diabetes",
          "Monitor your blood sugar levels regularly",
          "Work with a healthcare professional to manage your risk"
        );
        break;
      case "History of heart disease":
        recommendations.push(
          "Work closely with your healthcare provider for cardiac care",
          "Maintain a healthy lifestyle to reduce your risk of future heart issues"
        );
        break;
      case "History of gestational diabetes":
        recommendations.push(
          "Monitor your blood sugar levels regularly",
          "Maintain a healthy lifestyle to reduce your risk of type 2 diabetes"
        );
        break;
      case "High-risk waist circumference":
        recommendations.push(
          "Consult with a healthcare provider or nutritionist to discuss strategies for reducing your waist circumference",
          "Aim for regular exercise and a healthy diet to lose weight and improve your overall health"
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