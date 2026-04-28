import path from "path";
import fs from "fs";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import router from "./routes";

const app: Express = express();

// Trust the first proxy hop so that rate-limiting and IP-based middleware
// read the real client IP from X-Forwarded-For (required behind Replit's proxy)
app.set("trust proxy", 1);

// Health checks — absolute first routes, no middleware, plain-text instant response
app.get("/", (_req, res) => { res.send("ok"); });
app.get("/healthz", (_req, res) => { res.send("ok"); });
app.get("/api/healthz", (_req, res) => { res.send("ok"); });

const CANONICAL_HOST = "universitio.com";

const ALLOWED_DEV_PATTERNS = [
  /^localhost(:\d+)?$/,
  /\.replit\.dev$/,
  /\.repl\.co$/,
  /\.replit\.app$/,
  /\.replit\.com$/,
];

function isDevHost(host: string): boolean {
  return ALLOWED_DEV_PATTERNS.some((pattern) => pattern.test(host));
}

function canonicalRedirect(req: Request, res: Response, next: NextFunction): void {
  const forwardedHost = req.headers["x-forwarded-host"];
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) || req.headers["host"] || "";
  const bareHost = host.split(":")[0].toLowerCase();

  if (!bareHost || bareHost === CANONICAL_HOST || isDevHost(bareHost)) {
    next();
    return;
  }

  const redirectUrl = `https://${CANONICAL_HOST}${req.originalUrl}`;
  res.redirect(301, redirectUrl);
}

app.use(canonicalRedirect);
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, false);
        return;
      }
      try {
        const { hostname } = new URL(origin);
        if (hostname === CANONICAL_HOST || isDevHost(hostname)) {
          callback(null, true);
          return;
        }
      } catch {
        // ignore malformed origin
      }
      callback(null, false);
    },
    credentials: true,
  })
);

// Cookie parser — used to read HttpOnly auth cookies in specific endpoints
app.use(cookieParser());

// Stripe webhook needs raw body for signature verification
app.use("/api/askimate/stripe-webhook", express.raw({ type: "application/json" }));

// Tight body limit for AI endpoint to prevent large payload abuse
app.use("/api/askimate/ai", express.json({ limit: "16kb" }));

// Global JSON parsing for all other routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiter for public lead intake endpoints — prevents storage/email exhaustion abuse
const leadsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use(
  [
    "/api/leads/consultation",
    "/api/leads/assessment",
    "/api/leads/partners",
    "/api/leads/referral",
    "/api/leads/contact",
    "/api/leads/service-request",
  ],
  leadsRateLimit,
);

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const staticDir = path.resolve(__dirname, "../../universitio/dist/public");
  if (fs.existsSync(staticDir)) {
    // Cache control middleware for static assets
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Long cache (1 year, immutable) for versioned/hashed assets
      // Pattern: asset-<hash>.ext (e.g., index-CiBoISeN.css, vendor-react-qwSqH58P.js)
      if (/\.(js|mjs|css|webp|png|jpg|jpeg|gif|svg|woff2|woff|ttf|eot|mp4|webm)$/.test(req.path) && /[-][a-zA-Z0-9]+\.(js|mjs|css|webp|png|jpg|jpeg|gif|svg|woff2|woff|ttf|eot|mp4|webm)$/.test(req.path)) {
        res.set("Cache-Control", "public, max-age=31536000, immutable");
      }
      // Medium cache (7 days) for non-hashed static assets
      else if (/\.(js|mjs|css|webp|png|jpg|jpeg|gif|svg|woff2|woff|ttf|eot|ico|xml|txt)$/.test(req.path)) {
        res.set("Cache-Control", "public, max-age=604800");
      }
      // Short cache (1 hour, revalidatable) for HTML
      else if (req.path.endsWith(".html") || req.path === "/") {
        res.set("Cache-Control", "public, max-age=3600, must-revalidate");
      }
      // Default for other files (1 day)
      else {
        res.set("Cache-Control", "public, max-age=86400");
      }
      next();
    });

    app.use(express.static(staticDir));

    // Valid frontend routes for 404 detection
    const validRoutePatterns = [
      /^\/$/,                                    // Home
      /^\/free-consultation$/,                   // Free Consultation
      /^\/assessment-form$/,                     // Assessment Form
      /^\/blog$/,                                // Blog listing
      /^\/blog\/[a-z0-9\-]+$/,                   // Blog post (:slug)
      /^\/blog\/category\/[a-z0-9\-]+$/,        // Blog category
      /^\/partners$/,                            // Partners
      /^\/student-referral$/,                    // Student Referral
      /^\/careers$/,                             // Careers
      /^\/terms-and-conditions$/,                // Terms
      /^\/privacy-policy$/,                      // Privacy
      /^\/admin(?:\/.*)?$/,                      // Admin and subroutes
    ];

    function isValidRoute(pathname: string): boolean {
      return validRoutePatterns.some((pattern) => pattern.test(pathname));
    }

    // SPA fallback with proper 404 status for unknown routes
    app.get("/{*splat}", (req: Request, res: Response) => {
      const pathname = req.path;
      const statusCode = isValidRoute(pathname) ? 200 : 404;
      res.status(statusCode).sendFile(path.join(staticDir, "index.html"));
    });
  }
}

export default app;
