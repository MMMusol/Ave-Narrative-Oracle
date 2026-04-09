/**
 * Ave Narrative Oracle — API Client
 * Connects frontend to FastAPI backend
 */

// Backend URL — uses Vite proxy in dev, or VITE_BACKEND_URL in production
// In dev: Vite proxies /api/* to http://localhost:8000
// In production: falls back to the public sandbox backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://8000-i1ykqza8e3yzxg949ei6r-fb43c3e2.us1.manus.computer";

export interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark: number;
}

export interface HolderGrowthPoint {
  time: string;
  holders: number;
  change: number;
}

export interface NarrativeMetrics {
  cultural_resonance: number;
  community_growth: number;
  holder_distribution: number;
  liquidity_mc_ratio: number;
  volume_mc_ratio: number;
  kol_endorsement: number;
  tokenomics: number;
  onchain_timing: number;
  smart_money_flow: number;
  viral_potential: number;
}

export interface MathModelOutput {
  base_score: number;
  interaction_celebrity_narrative: number;
  interaction_culture_viral: number;
  sigmoid_boost: number;
  final_narrative_score: number;
  hold_value_score: number;
  breakout_probability: number;
  peak_mc_low: number;
  peak_mc_high: number;
}

export interface MiniMaxAnalysis {
  narrative_summary: string;
  key_endorsement_detail: string;
  risk_factors: string;
  investment_thesis: string;
  hedging_strategy: string;
  comparable_cases: string[];
  confidence_level: string;
}

export interface AnalysisResponse {
  address: string;
  chain: string;
  name: string;
  symbol: string;
  current_price_usd: number;
  market_cap: number;
  fdv: number;
  tvl: number;
  volume_24h: number;
  price_change_24h: number;
  price_change_1h: number;
  holders: number;
  total_supply: number;
  burn_amount: number;
  locked_percent: number;
  price_vs_ath_ratio: number;
  metrics: NarrativeMetrics;
  model_output: MathModelOutput;
  ai_analysis: MiniMaxAnalysis;
  radar_data: RadarDataPoint[];
  holder_growth: HolderGrowthPoint[];
  contract_risk_score: number;
  smart_money_net_flow: number;
  analysis_latency_ms: number;
  cached: boolean;
  timestamp: number;
}

export interface ExampleToken {
  name: string;
  symbol: string;
  chain: string;
  address: string;
  tag: string;
  mc: string;
  change: string;
  description: string;
}

/**
 * Analyze a token by contract address
 */
export async function analyzeToken(
  address: string,
  chain?: string
): Promise<AnalysisResponse> {
  const params = new URLSearchParams();
  if (chain) params.set("chain", chain);

  const url = `${BACKEND_URL}/api/analyze/${encodeURIComponent(address)}${
    params.toString() ? "?" + params.toString() : ""
  }`;

  // 60 second timeout — MiniMax analysis takes 15-20s
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: `HTTP ${response.status} error` }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Analysis timed out after 60s. The AI model is busy, please retry.");
    }
    throw err;
  }
}

/**
 * Get example tokens for homepage
 */
export async function getExampleTokens(): Promise<ExampleToken[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/examples`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Failed to fetch examples");
    const data = await response.json();
    return data.tokens || [];
  } catch {
    // Fallback to static data if backend unavailable
    return [
      {
        name: "Binance Life",
        symbol: "LIFE",
        chain: "BSC",
        address: "0x3b248cefa87f836a4e6f6d6c9b42991b88dc1d58",
        tag: "Institutional Backed",
        mc: "524M",
        change: "+12%",
        description: "He Yi & CZ endorsed BSC token",
      },
      {
        name: "Giggle",
        symbol: "GIGGLE",
        chain: "BSC",
        address: "0x2f4e8d2b1c3a5e7f9b0d4c6e8a2b4d6f8e0a2c4",
        tag: "Philanthropy",
        mc: "25M",
        change: "+45%",
        description: "Charity narrative BSC token",
      },
      {
        name: "PEPE",
        symbol: "PEPE",
        chain: "ETH",
        address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
        tag: "Cultural Icon",
        mc: "3B",
        change: "-2%",
        description: "Cultural meme icon on ETH",
      },
    ];
  }
}

/**
 * Format market cap to human-readable string
 */
export function formatMC(value: number): string {
  if (!value || value === 0) return "N/A";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

/**
 * Format price change with sign and color class
 */
export function formatChange(value: number): { text: string; positive: boolean } {
  const positive = value >= 0;
  return {
    text: `${positive ? "+" : ""}${value.toFixed(2)}%`,
    positive,
  };
}

/**
 * Format large numbers
 */
export function formatNumber(value: number): string {
  if (!value) return "0";
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-4)}`;
}
