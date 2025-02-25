import { IStorage } from "./types";
import { User, InsertUser, HealthData, Feedback } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private healthData: Map<number, HealthData>;
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
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId++;
    const newUser = { 
      id, 
      ...user,
      verified: 0,
      verificationToken: Math.random().toString(36).substring(2, 15),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async verifyUser(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      this.users.set(userId, {
        ...user,
        verified: 1,
        verificationToken: null,
      });
    }
  }

  async createHealthData(userId: number, data: HealthData): Promise<HealthData> {
    const id = this.currentId++;
    const newData = {
      id,
      userId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.healthData.set(id, newData);
    return newData;
  }

  async getHealthDataByUserId(userId: number): Promise<HealthData[]> {
    return Array.from(this.healthData.values()).filter(
      (data) => data.userId === userId,
    );
  }

  async updateHealthData(userId: number, data: Partial<HealthData>): Promise<HealthData | undefined> {
    const userHealthData = await this.getHealthDataByUserId(userId);
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
      this.healthData.set(latestData.id, updatedData);
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