// Convex functions for System Health Dashboard

import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

// HEALTH CHECK QUERIES

// Get all health check statuses
export const listHealthChecks = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(v.any()),
    collectedAt: v.optional(v.number()),
  }),
  handler: async (ctx: any, args: any) => {
    const limit = args.limit ?? 100;
    
    const results = await ctx.db
      .query("healthChecks")
      .order("desc", "collectedAt")
      .take(limit);

    // Group by jobName and get the most recent for each
    const latestByJob: Record<string, any> = {};
    for (const check of results) {
      if (!latestByJob[check.jobName] || check.collectedAt > latestByJob[check.jobName].collectedAt) {
        latestByJob[check.jobName] = check;
      }
    }

    const items = Object.values(latestByJob).sort((a: any, b: any) => 
      (b.lastRunAt || 0) - (a.lastRunAt || 0)
    );

    const collectedAt = items.length > 0 ? items[0].collectedAt : undefined;

    return { items, collectedAt };
  },
});

// Get health check statistics
export const getHealthStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    success: v.number(),
    error: v.number(),
    stale: v.number(),
    running: v.number(),
    unknown: v.number(),
    noLogs: v.number(),
    staleJobs: v.array(v.any()),
  }),
  handler: async (ctx: any) => {
    const allChecks = await ctx.db.query("healthChecks").collect();
    
    // Get latest check for each job
    const latestByJob: Record<string, any> = {};
    for (const check of allChecks) {
      if (!latestByJob[check.jobName] || check.collectedAt > latestByJob[check.jobName].collectedAt) {
        latestByJob[check.jobName] = check;
      }
    }

    const latestChecks = Object.values(latestByJob);

    const stats = {
      total: latestChecks.length,
      success: latestChecks.filter((c: any) => c.status === "success").length,
      error: latestChecks.filter((c: any) => c.status === "error").length,
      stale: latestChecks.filter((c: any) => c.status === "stale").length,
      running: latestChecks.filter((c: any) => c.status === "running").length,
      unknown: latestChecks.filter((c: any) => c.status === "unknown").length,
      noLogs: latestChecks.filter((c: any) => c.status === "no_logs").length,
      staleJobs: latestChecks.filter((c: any) => c.status === "stale" || c.status === "error" || c.status === "no_logs"),
    };

    return stats;
  },
});

// Get recent errors
export const getRecentErrors = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx: any, args: any) => {
    const limit = args.limit ?? 10;
    
    const allChecks = await ctx.db.query("healthChecks").collect();
    
    // Get latest check for each job
    const latestByJob: Record<string, any> = {};
    for (const check of allChecks) {
      if (!latestByJob[check.jobName] || check.collectedAt > latestByJob[check.jobName].collectedAt) {
        latestByJob[check.jobName] = check;
      }
    }

    const errors = Object.values(latestByJob)
      .filter((c: any) => c.status === "error" || c.status === "stale" || c.status === "no_logs")
      .sort((a: any, b: any) => (b.lastRunAt || 0) - (a.lastRunAt || 0))
      .slice(0, limit);

    return errors;
  },
});

// MUTATIONS

// Ingest health data from the collector script
export const ingestHealthData = mutation({
  args: {
    jobs: v.array(v.object({
      jobName: v.string(),
      status: v.string(),
      lastRunAt: v.optional(v.number()),
      exitCode: v.optional(v.number()),
      durationMs: v.optional(v.number()),
      errorMessage: v.optional(v.string()),
    })),
    collectedAt: v.number(),
    hostname: v.string(),
  },
  returns: v.number(),
  handler: async (ctx: any, args: any) => {
    let count = 0;
    
    for (const job of args.jobs) {
      await ctx.db.insert("healthChecks", {
        ...job,
        collectedAt: args.collectedAt,
        hostname: args.hostname,
      });
      count++;
    }

    return count;
  },
});

// Update a single health check (for manual updates)
export const updateHealthCheck = mutation({
  args: {
    jobName: v.string(),
    status: v.string(),
    lastRunAt: v.optional(v.number()),
    exitCode: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    hostname: v.optional(v.string()),
  },
  returns: v.id("healthChecks"),
  handler: async (ctx: any, args: any) => {
    return await ctx.db.insert("healthChecks", {
      ...args,
      collectedAt: Date.now(),
      hostname: args.hostname || "manual",
    });
  },
});
