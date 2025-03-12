import express, { type Request, Response, NextFunction } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import viteConfig from "../vite.config";
import { setupVite, log } from "./vite";
import { setupAuth, setupAuthRoutes } from "./auth";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start with detailed logging for diagnostics
console.log('Starting server process with PID:', process.pid);
console.log('Current working directory:', process.cwd());
console.log('Node environment:', process.env.NODE_ENV || 'development');

const app = express();
const apiRouter = express.Router();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup core auth (session, passport) on main app
setupAuth(app);

// Mount API router
app.use('/api', apiRouter);

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

    // Setup auth routes and register API routes
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

    // Serve static files from public directory
    log('Setting up diagram routes...');
    const publicPath = path.join(process.cwd(), 'public');
    
    // Serve diagrams.html from both /diagrams and /diagrams.html routes
    app.get(['/diagrams', '/diagrams.html'], (req, res) => {
      log(`Serving diagrams.html from ${req.path}`);
      res.sendFile(path.join(publicPath, 'diagrams.html'));
    });
    
    // Serve static files
    app.use(express.static(publicPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.png') || filePath.endsWith('.jpg')) {
          res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        }
      }
    }));
    
    log('Diagram routes setup complete');

    const port = process.env.PORT || 5000;
    log(`Using port ${port}`);

    // Create HTTP server
    const server = createServer(app);

    // Configure server based on environment
    if (process.env.NODE_ENV === 'production') {
      log('Running in production mode...');

      // In production, use the current working directory as base
      const projectRoot = dirname(__dirname); // Go up one level from server/
      const staticPath = path.join(projectRoot, 'dist', 'public');

      log(`Production static path: ${staticPath}`);

      // Verify build directory exists
      if (!fs.existsSync(staticPath)) {
        log('Error: Production build directory not found at', staticPath);
        throw new Error('Production build not found');
      }

      // Serve static files
      app.use(express.static(staticPath));

      // Serve index.html for client-side routing
      app.get('*', (_req, res) => {
        const indexPath = path.join(staticPath, 'index.html');
        if (!fs.existsSync(indexPath)) {
          log('Error: index.html not found at', indexPath);
          throw new Error('index.html not found in build directory');
        }
        res.sendFile(indexPath);
      });
    } else {
      // Development mode - use Vite
      log('Setting up Vite development server...');
      await setupVite(app, server);
    }

    // Start server
    server.listen(Number(port), '0.0.0.0', () => {
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