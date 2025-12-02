import fastify from "fastify";
import { createLogger } from "./logger.js";

export function createService({ name, port = 0, routes = [], health = {} }) {
  const logger = createLogger(name);
  const app = fastify({ logger });

  app.get("/health", async () => ({
    status: "ok",
    service: name,
    ...health,
  }));

  for (const route of routes) {
    app.route(route);
  }

  async function start(listenPort = port) {
    const resolvedPort = listenPort || Number(process.env.PORT) || 0;
    await app.listen({ port: resolvedPort, host: "0.0.0.0" });
    const address = app.server.address();
    const actualPort = typeof address === "object" && address ? address.port : resolvedPort;
    app.log.info({ port: actualPort }, "service_ready");
    return { port: actualPort };
  }

  return { app, start };
}
