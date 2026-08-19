import { useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toPng } from "html-to-image";
import toast from "react-hot-toast";
import { Share2, Download } from "lucide-react";
import { getJobById } from "@/features/jobs/api/jobs.api";
import { JobPosterCard } from "@/components/JobPosterCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * "Download"/"Share" both operate on a client-rendered PNG snapshot of
 * the JobPosterCard — no server-side image generation service, kept
 * intentionally lightweight per the brief's "make the generated design
 * professional... goal is WhatsApp sharing," not a heavy design tool.
 * Falls back to plain download if the Web Share API isn't available
 * (desktop browsers) rather than failing silently.
 */
export default function JobPosterPage() {
  const { id } = useParams<{ id: string }>();
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJobById(id!),
    enabled: Boolean(id),
  });

  async function generateImage(): Promise<string | null> {
    if (!cardRef.current) return null;
    try {
      return await toPng(cardRef.current, { pixelRatio: 2 });
    } catch {
      toast.error("Could not generate the poster image");
      return null;
    }
  }

  async function handleDownload() {
    const dataUrl = await generateImage();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `localhire-job-${id}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function handleShare() {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "localhire-job.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Job on LocalHire" });
          return;
        }
      } catch {
        // fall through to download
      }
    }
    toast("Sharing isn't supported here — downloading instead", { icon: "ℹ️" });
    handleDownload();
  }

  if (isLoading) return <Skeleton className="h-96" />;
  if (!job) return <p className="text-sm text-ink-500">Job not found.</p>;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center">
      <h1 className="font-display text-xl font-bold text-ink-900">Share this Job</h1>

      <div className="mt-6 scale-90 sm:scale-100">
        <JobPosterCard
          ref={cardRef}
          title={job.title}
          location={job.location.city}
          salaryMin={job.salaryMin}
          salaryMax={job.salaryMax}
        />
      </div>

      <div className="mt-6 flex w-full max-w-[400px] gap-3">
        <Button variant="outline" fullWidth onClick={handleDownload}>
          <Download size={16} className="mr-1.5" /> Download
        </Button>
        <Button fullWidth onClick={handleShare}>
          <Share2 size={16} className="mr-1.5" /> Share
        </Button>
      </div>
    </div>
  );
}