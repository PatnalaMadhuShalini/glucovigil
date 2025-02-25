import type { User, InsertUser, HealthData, Feedback } from "@shared/schema";
import type { Store } from "express-session";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  verifyUser(userId: number): Promise<void>;

  // Health data operations
  createHealthData(userId: number, data: HealthData): Promise<HealthData>;
  getHealthDataByUserId(userId: number): Promise<HealthData[]>;
  updateHealthData(userId: number, data: Partial<HealthData>): Promise<HealthData | undefined>;

  // Feedback operations  
  createFeedback(userId: number, feedback: Feedback): Promise<Feedback>;

  // Session store
  sessionStore: Store;
}