#!/bin/bash
# Health check collector - parses cron job logs and updates Mission Control
# Run this every 5-10 minutes via cron or heartbeat

LOG_DIR="/home/moltbot/.openclaw/workspace/logs/system-cron"
SCRIPT_DIR="/home/moltbot/.openclaw/workspace/scripts/system-cron"
MC_DIR="/home/moltbot/.openclaw/workspace/projects/mission-control"
NOW=$(date +%s)000  # Unix timestamp in milliseconds for Convex

# Threshold for stale jobs (minutes)
STALE_THRESHOLD=60

# Build JSON array of health checks
CHECKS="["
FIRST=true

for logfile in "$LOG_DIR"/*.log; do
    [ -f "$logfile" ] || continue
    
    jobname=$(basename "$logfile" .log)
    
    # Parse last run from log
    # Format: [2026-02-10 05:45:00 UTC] start jobname
    #         [2026-02-10 05:45:30 UTC] end jobname (exit 0)
    last_line=$(tail -5 "$logfile" 2>/dev/null | grep "end.*exit" | tail -1)
    start_line=$(tail -10 "$logfile" 2>/dev/null | grep "start.*$jobname" | tail -1)
    
    if [ -z "$last_line" ]; then
        # No end line found - check if there's any start line
        if [ -z "$start_line" ]; then
            status="unknown"
            exit_code="null"
            last_run_ms="null"
            duration_ms="null"
        else
            # Started but never finished
            status="running"
            exit_code="null"
            last_run_ms="null"
            duration_ms="null"
        fi
    else
        # Parse the end line
        # Example: [2026-02-10 05:45:30 UTC] end jobname (exit 0)
        exit_code=$(echo "$last_line" | grep -oP 'exit \K[0-9]+' || echo "null")
        
        if [ "$exit_code" = "0" ]; then
            status="success"
        else
            status="error"
        fi
        
        # Parse timestamp
        timestamp_str=$(echo "$last_line" | grep -oP '\[\K[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}')
        if [ -n "$timestamp_str" ]; then
            last_run_ms=$(date -d "$timestamp_str UTC" +%s)000
        else
            last_run_ms="null"
        fi
        
        # Parse duration if available
        if [ -n "$start_line" ] && [ -n "$last_line" ]; then
            start_ts=$(echo "$start_line" | grep -oP '\[\K[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}')
            end_ts=$(echo "$last_line" | grep -oP '\[\K[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}')
            if [ -n "$start_ts" ] && [ -n "$end_ts" ]; then
                start_epoch=$(date -d "$start_ts UTC" +%s)
                end_epoch=$(date -d "$end_ts UTC" +%s)
                duration_ms=$(( (end_epoch - start_epoch) * 1000 ))
            else
                duration_ms="null"
            fi
        else
            duration_ms="null"
        fi
    fi
    
    # Check if stale
    if [ "$last_run_ms" != "null" ]; then
        stale_minutes=$(( (NOW - last_run_ms) / 60000 ))
        if [ $stale_minutes -gt $STALE_THRESHOLD ]; then
            is_stale="true"
        else
            is_stale="false"
            stale_minutes="null"
        fi
    else
        is_stale="true"
        stale_minutes="null"
    fi
    
    # Add to JSON array
    if [ "$FIRST" = true ]; then
        FIRST=false
    else
        CHECKS+=","
    fi
    
    CHECKS+="{"
    CHECKS+="\"jobName\":\"$jobname\","
    CHECKS+="\"lastStatus\":\"$status\","
    CHECKS+="\"lastRunAt\":$last_run_ms,"
    CHECKS+="\"exitCode\":$exit_code,"
    CHECKS+="\"durationMs\":$duration_ms,"
    CHECKS+="\"isStale\":$is_stale,"
    if [ "$stale_minutes" != "null" ]; then
        CHECKS+="\"staleMinutes\":$stale_minutes"
    else
        CHECKS+="\"staleMinutes\":null"
    fi
    CHECKS+="}"
done

CHECKS+="]"

# Update Convex via the bulkUpdateHealthChecks mutation
# Using npx convex to call the mutation
cd "$MC_DIR"

echo "$CHECKS" | npx convex run health:bulkUpdateHealthChecks --stdin 2>/dev/null

exit 0
