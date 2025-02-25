import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const healthData = pgTable("health_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  demographics: json("demographics").notNull(),
  physiological: json("physiological").notNull(),
  lifestyle: json("lifestyle").notNull(),
  prediction: json("prediction"),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const healthDataSchema = z.object({
  demographics: z.object({
    age: z.number().min(0).max(120),
    gender: z.enum(["male", "female", "other"]),
    ethnicity: z.string(),
  }),
  physiological: z.object({
    height: z.number().positive(),
    weight: z.number().positive(),
    bloodPressure: z.object({
      systolic: z.number().positive(),
      diastolic: z.number().positive()
    }),
    bloodSugar: z.number().positive(),
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
