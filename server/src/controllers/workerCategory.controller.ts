import { Request, Response } from "express";
import { workerCategoryService } from "../services/workerCategory.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";

export const listCategories = catchAsync(async (_req: Request, res: Response) => {
  const categories = await workerCategoryService.listActive();
  sendSuccess(res, 200, { data: { categories } });
});

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await workerCategoryService.create(req.body);
  sendSuccess(res, 201, { message: "Category created", data: { category } });
});

export const deactivateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await workerCategoryService.deactivate(req.params.id);
  sendSuccess(res, 200, { message: "Category deactivated", data: { category } });
});