import express from "express";
import { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupAuth, setupAuthRoutes } from "./auth";
import { registerRoutes } from "./routes";
import { testDatabaseConnection } from "./db";

// Add global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

let server: any = null;

async function startServer() {
  try {
    console.log('Starting server initialization...');

    // Test database connection first
    await testDatabaseConnection();
    console.log('Database connection successful');

    // Create Express app
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Setup auth and routes first
    console.log('Setting up authentication...');
    setupAuth(app);
    setupAuthRoutes(app);
    const router = express.Router();
    await registerRoutes(router);
    app.use('/api', router);

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Server error:', err);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Create HTTP server
    server = createServer(app);

    // Start server
    await new Promise<void>((resolve, reject) => {
      server.listen(5000, '0.0.0.0', () => {
        console.log('Server running on port 5000');
        resolve();
      });

      server.once('error', (error: any) => {
        console.error('Server startup error:', error);
        reject(error);
      });
    });

  } catch (error) {
    console.error('Server initialization failed:', error);
    if (server) {
      server.close();
    }
    process.exit(1);
  }
}

// Handle cleanup on shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

startServer();