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
        username = username.trim();
        console.log('[Auth] Attempting login for:', username);

        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log('[Auth] User not found:', username);
          return done(null, false, { message: "Invalid username or password" });
        }

        console.log('[Auth] Found user:', username);
        const isValid = await comparePasswords(password, user.password);
        console.log('[Auth] Password validation result:', isValid);

        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (err) {
        console.error('[Auth] Error during authentication:', err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user: SelectUser, done) => {
    console.log('[Auth] Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('[Auth] Deserializing user:', id);
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      console.error('[Auth] Error during deserialization:', err);
      done(err);
    }
  });
}

export function setupAuthRoutes(app: Express) {
  // Login route handler
  app.post("/api/login", (req, res, next) => {
    if (req.body.username) {
      req.body.username = req.body.username.trim();
    }

    console.log('[Auth] Login request received:', req.body.username);

    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error('[Auth] Login error:', err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        console.log('[Auth] Authentication failed:', info?.message);
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error('[Auth] Session creation error:', err);
          return res.status(500).json({ message: "Error during login" });
        }
        console.log('[Auth] Login successful for:', user.username);
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
      // Trim username before validation
      if (req.body.username) {
        req.body.username = req.body.username.trim();
      }

      console.log('[Auth] Registration request received');
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login after registration" });
        }
        console.log('[Auth] Registration successful for:', user.username);
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
      res.status(500).json({ message: "Error during registration" });
    }
  });

  // Logout route handler
  app.post("/api/logout", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Error clearing session" });
        }
        res.clearCookie('gluco.sid');
        res.sendStatus(200);
      });
    });
  });

  // Get current user route handler
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

async function hashPassword(password: string): Promise<string> {
  try {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    const hashedPassword = `${buf.toString("hex")}.${salt}`;
    console.log('[Auth] Password hashed successfully');
    return hashedPassword;
  } catch (err) {
    console.error('[Auth] Error hashing password:', err);
    throw new Error('Failed to hash password');
  }
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    console.log('[Auth] Comparing passwords');
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error('[Auth] Invalid stored password format');
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (err) {
    console.error('[Auth] Error comparing passwords:', err);
    return false;
  }
}