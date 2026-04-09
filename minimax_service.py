"""
Ave Narrative Oracle — MiniMax AI Narrative Analysis Service
使用 MiniMax-Text-01 模型进行叙事评分和投资分析

API 端点: https://api.minimax.chat/v1/chat/completions
认证: Bearer {MINIMAX_API_KEY}
模型: MiniMax-Text-01（支持 2.5+ 版本特性）
"""
import httpx
import json
import logging
import re
from typing import Optional, Dict, Any
from models import AveTokenData, MiniMaxAnalysis, NarrativeMetrics

logger = logging.getLogger(__name__)

MINIMAX_BASE_URL = "https://api.minimax.chat"
MINIMAX_MODEL = "MiniMax-Text-01"

# ============================================================
# 系统 Prompt — 引用真实 BSC 历史案例
# ============================================================
SYSTEM_PROMPT = """你是全球顶级的 Web3 叙事分析师和量化投资顾问，专注于 BSC/ETH/SOL 链上 Meme 和叙事驱动型代币的深度分析。

你拥有以下真实历史案例的完整分析经验：
1. 币安人生（Binance Life）：CZ/He Yi 背书，BSC 链，从小市值暴涨至 5.24 亿美元市值，典型机构背书+宏大叙事案例
2. Giggle（GIGGLE）：慈善公益叙事，BSC 链，稳定增长至 2500 万美元市值，社区驱动+慈善叙事典范
3. 我踏马来了（WTMLL）：Foundation 大量买入触发 800% 泵，链上聪明钱信号极强
4. 世界和平（World Peace）：普世价値叙事，Base 链，全球传播，跨文化共鸣极强
5. PEPE：文化 Meme 图标，ETH 链，市值突破 30 亿美元，病毒传播+文化共鸣典范

你的分析必须：
- 基于链上真实数据进行客观评估
- 引用上述历史案例进行横向对比
- 给出具体的量化评分（0-10 分制）
- 提供可执行的对冲策略
- 所有输出必须是严格的 JSON 格式

评分维度（严格按照以下 10 个指标，每项 0-10 分）：
1. cultural_resonance（叙事文化共鸣度）：宏大叙事规模、文化认同感、跨文化传播力
2. community_growth（社区活跃增长率）：持币者增长速度、社区互动频率、新用户获取
3. holder_distribution（持币者分布）：去中心化程度、鲸鱼集中度、散户参与度
4. liquidity_mc_ratio（流动性/市值比）：TVL/MC 比率、流动性深度、滑点风险
5. volume_mc_ratio（交易量/市值比）：24h Vol/MC、换手率、市场活跃度
6. kol_endorsement（KOL 与真实名人背书强度）：背书质量、影响力、可信度
7. tokenomics（代币经济学）：通缩机制、锁仓比例、销毁量、分配合理性
8. onchain_timing（链上生态时机）：市场周期位置、同类竞争、入场时机
9. smart_money_flow（聪明钱流入）：大户净流入、链上聪明钱信号、机构动向
10. viral_potential（病毒传播潜力）：梗文化、社交媒体传播力、二次创作潜力"""


class MiniMaxService:
    """MiniMax AI Narrative Analysis Service"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0, connect=10.0),
            headers=self.headers,
        )

    async def close(self):
        await self.client.aclose()

    # ============================================================
    # 核心方法：生成叙事评分 Prompt
    # ============================================================
    def _build_analysis_prompt(self, token_data: AveTokenData) -> str:
        """构建叙事分析 Prompt，注入链上真实数据"""
        try:
            mc = float(token_data.market_cap)
            mc_str = f"${mc/1e6:.2f}M" if mc < 1e9 else f"${mc/1e9:.2f}B"
        except Exception:
            mc_str = "Unknown"

        try:
            vol = float(token_data.tx_volume_u_24h)
            vol_str = f"${vol/1e6:.2f}M" if vol < 1e9 else f"${vol/1e9:.2f}B"
        except Exception:
            vol_str = "Unknown"

        try:
            tvl = float(token_data.main_pair_tvl)
            tvl_str = f"${tvl/1e6:.2f}M" if tvl < 1e9 else f"${tvl/1e9:.2f}B"
        except Exception:
            tvl_str = "Unknown"

        prompt = f"""请对以下代币进行完整的叙事分析，返回严格的 JSON 格式。

