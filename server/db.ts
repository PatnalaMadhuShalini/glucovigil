import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check for required environment variable
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Create connection pool with error handling
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000
});

// Test database connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(1);
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Export a function to test database connection
export async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}