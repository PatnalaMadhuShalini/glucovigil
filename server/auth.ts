import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Router } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";

const scryptAsync = promisify(scrypt);

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'gluco-smart-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'lax'
    },
    name: 'gluco.sid'
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log('Attempting login for user:', username);
        const user = await storage.getUserByUsername(username);

        if (!user) {
          console.log('User not found:', username);
          return done(null, false, { message: "Invalid username or password" });
        }

        console.log('Comparing passwords for user:', username);
        const isValid = await comparePasswords(password, user.password);
        console.log('Password comparison result:', isValid);

        if (!isValid) {
          console.log('Invalid password for user:', username);
          return done(null, false, { message: "Invalid username or password" });
        }

        console.log('Login successful for user:', username);
        return done(null, user);
      } catch (err) {
        console.error('Authentication error:', err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('Deserializing user:', id);
      const user = await storage.getUser(id);
      if (!user) {
        console.warn(`User ${id} not found during deserialization`);
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      console.error('Deserialization error:', err);
      done(err);
    }
  });
}

export function setupAuthRoutes(app: Express) {
  // Login route handler
  app.post("/api/login", (req, res, next) => {
    console.log('Login request received:', { 
      username: req.body.username,
      hasPassword: !!req.body.password 
    });

    if (!req.body.username || !req.body.password) {
      console.log('Missing credentials in request');
      return res.status(400).json({ message: "Username and password are required" });
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        console.log('Authentication failed:', info?.message);
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Session creation error:", err);
          return res.status(500).json({ message: "Error during login" });
        }
        console.log('Login successful for user:', user.username);
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

  // Register route handler
  app.post("/api/register", async (req, res) => {
    try {
      console.log('Registration request received');
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        console.log('Username already exists:', validatedData.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      console.log('User registered successfully:', user.username);
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({ message: "Error during login after registration" });
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
      console.error("Registration error:", err);
      if (err instanceof Error) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Error during registration" });
    }
  });

  // Logout route handler
  app.post("/api/logout", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    console.log('Logout request received');
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error during logout" });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Error clearing session" });
        }
        res.clearCookie('gluco.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: 'lax'
        });
        console.log('Logout successful');
        res.sendStatus(200);
      });
    });
  });

  // Get current user route handler
  app.get("/api/user", (req, res) => {
    console.log('User info request received');
    if (!req.isAuthenticated()) {
      console.log('User not authenticated');
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as SelectUser;
    console.log('Returning user info for:', user.username);
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

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;

    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (err) {
    console.error('Error in comparePasswords:', err);
    return false;
  }
}