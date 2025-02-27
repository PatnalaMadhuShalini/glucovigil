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
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (err) {
      console.error('[Storage] Error getting user by ID:', err);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      username = username.trim();
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (err) {
      console.error('[Storage] Error getting user by username:', err);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [newUser] = await db
        .insert(users)
        .values({
          ...user,
          username: user.username.trim(),
          achievements: [],
          healthGoals: [],
          preferredLanguage: 'en',
          verified: false
        })
        .returning();
      return newUser;
    } catch (err) {
      console.error('[Storage] Error creating user:', err);
      throw err;
    }
  }
}

export const storage = new DatabaseStorage();