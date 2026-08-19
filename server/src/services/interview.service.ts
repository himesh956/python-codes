import { Interview, IInterview } from "../models/Interview";
import { Application } from "../models/Application";
import { CandidateProfile } from "../models/CandidateProfile";
import { EmployerProfile } from "../models/EmployerProfile";
import { AppError } from "../utils/AppError";
import { notificationService } from "./notification.service";
import { ScheduleInterviewInput, UpdateInterviewInput } from "../validators/interview.validators";

async function getEmployerProfileOrThrow(userId: string) {
  const profile = await EmployerProfile.findOne({ user: userId });
  if (!profile) throw AppError.notFound("Employer profile not found");
  return profile;
}

async function getCandidateProfileOrThrow(userId: string) {
  const profile = await CandidateProfile.findOne({ user: userId });
  if (!profile) throw AppError.notFound("Candidate profile not found");
  return profile;
}

async function schedule(userId: string, input: ScheduleInterviewInput): Promise<IInterview> {
  const employer = await getEmployerProfileOrThrow(userId);
  const application = await Application.findById(input.applicationId);
  if (!application) throw AppError.notFound("Application not found");
  if (application.employer.toString() !== employer._id.toString()) {
    throw AppError.forbidden("You do not have permission to schedule this interview");
  }
  if (application.status !== "INTERVIEW") {
    throw AppError.badRequest(
      'Application must be in "INTERVIEW" status before scheduling an interview'
    );
  }

  const interview = await Interview.create({
    application: application._id,
    candidate: application.candidate,
    job: application.job,
    scheduledDate: input.scheduledDate,
    mode: input.mode,
    meetingLink: input.meetingLink,
    interviewer: input.interviewer,
    notes: input.notes,
    status: "SCHEDULED",
  });

  const candidateProfile = await CandidateProfile.findById(application.candidate);
  if (candidateProfile) {
    await notificationService.create({
      recipient: candidateProfile.user,
      type: "INTERVIEW_SCHEDULED",
      message: `An interview has been scheduled for your application`,
      relatedEntity: { kind: "INTERVIEW", id: interview._id },
    });
  }

  return interview;
}

async function updateByEmployer(
  userId: string,
  interviewId: string,
  input: UpdateInterviewInput
): Promise<IInterview> {
  const employer = await getEmployerProfileOrThrow(userId);
  const interview = await Interview.findById(interviewId);
  if (!interview) throw AppError.notFound("Interview not found");

  const application = await Application.findById(interview.application);
  if (!application || application.employer.toString() !== employer._id.toString()) {
    throw AppError.forbidden("You do not have permission to update this interview");
  }

  Object.assign(interview, input);
  await interview.save();

  if (input.status === "RESCHEDULED" || input.scheduledDate) {
    const candidateProfile = await CandidateProfile.findById(interview.candidate);
    if (candidateProfile) {
      await notificationService.create({
        recipient: candidateProfile.user,
        type: "INTERVIEW_SCHEDULED",
        message: "Your interview details have been updated",
        relatedEntity: { kind: "INTERVIEW", id: interview._id },
      });
    }
  }

  return interview;
}

async function listUpcomingForCandidate(userId: string): Promise<IInterview[]> {
  const candidate = await getCandidateProfileOrThrow(userId);
  return Interview.find({
    candidate: candidate._id,
    status: { $in: ["SCHEDULED", "RESCHEDULED"] },
  })
    .sort({ scheduledDate: 1 })
    .populate("job", "title");
}

async function listForEmployerJob(userId: string, applicationId: string): Promise<IInterview[]> {
  const employer = await getEmployerProfileOrThrow(userId);
  const application = await Application.findById(applicationId);
  if (!application) throw AppError.notFound("Application not found");
  if (application.employer.toString() !== employer._id.toString()) {
    throw AppError.forbidden("You do not have permission to view these interviews");
  }
  return Interview.find({ application: application._id }).sort({ scheduledDate: -1 });
}

export const interviewService = {
  schedule,
  updateByEmployer,
  listUpcomingForCandidate,
  listForEmployerJob,
};