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
  connectionTimeoutMillis: 30000, // Increased timeout
  idleTimeoutMillis: 60000,
  max: 5, // Reduced max connections for stability
  maxUses: 7500
});

// Create Drizzle instance with retries
let db: ReturnType<typeof drizzle>;
try {
  db = drizzle(pool, { schema });
  console.log('Successfully created Drizzle instance');
} catch (error) {
  console.error('Failed to create Drizzle instance:', error);
  throw error;
}

// Test database connection with retries
export async function testDatabaseConnection(retries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting database connection (attempt ${attempt})`);
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log(`Database connection successful (attempt ${attempt}):`, result.rows[0].now);
      return true;
    } catch (error) {
      console.error(`Database connection attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error;
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt * 2));
    }
  }
  return false;
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  process.exit(1); // Exit on critical database errors
});

// Handle pool connect events
pool.on('connect', () => {
  console.log('New client connected to the pool');
});

export { db };