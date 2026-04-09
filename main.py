"""
Ave Narrative Oracle — FastAPI Backend
AVE宏大叙事预言机 · 后端主入口

技术栈: FastAPI + httpx + numpy
API集成: AVE.ai Claw Monitoring Skill + MiniMax-Text-01
"""
import time
import logging
import os
import asyncio
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from dotenv import load_dotenv
load_dotenv()

from models import (
    AnalysisResponse, ErrorResponse, RadarDataPoint,
    NarrativeMetrics, MathModelOutput, MiniMaxAnalysis
)
from services.ave_service import AveService
from services.minimax_service import MiniMaxService
from services.math_engine import MathEngine
from utils.cache import get_analysis_cache, set_analysis_cache, get_cache_stats

# ============================================================
# 日志配置
# ============================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("ave_oracle")

# ============================================================
# 环境变量
# ============================================================
AVE_API_KEY = os.getenv("AVE_API_KEY", "")
MINIMAX_API_KEY = os.getenv("MINIMAX_API_KEY", "")
PORT = int(os.getenv("PORT", "8000"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

if not AVE_API_KEY:
    logger.warning("AVE_API_KEY not set!")
if not MINIMAX_API_KEY:
    logger.warning("MINIMAX_API_KEY not set!")

# ============================================================
# 服务实例（全局单例）
# ============================================================
ave_service: Optional[AveService] = None
minimax_service: Optional[MiniMaxService] = None
math_engine = MathEngine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    global ave_service, minimax_service
    logger.info("🚀 Ave Narrative Oracle Backend Starting...")
    ave_service = AveService(AVE_API_KEY)
    minimax_service = MiniMaxService(MINIMAX_API_KEY)
    logger.info("✅ Services initialized")
    yield
    # 关闭时清理
    if ave_service:
        await ave_service.close()
    if minimax_service:
        await minimax_service.close()
    logger.info("👋 Services closed")


# ============================================================
# FastAPI 应用
# ============================================================
app = FastAPI(
    title="Ave Narrative Oracle API",
    description="AVE宏大叙事预言机 — Institutional-grade narrative intelligence powered by AVE Claw & MiniMax AI",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# 请求计时中间件
# ============================================================
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = str(round(process_time, 2))
    return response


# ============================================================
# 健康检查
# ============================================================
@app.get("/health", tags=["System"])
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "project": "Ave Narrative Oracle",
        "ave_api": "configured" if AVE_API_KEY else "missing",
        "minimax_api": "configured" if MINIMAX_API_KEY else "missing",
        "cache": get_cache_stats(),
    }


# ============================================================
# 核心分析端点
# ============================================================
@app.get(
    "/api/analyze/{address}",
    response_model=AnalysisResponse,
    tags=["Analysis"],
    summary="Analyze token narrative",
    description="""
    核心分析端点：通过代币合约地址获取完整的叙事分析报告
    
    调用流程：
    1. 检查缓存（TTL=5分钟）
    2. 调用 AVE.ai Claw Monitoring Skill 获取链上数据
    3. 调用 MiniMax-Text-01 进行 AI 叙事评分
    4. 运行复合非线性数学模型
    5. 返回完整分析报告
    """
)
async def analyze_token(
    address: str,
    chain: Optional[str] = Query(None, description="Chain hint: eth/bsc/solana/base/arb"),
):
    """
    分析代币叙事强度
    
    - **address**: 代币合约地址
    - **chain**: 可选的链标识（eth/bsc/solana/base/arb）
    """
    start_time = time.time()
    logger.info(f"[Analyze] Request: address={address[:20]}..., chain={chain}")

    # --- 缓存检查 ---
    cached = get_analysis_cache(address, chain)
    if cached:
        cached["cached"] = True
        return JSONResponse(content=cached)

    try:
        # ============================================================
        # Step 1: AVE.ai Claw Monitoring Skill 调用
        # ============================================================
        logger.info("[Step 1] Calling AVE.ai Claw Monitoring Skill...")
        raw_token = await ave_service.search_token(address)

        if not raw_token:
            raise HTTPException(
                status_code=404,
                detail=f"Token not found for address: {address}. Please verify the contract address and chain."
            )

        token_data = ave_service.parse_token_data(raw_token)
        detected_chain = token_data.chain or chain or "unknown"

        # 尝试获取更详细数据
        if detected_chain and detected_chain != "unknown":
            detail_data = await ave_service.get_token_detail(address, detected_chain)
            if detail_data and detail_data.get("token"):
                # 用详细数据补充
                detail_token = detail_data["token"]
                if not token_data.intro_en and detail_token.get("intro_en"):
                    token_data.intro_en = detail_token.get("intro_en", "")
                if not token_data.intro_cn and detail_token.get("intro_cn"):
                    token_data.intro_cn = detail_token.get("intro_cn", "")

        logger.info(f"[Step 1] ✅ Token: {token_data.name} ({token_data.symbol}) on {detected_chain}")

        # ============================================================
        # Step 2: 链上指标计算（降级方案）
        # ============================================================
        logger.info("[Step 2] Computing on-chain metrics...")
        onchain_metrics = math_engine.compute_metrics_from_onchain(token_data)
        contract_risk = math_engine.compute_contract_risk(token_data)

        # ============================================================
        # Step 3: MiniMax AI 叙事评分
        # ============================================================
        logger.info("[Step 3] Calling MiniMax-Text-01 for narrative analysis...")
        ai_analysis, ai_scores = await minimax_service.analyze_token_with_scores(token_data)

        # ============================================================
        # Step 4: 融合评分
        # ============================================================
        logger.info("[Step 4] Merging AI scores with on-chain metrics...")
        if ai_scores:
            final_metrics = math_engine.merge_scores(ai_scores, onchain_metrics, ai_weight=0.7)
        else:
            final_metrics = onchain_metrics

        # ============================================================
        # Step 5: 复合非线性数学模型
        # ============================================================
        logger.info("[Step 5] Running composite non-linear math model...")
        model_output = math_engine.compute_model_output(final_metrics, token_data, contract_risk)

        # ============================================================
        # Step 6: 构建响应
        # ============================================================
        # 安全转换数值
        def safe_float(val, default=0.0):
            try:
                return float(val or default)
            except (ValueError, TypeError):
                return default

        mc = safe_float(token_data.market_cap)
        tvl = safe_float(token_data.main_pair_tvl)
        vol = safe_float(token_data.tx_volume_u_24h)
        price = safe_float(token_data.current_price_usd)
        fdv = safe_float(token_data.fdv)
        total = safe_float(token_data.total, 1)
        burn = safe_float(token_data.burn_amount)
        locked_pct = safe_float(token_data.locked_percent)
        launch_price = safe_float(token_data.launch_price, 1)
        price_vs_ath = price / launch_price if launch_price > 0 else 0

        # 雷达图数据（6维，对应前端展示）
        radar_data = [
            RadarDataPoint(subject="Cultural", value=round(final_metrics.cultural_resonance, 1)),
            RadarDataPoint(subject="Endorsement", value=round(final_metrics.kol_endorsement, 1)),
            RadarDataPoint(subject="Social", value=round(final_metrics.community_growth, 1)),
            RadarDataPoint(subject="Philanthropy", value=round(final_metrics.tokenomics, 1)),
            RadarDataPoint(subject="Humor", value=round(final_metrics.viral_potential, 1)),
            RadarDataPoint(subject="Political", value=round(final_metrics.onchain_timing, 1)),
        ]

        # 持仓增长数据
        holder_growth = math_engine.generate_holder_growth(token_data)

        # 聪明钱净流入
        smart_money_net = ave_service.estimate_smart_money_flow(token_data)

        latency_ms = int((time.time() - start_time) * 1000)
        logger.info(f"[Analyze] ✅ Complete in {latency_ms}ms")

        response_data = AnalysisResponse(
            address=address,
            chain=detected_chain,
            name=token_data.name,
            symbol=token_data.symbol,
            current_price_usd=price,
            market_cap=mc,
            fdv=fdv,
            tvl=tvl,
            volume_24h=vol,
            price_change_24h=safe_float(token_data.price_change_24h),
            price_change_1h=safe_float(token_data.price_change_1h),
            holders=token_data.holders,
            total_supply=total,
            burn_amount=burn,
            locked_percent=locked_pct,
            price_vs_ath_ratio=round(price_vs_ath, 4),
            metrics=final_metrics,
            model_output=model_output,
            ai_analysis=ai_analysis,
            radar_data=radar_data,
            holder_growth=holder_growth,
            contract_risk_score=contract_risk,
            smart_money_net_flow=smart_money_net,
            analysis_latency_ms=latency_ms,
            cached=False,
            timestamp=int(time.time()),
        )

        # 缓存结果
        response_dict = response_data.model_dump()
        set_analysis_cache(address, response_dict, chain)

        return response_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Analyze] Error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


# ============================================================
# 示例 Token 列表端点
# ============================================================
@app.get("/api/examples", tags=["Examples"])
async def get_example_tokens():
    """获取示例代币列表（用于首页展示）"""
    return {
        "tokens": [
            {
                "name": "Binance Life",
                "symbol": "LIFE",
                "chain": "BSC",
                "address": "0x3b248cefa87f836a4e6f6d6c9b42991b88dc1d58",
                "tag": "Institutional Backed",
                "mc": "524M",
                "change": "+12%",
                "description": "He Yi & CZ endorsed BSC token — peak $524M MC"
            },
            {
                "name": "Giggle",
                "symbol": "GIGGLE",
                "chain": "BSC",
                "address": "0x2f4e8d2b1c3a5e7f9b0d4c6e8a2b4d6f8e0a2c4",
                "tag": "Philanthropy",
                "mc": "25M",
                "change": "+45%",
                "description": "Charity narrative BSC token — stable $25M+ MC"
            },
            {
                "name": "PEPE",
                "symbol": "PEPE",
                "chain": "ETH",
                "address": "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
                "tag": "Cultural Icon",
                "mc": "3B",
                "change": "-2%",
                "description": "Cultural meme icon — $3B+ market cap"
            },
        ]
    }


# ============================================================
# 直接通过地址搜索（POST 方式）
# ============================================================
class SearchRequest(BaseModel):
    address: str
    chain: Optional[str] = None


@app.post("/api/search", tags=["Analysis"])
async def search_token(req: SearchRequest):
    """快速搜索代币基础信息（不运行完整分析）"""
    try:
        raw = await ave_service.search_token(req.address)
        if not raw:
            raise HTTPException(status_code=404, detail="Token not found")
        token_data = ave_service.parse_token_data(raw)
        return {
            "found": True,
            "name": token_data.name,
            "symbol": token_data.symbol,
            "chain": token_data.chain,
            "market_cap": token_data.market_cap,
            "holders": token_data.holders,
            "price_usd": token_data.current_price_usd,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 启动入口
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=PORT,
        reload=True,
        log_level="info",
    )
