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

async function verifyPassword(password: string, stored: string) {
  const [hash, salt] = stored.split('.');
  const buf = await scryptAsync(password, salt, 64) as Buffer;
  return buf.toString('hex') === hash;
}

export function setupAuth(app: Express) {
  app.use(session({
    secret: 'gluco-smart-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
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

      const isValid = await verifyPassword(password, user.password);
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
  app.post("/api/register", async (req, res) => {
    try {
      // Basic validation
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      console.log(`Registration attempt for username: ${username}`);

      // Validate using schema
      const data = insertUserSchema.parse(req.body);

      // Check existing user
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        console.log(`Registration failed: Username ${username} already exists`);
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword
      });

      console.log(`User ${username} created successfully`);

      // Log user in after registration
      req.login(user, (err) => {
        if (err) {
          console.error("Auto login after registration failed:", err);
          return res.status(201).json({ 
            message: "Registration successful but login failed. Please log in manually.",
            success: true,
            id: user.id,
            username: user.username,
            loginRequired: true
          });
        }

        console.log(`User ${username} automatically logged in after registration`);
        return res.status(201).json({
          message: "Registration successful",
          success: true,
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
        message: error.message || "Registration failed",
        success: false
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    console.log(`Login attempt for username: ${username}`);

    passport.authenticate("local", (err: any, user: any) => {
      if (err) {
        console.error("Login authentication error:", err);
        return res.status(500).json({ message: "Server error" });
      }
      if (!user) {
        console.log(`Login failed: Invalid credentials for ${username}`);
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login session error:", loginErr);
          return res.status(500).json({ message: "Login failed" });
        }

        console.log(`User ${username} logged in successfully`);
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