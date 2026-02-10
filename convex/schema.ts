// Activity tracking schema for Mission Control
// Records every action the AI assistant performs

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Activity Feed - every single action recorded
  activities: defineTable({
    timestamp: v.number(),
    type: v.string(),
    description: v.string(),
    details: v.optional(v.any()),
    sessionKey: v.optional(v.string()),
    channel: v.optional(v.string()),
    status: v.string(),
    durationMs: v.optional(v.number()),
    tokenCount: v.optional(v.number()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // Scheduled Tasks - for calendar view
  scheduledTasks: defineTable({
    name: v.string(),
    description: v.string(),
    schedule: v.object({
      kind: v.string(),
      expr: v.optional(v.string()),
      everyMs: v.optional(v.number()),
    }),
    nextRunAt: v.number(),
    lastRunAt: v.optional(v.number()),
    lastStatus: v.optional(v.string()),
    enabled: v.boolean(),
    channel: v.optional(v.string()),
    model: v.optional(v.string()),
  })
    .index("by_next_run", ["nextRunAt"])
    .index("by_enabled", ["enabled"]),

  // Search index for global search
  searchIndex: defineTable({
    content: v.string(),
    contentType: v.string(),
    sourcePath: v.string(),
    title: v.optional(v.string()),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_content_type", ["contentType"])
    .index("by_timestamp", ["timestamp"]),

  // Memory documents
  memories: defineTable({
    path: v.string(),
    content: v.string(),
    lastModified: v.number(),
    type: v.string(),
  })
    .index("by_path", ["path"])
    .index("by_type", ["type"]),

  // Health checks for cron jobs and system status
  healthChecks: defineTable({
    jobName: v.string(),
    status: v.string(), // "success", "error", "stale", "running", "unknown", "no_logs"
    lastRunAt: v.optional(v.number()),
    exitCode: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    collectedAt: v.number(),
    hostname: v.string(),
  })
    .index("by_jobName", ["jobName"])
    .index("by_status", ["status"])
    .index("by_collectedAt", ["collectedAt"]),
});
