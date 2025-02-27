import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";

const scryptAsync = promisify(scrypt);

export function setupAuth(app: Express) {
  // Set up session with secure settings
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'gluco-smart-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    },
    name: 'gluco.sid'
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Find user in database
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        // Verify password
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

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
  // Login route
  app.post("/api/login", (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error occurred" });
      }

      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Session creation failed" });
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

  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      // Check if username exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      // Log user in after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login after registration failed" });
        }

        return res.status(201).json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          place: user.place
        });
      });
    } catch (err) {
      if (err instanceof Error) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Session destruction failed" });
        }
        res.clearCookie('gluco.sid');
        res.sendStatus(200);
      });
    });
  });

  // Get current user route
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

// Password hashing utility functions
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (err) {
    return false;
  }
}