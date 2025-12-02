import { createService, loadConfig, createHttpClient } from "@ip-prime-brokerage/pkg-utils";
import { renderStatusPanel } from "@ip-prime-brokerage/pkg-ui";
import { z } from "zod";

const config = loadConfig(
  z.object({
    API_GATEWAY_URL: z.string().url().default("http://localhost:4000"),
  })
);

const httpClient = createHttpClient({ timeoutMs: 3000 });

async function fetchGatewayHealth() {
  try {
    const health = await httpClient.get(`${config.API_GATEWAY_URL}/health`);
    return { status: "ok", health };
  } catch (error) {
    return { status: "err", error: error.message };
  }
}

const { app, start } = createService({
  name: "app-borrower-dashboard",
  port: Number(config.PORT) || 4100,
  routes: [
    {
      method: "GET",
      url: "/status",
      handler: async () => {
        const gateway = await fetchGatewayHealth();
        return {
          role: "borrower",
          gateway,
          timestamp: Date.now(),
        };
      },
    },
    {
      method: "GET",
      url: "/",
      handler: async () => {
        const gateway = await fetchGatewayHealth();
        const status = gateway.status;
        const stats = {
          "api_gateway": config.API_GATEWAY_URL,
          "gateway_status": status,
          "lending_core": "http://localhost:4004",
          "next_action": "submit manifest and lock collateral",
        };
        if (gateway.health?.services) {
          stats.blockchain = gateway.health.services.blockchain?.connected ? "connected" : "degraded";
          stats.compliance = String(gateway.health.services.compliance);
          stats.collateral = String(gateway.health.services.collateral);
        }
        return renderStatusPanel({ title: "Borrower Dashboard", status, stats });
      },
    },
  ],
  health: { role: "borrower_ui", gateway: config.API_GATEWAY_URL },
});

app.addHook("onSend", async (req, reply, payload) => {
  if (req.url === "/" && typeof payload === "string") {
    reply.header("content-type", "text/html; charset=utf-8");
  }
});

if (process.env.NODE_ENV !== "test") {
  start();
}

export { app, start };
