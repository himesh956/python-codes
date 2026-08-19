import { Router } from "express";
import * as bulkController from "../controllers/bulkBooking.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { bulkBookingLimiter } from "../middlewares/bulkBookingLimiter";
import { createBulkRequestSchema } from "../validators/bulkBooking.validators";

const router = Router();

router.use(authenticate);

router.post("/", bulkBookingLimiter, validate(createBulkRequestSchema), bulkController.createBulkRequest);
router.get("/my", bulkController.getMyBulkRequests);

export default router;