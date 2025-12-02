const palette = {
  ok: "#16a34a",
  warn: "#ca8a04",
  err: "#dc2626",
};

function renderRow(label, value) {
  return `<tr><td style="padding:4px 8px;font-weight:600;">${label}</td><td style="padding:4px 8px;">${value}</td></tr>`;
}

export function renderStatusPanel({ title, status, stats = {} }) {
  const color = status === "ok" ? palette.ok : status === "warn" ? palette.warn : palette.err;
  const rows = Object.entries(stats)
    .map(([key, value]) => renderRow(key, value))
    .join("");
  return `<!doctype html><html><head><title>${title}</title></head><body style="font-family:system-ui;margin:0;padding:16px;">` +
    `<header style="display:flex;align-items:center;gap:8px;">` +
    `<div style="width:12px;height:12px;border-radius:50%;background:${color};"></div>` +
    `<h1 style="margin:0;font-size:18px;">${title}</h1>` +
    `</header>` +
    `<table style="margin-top:12px;border-collapse:collapse;">${rows}</table>` +
    `</body></html>`;
}
