"""
Ave Narrative Oracle — AVE.ai Claw Token Query Service
使用 AVE Monitoring Skill 查询链上资产数据

API 端点: https://prod.ave-api.com
认证头: X-API-KEY: {AVE_API_KEY}

支持的数据：MC、holders、liquidity、smart money、price、volume 等
"""
import httpx
import logging
import time
from typing import Optional, Dict, Any, List
from models import AveTokenData
from utils.cache import get_ave_cache, set_ave_cache

logger = logging.getLogger(__name__)

AVE_BASE_URL = "https://prod.ave-api.com"


class AveService:
    """AVE.ai Claw Token Query Service"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "X-API-KEY": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        # httpx 异步客户端，超时 10 秒
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(10.0, connect=5.0),
            headers=self.headers,
        )

    async def close(self):
        await self.client.aclose()

    # ============================================================
    # 核心方法：通过 keyword 搜索 Token（AVE Monitoring Skill）
    # GET /v2/tokens?keyword={address}
    # ============================================================
    async def search_token(self, address: str) -> Optional[Dict[str, Any]]:
        """
        通过合约地址搜索 Token 数据
        这是黑客松要求的核心 AVE Skill 调用点
        """
        # 检查缓存
        cached = get_ave_cache(address)
        if cached:
            logger.info(f"[AVE Cache HIT] {address[:10]}...")
            return cached

        url = f"{AVE_BASE_URL}/v2/tokens"
        params = {"keyword": address, "limit": 5}

        try:
            logger.info(f"[AVE API] Searching token: {address[:20]}...")
            resp = await self.client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

            if data.get("status") == 1 and data.get("data"):
                token_list = data["data"]
                # 找到最匹配的 token（地址完全匹配优先）
                best_match = None
                for t in token_list:
                    if t.get("token", "").lower() == address.lower():
                        best_match = t
                        break
                if not best_match and token_list:
                    best_match = token_list[0]

                if best_match:
                    set_ave_cache(address, best_match)
                    logger.info(f"[AVE API] Found: {best_match.get('name')} ({best_match.get('chain')})")
                    return best_match

            logger.warning(f"[AVE API] No data found for {address}")
            return None

        except httpx.HTTPStatusError as e:
            logger.error(f"[AVE API] HTTP error {e.response.status_code}: {e.response.text[:200]}")
            raise
        except httpx.RequestError as e:
            logger.error(f"[AVE API] Request error: {e}")
            raise

    # ============================================================
    # 获取 Token 详情（含 pairs 信息）
    # GET /v2/tokens/{token-id}
    # ============================================================
    async def get_token_detail(self, address: str, chain: str) -> Optional[Dict[str, Any]]:
        """
        获取 Token 详情和 Top 5 交易对
        token-id 格式: {address}-{chain}
        """
        token_id = f"{address}-{chain}"
        cache_key = f"detail:{token_id}"
        cached = get_ave_cache(cache_key)
        if cached:
            return cached

        url = f"{AVE_BASE_URL}/v2/tokens/{token_id}"
        try:
            logger.info(f"[AVE API] Getting detail for {token_id}")
            resp = await self.client.get(url)
            resp.raise_for_status()
            data = resp.json()

            if data.get("status") == 1 and data.get("data"):
                result = data["data"]
                set_ave_cache(cache_key, result)
                return result

            return None
        except Exception as e:
            logger.error(f"[AVE API] Detail error: {e}")
            return None

    # ============================================================
    # 获取 Top 100 持币者
    # GET /v2/tokens/top100/{token-id}
    # ============================================================
    async def get_top_holders(self, address: str, chain: str, limit: int = 20) -> List[Dict]:
        """获取 Top 持币者数据，用于计算持币集中度"""
        token_id = f"{address}-{chain}"
        url = f"{AVE_BASE_URL}/v2/tokens/top100/{token_id}"
        params = {"limit": limit}

        try:
            resp = await self.client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            if data.get("status") == 1 and data.get("data"):
                return data["data"]
            return []
        except Exception as e:
            logger.warning(f"[AVE API] Top holders error: {e}")
            return []

    # ============================================================
    # 解析原始数据为标准化 AveTokenData
    # ============================================================
    def parse_token_data(self, raw: Dict[str, Any]) -> AveTokenData:
        """将 AVE API 原始响应解析为标准化数据模型"""
        return AveTokenData(
            token=raw.get("token", ""),
            chain=raw.get("chain", ""),
            name=raw.get("name", "Unknown"),
            symbol=raw.get("symbol", "???"),
            current_price_usd=str(raw.get("current_price_usd", "0")),
            market_cap=str(raw.get("market_cap", "0")),
            fdv=str(raw.get("fdv", "0")),
            tvl=str(raw.get("tvl", "0")),
            main_pair_tvl=str(raw.get("main_pair_tvl", "0")),
            tx_volume_u_24h=str(raw.get("tx_volume_u_24h", "0")),
            holders=int(raw.get("holders", 0)),
            price_change_1d=str(raw.get("price_change_1d", "0")),
            price_change_24h=str(raw.get("price_change_24h", "0")),
            price_change_1h=str(raw.get("price_change_1h", "0")),
            intro_en=raw.get("intro_en", ""),
            intro_cn=raw.get("intro_cn", ""),
            total=str(raw.get("total", "0")),
            burn_amount=str(raw.get("burn_amount", "0")),
            lock_amount=str(raw.get("lock_amount", "0")),
            locked_percent=str(raw.get("locked_percent", "0")),
            launch_price=str(raw.get("launch_price", "0")),
            token_price_change_5m=str(raw.get("token_price_change_5m", "0")),
            token_price_change_1h=str(raw.get("token_price_change_1h", "0")),
            token_price_change_4h=str(raw.get("token_price_change_4h", "0")),
            token_price_change_24h=str(raw.get("token_price_change_24h", "0")),
            token_tx_volume_usd_5m=str(raw.get("token_tx_volume_usd_5m", "0")),
            token_tx_volume_usd_1h=str(raw.get("token_tx_volume_usd_1h", "0")),
        )

    # ============================================================
    # 计算聪明钱净流入（基于价格变化和交易量推断）
    # ============================================================
    def estimate_smart_money_flow(self, token_data: AveTokenData) -> float:
        """
        聪明钱净流入估算
        基于：短期价格变化 × 交易量 × 方向系数
        """
        try:
            vol = float(token_data.tx_volume_u_24h)
            change_1h = float(token_data.token_price_change_1h or "0")
            change_4h = float(token_data.token_price_change_4h or "0")

            # 短期强势上涨 + 大交易量 = 聪明钱流入信号
            direction = 1 if (change_1h > 0 and change_4h > 0) else -1
            magnitude = abs(change_1h + change_4h) / 20.0  # 归一化
            smart_flow = direction * magnitude * vol * 0.15  # 估算15%为聪明钱

            return round(smart_flow, 2)
        except Exception:
            return 0.0
