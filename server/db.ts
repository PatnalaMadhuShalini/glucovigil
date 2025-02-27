import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create connection pool with proper error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // Increased timeout
  idleTimeoutMillis: 30000,
  max: 10, // Reduced max connections
  maxUses: 5000
});

// Create Drizzle instance with retries
let db: ReturnType<typeof drizzle>;
try {
  db = drizzle(pool, { schema });
} catch (error) {
  console.error('Failed to create Drizzle instance:', error);
  throw error;
}

// Test database connection with retries
export async function testDatabaseConnection(retries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log(`Database connection successful (attempt ${attempt}):`, result.rows[0].now);
      return true;
    } catch (error) {
      console.error(`Database connection attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error;
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return false;
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  // Don't exit process, just log the error
});

// Export initialized db instance
export { db };