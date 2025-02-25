import { pgTable, text, serial, integer, json } from "drizzle-orm/pg-core";
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
  verified: integer("verified").default(0),
  verificationToken: text("verification_token"),
  achievements: json("achievements").default([]),
  preferredLanguage: text("preferred_language").default("en"),
  healthGoals: json("health_goals").default([]),
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
});

export const healthDataSchema = z.object({
  demographics: z.object({
    age: z.number().int().min(0).max(120),
    gender: z.enum(["male", "female", "other"]),
    ethnicity: z.string().min(1, "Ethnicity is required"),
  }),
  physiological: z.object({
    height: z.number().min(100, "Height must be at least 100 cm").max(250, "Height must be less than 250 cm"),
    weight: z.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be less than 300 kg"),
    bloodPressure: z.object({
      systolic: z.number().min(70, "Systolic must be at least 70").max(200, "Systolic must be less than 200"),
      diastolic: z.number().min(40, "Diastolic must be at least 40").max(130, "Diastolic must be less than 130")
    }),
    bloodSugar: z.number().min(50, "Blood sugar must be at least 50 mg/dL").max(300, "Blood sugar must be less than 300 mg/dL"),
  }),
  lifestyle: z.object({
    smoking: z.boolean(),
    alcohol: z.boolean(),
    exercise: z.enum(["none", "light", "moderate", "heavy"]),
    diet: z.enum(["poor", "fair", "good", "excellent"]),
  })
});

export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type HealthData = z.infer<typeof healthDataSchema>;
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
};