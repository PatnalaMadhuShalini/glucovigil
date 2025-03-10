import { pgTable, text, serial, integer, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  gender: text("gender").notNull(),
  place: text("place").notNull(),
  achievements: json("achievements").default([]),
  preferredLanguage: text("preferred_language").default("en"),
  healthGoals: json("health_goals").default([]),
  verificationToken: text("verification_token"),
  verified: boolean("verified").default(false)
});

export const healthData = pgTable("health_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  demographics: json("demographics").notNull(),
  physiological: json("physiological").notNull(),
  lifestyle: json("lifestyle").notNull(),
  prediction: json("prediction"),
  createdAt: text("created_at").notNull(),
  nutritionPlan: json("nutrition_plan"),
  exercisePlan: json("exercise_plan"),
  achievements: json("achievements"),
  medicalRecords: json("medical_records")
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  category: text("category").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    fullName: true,
    email: true,
    phone: true,
    gender: true,
    place: true,
  })
  .extend({
    password: z.string().min(8, "Password must be at least 8 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\+?[1-9]\d{9,11}$/, "Invalid phone number"),
  });

// Update the symptom schema with new fields
export const symptomSchema = z.object({
  primarySymptom: z.string().min(1, "Please select a primary symptom"),
  severity: z.number().min(0).max(10),
  pattern: z.enum(["Constant", "Intermittent", "Progressive", "Cyclical"]),
  duration: z.string().min(1, "Please specify the duration"),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "night", "variable"]),
  triggers: z.string().optional(),
  additionalNotes: z.string().optional(),
  recordedAt: z.string().optional(),
});

export type Symptom = z.infer<typeof symptomSchema>;


// First, let's update the HealthData schema to include new fields
export const healthDataSchema = z.object({
  demographics: z.object({
    age: z.coerce.number().min(0).max(120),
    gender: z.enum(["male", "female", "other"]),
    ethnicity: z.string().min(1, "Ethnicity is required"),
  }),
  physiological: z.object({
    height: z.coerce.number().min(100, "Height must be at least 100 cm").max(250, "Height must be less than 250 cm"),
    weight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be less than 300 kg"),
    bloodPressure: z.object({
      systolic: z.coerce.number().min(70, "Systolic must be at least 70").max(200, "Systolic must be less than 200"),
      diastolic: z.coerce.number().min(40, "Diastolic must be at least 40").max(130, "Diastolic must be less than 130")
    }),
    bloodSugar: z.coerce.number().min(50, "Blood sugar must be at least 50 mg/dL").max(300, "Blood sugar must be less than 300 mg/dL"),
    a1c: z.coerce.number()
      .min(4, "A1C must be at least 4%")
      .max(20, "A1C values above 20% are unlikely")
      .optional(),
    gtt: z.coerce.number()
      .min(0, "GTT cannot be negative")
      .max(500, "GTT seems too high")
      .optional(),
    hemoglobin: z.coerce.number()
      .min(6, "Hemoglobin must be at least 6 g/dL")
      .max(20, "Hemoglobin seems too high")
      .optional(),
  }),
  familyHistory: z.object({
    diabetesInFamily: z.boolean(),
    diabeticRelatives: z.array(z.string()).optional(),
    otherConditions: z.array(z.string()).optional(),
  }).optional(),
  mentalHealth: z.object({
    stressLevel: z.enum(["low", "moderate", "high", "severe"]),
    moodPattern: z.enum(["stable", "variable", "depressed", "anxious", "mixed"]),
    sleepQuality: z.enum(["good", "fair", "poor"]),
    anxietyLevel: z.enum(["minimal", "mild", "moderate", "severe"]),
    copingMechanisms: z.array(z.string()).optional(),
  }).optional(),
  lifestyle: z.object({
    exercise: z.enum(["none", "light", "moderate", "heavy"]),
    diet: z.enum(["poor", "fair", "good", "excellent"]),
    workStyle: z.enum(["sedentary", "light", "moderate", "active"]),
    alcohol: z.enum([
      "never", "occasional", "social", "moderate", "heavy", "binge",
      "experimental", "former", "relapsing", "situational", "passive",
      "dependent", "recovering"
    ]),
    smoking: z.enum([
      "never", "occasional", "social", "moderate", "heavy", "binge",
      "experimental", "former", "relapsing", "situational", "passive",
      "dependent", "recovering"
    ])
  }),
  financialStatus: z.object({
    insuranceCoverage: z.boolean(),
    medicationAccessibility: z.enum(["easy", "moderate", "difficult"]),
    regularCheckupAbility: z.boolean(),
    financialStress: z.enum(["none", "low", "moderate", "high"]),
  }).optional(),
  createdAt: z.string().optional(),
}).strict();

// Update the type definition
export type HealthData = z.infer<typeof healthDataSchema>;

export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  category: z.string(),
  comment: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Feedback = z.infer<typeof feedbackSchema>;

// Achievement types
export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
};

// Nutrition and Exercise Plan types
export type NutritionPlan = {
  recommendations: string[];
  mealPlan: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
};

export type ExercisePlan = {
  recommendations: string[];
  weeklyPlan: {
    [key: string]: {
      type: string;
      duration: number;
      intensity: string;
      exercises: string[];
    }[];
  };
  goals: {
    steps: number;
    duration: number;
    intensity: string;
  };
};

// Add prediction types
export type Prediction = {
  score: number;
  level: "low" | "moderate" | "high";
  recommendations: string[];
};

export type HealthDataWithPrediction = HealthData & {
  prediction: Prediction;
  nutritionPlan?: NutritionPlan;
  exercisePlan?: ExercisePlan;
  achievements?: Achievement[];
  symptoms?: Symptom;
  createdAt: string;
};