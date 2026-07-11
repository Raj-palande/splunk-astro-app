// src/utils/logger.js
import fs from 'node:fs';
import path from 'node:path';

export function logSecurityEvent(category, eventType, details, request) {
  try {
    // 1. Structure the security log baseline
    const logEntry = {
      timestamp: new Date().toISOString(),
      category: category,        // "auth", "security", "data", or "system"
      event_type: eventType,      // e.g., "login_failure", "sqli_detect"
      
      // Astro provides request metadata natively
      client_ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
      requested_uri: new URL(request.url).pathname,
      http_method: request.method,
      user_agent: request.headers.get('user-agent') || 'unknown',
      
      // Pass dynamic object fields (username, payloads, byte sizes)
      details: details 
    };

    // 2. Define where to save the file on your machine
    const logFilePath = path.resolve('astro_security_telemetry.log');

    // 3. Append the entry as a clean, single stringified JSON line
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error("Failed to write to custom security telemetry log:", error);
  }
}