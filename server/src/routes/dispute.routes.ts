import { Router } from "express";
import * as disputeController from "../controllers/dispute.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { validateObjectId } from "../middlewares/validateObjectId";
import { createDisputeSchema, resolveDisputeSchema } from "../validators/dispute.validators";
import { ROLES } from "../constants/roles";

const router = Router();

router.post("/", authenticate, validate(createDisputeSchema), disputeController.createDispute);

router.get("/admin", authenticate, authorize(ROLES.ADMIN), disputeController.listDisputesForAdmin);
router.patch(
  "/admin/:id/resolve",
  authenticate,
  authorize(ROLES.ADMIN),
  validateObjectId("id"),
  validate(resolveDisputeSchema),
  disputeController.resolveDispute
);

export default router;