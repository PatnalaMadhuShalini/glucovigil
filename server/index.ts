import express from "express";
import { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic } from "./vite";
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

    // Setup auth and routes first
    console.log('Setting up authentication...');
    setupAuth(app);
    setupAuthRoutes(app);
    registerRoutes(app);

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

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error('Port 5000 is in use. Attempting to close existing connections...');
        server.close();
        process.exit(1);
      } else {
        console.error('Server error:', error);
        process.exit(1);
      }
    });

    // Start server
    await new Promise<void>((resolve, reject) => {
      server.listen(5000, '0.0.0.0', () => {
        console.log('Server running on port 5000');
        resolve();
      });

      server.once('error', reject);
    });

    // Setup Vite after server is running
    if (process.env.NODE_ENV !== "production") {
      console.log('Setting up Vite development server...');
      try {
        await setupVite(app);
        console.log('Vite setup completed');
      } catch (error) {
        console.error('Vite setup failed:', error);
        serveStatic(app);
      }
    } else {
      console.log('Setting up static file serving...');
      serveStatic(app);
    }

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