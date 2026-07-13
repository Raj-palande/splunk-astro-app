// src/utils/logger.js

export async function logSecurityEvent(category, eventType, details, request) {
  try {
    // 1. Structure the security log baseline
    const logEntry = {
      timestamp: new Date().toISOString(),
      category: category,        // "auth", "security", "data", or "system"
      event_type: eventType,      // e.g., "login_failure", "sqli_detect"
      
      // Grabs the real client IP forwarded through Vercel's proxy
      client_ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      requested_uri: new URL(request.url).pathname,
      http_method: request.method,
      user_agent: request.headers.get('user-agent') || 'unknown',
      
      // Pass dynamic object fields (username, payloads, byte sizes)
      details: details 
    };

    // 2. Keep standard console visibility for Vercel logs dashboard
    console.log(JSON.stringify(logEntry));

    // 3. Stream directly to your local Splunk via your active ngrok tunnel link
    const SPLUNK_TUNNEL_URL = "https://gorgeous-implement-scrambled.ngrok-free.dev/services/collector/event";
    
    // Paste your exact Token Value from Splunk Web inside these quotes!
    const SPLUNK_HEC_TOKEN = "cd08c018-1d0b-41bc-a070-b1a89d7f59b0";

    // CRITICAL FIX: Explicitly await the fetch and keep the connection active
    await fetch(SPLUNK_TUNNEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Splunk ${SPLUNK_HEC_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sourcetype: "_json",
        event: logEntry
      }),
      keepalive: true // Prevents localhost environment from closing the connection early
    }).catch(err => {
      console.error("👉 PIPELINE NETWORK ERROR:", err.message);
    });

  } catch (error) {
    console.error("Failed to process security telemetry log:", error);
  }
}