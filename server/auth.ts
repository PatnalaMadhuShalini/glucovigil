import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export function setupAuth(app: Express) {
  app.use(session({
    secret: 'gluco-smart-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false);
      }

      const [hash, salt] = user.password.split('.');
      const buf = await scryptAsync(password, salt, 64) as Buffer;
      const isValid = hash === buf.toString('hex');

      if (!isValid) {
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

export function setupAuthRoutes(app: Express) {
  // Simple registration route
  app.post("/api/register", async (req, res) => {
    try {
      // Basic validation
      const { username, password, fullName, email, phone, gender, place } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check for existing user first
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user with minimal data first
      const userData = {
        username,
        password: hashedPassword,
        fullName: fullName || username,
        email: email || '',
        phone: phone || '',
        gender: gender || 'other',
        place: place || ''
      };

      const user = await storage.createUser(userData);

      // Auto login after registration
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

    } catch (error: any) {
      console.error('Registration error:', error);
      return res.status(400).json({ 
        message: "Registration failed: " + error.message
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
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

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = req.user as any;
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