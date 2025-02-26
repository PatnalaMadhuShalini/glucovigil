import express from "express";
import { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from 'http';
import { setupAuth, setupAuthRoutes } from "./auth";
import { registerRoutes } from "./routes";

// Create Express app
const app = express();
const apiRouter = express.Router();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup core auth (session, passport) on main app
setupAuth(app);

// Mount API router
app.use('/api', apiRouter);

// Test route to verify Express is working
app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Express server is running' });
});

// Ensure JSON content-type for API routes
apiRouter.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Enhanced logging middleware for API routes
apiRouter.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }
    if (logLine.length > 80) {
      logLine = logLine.slice(0, 79) + "…";
    }
    log(logLine);
  });
  next();
});

// API error handling middleware
apiRouter.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log('API Error:', err.message);
  res.status(status).json({ message });
});


(async () => {
  try {
    log('Starting server initialization...');

    // Setup auth routes and register API routes on the router
    setupAuthRoutes(apiRouter);
    await registerRoutes(apiRouter);

    // Create HTTP server
    const server = createServer(app);

    // Add middleware to skip Vite/static for API routes
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        next('route');
        return;
      }
      next();
    });

    // Catch-all handler for unmatched API routes
    app.all("/api/*", (req, res) => {
      log(`Unmatched API route: ${req.method} ${req.path}`);
      return res.status(404).json({
        message: "API endpoint not found",
        path: req.path,
        method: req.method
      });
    });

    // Try different ports if default is in use
    const ports = [5000, 5001, 5002, 5003];
    let port: number | undefined;

    for (const p of ports) {
      try {
        log(`Attempting to start server on port ${p}...`);
        await server.listen({
          port: p,
          host: "0.0.0.0",
        });
        port = p;
        log(`Successfully bound to port ${p}`);
        break;
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'EADDRINUSE') {
          log(`Port ${p} is in use, trying next port...`);
          continue;
        }
        throw error;
      }
    }

    if (!port) {
      throw new Error('All ports are in use');
    }

    // Setup Vite/static serving after API routes are established
    if (app.get("env") === "development") {
      log('Setting up Vite development server...');
      await setupVite(app, server);
    } else {
      log('Setting up static file serving...');
      serveStatic(app);
    }

    // Generic error handler comes last
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log('Error:', err.message);
      res.status(status).json({ message });
    });

    log(`Server running at http://0.0.0.0:${port}`);
  } catch (error) {
    if (error instanceof Error) {
      log('Failed to start server:', error.message);
    } else {
      log('Failed to start server:', String(error));
    }
    process.exit(1);
  }
})();