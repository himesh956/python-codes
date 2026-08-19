interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

/** Consistent wrapper card for every chart on the admin analytics page. */
export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-medium text-slate-700">{title}</h3>
      <div className="mt-3 h-64">{children}</div>
    </div>
  );
}