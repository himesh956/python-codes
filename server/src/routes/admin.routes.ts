import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { ROLES } from "../constants/roles";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize(ROLES.ADMIN),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin dashboard access granted",
    });
  }
);

export default router;