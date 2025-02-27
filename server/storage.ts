import { users, type User, type InsertUser } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();