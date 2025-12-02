import pino from "pino";

export function createLogger(name) {
  return pino({
    name,
    level: process.env.LOG_LEVEL || "info",
    transport: process.env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        },
  });
}
