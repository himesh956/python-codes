import { useEffect, useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getMyEmployerProfile, updateMyCompany } from "../api/employer.api";

export default function CompanyProfilePage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["employer-profile"],
    queryFn: getMyEmployerProfile,
  });

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (profile?.company) {
      setName(profile.company.name ?? "");
      setAbout(profile.company.about ?? "");
      setIndustry(profile.company.industry ?? "");
      setWebsite(profile.company.website ?? "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: updateMyCompany,
    onSuccess: () => {
      toast.success("Company profile updated");
      queryClient.invalidateQueries({ queryKey: ["employer-profile"] });
    },
    onError: () => toast.error("Could not update company profile"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateMutation.mutate({ name, about, industry, website });
  }

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-slate-100" />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">Company Profile</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Company name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">About</label>
          <textarea
            rows={4}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Industry</label>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Website</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {updateMutation.isPending ? "Saving…" : "Save Company"}
        </button>
      </form>
    </div>
  );
}