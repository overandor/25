svc-api-gateway

Role
- single ingress for external traffic; enforces authn/z and routes to downstream services

Interface targets
- GraphQL for rich queries, REST for webhook-style event intake
- JSON Web Token auth issued by svc-user-auth, mutual TLS with internal services

Pipelines
1. request validation → schema-level rate limiting
2. fan-out to provenance, lending, tokenization services via internal message bus
3. response normalization → deterministic error codes consumed by apps

Observability
- emits structured logs + metrics to trustee admin channel; no business logic beyond orchestration
