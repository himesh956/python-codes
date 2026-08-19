import { Report, IReport } from "../models/Report";
import { Block } from "../models/Block";
import { AppError } from "../utils/AppError";

async function createReport(
  reporterId: string,
  targetType: "USER" | "JOB" | "WORKER_PROFILE",
  targetId: string,
  reason: string,
  details?: string
): Promise<IReport> {
  return Report.create({
    reportedBy: reporterId,
    targetType,
    targetId,
    reason,
    details,
  });
}

async function listReportsForAdmin(status?: string): Promise<IReport[]> {
  const filter = status ? { status } : {};
  return Report.find(filter).sort({ createdAt: -1 }).populate("reportedBy", "email role");
}

async function resolveReport(
  adminId: string,
  reportId: string,
  status: "REVIEWED" | "DISMISSED"
): Promise<IReport> {
  const report = await Report.findByIdAndUpdate(
    reportId,
    { $set: { status, reviewedBy: adminId } },
    { new: true }
  );
  if (!report) throw AppError.notFound("Report not found");
  return report;
}

async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  if (blockerId === blockedId) throw AppError.badRequest("You cannot block yourself");

  const existing = await Block.findOne({ blocker: blockerId, blocked: blockedId });
  if (existing) return; // idempotent — already blocked, no error

  await Block.create({ blocker: blockerId, blocked: blockedId });
}

async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  await Block.deleteOne({ blocker: blockerId, blocked: blockedId });
}

async function getMyBlockedUsers(blockerId: string): Promise<string[]> {
  const blocks = await Block.find({ blocker: blockerId }).select("blocked");
  return blocks.map((b) => b.blocked.toString());
}

/**
 * Checked from chat.service.ts / calling.service.ts before allowing a
 * new interaction — if EITHER party has blocked the other, the
 * interaction is refused. This is the actual enforcement point; the
 * Block model alone does nothing without this check being called.
 */
async function isBlockedEitherWay(userIdA: string, userIdB: string): Promise<boolean> {
  const block = await Block.findOne({
    $or: [
      { blocker: userIdA, blocked: userIdB },
      { blocker: userIdB, blocked: userIdA },
    ],
  });
  return Boolean(block);
}

export const trustSafetyService = {
  createReport,
  listReportsForAdmin,
  resolveReport,
  blockUser,
  unblockUser,
  getMyBlockedUsers,
  isBlockedEitherWay,
};