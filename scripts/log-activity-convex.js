// Log activity to Convex - called from system-cron or other external scripts
// Usage: node log-activity-convex.js <type> <description> [details_json] [channel] [status] [duration_ms] [token_count]

const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = "https://tacit-walrus-370.convex.cloud";

async function main() {
  const args = process.argv.slice(2);
  
  const type = args[0] || "unknown";
  const description = args[1] || "";
  const details = args[2] ? JSON.parse(args[2]) : null;
  const channel = args[3] || "system";
  const status = args[4] || "success";
  const durationMs = args[5] ? parseInt(args[5]) : null;
  const tokenCount = args[6] ? parseInt(args[6]) : null;

  const client = new ConvexHttpClient(CONVEX_URL);
  
  try {
    const result = await client.mutation("activities:logActivity", {
      type,
      description,
      details,
      channel,
      status,
      durationMs,
      tokenCount,
    });
    console.log("Logged:", result);
  } catch (err) {
    console.error("Failed to log activity:", err.message);
    process.exit(1);
  }
}

main();
