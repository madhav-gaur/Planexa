import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.route.js";
import { connectDB } from "./config/connectDb.js";
import { refreshTokenRouter } from "./routes/refreshToken.route.js";
import { workspaceRouter } from "./routes/workspace.route.js";
import { projectRouter } from "./routes/project.route.js";
import { taskRouter } from "./routes/task.route.js";
import notificationRouter from "./routes/notification.route.js";
import { activityRouter } from "./routes/activity.route.js";
import { reportRouter } from "./routes/report.route.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ["http://localhost:5173", "https://planexa-web.vercel.app"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin: " + origin));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(morgan("combined"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.get("/", (req, res) => {
  res.send("SERVER RUNNING");
});
app.use("/api/user", userRouter);
app.use("/api/auth", refreshTokenRouter);
app.use("/api/workspace", workspaceRouter);
app.use("/api/project", projectRouter);
app.use("/api/task", taskRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/activity", activityRouter);
app.use("/api/report", reportRouter);
const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server started on port", PORT);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
