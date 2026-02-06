import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";

export type Activity = {
  _id?: string;
  timestamp: number;
  type: string;
  description: string;
  status: string;
  channel?: string;
  durationMs?: number;
};

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-slate-400">{format(activity.timestamp, "PPpp")}</p>
          <h3 className="text-base font-semibold text-slate-100">{activity.description}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="rounded-full bg-slate-800 px-2 py-1">{activity.type}</span>
            {activity.channel && <span>Channel: {activity.channel}</span>}
            {typeof activity.durationMs === "number" && (
              <span>{activity.durationMs} ms</span>
            )}
          </div>
        </div>
        <StatusBadge status={activity.status} />
      </div>
    </div>
  );
}
