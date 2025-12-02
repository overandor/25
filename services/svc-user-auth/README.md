svc-user-auth

Role
- identity provider tying human actors to ERC-3643 identity registry entries

Features
- KYC onboarding, credential issuance, MFA policy enforcement
- exposes OAuth2/OpenID flows for apps + machine-to-machine tokens for services
- syncs whitelist/blacklist status with smart-contracts/registry components

Data discipline
- segregated PII store, tokenized IDs exported to rest of platform
- publishes attestations to svc-api-gateway for session validation
