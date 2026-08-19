import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import * as urgentBookingController from "../controllers/urgentBooking.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { validateObjectId } from "../middlewares/validateObjectId";
import {
  createBookingSchema,
  respondToBookingSchema,
  updateBookingStatusSchema,
} from "../validators/booking.validators";

const router = Router();

router.use(authenticate);

router.post("/", validate(createBookingSchema), bookingController.createBooking);
router.get("/my/as-customer", bookingController.getMyBookingsAsCustomer);
router.get("/my/as-worker", bookingController.getMyBookingsAsWorker);
router.get("/:id", validateObjectId("id"), bookingController.getBookingById);
router.patch(
  "/:id/respond",
  validateObjectId("id"),
  validate(respondToBookingSchema),
  bookingController.respondToBooking
);
router.patch(
  "/:id/status",
  validateObjectId("id"),
  validate(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);
router.get("/:bookingId/suggest-next", validateObjectId("bookingId"), urgentBookingController.suggestNext);

export default router;