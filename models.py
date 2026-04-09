"""
Ave Narrative Oracle — Pydantic Data Models
所有请求/响应的数据结构定义
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class ChainEnum(str, Enum):
    ETH = "eth"
    BSC = "bsc"
    SOL = "solana"
    BASE = "base"
    ARB = "arb"
    UNKNOWN = "unknown"


# ============================================================
# 请求模型
# ============================================================

class AnalyzeRequest(BaseModel):
    """分析请求体"""
    address: str = Field(..., description="Token contract address")
    chain: Optional[str] = Field(None, description="Chain hint: eth/bsc/solana/base/arb")


# ============================================================
# AVE API 原始数据模型
# ============================================================

class AveTokenData(BaseModel):
    """AVE API 返回的 Token 原始数据"""
    token: str = ""
    chain: str = ""
    name: str = ""
    symbol: str = ""
    current_price_usd: str = "0"
    market_cap: str = "0"
    fdv: str = "0"
    tvl: str = "0"
    main_pair_tvl: str = "0"
    tx_volume_u_24h: str = "0"
    holders: int = 0
    price_change_1d: str = "0"
    price_change_24h: str = "0"
    price_change_1h: str = "0"
    intro_en: str = ""
    intro_cn: str = ""
    total: str = "0"
    burn_amount: str = "0"
    lock_amount: str = "0"
    locked_percent: str = "0"
    launch_price: str = "0"
    token_price_change_5m: str = "0"
    token_price_change_1h: str = "0"
    token_price_change_4h: str = "0"
    token_price_change_24h: str = "0"
    token_tx_volume_usd_5m: str = "0"
    token_tx_volume_usd_1h: str = "0"


# ============================================================
# 10 个核心指标模型
# ============================================================

class NarrativeMetrics(BaseModel):
    """
    10 个核心叙事指标（权重总和 = 100%）
    基于 120+ 历史案例拟合（币安人生、Giggle、我踏马来了、世界和平等）
    """
    # 1. 叙事文化共鸣度 (18%) — 含宏大叙事规模
    cultural_resonance: float = Field(0.0, ge=0, le=10, description="文化共鸣度 0-10")
    # 2. 社区活跃增长率 (15%)
    community_growth: float = Field(0.0, ge=0, le=10, description="社区活跃增长率 0-10")
    # 3. 持币者分布 (12%)
    holder_distribution: float = Field(0.0, ge=0, le=10, description="持币者分布健康度 0-10")
    # 4. 流动性/市值比 (10%)
    liquidity_mc_ratio: float = Field(0.0, ge=0, le=10, description="流动性/市值比 0-10")
    # 5. 交易量/市值比 (10%)
    volume_mc_ratio: float = Field(0.0, ge=0, le=10, description="交易量/市值比 0-10")
    # 6. KOL 与真实名人背书强度 (10%)
    kol_endorsement: float = Field(0.0, ge=0, le=10, description="KOL/名人背书强度 0-10")
    # 7. 代币经济学 (8%)
    tokenomics: float = Field(0.0, ge=0, le=10, description="代币经济学健康度 0-10")
    # 8. 链上生态时机 (7%)
    onchain_timing: float = Field(0.0, ge=0, le=10, description="链上生态时机 0-10")
    # 9. 聪明钱流入 (6%)
    smart_money_flow: float = Field(0.0, ge=0, le=10, description="聪明钱流入强度 0-10")
    # 10. 病毒传播潜力 (4%)
    viral_potential: float = Field(0.0, ge=0, le=10, description="病毒传播潜力 0-10")


# ============================================================
# 数学模型输出
# ============================================================

class MathModelOutput(BaseModel):
    """复合非线性数学模型输出"""
    base_score: float = Field(0.0, description="加权基础分 (0-100)")
    interaction_celebrity_narrative: float = Field(0.0, description="名人×宏大叙事交互项")
    interaction_culture_viral: float = Field(0.0, description="文化×病毒交互项")
    sigmoid_boost: float = Field(0.0, description="Sigmoid 临界爆发加成")
    final_narrative_score: float = Field(0.0, description="最终叙事综合分 (0-100)")
    hold_value_score: float = Field(0.0, description="持仓价值分 (0-100，含风险衰减)")
    breakout_probability: float = Field(0.0, description="突破概率 (0-1)")
    peak_mc_low: float = Field(0.0, description="峰值市值预测下限 (USD)")
    peak_mc_high: float = Field(0.0, description="峰值市值预测上限 (USD)")


# ============================================================
# MiniMax AI 分析输出
# ============================================================

class MiniMaxAnalysis(BaseModel):
    """MiniMax AI 叙事分析结果"""
    narrative_summary: str = ""
    key_endorsement_detail: str = ""
    risk_factors: str = ""
    investment_thesis: str = ""
    hedging_strategy: str = ""
    comparable_cases: List[str] = []
    confidence_level: str = "Medium"


# ============================================================
# 雷达图数据
# ============================================================

class RadarDataPoint(BaseModel):
    subject: str
    value: float
    fullMark: float = 10.0


# ============================================================
# 持仓增长数据点
# ============================================================

class HolderGrowthPoint(BaseModel):
    time: str
    holders: int
    change: float


# ============================================================
# 完整分析响应
# ============================================================

class AnalysisResponse(BaseModel):
    """前端完整分析响应"""
    # 基础信息
    address: str
    chain: str
    name: str
    symbol: str
    
    # 价格数据
    current_price_usd: float
    market_cap: float
    fdv: float
    tvl: float
    volume_24h: float
    price_change_24h: float
    price_change_1h: float
    holders: int
    
    # 代币经济学
    total_supply: float
    burn_amount: float
    locked_percent: float
    price_vs_ath_ratio: float  # Price/ATH ratio
    
    # 10 个指标
    metrics: NarrativeMetrics
    
    # 数学模型输出
    model_output: MathModelOutput
    
    # MiniMax AI 分析
    ai_analysis: MiniMaxAnalysis
    
    # 雷达图数据（6维）
    radar_data: List[RadarDataPoint]
    
    # 持仓增长趋势（模拟24h数据点）
    holder_growth: List[HolderGrowthPoint]
    
    # 衍生指标
    contract_risk_score: int  # 1-10，越低越好
    smart_money_net_flow: float  # USD
    
    # 元数据
    analysis_latency_ms: int
    cached: bool = False
    timestamp: int


class ErrorResponse(BaseModel):
    error: str
    detail: str
    code: int
