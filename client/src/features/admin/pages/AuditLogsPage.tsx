import { useQuery } from "@tanstack/react-query";
import { listAuditLogs } from "../api/admin.api";

export default function AuditLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => listAuditLogs({ limit: 50 }),
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Audit Logs</h1>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <div className="h-40 animate-pulse bg-slate-100" />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {data?.logs.map((log) => (
                <tr key={log._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">{log.actor?.email}</td>
                  <td className="px-4 py-3 font-medium">{log.action}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {log.targetType}: {log.targetId}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}