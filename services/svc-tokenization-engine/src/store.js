import { randomUUID } from "crypto";
import { validate, TokenizationRequestSchema } from "@ip-prime-brokerage/pkg-types";

const tokens = new Map();

export function mintToken(request) {
  const data = validate(TokenizationRequestSchema, request);
  const tokenId = randomUUID();
  const record = {
    tokenId,
    ...data,
    mintedAt: Date.now(),
  };
  tokens.set(tokenId, record);
  return record;
}

export function getToken(id) {
  return tokens.get(id);
}
