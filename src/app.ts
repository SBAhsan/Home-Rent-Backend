import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import routes from "./routes.js";
import { PUBLIC_UPLOAD_DIR } from "./services/storage.service.js";
import { notFound } from "./middlewares/not-found.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});

// the frontend runs on another origin, so images must be allowed cross-origin
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// before the limiter, so loading many images doesn't use up the request limit
app.use("/uploads", express.static(PUBLIC_UPLOAD_DIR));

app.use(limiter);
app.use(routes);

app.use(notFound);
app.use(errorHandler);

export default app;