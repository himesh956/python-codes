import { Response } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { env } from "../config/env";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Request } from "express";

const REFRESH_COOKIE_NAME = "localhire_refresh_token";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: "/api/auth",
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
}

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, 201, {
    message: "Account created successfully",
    data: { user: result.user, accessToken: result.accessToken },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, 200, {
    message: "Logged in successfully",
    data: { user: result.user, accessToken: result.accessToken },
  });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  const result = await authService.refresh(token);
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, 200, {
    message: "Token refreshed",
    data: { user: result.user, accessToken: result.accessToken },
  });
});

export const logout = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    await authService.logout(req.user.id);
  }
  clearRefreshCookie(res);
  sendSuccess(res, 200, { message: "Logged out successfully" });
});

export const me = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  sendSuccess(res, 200, {
    data: {
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

export const changePassword = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  clearRefreshCookie(res);
  sendSuccess(res, 200, {
    message: "Password changed successfully. Please log in again.",
  });
});