import { Router } from "express";
import * as recurringController from "../controllers/recurringBooking.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { validateObjectId } from "../middlewares/validateObjectId";
import { createRecurringScheduleSchema } from "../validators/bulkBooking.validators";

const router = Router();

router.use(authenticate);

router.post("/", validate(createRecurringScheduleSchema), recurringController.createSchedule);
router.get("/my", recurringController.getMySchedules);
router.patch("/:id/cancel", validateObjectId("id"), recurringController.cancelSchedule);

export default router;