#!/usr/bin/env python3
"""
Enhanced IP Credit Stack - Production Ready with Real Blockchain Features
"""

import os
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, List

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field

from blockchain_utils import BlockchainService, IPCollateralManager, ERC3643_IDENTITY_ABI, IP_COLLATERAL_ABI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Config:
    RPC_URL = os.getenv("RPC_URL")
    IDENTITY_REGISTRY = os.getenv("IDENTITY_REGISTRY")
    COLLATERAL_MANAGER = os.getenv("COLLATERAL_MANAGER")
    PRIVATE_KEY = os.getenv("PRIVATE_KEY")
    
    if not RPC_URL:
        raise ValueError("RPC_URL environment variable is required")
    
    if not IDENTITY_REGISTRY:
        logger.warning("IDENTITY_REGISTRY not set - compliance features disabled")

try:
    blockchain_service = BlockchainService(Config.RPC_URL)
    logger.info(f"Connected to blockchain: {blockchain_service.get_network_info()}")
except Exception as e:
    logger.error(f"Blockchain connection failed: {e}")
    blockchain_service = None

app = FastAPI(
    title="IP Credit Stack - Production",
    description="Real IP-backed lending platform with zero mocks",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

class BlockchainAddress(BaseModel):
    address: str = Field(..., regex="^0x[a-fA-F0-9]{40}$")

class EnhancedProvenanceManifest(BaseModel):
    merkle_root: str = Field(..., regex="^0x[a-fA-F0-9]{64}$")
    total_effort_hours: int = Field(..., gt=0)
    developer_breakdown: Dict[str, int] = Field(default_factory=dict)
    file_hashes: List[str] = Field(default_factory=list)
    repository_url: str = Field(None)
    commit_hash: str = Field(None)

class CollateralCreationRequest(BaseModel):
    ip_hash: str = Field(..., regex="^0x[a-fA-F0-9]{64}$")
    valuation_usd: float = Field(..., gt=0)
    owner_address: str = Field(..., regex="^0x[a-fA-F0-9]{40}$")
    loan_terms: Dict[str, Any] = Field(default_factory=dict)

class EnhancedComplianceService:
    def __init__(self, blockchain_service: BlockchainService, identity_registry: str):
        self.blockchain = blockchain_service
        self.identity_registry = identity_registry
    
    def comprehensive_verification(self, wallet_address: str) -> Dict[str, Any]:
        if not self.blockchain:
            raise HTTPException(501, "Blockchain service unavailable")
        
        verification_result = self.blockchain.verify_contract_function(
            self.identity_registry,
            ERC3643_IDENTITY_ABI,
            "isVerified",
            [wallet_address]
        )
        
        if not verification_result["success"]:
            return {
                "wallet_address": wallet_address,
                "kyc_verified": False,
                "error": verification_result["error"],
                "timestamp": datetime.utcnow().isoformat()
            }
        
        identity_info = self.blockchain.verify_contract_function(
            self.identity_registry,
            ERC3643_IDENTITY_ABI,
            "identity",
            [wallet_address]
        )
        
        return {
            "wallet_address": wallet_address,
            "kyc_verified": verification_result["result"],
            "identity_info": identity_info if identity_info["success"] else None,
            "registry_address": self.identity_registry,
            "block_number": verification_result.get("block_number"),
            "timestamp": datetime.utcnow().isoformat()
        }

class RealCollateralService:
    def __init__(self, blockchain_service: BlockchainService, collateral_manager: str, private_key: str):
        self.blockchain = blockchain_service
        self.collateral_manager = IPCollateralManager(
            blockchain_service,
            collateral_manager,
            IP_COLLATERAL_ABI
        )
        self.private_key = private_key
    
    def create_collateral(self, request: CollateralCreationRequest) -> Dict[str, Any]:
        valuation_wei = int(request.valuation_usd * 10**18)
        
        result = self.collateral_manager.create_collateral_record(
            ip_hash=request.ip_hash,
            valuation=valuation_wei,
            owner_address=request.owner_address,
            private_key=self.private_key
        )
        
        if result["success"]:
            confirmation = self.blockchain.wait_for_transaction(result["transaction_hash"])
            result["confirmation"] = confirmation
        
        return result

try:
    enhanced_compliance = EnhancedComplianceService(blockchain_service, Config.IDENTITY_REGISTRY)
except Exception as e:
    logger.warning(f"Enhanced compliance service disabled: {e}")
    enhanced_compliance = None

try:
    if Config.COLLATERAL_MANAGER and Config.PRIVATE_KEY:
        collateral_service = RealCollateralService(
            blockchain_service, 
            Config.COLLATERAL_MANAGER, 
            Config.PRIVATE_KEY
        )
    else:
        collateral_service = None
        logger.warning("Collateral service disabled - missing contract address or private key")
except Exception as e:
    logger.error(f"Collateral service initialization failed: {e}")
    collateral_service = None

@app.get("/health")
async def health_check():
    if not blockchain_service:
        raise HTTPException(503, "Blockchain service unavailable")
    
    network_info = blockchain_service.get_network_info()
    
    return {
        "status": "healthy" if network_info["connected"] else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "services": {
            "blockchain": network_info,
            "compliance": enhanced_compliance is not None,
            "collateral": collateral_service is not None
        }
    }

@app.get("/network/status")
async def network_status():
    if not blockchain_service:
        raise HTTPException(503, "Blockchain service unavailable")
    
    return blockchain_service.get_network_info()

@app.post("/compliance/verify-enhanced")
async def verify_enhanced_compliance(wallet: BlockchainAddress):
    if not enhanced_compliance:
        raise HTTPException(501, "Enhanced compliance service requires IDENTITY_REGISTRY configuration")
    
    return enhanced_compliance.comprehensive_verification(wallet.address)

@app.post("/collateral/create")
async def create_collateral(request: CollateralCreationRequest, background_tasks: BackgroundTasks):
    if not collateral_service:
        raise HTTPException(501, "Collateral service requires COLLATERAL_MANAGER and PRIVATE_KEY configuration")
    
    result = collateral_service.create_collateral(request)
    
    if not result["success"]:
        raise HTTPException(500, f"Collateral creation failed: {result.get('error', 'Unknown error')}")
    
    return result

@app.get("/transaction/{tx_hash}/status")
async def get_transaction_status(tx_hash: str):
    if not blockchain_service:
        raise HTTPException(503, "Blockchain service unavailable")
    
    receipt = blockchain_service.get_transaction_receipt(tx_hash)
    
    if not receipt:
        raise HTTPException(404, f"Transaction not found: {tx_hash}")
    
    return receipt

@app.post("/monitor/start")
async def start_monitoring(wallet_address: str, background_tasks: BackgroundTasks):
    async def monitor_wallet(address: str):
        while True:
            try:
                if enhanced_compliance:
                    status = enhanced_compliance.comprehensive_verification(address)
                    logger.info(f"Monitoring update for {address}: {status}")
                await asyncio.sleep(60)
            except Exception as e:
                logger.error(f"Monitoring error for {address}: {e}")
                await asyncio.sleep(30)
    
    background_tasks.add_task(monitor_wallet, wallet_address)
    
    return {"monitoring": True, "wallet": wallet_address}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )
