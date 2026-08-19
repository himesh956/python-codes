import { Router } from "express";
import * as trustSafetyController from "../controllers/trustSafety.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { validateObjectId } from "../middlewares/validateObjectId";
import { createReportSchema, blockUserSchema } from "../validators/trustSafety.validators";
import { resolveReportSchema } from "../validators/adminReport.validators";
import { ROLES } from "../constants/roles";

const router = Router();

router.use(authenticate);

router.post("/reports", validate(createReportSchema), trustSafetyController.createReport);
router.post("/blocks", validate(blockUserSchema), trustSafetyController.blockUser);
router.delete("/blocks/:userId", validateObjectId("userId"), trustSafetyController.unblockUser);
router.get("/blocks/my", trustSafetyController.getMyBlockedUsers);

router.get("/reports/admin", authorize(ROLES.ADMIN), trustSafetyController.listReportsForAdmin);
router.patch(
  "/reports/admin/:id/resolve",
  authorize(ROLES.ADMIN),
  validateObjectId("id"),
  validate(resolveReportSchema),
  trustSafetyController.resolveReport
);

export default router;