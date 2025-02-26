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
  createHealthData(userId: number, data: HealthData): Promise<HealthDataWithPrediction>;
  getHealthDataByUserId(userId: number): Promise<HealthDataWithPrediction[]>;
  updateHealthData(userId: number, data: Partial<HealthData>): Promise<HealthDataWithPrediction | undefined>;
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

  async createHealthData(userId: number, data: HealthData): Promise<HealthDataWithPrediction> {
    const [newData] = await db
      .insert(healthData)
      .values({
        userId,
        demographics: data.demographics,
        physiological: data.physiological,
        lifestyle: data.lifestyle,
        createdAt: new Date().toISOString()
      })
      .returning();

    return {
      ...data,
      id: newData.id,
      userId: newData.userId,
      createdAt: newData.createdAt,
      prediction: null,
      nutritionPlan: null,
      exercisePlan: null,
      achievements: []
    };
  }

  async getHealthDataByUserId(userId: number): Promise<HealthDataWithPrediction[]> {
    const data = await db
      .select()
      .from(healthData)
      .where(eq(healthData.userId, userId));

    return data.map(entry => ({
      demographics: entry.demographics as HealthData['demographics'],
      physiological: entry.physiological as HealthData['physiological'],
      lifestyle: entry.lifestyle as HealthData['lifestyle'],
      id: entry.id,
      userId: entry.userId,
      createdAt: entry.createdAt,
      prediction: entry.prediction as HealthDataWithPrediction['prediction'],
      nutritionPlan: entry.nutritionPlan as HealthDataWithPrediction['nutritionPlan'],
      exercisePlan: entry.exercisePlan as HealthDataWithPrediction['exercisePlan'],
      achievements: entry.achievements as HealthDataWithPrediction['achievements'] || []
    }));
  }

  async updateHealthData(userId: number, data: Partial<HealthData>): Promise<HealthDataWithPrediction | undefined> {
    const [updatedData] = await db
      .update(healthData)
      .set(data)
      .where(eq(healthData.userId, userId))
      .returning();

    if (!updatedData) return undefined;

    return {
      demographics: updatedData.demographics as HealthData['demographics'],
      physiological: updatedData.physiological as HealthData['physiological'],
      lifestyle: updatedData.lifestyle as HealthData['lifestyle'],
      id: updatedData.id,
      userId: updatedData.userId,
      createdAt: updatedData.createdAt,
      prediction: updatedData.prediction as HealthDataWithPrediction['prediction'],
      nutritionPlan: updatedData.nutritionPlan as HealthDataWithPrediction['nutritionPlan'],
      exercisePlan: updatedData.exercisePlan as HealthDataWithPrediction['exercisePlan'],
      achievements: updatedData.achievements as HealthDataWithPrediction['achievements'] || []
    };
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