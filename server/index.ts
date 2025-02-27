import express from "express";
import { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { setupAuth, setupAuthRoutes } from "./auth";
import { registerRoutes } from "./routes";

(async () => {
  try {
    log('Starting server initialization...');

    // Create Express app
    const app = express();
    log('Express app created');

    // Basic middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    log('Basic middleware configured');

    // Setup core auth (session, passport) on main app
    await setupAuth(app);
    log('Auth setup completed');

    // Setup auth routes directly on the app since they need session access
    setupAuthRoutes(app);
    log('Auth routes configured');

    // Mount API router and register API routes
    const apiRouter = express.Router();
    app.use('/api', apiRouter);
    registerRoutes(apiRouter);
    log('API routes registered');

    // Test route to verify Express is working
    app.get('/test', (req, res) => {
      res.json({ status: 'ok', message: 'Express server is running' });
    });

    // API error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log('API Error:', err.message);
      res.status(status).json({ message });
    });

    // Create HTTP server
    const server = createServer(app);
    log('HTTP server created');

    // Listen on port 5000
    const PORT = 5000;
    log(`Attempting to start server on port ${PORT}...`);

    await new Promise<void>((resolve, reject) => {
      server.listen(PORT, '0.0.0.0', () => {
        log(`Successfully bound to port ${PORT}`);
        resolve();
      });

      server.on('error', (err) => {
        log('Server error:', err);
        reject(err);
      });
    });

    // Since we're debugging, skip Vite setup initially
    if (process.env.NODE_ENV === 'production') {
      log('Setting up static file serving...');
      serveStatic(app);
    }

    log(`Server running at http://0.0.0.0:${PORT}`);
  } catch (error) {
    if (error instanceof Error) {
      log('Failed to start server:', error.message);
    } else {
      log('Failed to start server:', String(error));
    }
    process.exit(1);
  }
})();