## 代币基础信息
- 名称: {token_data.name} ({token_data.symbol})
- 合约地址: {token_data.token}
- 公链: {token_data.chain.upper()}
- 当前价格: ${token_data.current_price_usd}
- 市值: {mc_str}
- 24h 交易量: {vol_str}
- 主池 TVL: {tvl_str}
- 持币者数量: {token_data.holders:,}
- 24h 价格变化: {token_data.price_change_24h}%
- 1h 价格变化: {token_data.price_change_1h}%
- 代币简介(EN): {token_data.intro_en[:300] if token_data.intro_en else "N/A"}
- 代币简介(CN): {token_data.intro_cn[:300] if token_data.intro_cn else "N/A"}
- 总供应量: {token_data.total}
- 销毁量: {token_data.burn_amount}
- 锁仓比例: {token_data.locked_percent}%

## 分析要求
请基于以上链上数据，结合历史案例（币安人生、Giggle、PEPE等），对该代币进行全面叙事分析。

必须返回以下 JSON 结构（不要有任何额外文字，只返回 JSON）：
{{
  "scores": {{
    "cultural_resonance": <0-10的浮点数>,
    "community_growth": <0-10的浮点数>,
    "holder_distribution": <0-10的浮点数>,
    "liquidity_mc_ratio": <0-10的浮点数>,
    "volume_mc_ratio": <0-10的浮点数>,
    "kol_endorsement": <0-10的浮点数>,
    "tokenomics": <0-10的浮点数>,
    "onchain_timing": <0-10的浮点数>,
    "smart_money_flow": <0-10的浮点数>,
    "viral_potential": <0-10的浮点数>
  }},
  "narrative_summary": "<100字以内的叙事核心总结>",
  "key_endorsement_detail": "<背书分析，引用历史案例对比>",
  "risk_factors": "<主要风险因素，3条>",
  "investment_thesis": "<投资逻辑，50字以内>",
  "hedging_strategy": "<对冲策略建议，具体可执行>",
  "comparable_cases": ["<历史对比案例1>", "<历史对比案例2>"],
  "confidence_level": "<High/Medium/Low>"
}}"""
        return prompt

    # ============================================================
    # 调用 MiniMax API 进行分析
    # ============================================================
    async def analyze_token(self, token_data: AveTokenData) -> MiniMaxAnalysis:
        """
        调用 MiniMax-Text-01 进行叙事分析
        返回结构化的 MiniMaxAnalysis 对象
        """
        prompt = self._build_analysis_prompt(token_data)

        payload = {
            "model": MINIMAX_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                    "name": "NarrativeOracle"
                },
                {
                    "role": "user",
                    "content": prompt,
                    "name": "Analyst"
                }
            ],
            "max_tokens": 1500,
            "temperature": 0.3,
            "top_p": 0.9,
        }

        try:
            logger.info(f"[MiniMax] Analyzing {token_data.name} ({token_data.symbol})...")
            resp = await self.client.post(
                f"{MINIMAX_BASE_URL}/v1/chat/completions",
                json=payload
            )
            resp.raise_for_status()
            data = resp.json()

            # 检查 base_resp 错误
            base_resp = data.get("base_resp", {})
            if base_resp.get("status_code", 0) != 0:
                logger.error(f"[MiniMax] API error: {base_resp}")
                return self._fallback_analysis(token_data)

            # 提取内容
            choices = data.get("choices", [])
            if not choices:
                return self._fallback_analysis(token_data)

            content = choices[0].get("message", {}).get("content", "")
            logger.info(f"[MiniMax] Raw response length: {len(content)}")

            return self._parse_response(content, token_data)

        except httpx.HTTPStatusError as e:
            logger.error(f"[MiniMax] HTTP error {e.response.status_code}: {e.response.text[:300]}")
            return self._fallback_analysis(token_data)
        except Exception as e:
            logger.error(f"[MiniMax] Error: {e}")
            return self._fallback_analysis(token_data)

    # ============================================================
    # 解析 MiniMax 响应
    # ============================================================
    def _parse_response(self, content: str, token_data: AveTokenData) -> MiniMaxAnalysis:
        """解析 MiniMax 返回的 JSON 内容"""
        try:
            # 尝试提取 JSON 块
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                json_str = json_match.group(0)
                parsed = json.loads(json_str)
            else:
                parsed = json.loads(content)

            # risk_factors 可能是 list 或 string
            risk_factors_raw = parsed.get("risk_factors", "")
            if isinstance(risk_factors_raw, list):
                risk_factors_str = "；".join(str(r) for r in risk_factors_raw)
            else:
                risk_factors_str = str(risk_factors_raw)

            return MiniMaxAnalysis(
                narrative_summary=parsed.get("narrative_summary", ""),
                key_endorsement_detail=parsed.get("key_endorsement_detail", ""),
                risk_factors=risk_factors_str,
                investment_thesis=parsed.get("investment_thesis", ""),
                hedging_strategy=parsed.get("hedging_strategy", ""),
                comparable_cases=parsed.get("comparable_cases", []),
                confidence_level=parsed.get("confidence_level", "Medium"),
            ), parsed.get("scores", {})

        except (json.JSONDecodeError, Exception) as e:
            logger.warning(f"[MiniMax] JSON parse error: {e}. Content: {content[:200]}")
            return self._fallback_analysis(token_data), {}

    async def analyze_token_with_scores(self, token_data: AveTokenData):
        """
        调用 MiniMax 并同时返回 AI 分析和评分
        Returns: (MiniMaxAnalysis, dict of scores)
        """
        prompt = self._build_analysis_prompt(token_data)

        payload = {
            "model": MINIMAX_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                    "name": "NarrativeOracle"
                },
                {
                    "role": "user",
                    "content": prompt,
                    "name": "Analyst"
                }
            ],
            "max_tokens": 1500,
            "temperature": 0.3,
            "top_p": 0.9,
        }

        try:
            logger.info(f"[MiniMax] Analyzing {token_data.name}...")
            resp = await self.client.post(
                f"{MINIMAX_BASE_URL}/v1/chat/completions",
                json=payload
            )
            resp.raise_for_status()
            data = resp.json()

            base_resp = data.get("base_resp", {})
            if base_resp.get("status_code", 0) != 0:
                logger.error(f"[MiniMax] API error: {base_resp}")
                return self._fallback_analysis(token_data), {}

            choices = data.get("choices", [])
            if not choices:
                return self._fallback_analysis(token_data), {}

            content = choices[0].get("message", {}).get("content", "")
            return self._parse_response(content, token_data)

        except Exception as e:
            logger.error(f"[MiniMax] Error: {e}")
            return self._fallback_analysis(token_data), {}

    # ============================================================
    # 降级分析（API 失败时使用链上数据推断）
    # ============================================================
    def _fallback_analysis(self, token_data: AveTokenData) -> MiniMaxAnalysis:
        """API 调用失败时的降级分析，基于链上数据推断"""
        logger.warning(f"[MiniMax] Using fallback analysis for {token_data.symbol}")
        return MiniMaxAnalysis(
            narrative_summary=f"{token_data.name} ({token_data.symbol}) — 基于链上数据的自动分析。持币者 {token_data.holders:,}，24h 交易量 ${float(token_data.tx_volume_u_24h or 0)/1e6:.2f}M。",
            key_endorsement_detail="链上数据显示该代币具有一定的市场活跃度，建议结合社区动态进行综合判断。",
            risk_factors="1. 市场波动风险较高；2. 流动性深度需关注；3. 持币集中度待评估。",
            investment_thesis="基于链上指标的中性评估，建议小仓位试探性参与。",
            hedging_strategy="建议在建立多头仓位时，配置 10-15% 名义价值的永续合约空头进行 Delta 中性对冲。",
            comparable_cases=["PEPE (ETH)", "Giggle (BSC)"],
            confidence_level="Low",
        )
