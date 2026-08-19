import { Router } from "express";
import mongoose from "mongoose";
import { sendSuccess } from "../utils/apiResponse";

const router = Router();

router.get("/", (_req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  sendSuccess(res, 200, {
    message: "LOCALHIRE API is healthy",
    data: {
      uptime: process.uptime(),
      database: dbState === 1 ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;