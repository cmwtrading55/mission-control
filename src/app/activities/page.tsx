"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePaginatedQuery, useQuery } from "@/lib/convex-hooks";
import { api } from "@convex/_generated/api";
import { ActivityCard } from "@/components/ActivityCard";

const activityTypes = [
  "all",
  "cron_run",
  "message_sent",
  "file_modified",
  "command_executed",
  "heartbeat",
  "memory_updated",
];

export default function ActivitiesPage() {
  const [filter, setFilter] = useState("all");
  const { results, status, loadMore } = usePaginatedQuery(
    api.activities.listActivities,
    { type: filter === "all" ? undefined : filter },
    { initialNumItems: 20 }
  );
  const stats = useQuery(api.activities.getActivityStats, {});

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && status === "CanLoadMore") {
        loadMore(20);
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [status, loadMore]);

  const byType = useMemo(() => {
    if (!stats || !(stats as any).byType) return [] as Array<[string, number]>;
    return (Object.entries((stats as any).byType) as Array<[string, number]>).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">Activity Feed</h2>
        <p className="text-sm text-slate-400">Real-time log of assistant operations.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase text-slate-400">Total Activities</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">
            {(stats as any)?.totalActivities ?? "--"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase text-slate-400">Today</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">
            {(stats as any)?.todayCount ?? "--"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase text-slate-400">By Type</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
            {byType.map(([type, count]) => (
              <span key={type} className="rounded-full bg-slate-800 px-2 py-1">
                {type}: {count}
              </span>
            ))}
            {byType.length === 0 && <span className="text-slate-500">No data yet</span>}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {activityTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                filter === type
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {results.map((activity: any) => (
            <ActivityCard key={activity._id ?? activity.timestamp} activity={activity} />
          ))}
          {results.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-400">
              No activities found for this filter.
            </div>
          )}
          <div ref={sentinelRef} />
          {status === "LoadingMore" && (
            <div className="text-center text-sm text-slate-400">Loading more...</div>
          )}
        </div>
      </section>
    </div>
  );
}
