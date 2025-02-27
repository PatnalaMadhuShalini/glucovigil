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
      console.log('[Storage] Getting user by ID:', id);
      const [user] = await db.select().from(users).where(eq(users.id, id));
      console.log('[Storage] User found:', user ? 'yes' : 'no');
      return user;
    } catch (err) {
      console.error('[Storage] Error getting user by ID:', err);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      // Ensure username is trimmed
      username = username.trim();
      console.log('[Storage] Getting user by username:', username);
      const [user] = await db.select().from(users).where(eq(users.username, username));
      console.log('[Storage] User found:', user ? 'yes' : 'no');
      if (user) {
        console.log('[Storage] Password hash format:', user.password.includes('.') ? 'valid' : 'invalid');
      }
      return user;
    } catch (err) {
      console.error('[Storage] Error getting user by username:', err);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Ensure username is trimmed before storing
      const trimmedUser = {
        ...user,
        username: user.username.trim()
      };
      console.log('[Storage] Creating new user:', trimmedUser.username);
      const [newUser] = await db.insert(users).values(trimmedUser).returning();
      console.log('[Storage] User created successfully');
      return newUser;
    } catch (err) {
      console.error('[Storage] Error creating user:', err);
      throw err;
    }
  }
}

export const storage = new DatabaseStorage();