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

    // API routes first to ensure they're not intercepted by Vite
    const apiRouter = express.Router();
    app.use('/api', apiRouter);

    // Setup core auth
    setupAuth(app);
    log('Auth setup completed');

    // Setup auth routes
    setupAuthRoutes(app);
    log('Auth routes configured');

    // Register other API routes
    registerRoutes(apiRouter);
    log('API routes registered');

    // Test route
    app.get('/test', (req, res) => {
      res.json({ status: 'ok', message: 'Express server is running' });
    });
    log('Test route added');

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
    log(`Attempting to start server on port ${PORT}...`);

    await new Promise<void>((resolve, reject) => {
      try {
        server.listen(PORT, '0.0.0.0', () => {
          log(`Server listening on port ${PORT}`);
          resolve();
        });

        server.on('error', (err) => {
          if ((err as any).code === 'EADDRINUSE') {
            log(`Port ${PORT} is already in use`);
            reject(new Error(`Port ${PORT} is already in use`));
          } else {
            log('Server error:', err);
            reject(err);
          }
        });
      } catch (err) {
        log('Error during server startup:', err);
        reject(err);
      }
    });

    log(`Server running at http://0.0.0.0:${PORT}`);
  } catch (error) {
    log('Failed to start server:', error);
    process.exit(1);
  }
})();