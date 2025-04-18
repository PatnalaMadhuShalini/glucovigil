import { users, healthData, feedback, type User, type InsertUser, type HealthData, type Feedback, type HealthDataWithPrediction } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createHealthData(userId: number, data: HealthDataWithPrediction): Promise<HealthDataWithPrediction>;
  getHealthDataByUserId(userId: number): Promise<HealthDataWithPrediction[]>;
  updateHealthData(userId: number, data: Partial<HealthDataWithPrediction>): Promise<HealthDataWithPrediction | undefined>;
  createFeedback(userId: number, feedback: Feedback): Promise<Feedback>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  verifyUser(userId: number): Promise<boolean>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async createHealthData(userId: number, data: HealthDataWithPrediction): Promise<HealthDataWithPrediction> {
    const [newData] = await db
      .insert(healthData)
      .values({
        userId,
        demographics: data.demographics,
        physiological: data.physiological,
        lifestyle: data.lifestyle,
        prediction: data.prediction,
        nutritionPlan: data.nutritionPlan,
        exercisePlan: data.exercisePlan,
        achievements: data.achievements,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return newData as HealthDataWithPrediction;
  }

  async getHealthDataByUserId(userId: number): Promise<HealthDataWithPrediction[]> {
    const data = await db
      .select()
      .from(healthData)
      .where(eq(healthData.userId, userId));
    return data as HealthDataWithPrediction[];
  }

  async updateHealthData(userId: number, data: Partial<HealthDataWithPrediction>): Promise<HealthDataWithPrediction | undefined> {
    const [updatedData] = await db
      .update(healthData)
      .set(data)
      .where(eq(healthData.userId, userId))
      .returning();
    return updatedData as HealthDataWithPrediction;
  }

  async createFeedback(userId: number, feedbackData: Feedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values({
        userId,
        rating: feedbackData.rating,
        category: feedbackData.category,
        comment: feedbackData.comment,
      })
      .returning();
    return newFeedback;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token));
    return user;
  }

  async verifyUser(userId: number): Promise<boolean> {
    const [user] = await db
      .update(users)
      .set({ verified: true })
      .where(eq(users.id, userId))
      .returning();
    return !!user;
  }
}

export const storage = new DatabaseStorage();