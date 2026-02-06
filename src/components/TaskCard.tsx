import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";

export type ScheduledTask = {
  _id?: string;
  name: string;
  description: string;
  nextRunAt: number;
  channel?: string;
  model?: string;
  lastStatus?: string;
};

export function TaskCard({ task, onClick }: { task: ScheduledTask; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-left transition hover:border-slate-700 hover:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{task.name}</h3>
          <p className="text-sm text-slate-400">{task.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>{format(task.nextRunAt, "PPpp")}</span>
            {task.channel && <span>Channel: {task.channel}</span>}
            {task.model && <span>Model: {task.model}</span>}
          </div>
        </div>
        {task.lastStatus && <StatusBadge status={task.lastStatus} />}
      </div>
    </button>
  );
}
