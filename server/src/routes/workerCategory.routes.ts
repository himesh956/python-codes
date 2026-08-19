import { Router } from "express";
import * as categoryController from "../controllers/workerCategory.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { validateObjectId } from "../middlewares/validateObjectId";
import { createCategorySchema } from "../validators/workerCategory.validators";
import { ROLES } from "../constants/roles";

const router = Router();

// Public — anyone browsing needs to see categories to filter by.
router.get("/", categoryController.listCategories);

// Admin-only management.
router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createCategorySchema),
  categoryController.createCategory
);
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize(ROLES.ADMIN),
  validateObjectId("id"),
  categoryController.deactivateCategory
);

export default router;