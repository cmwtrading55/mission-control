"use client";

import { useMemo, useState } from "react";
import { addDays, addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { StatusBadge } from "@/components/StatusBadge";

const statusColor: Record<string, string> = {
  upcoming: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  running: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  error: "bg-red-500/15 text-red-300 border-red-500/30",
};

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const schedule = useQuery(api.activities.getWeeklySchedule, {
    weekStart: weekStart.getTime(),
  });

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, idx) => addDays(weekStart, idx));
  }, [weekStart]);

  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100">Weekly Schedule</h2>
          <p className="text-sm text-slate-400">
            {format(weekStart, "PP")} - {format(addDays(weekStart, 6), "PP")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            Previous
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            This Week
          </button>
          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[2.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {days.map((day) => {
            const dayTasks = (schedule ?? []).filter(
              (task: any) => task.nextRunAt >= day.getTime() && task.nextRunAt < addDays(day, 1).getTime()
            );
            return (
              <div key={day.toISOString()} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-slate-400">{format(day, "EEE")}</p>
                    <p className="text-sm text-slate-200">{format(day, "PPP")}</p>
                  </div>
                  <span className="text-xs text-slate-400">{dayTasks.length} tasks</span>
                </div>
                <div className="space-y-2">
                  {dayTasks.map((task: any) => (
                    <button
                      key={task._id ?? task.name}
                      onClick={() => setSelectedTask(task)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition hover:border-slate-600 ${
                        statusColor[task.lastStatus] ?? "border-slate-800 bg-slate-950/40 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{task.name}</span>
                        <span className="text-xs text-slate-400">{format(task.nextRunAt, "p")}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{task.channel ?? "No channel"}</p>
                    </button>
                  ))}
                  {dayTasks.length === 0 && (
                    <p className="text-xs text-slate-500">No tasks scheduled.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-lg font-semibold text-slate-100">Task Details</h3>
          {selectedTask ? (
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div>
                <p className="text-xs uppercase text-slate-500">Name</p>
                <p className="text-base font-semibold text-slate-100">{selectedTask.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Description</p>
                <p>{selectedTask.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedTask.lastStatus ?? "upcoming"} />
                {selectedTask.channel && (
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                    Channel: {selectedTask.channel}
                  </span>
                )}
                {selectedTask.model && (
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                    Model: {selectedTask.model}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Next Run</p>
                <p>{format(selectedTask.nextRunAt, "PPpp")}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Select a task to view details.</p>
          )}
        </div>
      </section>
    </div>
  );
}
