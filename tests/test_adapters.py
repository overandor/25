import asyncio
import sys
from pathlib import Path

import pytest
from httpx import HTTPStatusError
from solana.exceptions import SolanaRpcException
from solana.rpc.core import UnconfirmedTxError

sys.path.append(str(Path(__file__).resolve().parents[1]))

from vault_core import AppSettings, EVMAdapter, SecurityConfig, SolanaAdapter


@pytest.mark.asyncio
async def test_evm_adapter_connectivity():
    settings = AppSettings(
        rpc_url="https://rpc.ankr.com/eth_sepolia",
        identity_registry="0x" + "0" * 40,
        vault_contract="0x" + "0" * 40,
    )
    adapter = EVMAdapter(settings, SecurityConfig(settings))

    initialized = await adapter.initialize()
    if not initialized:
        pytest.skip("EVM devnet not reachable")

    compliance = await adapter.verify_compliance("0x0000000000000000000000000000000000000000")
    assert "kyc_verified" in compliance


@pytest.mark.asyncio
async def test_solana_adapter_memo_transaction():
    adapter = SolanaAdapter("https://api.devnet.solana.com")
    assert await adapter.initialize() is True

    owner = str(adapter.fee_payer.public_key)
    compliance = await adapter.verify_compliance(owner)
    assert compliance["wallet"] == owner

    try:
        result = await asyncio.wait_for(
            adapter.create_vault(
                ip_hash="0x" + "ab" * 32,
                valuation=1_000_000_000,
                owner=owner,
                loan_terms={"tenor_days": 30},
            ),
            timeout=30,
        )
    except (SolanaRpcException, HTTPStatusError, UnconfirmedTxError):
        pytest.skip("Solana devnet throttled")
    except asyncio.TimeoutError:
        pytest.skip("Solana devnet slow response")
    assert result["success"] is True
    assert result["transaction_hash"]
