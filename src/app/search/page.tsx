"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@/lib/convex-hooks";
import { api } from "@convex/_generated/api";
import { SearchResult } from "@/components/SearchResult";
import { Search } from "lucide-react";

const filters = ["all", "activity", "memory", "document", "task", "indexed"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const results = useQuery(api.activities.globalSearch, {
    query: query.trim() || " ",
    limit: 40,
  });

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    ((results as any[]) ?? []).forEach((item: any) => {
      const type = item.resultType || item.contentType || "other";
      if (filter !== "all" && filter !== type) return;
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });
    return groups;
  }, [results, filter]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">Global Search</h2>
        <p className="text-sm text-slate-400">Search across activities, memories, documents, and tasks.</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search everything..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 pl-10 pr-3 text-sm text-slate-100 outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  filter === item
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(grouped).length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-400">
            Enter a search query to see results.
          </div>
        )}
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">{type}</h3>
              <span className="text-xs text-slate-400">{items.length} results</span>
            </div>
            <div className="space-y-3">
              {items.map((item: any) => (
                <SearchResult key={item._id ?? item.sourcePath ?? item.timestamp} result={item} query={query} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
