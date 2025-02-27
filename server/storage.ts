import { users, healthData, type User, type InsertUser, type HealthData } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.Store;
  // Add health data operations
  createHealthData(userId: number, data: HealthData): Promise<HealthData>;
  getHealthDataByUserId(userId: number): Promise<HealthData[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      return user;
    } catch (err) {
      console.error('Error getting user:', err);
      throw new Error('Failed to get user');
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username.toLowerCase().trim()))
        .limit(1);
      return user;
    } catch (err) {
      console.error('Error getting user by username:', err);
      throw new Error('Failed to get user');
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [newUser] = await db
        .insert(users)
        .values({
          ...user,
          username: user.username.toLowerCase().trim(),
          achievements: [],
          healthGoals: [],
          preferredLanguage: 'en',
          verified: false
        })
        .returning();

      if (!newUser) {
        throw new Error('User creation failed');
      }

      return newUser;
    } catch (err) {
      console.error('Error creating user:', err);
      throw new Error('Failed to create user');
    }
  }

  // Add health data methods
  async createHealthData(userId: number, data: HealthData): Promise<HealthData> {
    try {
      console.log('Creating health data for user:', userId, data);
      const [newHealthData] = await db
        .insert(healthData)
        .values({
          userId,
          demographics: data.demographics,
          physiological: data.physiological,
          lifestyle: data.lifestyle,
          prediction: data.prediction || null,
          createdAt: new Date().toISOString(),
          nutritionPlan: null,
          exercisePlan: null,
          achievements: [],
          medicalRecords: null
        })
        .returning();

      if (!newHealthData) {
        throw new Error('Health data creation failed');
      }

      return newHealthData as HealthData;
    } catch (err) {
      console.error('Error creating health data:', err);
      throw new Error('Failed to create health data');
    }
  }

  async getHealthDataByUserId(userId: number): Promise<HealthData[]> {
    try {
      console.log('Fetching health data for user:', userId);
      const userHealthData = await db
        .select()
        .from(healthData)
        .where(eq(healthData.userId, userId))
        .orderBy(healthData.createdAt);

      return userHealthData as HealthData[];
    } catch (err) {
      console.error('Error getting health data:', err);
      throw new Error('Failed to get health data');
    }
  }
}

export const storage = new DatabaseStorage();