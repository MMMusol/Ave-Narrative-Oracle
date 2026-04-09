"""
Ave Narrative Oracle — 内存缓存工具
使用 TTLCache 实现请求级别缓存，减少 API 调用次数
"""
import time
import hashlib
import json
from typing import Any, Optional
from cachetools import TTLCache
import logging

logger = logging.getLogger(__name__)

# 全局缓存实例：最多缓存 200 个分析结果，TTL = 5 分钟
_analysis_cache: TTLCache = TTLCache(maxsize=200, ttl=300)

# AVE 原始数据缓存：TTL = 60 秒（价格数据更新较快）
_ave_cache: TTLCache = TTLCache(maxsize=500, ttl=60)


def _make_key(address: str, chain: Optional[str] = None) -> str:
    """生成缓存键"""
    raw = f"{address.lower()}:{chain or 'auto'}"
    return hashlib.md5(raw.encode()).hexdigest()


def get_analysis_cache(address: str, chain: Optional[str] = None) -> Optional[Any]:
    """获取完整分析缓存"""
    key = _make_key(address, chain)
    result = _analysis_cache.get(key)
    if result:
        logger.info(f"[Cache HIT] analysis for {address[:10]}...")
    return result


def set_analysis_cache(address: str, data: Any, chain: Optional[str] = None) -> None:
    """设置完整分析缓存"""
    key = _make_key(address, chain)
    _analysis_cache[key] = data
    logger.info(f"[Cache SET] analysis for {address[:10]}...")


def get_ave_cache(address: str) -> Optional[Any]:
    """获取 AVE 原始数据缓存"""
    key = f"ave:{address.lower()}"
    return _ave_cache.get(key)


def set_ave_cache(address: str, data: Any) -> None:
    """设置 AVE 原始数据缓存"""
    key = f"ave:{address.lower()}"
    _ave_cache[key] = data


def get_cache_stats() -> dict:
    """获取缓存统计信息"""
    return {
        "analysis_cache_size": len(_analysis_cache),
        "analysis_cache_maxsize": _analysis_cache.maxsize,
        "ave_cache_size": len(_ave_cache),
        "ave_cache_maxsize": _ave_cache.maxsize,
    }
