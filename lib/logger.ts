/**
 * Structured JSON Logger for Insight Forge.
 * Outputs structured logs to console in JSON format.
 * Vercel and other hosting platforms automatically capture console output.
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: string;
  durationMs?: number;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: Error | string
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  if (error) {
    entry.error = error instanceof Error ? error.message : error;
  }

  return entry;
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry("info", message, context);
    console.log(JSON.stringify(entry));
  },

  warn(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry("warn", message, context);
    console.warn(JSON.stringify(entry));
  },

  error(message: string, error?: Error | string, context?: Record<string, unknown>) {
    const entry = createLogEntry("error", message, context, error);
    console.error(JSON.stringify(entry));
  },

  /** Utility: measure duration of an async operation */
  async timed<T>(
    message: string,
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      const entry = createLogEntry("info", message, {
        ...context,
        durationMs,
      });
      console.log(JSON.stringify(entry));
      return result;
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      const entry = createLogEntry(
        "error",
        `${message} — failed`,
        { ...context, durationMs },
        err instanceof Error ? err : String(err)
      );
      console.error(JSON.stringify(entry));
      throw err;
    }
  },
};
