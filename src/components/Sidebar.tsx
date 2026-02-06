"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Search, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/activities", label: "Activity Feed", icon: Activity },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/search", label: "Search", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col gap-6 border-r border-slate-800 bg-slate-950/40 p-6 md:w-64">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Mission Control</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-100">Operations Hub</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400">
        Real-time monitoring of assistant operations. Stay in control.
      </div>
    </aside>
  );
}
