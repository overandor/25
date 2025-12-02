import { randomUUID } from "crypto";
import { validate, SPVSchema } from "@ip-prime-brokerage/pkg-types";

const store = new Map();

export function createSpv(input) {
  const spv = validate(SPVSchema, input);
  const id = randomUUID();
  const record = { id, ...spv, createdAt: Date.now() };
  store.set(id, record);
  return record;
}

export function getSpv(id) {
  return store.get(id);
}
