import { useEffect, useState } from "react";

/**
 * Live countdown for the urgent-booking respondBy deadline (Part 7).
 * Purely visual — the actual expiry enforcement happens server-side
 * (the sweeper job), this just gives the customer a sense of urgency
 * and auto-refreshes the parent when time runs out.
 */
export function CountdownTimer({ deadline, onExpire }: { deadline: string; onExpire?: () => void }) {
  const [remainingMs, setRemainingMs] = useState(() => new Date(deadline).getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const ms = new Date(deadline).getTime() - Date.now();
      setRemainingMs(ms);
      if (ms <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  if (remainingMs <= 0) {
    return <span className="text-xs font-medium text-danger">Expired</span>;
  }

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  return (
    <span className="text-xs font-medium text-danger">
      {minutes}:{seconds.toString().padStart(2, "0")} remaining
    </span>
  );
}