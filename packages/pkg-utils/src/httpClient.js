import { setTimeout as delay } from "timers/promises";

export function createHttpClient({ timeoutMs = 5000, defaultHeaders = {} } = {}) {
  async function request(method, url, body) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "content-type": "application/json",
          ...defaultHeaders,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const payload = isJson ? await response.json() : await response.text();
      if (!response.ok) {
        const message = typeof payload === "string" ? payload : JSON.stringify(payload);
        const error = new Error(`HTTP ${response.status}: ${message}`);
        error.status = response.status;
        error.payload = payload;
        throw error;
      }
      return payload;
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    get: (url) => request("GET", url),
    post: (url, body) => request("POST", url, body),
    request,
    delay,
  };
}
