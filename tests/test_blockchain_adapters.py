import asyncio
from base58 import b58encode

import pytest
from solders.keypair import Keypair
from solana.exceptions import SolanaRpcException
from httpx import HTTPStatusError

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

pytest_plugins = ["pytest_asyncio.plugin"]

from vault_core import AppSettings, EvmAdapter, SecurityConfig, SolanaAdapter


async def wait_with_timeout(coro, timeout: int = 40):
    return await asyncio.wait_for(coro, timeout=timeout)


@pytest.mark.asyncio
async def test_evm_adapter_connects_and_reads_height():
    settings = AppSettings(
        rpc_url="https://rpc.sepolia.org",
        identity_registry="0x" + "0" * 40,
        vault_contract="0x" + "0" * 40,
        evm_chain_id=11155111,
    )
    security = SecurityConfig(settings)
    adapter = EvmAdapter(
        settings.rpc_url,
        settings.evm_chain_id,
        settings.identity_registry,
        settings.vault_contract,
        settings.encrypted_private_key,
        security,
    )

    if not await wait_with_timeout(adapter.initialize()):
        pytest.skip("EVM devnet unavailable")
    height = await wait_with_timeout(adapter.get_block_height())
    assert isinstance(height, int)
    assert height > 0


@pytest.mark.asyncio
async def test_solana_adapter_airdrop_and_memo():
    fee_payer = Keypair()
    private_key = b58encode(bytes(fee_payer)).decode()

    settings = AppSettings(
        rpc_url="https://rpc.sepolia.org",
        identity_registry="0x" + "0" * 40,
        vault_contract="0x" + "0" * 40,
        solana_rpc_url="https://api.devnet.solana.com",
        solana_private_key=private_key,
        default_chain="solana",
    )
    security = SecurityConfig(settings)
    adapter = SolanaAdapter(
        settings.solana_rpc_url,
        settings.solana_program_id,
        settings.solana_private_key,
        settings.solana_encrypted_private_key,
        security,
    )

    if not await wait_with_timeout(adapter.initialize()):
        pytest.skip("Solana devnet unavailable")
    compliance = await wait_with_timeout(adapter.verify_compliance(str(fee_payer.pubkey())))
    assert compliance["kyc_verified"] is True

    try:
        result = await wait_with_timeout(
            adapter.create_vault(
                ip_hash="0x" + "ab" * 32,
                valuation=1_000_000,
                owner=str(fee_payer.pubkey()),
                loan_terms={"note": "devnet-memo"},
            ),
            timeout=120,
        )
    except (HTTPStatusError, SolanaRpcException):
        pytest.skip("Solana devnet airdrop rate-limited")

    assert result["success"] is True
    assert result["transaction_hash"]
