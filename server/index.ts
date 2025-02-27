import express from "express";
import { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { setupAuth, setupAuthRoutes } from "./auth";
import { registerRoutes } from "./routes";

(async () => {
  try {
    // Create Express app with minimal middleware
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Health check route
    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });


    // Create HTTP server
    const server = createServer(app);

    // Setup Vite for development
    if (process.env.NODE_ENV !== "production") {
      await setupVite(app);
    } else {
      serveStatic(app);
    }

    // Setup auth and routes
    setupAuth(app);
    setupAuthRoutes(app);
    registerRoutes(app);

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Server error:', err);
      res.status(500).json({ message: 'Internal server error' });
    });

    // Start server
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
})();