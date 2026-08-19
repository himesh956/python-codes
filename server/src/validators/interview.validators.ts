import { z } from "zod";
import { INTERVIEW_MODES, INTERVIEW_STATUSES } from "../constants/enums";

export const scheduleInterviewSchema = z.object({
  body: z.object({
    applicationId: z.string().min(1, "applicationId is required"),
    scheduledDate: z.coerce.date(),
    mode: z.enum(INTERVIEW_MODES),
    meetingLink: z.string().url().optional(),
    interviewer: z.string().max(150).optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const updateInterviewSchema = z.object({
  body: z.object({
    scheduledDate: z.coerce.date().optional(),
    mode: z.enum(INTERVIEW_MODES).optional(),
    meetingLink: z.string().url().optional(),
    interviewer: z.string().max(150).optional(),
    notes: z.string().max(1000).optional(),
    status: z.enum(INTERVIEW_STATUSES).optional(),
  }),
});

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>["body"];
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>["body"];