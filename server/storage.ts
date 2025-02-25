import { IStorage } from "./types";
import { User, InsertUser, HealthData, Feedback } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private healthData: Map<number, HealthData[]>;
  private feedback: Map<number, Feedback>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.healthData = new Map();
    this.feedback = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return undefined; // Verification removed as requested
  }

  async verifyUser(userId: number): Promise<void> {
    // Verification removed as requested
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId++;
    const newUser: User = {
      id,
      ...user,
      achievements: [],
      preferredLanguage: "en",
      healthGoals: []
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async createHealthData(userId: number, data: HealthData): Promise<HealthData> {
    const id = this.currentId++;
    const newData = {
      ...data,
      createdAt: new Date().toISOString(),
    };

    const userHealthData = this.healthData.get(userId) || [];
    userHealthData.push(newData);
    this.healthData.set(userId, userHealthData);

    return newData;
  }

  async getHealthDataByUserId(userId: number): Promise<HealthData[]> {
    return this.healthData.get(userId) || [];
  }

  async updateHealthData(userId: number, data: Partial<HealthData>): Promise<HealthData | undefined> {
    const userHealthData = this.healthData.get(userId) || [];
    const latestData = userHealthData[userHealthData.length - 1];

    if (latestData) {
      const updatedData = {
        ...latestData,
        ...data,
        physiological: {
          ...latestData.physiological,
          ...(data.physiological || {})
        }
      };
      userHealthData[userHealthData.length - 1] = updatedData;
      this.healthData.set(userId, userHealthData);
      return updatedData;
    }

    return undefined;
  }

  async createFeedback(userId: number, feedback: Feedback): Promise<Feedback> {
    const id = this.currentId++;
    const newFeedback = {
      id,
      userId,
      ...feedback,
      createdAt: new Date().toISOString(),
    };
    this.feedback.set(id, newFeedback);
    return newFeedback;
  }
}

export const storage = new MemStorage();