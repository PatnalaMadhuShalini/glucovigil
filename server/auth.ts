import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";

const scryptAsync = promisify(scrypt);

// Simple password hashing
async function hashPassword(password: string, salt?: string) {
  const actualSalt = salt || randomBytes(16).toString('hex');
  const hashedBuffer = await scryptAsync(password, actualSalt, 64) as Buffer;
  return `${hashedBuffer.toString('hex')}.${actualSalt}`;
}

export function setupAuth(app: Express) {
  // Session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || 'gluco-smart-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false);
      }

      // Verify password
      const [, salt] = user.password.split('.');
      const hashedPassword = await hashPassword(password, salt);

      if (hashedPassword === user.password) {
        return done(null, user);
      }

      return done(null, false);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: SelectUser, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });
}

export function setupAuthRoutes(app: Express) {
  // Login
  app.post("/api/login", (req, res, next) => {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    passport.authenticate("local", (err: any, user: any) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }

        return res.json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          place: user.place
        });
      });
    })(req, res, next);
  });

  // Register
  app.post("/api/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      // Check existing user
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword
      });

      // Login after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }

        return res.json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          place: user.place
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = req.user as SelectUser;
    res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      place: user.place
    });
  });
}