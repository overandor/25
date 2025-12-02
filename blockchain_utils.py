"""
Real blockchain utilities for IP Credit Stack - Zero Mocks
"""

import time
import logging
from typing import Dict, Any, Optional

from web3 import Web3
from web3.middleware import geth_poa_middleware
from web3.exceptions import ContractLogicError, TransactionNotFound

logger = logging.getLogger(__name__)

class BlockchainService:
    """Real blockchain service with zero mocks"""
    
    def __init__(self, rpc_url: str, chain_id: int = 11155111):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={'timeout': 30}))
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        self.chain_id = chain_id
        
        if not self.w3.is_connected():
            raise ConnectionError(f"Cannot connect to blockchain RPC: {rpc_url}")
    
    def get_network_info(self) -> Dict[str, Any]:
        """Get real blockchain network information"""
        try:
            return {
                "connected": self.w3.is_connected(),
                "chain_id": self.chain_id,
                "latest_block": self.w3.eth.block_number,
                "gas_price": self.w3.eth.gas_price,
                "node_version": self.w3.client_version if self.w3.is_connected() else "disconnected"
            }
        except Exception as e:
            logger.error(f"Network info error: {str(e)}")
            return {"connected": False, "error": str(e)}
    
    def verify_contract_function(self, contract_address: str, abi: list, function_name: str, args: list) -> Dict[str, Any]:
        """Real contract function verification"""
        try:
            contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(contract_address),
                abi=abi
            )
            
            if function_name not in contract.functions:
                return {
                    "success": False,
                    "error": f"Function {function_name} not found in contract ABI"
                }
            
            function = contract.functions[function_name](*args)
            result = function.call()
            
            return {
                "success": True,
                "result": result,
                "contract_address": contract_address,
                "function": function_name,
                "block_number": self.w3.eth.block_number
            }
            
        except ContractLogicError as e:
            return {
                "success": False,
                "error": f"Contract logic error: {str(e)}",
                "revert_reason": str(e)
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Contract call failed: {str(e)}"
            }
    
    def get_transaction_receipt(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        """Get real transaction receipt"""
        try:
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            if receipt:
                return {
                    "block_hash": receipt.blockHash.hex(),
                    "block_number": receipt.blockNumber,
                    "gas_used": receipt.gasUsed,
                    "status": receipt.status,
                    "transaction_hash": receipt.transactionHash.hex()
                }
            return None
        except TransactionNotFound:
            return None
        except Exception as e:
            logger.error(f"Transaction receipt error: {str(e)}")
            return None
    
    def wait_for_transaction(self, tx_hash: str, timeout: int = 120) -> Dict[str, Any]:
        """Wait for transaction confirmation - REAL implementation"""
        start_time = time.time()
        tx_hash_bytes = Web3.to_bytes(hexstr=tx_hash)
        
        while time.time() - start_time < timeout:
            receipt = self.w3.eth.get_transaction_receipt(tx_hash_bytes)
            if receipt is not None:
                return {
                    "success": True,
                    "receipt": {
                        "block_number": receipt.blockNumber,
                        "gas_used": receipt.gasUsed,
                        "status": receipt.status,
                        "transaction_hash": receipt.transactionHash.hex()
                    },
                    "confirmation_time": time.time() - start_time
                }
            
            time.sleep(3)
        
        return {
            "success": False,
            "error": f"Transaction not confirmed within {timeout} seconds",
            "transaction_hash": tx_hash
        }

class IPCollateralManager:
    """Real IP collateral management on blockchain"""
    
    def __init__(self, blockchain_service: BlockchainService, contract_address: str, abi: list):
        self.blockchain = blockchain_service
        self.w3 = blockchain_service.w3
        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=abi
        )
    
    def create_collateral_record(self, 
                               ip_hash: str,
                               valuation: int,
                               owner_address: str,
                               private_key: str) -> Dict[str, Any]:
        """Create real collateral record on blockchain"""
        try:
            if not self.w3.is_address(owner_address):
                return {"success": False, "error": "Invalid owner address"}
            
            transaction = self.contract.functions.depositIP(
                Web3.to_bytes(hexstr=ip_hash),
                valuation,
                Web3.to_checksum_address(owner_address)
            ).build_transaction({
                'chainId': self.blockchain.chain_id,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(owner_address),
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key)
            
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            return {
                "success": True,
                "transaction_hash": tx_hash.hex(),
                "ip_hash": ip_hash,
                "valuation": valuation,
                "owner": owner_address
            }
            
        except Exception as e:
            logger.error(f"Collateral creation failed: {str(e)}")
            return {
                "success": False,
                "error": f"Transaction failed: {str(e)}"
            }

ERC3643_IDENTITY_ABI = [
    {
        "inputs": [{"name": "_user", "type": "address"}],
        "name": "isVerified",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "_user", "type": "address"}],
        "name": "identity",
        "outputs": [
            {"name": "country", "type": "uint16"},
            {"name": "province", "type": "uint16"},
            {"name": "expiresAt", "type": "uint64"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

IP_COLLATERAL_ABI = [
    {
        "inputs": [
            {"name": "ipHash", "type": "bytes32"},
            {"name": "valuation", "type": "uint256"},
            {"name": "owner", "type": "address"}
        ],
        "name": "depositIP",
        "outputs": [{"name": "collateralId", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"name": "collateralId", "type": "uint256"}],
        "name": "getIPRecord",
        "outputs": [
            {"name": "ipHash", "type": "bytes32"},
            {"name": "valuation", "type": "uint256"},
            {"name": "owner", "type": "address"},
            {"name": "depositTime", "type": "uint256"},
            {"name": "isActive", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
