# 🏦 Vault Protocol - Enterprise IP Collateralization

**Production-Grade, Zero Mocks, Real Blockchain Integration**

## 🚀 Features

- **✅ Zero Mocks**: All endpoints perform real blockchain operations
- **🔒 Enterprise Security**: Encrypted private keys, rate limiting, audit logging
- **⚡ Async Architecture**: Non-blocking blockchain operations
- **🏛️ ERC-3643 Compliance**: Full KYC/AML verification
- **📊 Gas Optimization**: Dynamic gas pricing with fallbacks
- **🔍 Comprehensive Audit**: Cryptographic audit trail
- **🚦 Rate Limiting**: Redis-based rate limiting
- **❤️ Health Monitoring**: Comprehensive health checks with Redis connectivity validation

## 🛠️ Quick Start

### Prerequisites

- Python 3.11+
- Redis 6+
- Ethereum node (Infura/Alchemy)
- ERC-3643 Identity Registry
- Vault Protocol Smart Contracts

### Environment Setup

```bash
# Clone and setup
git clone <repository>
cd vault-protocol
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Environment configuration
cp .env.example .env
# Edit .env with your production values
```

Production Deployment

```bash
# Using Docker (Recommended)
docker-compose up -d --build

# Or directly with uvicorn
uvicorn vault_core:app --host 0.0.0.0 --port 8000 --workers 4
```

Configuration validation

- `AppSettings` enforces minimum JWT length, validates checksum addresses for on-chain registries/contracts, and fails vault creation when the required ERC-3643 registry or vault contract addresses are missing.
- Rate limiting disables itself gracefully when Redis is unreachable and the health endpoint reflects Redis connectivity status.

📋 API Documentation

Health Check

```http
GET /health
```

Returns system status and service health.

Create Vault

```http
POST /vault/create
{
    "ip_hash": "0xabc123...",
    "valuation_usd": "50000.00",
    "owner_address": "0x742E6d36C5054b4A0f6a4e7c6725bF2a7F824e12",
    "loan_terms": {
        "duration_days": 90,
        "interest_rate": "5.5"
    }
}
```

Compliance Verification

```http
POST /compliance/verify
{
    "wallet_address": "0x742E6d36C5054b4A0f6a4e7c6725bF2a7F824e12"
}
```

🔧 Configuration

Required Environment Variables

```bash
# Blockchain
RPC_URL=https://sepolia.infura.io/v3/your-project-id
IDENTITY_REGISTRY=0xYourERC3643Contract
VAULT_CONTRACT=0xYourVaultContract

# Security
JWT_SECRET=your-32-character-secret-key
ENCRYPTION_KEY=your-fernet-key
ENCRYPTED_PRIVATE_KEY=your-encrypted-signing-key
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=https://your-frontend.com,http://localhost:3000
```

Private Key Encryption

```python
from cryptography.fernet import Fernet

# Generate encryption key
key = Fernet.generate_key()
print(f"ENCRYPTION_KEY={key.decode()}")

# Encrypt your private key
cipher = Fernet(key)
encrypted_pk = cipher.encrypt(b"your_private_key_here")
print(f"ENCRYPTED_PRIVATE_KEY={encrypted_pk.decode()}")
```

🏗️ Architecture

Core Components

1. AsyncBlockchainService: Non-blocking Web3 operations with gas optimization
2. EnterpriseComplianceService: Multi-layer KYC verification
3. VaultCollateralManager: Secure vault creation with encrypted keys
4. SecurityConfig: Centralized security management
5. AuditLogger: Cryptographic audit trail

Security Features

· 🔒 Encrypted private key storage
· 🚦 Redis-based rate limiting
· 📝 Cryptographic audit logs
· 🏛️ ERC-3643 compliance integration
· ⚡ Async nonce management
· 💰 Dynamic gas optimization

🚨 Production Checklist

· Configure all environment variables
· Set up Redis for rate limiting
· Configure proper logging
· Set up monitoring and alerts
· Configure backup strategies
· Set up SSL/TLS termination
· Configure firewall rules
· Set up disaster recovery

📊 Monitoring

The API includes comprehensive health checks at /health and structured logging for all operations. Integrate with your preferred monitoring solution (Prometheus, Datadog, etc.)

🆘 Support

For production issues:

1. Check audit logs: tail -f audit.log
2. Verify blockchain connectivity: /health endpoint
3. Check Redis connectivity
4. Review application logs

📄 License

Proprietary - All rights reserved.

## Key Production Features:

1. **✅ Zero Mocks**: All blockchain operations are real RPC calls
2. **🔒 Enterprise Security**: Encrypted keys, rate limiting, audit trails
3. **⚡ Async Architecture**: Non-blocking Web3 operations
4. **🏛️ Real Compliance**: ERC-3643 integration with multi-layer verification
5. **💼 Gas Management**: Dynamic pricing with fallback strategies
6. **📊 Production Ready**: Health checks, monitoring, proper error handling
7. **🔐 Key Security**: Encrypted private key storage
8. **🚦 Rate Limiting**: Redis-based with proper middleware
9. **📝 Audit Trail**: Cryptographic chain of custody for all operations

This implementation is ready for enterprise deployment with no mocks and full production hardening.
