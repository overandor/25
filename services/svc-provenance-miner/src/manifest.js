import crypto from "crypto";
import { validate, ProvenanceManifestSchema } from "@ip-prime-brokerage/pkg-types";

export function computeMerkleRoot(fileHashes) {
  const clean = fileHashes.map((h) => h.replace(/^0x/, ""));
  let layer = clean.map((h) => Buffer.from(h, "hex"));
  if (layer.length === 0) throw new Error("fileHashes cannot be empty");
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = layer[i + 1] || layer[i];
      const combined = Buffer.concat([left, right]);
      next.push(crypto.createHash("sha256").update(combined).digest());
    }
    layer = next;
  }
  return "0x" + layer[0].toString("hex");
}

export function buildManifest(payload) {
  const validated = validate(
    ProvenanceManifestSchema,
    {
      ...payload,
      merkleRoot: payload.merkleRoot || computeMerkleRoot(payload.fileHashes),
    }
  );
  return {
    ...validated,
    createdAt: Date.now(),
  };
}
