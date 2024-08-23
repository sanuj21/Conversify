import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { createServer } from "http";
import requestIp from "request-ip";
import { Server } from "socket.io";
// import session from "express-session";
import { initializeSocketIO } from "./socket/index.js";
import { ApiError } from "./utils/ApiError.js";
import passport from "passport";

const app = express();

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

app.set("io", io); // using set method to mount the `io` instance on the app to avoid usage of `global`

// global middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// required for passport
// app.use(
//   session({
//     secret: process.env.EXPRESS_SESSION_SECRET,
//     resave: true,
//     saveUninitialized: true,
//   })
// ); // session secret
app.use(passport.initialize());
// app.use(passport.session()); // persistent login sessions

app.use(requestIp.mw());

// Rate limiter to avoid misuse of the service and avoid cost spikes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

// app.use(morganMiddleware);
// api routes
import { errorHandler } from "./middlewares/error.middlewares.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

// * App routes
import userRouter from "./routes/user.routes.js";

import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";

import { avoidInProduction } from "./middlewares/auth.middlewares.js";

// * healthcheck
app.use("/api/v1/healthcheck", healthcheckRouter);

// * Public apis

// * App apis
app.use("/api/v1/users", userRouter);

app.use("/api/v1/chat-app/chats", chatRouter);
app.use("/api/v1/chat-app/messages", messageRouter);

initializeSocketIO(io);

// common error handling middleware
app.use(errorHandler);

export { httpServer };
