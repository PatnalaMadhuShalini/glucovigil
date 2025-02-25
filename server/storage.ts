import { IStorage } from "./types";
import { User, InsertUser, HealthData, InsertHealthData, Feedback, InsertFeedback } from "@shared/schema";
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

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId++;
    const newUser = { id, ...user };
    this.users.set(id, newUser);
    return newUser;
  }

  async createHealthData(userId: number, data: InsertHealthData): Promise<HealthData> {
    const id = this.currentId++;
    const newData: HealthData = {
      id,
      userId,
      ...data,
      diabetesRisk: this.calculateDiabetesRisk(data),
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

  async createFeedback(userId: number, feedback: InsertFeedback): Promise<Feedback> {
    const id = this.currentId++;
    const newFeedback: Feedback = {
      id,
      userId,
      ...feedback,
      createdAt: new Date().toISOString(),
    };
    this.feedback.set(id, newFeedback);
    return newFeedback;
  }

  private calculateDiabetesRisk(data: InsertHealthData): number {
    // Simple risk calculation algorithm
    let risk = 0;
    
    // Age factor
    risk += data.age > 45 ? 20 : 10;
    
    // BMI calculation and factor
    const heightInMeters = data.height / 100;
    const bmi = data.weight / (heightInMeters * heightInMeters);
    risk += bmi > 30 ? 20 : bmi > 25 ? 15 : 10;
    
    // Blood glucose factor
    risk += data.bloodGlucose > 126 ? 30 : data.bloodGlucose > 100 ? 20 : 10;
    
    // Family history factor
    risk += data.familyDiabetesHistory ? 20 : 0;
    
    // Lifestyle factors
    risk -= data.exerciseHoursPerWeek > 5 ? 10 : data.exerciseHoursPerWeek > 2 ? 5 : 0;
    risk += data.smokingStatus ? 10 : 0;
    
    // Normalize to 0-100 range
    return Math.min(Math.max(risk, 0), 100);
  }
}

export const storage = new MemStorage();
