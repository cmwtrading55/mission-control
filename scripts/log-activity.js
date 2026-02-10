// Log activity to Convex for Mission Control dashboard
// Usage: node log-activity.js "type" "description" [details_json] [channel] [status] [duration_ms] [token_count]

const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.CONVEX_URL || "https://tacit-walrus-370.convex.cloud";

async function logActivity() {
  const args = process.argv.slice(2);
  
  const type = args[0] || "unknown";
  const description = args[1] || "";
  const details = args[2] ? JSON.parse(args[2]) : null;
  const channel = args[3] || "system";
  const status = args[4] || "success";
  const durationMs = args[5] ? parseInt(args[5]) : null;
  const tokenCount = args[6] ? parseInt(args[6]) : null;

  try {
    const client = new ConvexHttpClient(CONVEX_URL);
    
    await client.mutation("activities:logActivity", {
      type,
      description,
      details,
      channel,
      status,
      durationMs,
      tokenCount,
    });
    
    console.log("✓ Activity logged:", type);
  } catch (err) {
    console.error("✗ Failed to log activity:", err.message);
    process.exit(1);
  }
}

logActivity();
