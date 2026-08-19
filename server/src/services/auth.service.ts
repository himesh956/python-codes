import { Types } from "mongoose";
import { User, IUser } from "../models/User";
import { CandidateProfile } from "../models/CandidateProfile";
import { EmployerProfile } from "../models/EmployerProfile";
import { Company } from "../models/Company";
import { AppError } from "../utils/AppError";
import { hashPassword, comparePassword, hashToken, compareTokenHash } from "../utils/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { Role, ROLES } from "../constants/roles";
import { RegisterInput, LoginInput } from "../validators/auth.validators";

interface AuthResult {
  user: {
    id: string;
    email: string;
    role: Role;
  };
  accessToken: string;
  refreshToken: string;
}

async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw AppError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    email: input.email,
    passwordHash,
    role: input.role,
  });

  if (input.role === ROLES.CANDIDATE) {
    await CandidateProfile.create({
      user: user._id,
      fullName: input.fullName,
    });
  } else if (input.role === ROLES.EMPLOYER) {
    const company = await Company.create({
      name: `${input.fullName}'s Company`,
      createdBy: user._id,
    });
    await EmployerProfile.create({
      user: user._id,
      company: company._id,
      fullName: input.fullName,
    });
  }

  return issueTokens(user);
}

async function login(input: LoginInput): Promise<AuthResult> {
  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  if (!user) {
    throw AppError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw AppError.forbidden("This account has been disabled");
  }

  const isMatch = await comparePassword(input.password, user.passwordHash);
  if (!isMatch) {
    throw AppError.unauthorized("Invalid email or password");
  }

  return issueTokens(user);
}

async function refresh(token: string | undefined): Promise<AuthResult> {
  if (!token) {
    throw AppError.unauthorized("Refresh token missing");
  }

  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw AppError.unauthorized("Invalid or expired refresh token");
  }

  const user = await User.findById(payload.sub).select("+refreshTokenHash");
  if (!user || !user.refreshTokenHash) {
    throw AppError.unauthorized("Invalid refresh token");
  }

  const isMatch = compareTokenHash(token, user.refreshTokenHash);
  if (!isMatch) {
    throw AppError.unauthorized("Invalid refresh token");
  }

  return issueTokens(user);
}

async function logout(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
}

async function getMe(userId: string): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw AppError.notFound("User not found");
  }
  return user;
}

/**
 * Requires the current password before allowing a change — even
 * though the request is already authenticated, this stops a stolen
 * access token (short-lived, but still) from being used to silently
 * take over the account by changing the password. Also invalidates
 * the refresh token, forcing re-login everywhere else.
 */
async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) {
    throw AppError.notFound("User not found");
  }

  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw AppError.unauthorized("Current password is incorrect");
  }

  user.passwordHash = await hashPassword(newPassword);
  user.refreshTokenHash = null; // force re-login on all other sessions
  await user.save();
}

async function issueTokens(user: IUser): Promise<AuthResult> {
  const userId = (user._id as Types.ObjectId).toString();

  const accessToken = signAccessToken({ sub: userId, role: user.role });
  const refreshToken = signRefreshToken({ sub: userId });

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return {
    user: { id: userId, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

export const authService = { register, login, refresh, logout, getMe, changePassword };