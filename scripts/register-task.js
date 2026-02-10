const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.CONVEX_URL || "https://tacit-walrus-370.convex.cloud";

async function registerTask() {
  const args = process.argv.slice(2);
  
  const name = args[0];
  const description = args[1];
  const scheduleKind = args[2]; // "cron" or "everyMs"
  const scheduleValue = args[3];
  const nextRunAt = parseInt(args[4]);
  const channel = args[5] || "system";
  const model = args[6] || "kimi";

  try {
    const client = new ConvexHttpClient(CONVEX_URL);
    
    await client.mutation("activities:upsertScheduledTask", {
      name,
      description,
      schedule: scheduleKind === "cron" 
        ? { kind: "cron", expr: scheduleValue }
        : { kind: "every", everyMs: parseInt(scheduleValue) },
      nextRunAt,
      enabled: true,
      channel,
      model,
    });
    
    console.log("✓ Task registered:", name);
  } catch (err) {
    console.error("✗ Failed to register task:", err.message);
    process.exit(1);
  }
}

registerTask();
