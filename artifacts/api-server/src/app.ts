import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import router from "./routes";

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

const app: Express = express();

app.use(canonicalRedirect);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", router);

export default app;
