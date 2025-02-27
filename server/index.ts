import express from "express";
import { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { setupAuth, setupAuthRoutes } from "./auth";
import { registerRoutes } from "./routes";
import { testDatabaseConnection } from "./db";

(async () => {
  try {
    console.log('Starting server initialization...');

    // Test database connection first
    await testDatabaseConnection();

    // Create Express app
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Health check route
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Create HTTP server
    const server = createServer(app);

    // Setup Vite for development with timeout
    if (process.env.NODE_ENV !== "production") {
      console.log('Setting up Vite development server...');
      try {
        await Promise.race([
          setupVite(app),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Vite setup timeout')), 5000)
          )
        ]);
        console.log('Vite setup completed');
      } catch (error) {
        console.warn('Vite setup failed or timed out, falling back to static serving:', error);
        serveStatic(app);
      }
    } else {
      console.log('Setting up static file serving...');
      serveStatic(app);
    }

    // Setup auth and routes
    console.log('Configuring authentication...');
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

    // Start server on port 5000
    const PORT = 5000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
})();