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
      checkPeriod: 86400000
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log('Getting user by ID:', id);
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      console.log('User found by ID:', user ? 'yes' : 'no');
      return user;
    } catch (err) {
      console.error('Database error - getUser:', err);
      throw new Error('Failed to get user');
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log('Getting user by username:', username);
      const normalizedUsername = username.toLowerCase().trim();

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, normalizedUsername))
        .limit(1);

      console.log('User found by username:', user ? 'yes' : 'no');
      return user;
    } catch (err) {
      console.error('Database error - getUserByUsername:', err);
      throw new Error('Failed to get user by username');
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      console.log('Creating new user:', { ...user, password: '[REDACTED]' });

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
        console.error('User creation failed - no user returned');
        throw new Error('User creation failed');
      }

      console.log('User created successfully');
      return newUser;
    } catch (err) {
      console.error('Database error - createUser:', err);
      throw new Error('Failed to create user account');
    }
  }
}

export const storage = new DatabaseStorage();