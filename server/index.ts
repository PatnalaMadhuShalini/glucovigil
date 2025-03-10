import express from "express";
import { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { setupAuth, setupAuthRoutes } from "./auth";
import { registerRoutes } from "./routes";
import net from "net"; // Import net module using ESM syntax

// Start with detailed logging for diagnostics
console.log('Starting server process with PID:', process.pid);
console.log('Current working directory:', process.cwd());
console.log('Node environment:', process.env.NODE_ENV || 'development');

// Check for active ports to detect port conflicts early
async function isPortInUse(port: number): Promise<boolean> {
  log(`Checking availability of port ${port}...`);
  return new Promise((resolve) => {
    const tester = net.createServer() // Use imported net module
      .once('error', () => {
        log(`Port ${port} is in use`);
        resolve(true);
      })
      .once('listening', () => {
        log(`Port ${port} is available`);
        tester.once('close', () => resolve(false)).close();
      })
      .listen(port, '0.0.0.0');
  });
}

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
    log('Setting up auth routes...');
    setupAuthRoutes(apiRouter);
    log('Registering API routes...');
    await registerRoutes(apiRouter);
    log('Routes registration complete');

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

    // Use a fixed port for improved startup reliability
    const port = 5001; // Fixed port to reduce selection complexity
    log(`Using fixed port ${port} for improved startup reliability`);

    // Create HTTP server only when ready to start
    const server = createServer(app);

    // Skip Vite in workflow to improve startup time
    if (process.env.WORKFLOW_NAME && process.env.NODE_ENV !== 'production') {
      log('Running in workflow mode, using static file serving for faster startup');
      serveStatic(app);
    } else if (app.get("env") === "development") {
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

    // Start server on the fixed port with proper error handling
    log(`Attempting to start server on port ${port}...`);
    server.listen(port, '0.0.0.0', () => {
      log(`Server running at http://0.0.0.0:${port}`);
    }).on('error', (err: Error & { code?: string }) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${port} is in use, trying alternative port`);
        // If port is in use, try an alternative
        server.listen(5002, '0.0.0.0', () => {
          log(`Server running at http://0.0.0.0:5002 (alternative port)`);
        }).on('error', (err2) => {
          log(`Failed to start server on alternative port: ${err2.message}`);
          process.exit(1);
        });
      } else {
        log(`Failed to start server: ${err.message}`);
        process.exit(1);
      }
    });

  } catch (error) {
    if (error instanceof Error) {
      log('Failed to start server:', error.message);
    } else {
      log('Failed to start server:', String(error));
    }
    process.exit(1);
  }
})();