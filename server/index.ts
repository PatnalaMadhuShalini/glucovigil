import express from "express";
import { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { setupAuth, setupAuthRoutes } from "./auth";
import { registerRoutes } from "./routes";

(async () => {
  try {
    log('Starting server initialization...');

    // Create Express app with minimal middleware
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    log('Basic middleware configured');

    // Health check route to verify server is working
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', message: 'Server is running' });
    });
    log('Health check route added');

    // Create HTTP server
    const server = createServer(app);
    log('HTTP server created');

    // Setup Vite for development
    if (process.env.NODE_ENV !== "production") {
      await setupVite(app);
      log('Vite middleware configured');
    } else {
      serveStatic(app);
      log('Static serving configured');
    }

    // Setup auth and routes after Vite
    setupAuth(app);
    setupAuthRoutes(app);
    registerRoutes(app);
    log('Auth and routes configured');

    // Start server
    const PORT = process.env.PORT || 5000; 
    log(`Attempting to start server on port ${PORT}`);

    server.listen(PORT, '0.0.0.0', () => {
      log(`Server successfully started on port ${PORT}`);
    });

    server.on('error', (err) => {
      if ((err as any).code === 'EADDRINUSE') {
        log(`Error: Port ${PORT} is already in use`);
      } else {
        log('Server error:', err);
      }
    });

  } catch (error) {
    log('Server initialization failed:', error);
  }
})();