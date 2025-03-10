import express from "express";
import { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { setupAuth, setupAuthRoutes } from "./auth";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";

// Start with detailed logging for diagnostics
console.log('Starting server process with PID:', process.pid);
console.log('Current working directory:', process.cwd());
console.log('Node environment:', process.env.NODE_ENV || 'development');

const app = express();
const apiRouter = express.Router();

// Log the port configuration
log(`Deployment expects traffic on port 5000 forwarded to external port 80`);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup core auth (session, passport) on main app
setupAuth(app);

// Mount API router
app.use('/api', apiRouter);

// Test route to verify API and auth state
apiRouter.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    authenticated: req.isAuthenticated(),
    user: req.user ? {
      id: req.user.id,
      username: req.user.username
    } : null
  });
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

    const port = 5000;
    log(`Using port ${port} to match deployment configuration`);

    // Create HTTP server
    const server = createServer(app);

    // Handle static file serving and Vite setup based on environment
    if (process.env.WORKFLOW_NAME) {
      log('Running in workflow mode, checking build directory...');
      const staticPath = path.resolve(__dirname, '../dist/public');

      // Verify build directory exists
      if (!fs.existsSync(staticPath)) {
        log(`Error: Build directory not found at ${staticPath}`);
        log('Please ensure "npm run build" has been executed');
        process.exit(1);
      }

      log(`Serving static files from ${staticPath}`);
      app.use(express.static(staticPath));

      // Serve index.html for client-side routing
      app.get('*', (_req, res) => {
        const indexPath = path.join(staticPath, 'index.html');
        if (!fs.existsSync(indexPath)) {
          log(`Error: index.html not found at ${indexPath}`);
          return res.status(500).send('Server configuration error: index.html not found');
        }
        res.sendFile(indexPath);
      });
    } else if (process.env.NODE_ENV === "development") {
      log('Setting up Vite development server...');
      await setupVite(app, server);
    } else {
      log('Setting up static file serving for production...');
      serveStatic(app);
    }

    // Generic error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log('Error:', err.message);
      res.status(status).json({ message });
    });

    // Explicitly bind to 0.0.0.0 for external connections
    log(`Starting server on port ${port} bound to 0.0.0.0 for external access...`);
    server.listen(port, '0.0.0.0', () => {
      log(`Server running at http://0.0.0.0:${port}`);
    }).on('error', (err: Error & { code?: string }) => {
      log(`Failed to start server: ${err.message}`);
      process.exit(1);
    });

  } catch (error) {
    log('Failed to start server:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
})();