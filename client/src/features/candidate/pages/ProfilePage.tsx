import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getMyCandidateProfile, updateMyCandidateProfile, uploadResume } from "../api/candidate.api";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["candidate-profile"],
    queryFn: getMyCandidateProfile,
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [expectedCTC, setExpectedCTC] = useState<string>("");

  useEffect(() => {
    if (data?.profile) {
      setFullName(data.profile.fullName ?? "");
      setPhone(data.profile.phone ?? "");
      setBio(data.profile.bio ?? "");
      setSkillsInput(data.profile.skills.join(", "));
      setExpectedCTC(data.profile.expectedCTC ? String(data.profile.expectedCTC) : "");
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: updateMyCandidateProfile,
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
    },
    onError: () => toast.error("Could not update profile"),
  });

  const resumeMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      toast.success("Resume uploaded");
      queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
    },
    onError: () => toast.error("Resume upload failed — check file is a PDF under 5MB"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateMutation.mutate({
      fullName,
      phone,
      bio,
      skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
      expectedCTC: expectedCTC ? Number(expectedCTC) : undefined,
    });
  }

  function handleResumeChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) resumeMutation.mutate(file);
  }

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-slate-100" />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">My Profile</h1>

      {data && (
        <div className="mt-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-brand-600 transition-all"
              style={{ width: `${data.profileCompletion}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Profile completion: {data.profileCompletion}%
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Skills (comma-separated)</label>
          <input
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="React, Node.js, MongoDB"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Expected CTC (₹ per year)</label>
          <input
            type="number"
            value={expectedCTC}
            onChange={(e) => setExpectedCTC(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Resume (PDF, max 5MB)</label>
         {data?.profile.resume && (
  <a
    href={data.profile.resume.cloudinaryUrl}
    target="_blank"
    rel="noreferrer"
    className="mt-1 block text-xs text-brand-600 hover:underline"
  >
    Current: {data.profile.resume.fileName}
  </a>
)}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleResumeChange}
            className="mt-1 w-full text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {updateMutation.isPending ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}