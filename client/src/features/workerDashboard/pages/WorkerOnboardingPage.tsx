import { useEffect, useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { listCategories, getMyWorkerProfile, upsertMyWorkerProfile, getWageEstimate } from "@/features/workers/api/workers.api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertCircle } from "lucide-react";

const WAGE_TYPES = ["DAILY", "HOURLY", "PER_JOB"] as const;

/**
 * Worker onboarding is deliberately a form-based flow at MVP — voice-
 * note-to-profile (Part 9 of the product plan) is a V1 addition on
 * top of this same underlying upsertMyWorkerProfile endpoint, not a
 * replacement for it.
 */
export default function WorkerOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({ queryKey: ["worker-categories"], queryFn: listCategories });
  const { data: existingProfile } = useQuery({
    queryKey: ["my-worker-profile"],
    queryFn: getMyWorkerProfile,
    retry: false,
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState("0");
  const [city, setCity] = useState("");
  const [serviceAreaRadiusKm, setServiceAreaRadiusKm] = useState("5");
  const [wageType, setWageType] = useState<(typeof WAGE_TYPES)[number]>("DAILY");
  const [wageAmount, setWageAmount] = useState("");

  useEffect(() => {
    if (existingProfile) {
      setFullName(existingProfile.fullName);
      setPhone("");
      setBio(existingProfile.bio ?? "");
      setSelectedCategories(existingProfile.categories.map((c) => c._id));
      setExperienceYears(String(existingProfile.experienceYears));
      setCity(existingProfile.baseLocation.city);
      setServiceAreaRadiusKm(String(existingProfile.serviceAreaRadiusKm));
      setWageType(existingProfile.wageExpectation.type);
      setWageAmount(String(existingProfile.wageExpectation.amount));
    }
  }, [existingProfile]);

  const { data: wageGuidance } = useQuery({
    queryKey: ["wage-guidance", selectedCategories[0], city, experienceYears],
    queryFn: () =>
      getWageEstimate({
        categoryId: selectedCategories[0],
        city,
        experienceYears: Number(experienceYears),
      }),
    enabled: Boolean(selectedCategories[0] && city),
  });

  const saveMutation = useMutation({
    mutationFn: upsertMyWorkerProfile,
    onSuccess: () => {
      toast.success("Worker profile saved!");
      queryClient.invalidateQueries({ queryKey: ["my-worker-profile"] });
      navigate("/worker/dashboard");
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not save worker profile";
      toast.error(message);
    },
  });

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveMutation.mutate({
      fullName,
      phone: phone || undefined,
      bio: bio || undefined,
      categories: selectedCategories,
      experienceYears: Number(experienceYears),
      baseLocation: { city },
      serviceAreaRadiusKm: Number(serviceAreaRadiusKm),
      wageExpectation: { type: wageType, amount: Number(wageAmount) },
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-xl font-bold text-ink-900">
        {existingProfile ? "Edit Your Worker Profile" : "Get Hired — Set Up Your Worker Profile"}
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        This is what customers see when they search for someone to hire.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-ink-100 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-ink-700">Your name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700">Phone number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="For customers to reach you after booking"
            className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700">
            What work do you do? <span className="text-ink-400">(select all that apply)</span>
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories?.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => toggleCategory(c._id)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                  selectedCategories.includes(c._id)
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-ink-200 text-ink-600"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700">About you</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell customers about your work, tools, specialties…"
            className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700">Years of experience</label>
            <input
              type="number"
              min={0}
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700">Service radius (km)</label>
            <input
              type="number"
              min={1}
              max={50}
              value={serviceAreaRadiusKm}
              onChange={(e) => setServiceAreaRadiusKm(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700">Your city</label>
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Ghaziabad"
            className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
          />
        </div>

        {wageGuidance && (
          <div className="flex items-start gap-2 rounded-xl bg-trust-50 p-3 text-sm text-trust-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>
              Workers like you in {city} typically charge ₹{wageGuidance.p25.toLocaleString("en-IN")}–₹
              {wageGuidance.p75.toLocaleString("en-IN")}
              {wageGuidance.confidence === "LOW" && " (limited local data so far)"}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700">Wage type</label>
            <select
              value={wageType}
              onChange={(e) => setWageType(e.target.value as typeof wageType)}
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
            >
              <option value="DAILY">Per day</option>
              <option value="HOURLY">Per hour</option>
              <option value="PER_JOB">Per job</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700">Amount (₹)</label>
            <input
              type="number"
              required
              min={0}
              value={wageAmount}
              onChange={(e) => setWageAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={saveMutation.isPending}>
          {existingProfile ? "Save Changes" : "Create My Worker Profile"}
        </Button>
      </form>

      {!existingProfile && (
        <Card className="mt-4 bg-trust-50">
          <p className="text-sm text-trust-800">
            💡 New workers get guaranteed visibility slots in search results while you build your rating —
            verify your phone number to unlock this immediately.
          </p>
        </Card>
      )}
    </div>
  );
}