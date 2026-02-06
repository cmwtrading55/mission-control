import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  error: "bg-red-500/15 text-red-400 border-red-500/30",
  running: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  upcoming: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        statusStyles[status] ?? "bg-slate-700/40 text-slate-300 border-slate-700",
        className
      )}
    >
      {status}
    </span>
  );
}
