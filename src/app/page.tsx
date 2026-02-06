"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@/lib/convex-hooks";
import { api } from "@convex/_generated/api";
import { ActivityCard } from "@/components/ActivityCard";
import { TaskCard } from "@/components/TaskCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Search } from "lucide-react";

export default function DashboardPage() {
  const stats = useQuery(api.activities.getActivityStats, {});
  const activitiesData = useQuery(api.activities.listActivities, { limit: 10 });
  const tasks = useQuery(api.activities.listScheduledTasks, {});

  const upcomingTasks = useMemo(() => {
    if (!tasks) return [];
    const now = Date.now();
    const nextDay = now + 24 * 60 * 60 * 1000;
    return tasks.filter((task: any) => task.nextRunAt >= now && task.nextRunAt <= nextDay);
  }, [tasks]);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-100">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase text-slate-400">Total Activities</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">
              {stats?.totalActivities ?? "--"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase text-slate-400">Today</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">
              {stats?.todayCount ?? "--"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase text-slate-400">Active Tasks</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">
              {tasks?.length ?? "--"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase text-slate-400">System Status</p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status="success" />
              <span className="text-sm text-slate-300">All systems nominal</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Quick Search</h3>
            <p className="text-sm text-slate-400">Search across activities, memories, documents, and tasks.</p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
          >
            <Search className="h-4 w-4" />
            Open Search
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Recent Activity</h3>
            <Link href="/activities" className="text-sm text-emerald-300 hover:text-emerald-200">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {activitiesData?.items?.map((activity: any) => (
              <ActivityCard key={activity._id ?? activity.timestamp} activity={activity} />
            ))}
            {!activitiesData && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-400">
                Loading recent activity...
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-100">Upcoming Tasks (24h)</h3>
          <div className="space-y-3">
            {upcomingTasks.map((task: any) => (
              <TaskCard key={task._id ?? task.name} task={task} />
            ))}
            {upcomingTasks.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-400">
                No tasks scheduled in the next 24 hours.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
