import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

/**
 * One consistent "something went wrong" card, used everywhere a query
 * fails, instead of each page inventing its own error text — this is
 * what makes Phase 13's "retry buttons" and "avoid technical error
 * messages" requirements uniform across the whole app.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white py-16 text-center">
      <AlertCircle size={28} className="text-danger" />
      <p className="mt-3 text-sm font-semibold text-ink-800">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{description}</p>
      {onRetry && (
        <Button className="mt-4" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}