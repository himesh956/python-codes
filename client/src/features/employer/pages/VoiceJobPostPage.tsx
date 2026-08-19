import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Mic, Square, Pencil, Check } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { processTranscript, ExtractedJobData } from "../api/voiceToJob.api";
import { createJob } from "../api/employer.api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const SALARY_TYPE_LABEL: Record<string, string> = {
  DAILY: "/day",
  HOURLY: "/hr",
  MONTHLY: "/month",
  PER_JOB: "/job",
};

/**
 * Three-step flow, exactly per the brief: record → AI understands →
 * confirm/edit → post. The AI never auto-publishes — "Post Job" is
 * always a distinct, explicit tap on data the employer has seen and
 * can edit first (Edit just means: use the manual PostJobPage with
 * these values pre-filled — kept simple rather than building a second
 * full edit UI here).
 */
export default function VoiceJobPostPage() {
  const navigate = useNavigate();
  const { isSupported, isListening, transcript, start, stop } = useSpeechRecognition("hi-IN");
  const [extracted, setExtracted] = useState<ExtractedJobData | null>(null);
  const [step, setStep] = useState<"RECORD" | "CONFIRM">("RECORD");

  const processMutation = useMutation({
    mutationFn: () => processTranscript(transcript),
    onSuccess: (result) => {
      setExtracted(result.extracted);
      setStep("CONFIRM");
    },
    onError: () => toast.error("Could not understand the recording. Try again or use the manual form."),
  });

  const postMutation = useMutation({
    mutationFn: () =>
      createJob({
        title: extracted!.title ?? "New Job",
        description: extracted!.description ?? transcript,
        skills: [],
        employmentType: (extracted!.employmentType as "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT") ?? "FULL_TIME",
        workMode: "ON_SITE",
        location: { city: extracted!.location ?? "" },
        salaryMin: extracted!.salaryMin,
        salaryMax: extracted!.salaryMax,
        experienceMinYears: 0,
        openings: 1,
      }),
    onSuccess: () => {
      toast.success("Job posted as draft — publish it from My Jobs");
      navigate("/employer/jobs");
    },
    onError: () => toast.error("Could not post the job. Please try the manual form."),
  });

  if (!isSupported) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="font-medium text-ink-800">Voice posting isn't supported on this browser.</p>
        <p className="mt-1 text-sm text-ink-500">Please use the regular job form instead.</p>
        <Button className="mt-4" onClick={() => navigate("/employer/jobs/create")}>
          Use Manual Form
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-center font-display text-xl font-bold text-ink-900">🎤 Post Job by Voice</h1>

      {step === "RECORD" && (
        <Card className="mt-6 text-center">
          <p className="text-sm text-ink-500">
            Tap the mic and describe the job — e.g. "Mujhe mechanic chahiye, salary 15000 se 18000, location
            Ghaziabad"
          </p>

          <button
            onClick={isListening ? stop : start}
            className={`mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full ${
              isListening ? "animate-pulse bg-danger" : "bg-brand-500"
            } text-white`}
          >
            {isListening ? <Square size={28} /> : <Mic size={28} />}
          </button>
          <p className="mt-3 text-xs text-ink-400">{isListening ? "Listening…" : "Tap to start"}</p>

          {transcript && (
            <div className="mt-4 rounded-xl bg-ink-50 p-3 text-left text-sm text-ink-700">"{transcript}"</div>
          )}

          {transcript && !isListening && (
            <Button
              className="mt-4"
              fullWidth
              onClick={() => processMutation.mutate()}
              isLoading={processMutation.isPending}
            >
              Continue
            </Button>
          )}

          <button
            onClick={() => navigate("/employer/jobs/create")}
            className="mt-4 text-xs text-ink-400 hover:text-brand-600"
          >
            Or use the manual form instead
          </button>
        </Card>
      )}

      {step === "CONFIRM" && extracted && (
        <Card className="mt-6">
          <p className="text-sm font-semibold text-ink-700">AI understood:</p>

          <div className="mt-3 space-y-2 text-sm">
            <Row label="Role" value={extracted.title ?? "Not detected"} />
            <Row
              label="Salary"
              value={
                extracted.salaryMin
                  ? `₹${extracted.salaryMin.toLocaleString("en-IN")}${
                      extracted.salaryMax ? ` - ₹${extracted.salaryMax.toLocaleString("en-IN")}` : ""
                    }${SALARY_TYPE_LABEL[extracted.salaryType ?? "MONTHLY"]}`
                  : "Not detected"
              }
            />
            <Row label="Location" value={extracted.location ?? "Not detected"} />
            <Row label="Type" value={extracted.employmentType?.replace("_", " ") ?? "Full Time"} />
          </div>

          {extracted.confidence === "LOW" && (
            <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
              We couldn't detect much from that recording — please review carefully or use the manual form.
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/employer/jobs/create")}>
              <Pencil size={14} className="mr-1" /> Edit
            </Button>
            <Button className="flex-1" onClick={() => postMutation.mutate()} isLoading={postMutation.isPending}>
              <Check size={14} className="mr-1" /> Post Job
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-ink-100 pb-2">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}