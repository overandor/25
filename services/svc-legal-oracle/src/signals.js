import crypto from "crypto";
import { validate, DefaultSignalSchema } from "@ip-prime-brokerage/pkg-types";

const signals = [];

export function recordSignal(secret, payload) {
  const data = validate(DefaultSignalSchema, payload);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${data.loanId}:${data.reason}:${data.timestamp}`)
    .digest("hex");
  const record = { ...data, signature, recordedAt: Date.now() };
  signals.push(record);
  return record;
}

export function listSignals() {
  return signals;
}
