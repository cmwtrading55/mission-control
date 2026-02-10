"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Activity,
  RefreshCw
} from "lucide-react";

export default function HealthDashboard() {
  const healthChecks = useQuery(api.health.listHealthChecks);
  const summary = useQuery(api.health.getHealthSummary);
  const staleJobs = useQuery(api.health.getStaleJobs, { thresholdMinutes: 60 });

  if (!healthChecks || !summary) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="flex items-center gap-2 text-gray-400">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading health status...</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string, isStale: boolean) => {
    if (isStale) return <AlertTriangle className="text-yellow-500" size={20} />;
    if (status === "success") return <CheckCircle className="text-green-500" size={20} />;
    if (status === "error") return <XCircle className="text-red-500" size={20} />;
    return <Clock className="text-gray-400" size={20} />;
  };

  const getStatusColor = (status: string, isStale: boolean) => {
    if (isStale) return "border-yellow-500/30 bg-yellow-500/10";
    if (status === "success") return "border-green-500/30 bg-green-500/10";
    if (status === "error") return "border-red-500/30 bg-red-500/10";
    return "border-gray-700 bg-gray-900";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Activity className="text-blue-500" size={32} />
            System Health
          </h1>
          <p className="text-gray-400">
            Real-time status of all automated cron jobs and system processes
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Jobs</div>
            <div className="text-2xl font-bold">{summary.totalJobs}</div>
          </div>
          <div className="bg-gray-900 border border-green-500/30 rounded-lg p-4">
            <div className="text-green-400 text-sm mb-1">Healthy</div>
            <div className="text-2xl font-bold text-green-500">{summary.healthyJobs}</div>
          </div>
          <div className="bg-gray-900 border border-yellow-500/30 rounded-lg p-4">
            <div className="text-yellow-400 text-sm mb-1">Stale</div>
            <div className="text-2xl font-bold text-yellow-500">{summary.staleJobs}</div>
          </div>
          <div className="bg-gray-900 border border-red-500/30 rounded-lg p-4">
            <div className="text-red-400 text-sm mb-1">Errors</div>
            <div className="text-2xl font-bold text-red-500">{summary.errorJobs}</div>
          </div>
        </div>

        {/* Alerts Section */}
        {staleJobs && staleJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400 flex items-center gap-2">
              <AlertTriangle size={20} />
              Alerts ({staleJobs.length})
            </h2>
            <div className="space-y-2">
              {staleJobs.map((job: any) => (
                <div 
                  key={job._id}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-yellow-500" size={20} />
                    <div>
                      <div className="font-medium">{job.jobName}</div>
                      <div className="text-sm text-gray-400">
                        {job.staleMinutes 
                          ? `No update in ${Math.round(job.staleMinutes)} minutes`
                          : job.lastStatus === "error" 
                            ? "Last run failed"
                            : "Status unknown"
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {job.lastRunAt 
                      ? formatDistanceToNow(job.lastRunAt, { addSuffix: true })
                      : "Never run"
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Jobs Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold">All Jobs</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {healthChecks.map((job: any) => (
              <div 
                key={job._id}
                className={`px-6 py-4 flex items-center justify-between border-l-4 ${getStatusColor(job.lastStatus, job.isStale)}`}
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(job.lastStatus, job.isStale)}
                  <div>
                    <div className="font-medium">{job.jobName}</div>
                    <div className="text-sm text-gray-400">
                      Exit code: {job.exitCode ?? "N/A"}
                      {job.durationMs && ` • ${Math.round(job.durationMs / 1000)}s`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    job.isStale ? "text-yellow-400" : 
                    job.lastStatus === "success" ? "text-green-400" : 
                    job.lastStatus === "error" ? "text-red-400" : "text-gray-400"
                  }`}>
                    {job.isStale ? "STALE" : job.lastStatus.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {job.lastRunAt 
                      ? formatDistanceToNow(job.lastRunAt, { addSuffix: true })
                      : "Never run"
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          Last updated: {summary.lastUpdated 
            ? formatDistanceToNow(summary.lastUpdated, { addSuffix: true })
            : "Unknown"
          }
        </div>
      </div>
    </div>
  );
}
