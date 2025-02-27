import express from "express";
import { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { setupAuth, setupAuthRoutes } from "./auth";
import { registerRoutes } from "./routes";

(async () => {
  try {
    // Create Express app
    const app = express();
    log('Express app created');

    // Basic middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    log('Basic middleware configured');

    app.set("trust proxy", 1);

    // Setup auth
    setupAuth(app);
    log('Auth setup completed');

    // Setup auth routes
    setupAuthRoutes(app);
    log('Auth routes configured');

    // API routes
    const apiRouter = express.Router();
    app.use('/api', apiRouter);
    registerRoutes(apiRouter);
    log('API routes registered');

    // API error handling
    app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
      log('API Error:', err.message);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // Create HTTP server
    const server = createServer(app);
    log('HTTP server created');

    // Setup Vite or static serving last
    if (process.env.NODE_ENV !== "production") {
      log('Setting up Vite development server...');
      await setupVite(app);
      log('Vite setup completed');
    } else {
      log('Setting up static file serving...');
      serveStatic(app);
      log('Static serving setup completed');
    }

    // Start server
    const PORT = process.env.PORT || 5000;

    // Close any existing connections
    try {
      server.close();
    } catch (err) {
      // Ignore errors if no server was running
    }

    server.listen(PORT, () => {
      log(`Server listening on port ${PORT}`);
    });

    server.on('error', (err: Error) => {
      log('Server error:', err);
      if ((err as any).code === 'EADDRINUSE') {
        log(`Port ${PORT} is already in use`);
        process.exit(1);
      }
      process.exit(1);
    });

  } catch (error) {
    log('Failed to start server:', error);
    process.exit(1);
  }
})();