import express from "express";
import { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { log } from "./vite";

(async () => {
  try {
    log('Starting minimal server initialization...');

    // Create Express app
    const app = express();
    log('Express app created');

    // Basic middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    log('Basic middleware configured');

    // Test route to verify Express is working
    app.get('/test', (req, res) => {
      res.json({ status: 'ok', message: 'Express server is running' });
    });
    log('Test route added');

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
        if ((err as any).code === 'EADDRINUSE') {
          log(`Port ${PORT} is already in use`);
          reject(new Error(`Port ${PORT} is already in use. Please ensure no other process is using this port.`));
        } else {
          log('Server error:', err);
          reject(err);
        }
      });
    });

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