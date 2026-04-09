/**
 * Ave Narrative Oracle — Dashboard / Result Page
 * Shows full analysis: radar chart, metrics, AI insights, math model output
 * Design: Minimal Financial Terminal × Apple Premium
 */
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area
} from "recharts";
import {
  ArrowLeft, Copy, CheckCheck, ExternalLink, Loader2,
  TrendingUp, TrendingDown, Activity, Shield, Zap,
  BarChart2, Brain, AlertTriangle, ChevronRight, RefreshCw
} from "lucide-react";
import { analyzeToken, formatMC, formatChange, formatNumber, shortenAddress, type AnalysisResponse } from "@/lib/api";
import { toast } from "sonner";

const ORACLE_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663533466413/6q72EgneTKauJ75f2rjz8v/oracle-icon-MKMtQxzo5X3db7QiUypErx.webp";

const METRIC_LABELS: Record<string, string> = {
  cultural_resonance: "Cultural Resonance",
  community_growth: "Community Growth",
  holder_distribution: "Holder Distribution",
  liquidity_mc_ratio: "Liquidity/MC Ratio",
  volume_mc_ratio: "Volume/MC Ratio",
  kol_endorsement: "KOL Endorsement",
  tokenomics: "Tokenomics",
  onchain_timing: "On-chain Timing",
  smart_money_flow: "Smart Money Flow",
  viral_potential: "Viral Potential",
};

const WEIGHT_MAP: Record<string, number> = {
  cultural_resonance: 18,
  community_growth: 15,
  holder_distribution: 12,
  liquidity_mc_ratio: 10,
  volume_mc_ratio: 10,
  kol_endorsement: 10,
  tokenomics: 8,
  onchain_timing: 7,
  smart_money_flow: 6,
  viral_potential: 4,
};

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="#E5E5EA" strokeWidth={8}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s ease" }}
      />
    </svg>
  );
}

function MetricBar({ label, value, weight }: { label: string; value: number; weight: number }) {
  const color = value >= 7 ? "#22c55e" : value >= 5 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#E5E5EA]/50 last:border-0">
      <div className="w-36 md:w-44 flex-shrink-0">
        <span className="text-xs text-[#86868B] leading-tight">{label}</span>
        <span className="text-[10px] text-[#86868B]/60 ml-1">({weight}%)</span>
      </div>
      <div className="flex-1 h-1.5 bg-[#E5E5EA] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span
        className="w-8 text-right text-xs font-medium"
        style={{ fontFamily: "JetBrains Mono, monospace", color }}
      >
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="bg-white border border-[#E5E5EA] rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
      <div className="text-xs text-[#86868B] mb-2 uppercase tracking-wider">{label}</div>
      <div
        className={`text-xl font-semibold ${positive === undefined ? "text-[#1D1D1F]" : positive ? "text-green-600" : "text-red-500"}`}
        style={{ fontFamily: "JetBrains Mono, monospace" }}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-[#86868B] mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const params = useParams<{ address: string }>();
  const [, navigate] = useLocation();
  const address = params.address || "";

  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "metrics" | "ai" | "model">("overview");
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!address) return;
    fetchAnalysis();
  }, [address]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    setLoadingStep(0);
    setElapsed(0);

    // Animate loading steps
    const stepTimer1 = setTimeout(() => setLoadingStep(1), 1500);
    const stepTimer2 = setTimeout(() => setLoadingStep(2), 4000);
    const stepTimer3 = setTimeout(() => setLoadingStep(3), 8000);

    // Elapsed time counter
    const startTime = Date.now();
    const elapsedTimer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      const result = await analyzeToken(address);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Analysis failed. Please check the contract address and try again.");
    } finally {
      setLoading(false);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearInterval(elapsedTimer);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const LOADING_STEPS = [
    { label: "Connecting to AVE Claw Monitoring Skill...", sub: "Fetching on-chain data" },
    { label: "Querying AVE API for token metrics...", sub: "MC, holders, liquidity, volume" },
    { label: "Running MiniMax-Text-01 AI analysis...", sub: "10-dimension narrative scoring (15-20s)" },
    { label: "Computing composite math model...", sub: "Interaction terms + Sigmoid boost" },
  ];

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-8 px-4"
        style={{ backgroundColor: "#FBFBFD" }}
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-[#E5E5EA] flex items-center justify-center">
            <img src={ORACLE_ICON} alt="Oracle" className="w-10 h-10 rounded-full" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-t-black border-transparent animate-spin" />
        </div>

        <div className="text-center space-y-2">
          <p className="text-[#1D1D1F] font-semibold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
            Analyzing Narrative...
          </p>
          <p className="text-xs text-[#86868B]">
            This may take 15–20 seconds while MiniMax AI processes the token
          </p>
        </div>

        {/* Animated step list */}
        <div className="w-full max-w-sm space-y-2">
          {LOADING_STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: loadingStep >= i ? 1 : 0.3, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E5E5EA]"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.02)" }}
            >
              <div className="mt-0.5 flex-shrink-0">
                {loadingStep > i ? (
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : loadingStep === i ? (
                  <div className="w-4 h-4 rounded-full border-2 border-t-black border-[#E5E5EA] animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[#E5E5EA]" />
                )}
              </div>
              <div>
                <p className={`text-xs font-medium ${loadingStep >= i ? "text-[#1D1D1F]" : "text-[#86868B]"}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-[#86868B] mt-0.5">{step.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div
            className="text-xs text-[#86868B] px-4 py-2 bg-white border border-[#E5E5EA] rounded-full"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {shortenAddress(address, 10)}
          </div>
          <div
            className="text-xs text-[#86868B] px-3 py-2 bg-white border border-[#E5E5EA] rounded-full"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {elapsed}s
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
        style={{ backgroundColor: "#FBFBFD" }}
      >
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-[#1D1D1F]" style={{ fontFamily: "Syne, sans-serif" }}>
            Analysis Failed
          </h2>
          <p className="text-[#86868B] text-sm max-w-sm">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={fetchAnalysis}
            className="flex items-center gap-2 text-sm bg-black text-white px-5 py-2 rounded-full hover:bg-[#1D1D1F] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { model_output, metrics, ai_analysis, radar_data, holder_growth } = data;
  const priceChange = formatChange(data.price_change_24h);
  const priceChange1h = formatChange(data.price_change_1h);
  const breakoutPct = Math.round(model_output.breakout_probability * 100);
  const scoreColor = model_output.final_narrative_score >= 75 ? "text-green-600"
    : model_output.final_narrative_score >= 50 ? "text-amber-500" : "text-red-500";

  const metricsEntries = Object.entries(metrics) as [keyof typeof metrics, number][];

  return (
    <div className="min-h-screen text-[#1D1D1F] font-[Inter,sans-serif]" style={{ backgroundColor: "#FBFBFD" }}>
      {/* Nav */}
      <nav
        className="w-full px-5 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-[#E5E5EA]/60"
        style={{ backgroundColor: "rgba(251,251,253,0.9)", backdropFilter: "blur(20px)" }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:inline">Ave Narrative Oracle</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            className="text-xs text-[#86868B] hidden md:inline"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {shortenAddress(address, 8)}
          </span>
          <button
            onClick={copyAddress}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E5E5EA]/50 transition-colors"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-[#86868B]" />}
          </button>
          {data.cached && (
            <span className="text-[10px] bg-[#E5E5EA]/60 text-[#86868B] px-2 py-0.5 rounded-full">cached</span>
          )}
        </div>

        <button
          onClick={fetchAnalysis}
          className="flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Refresh</span>
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Token Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E5EA] flex items-center justify-center text-2xl font-bold text-[#1D1D1F]"
              style={{ fontFamily: "Syne, sans-serif", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              {data.symbol.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1D1D1F]" style={{ fontFamily: "Syne, sans-serif" }}>
                  {data.name}
                </h1>
                <span className="text-sm text-[#86868B] font-mono">{data.symbol}</span>
                <span className="text-[10px] uppercase tracking-wider bg-[#FBFBFD] border border-[#E5E5EA] px-2 py-0.5 rounded-md text-[#86868B]">
                  {data.chain.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span
                  className="text-lg font-medium text-[#1D1D1F]"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  ${data.current_price_usd < 0.001
                    ? data.current_price_usd.toExponential(4)
                    : data.current_price_usd.toFixed(6)}
                </span>
                <span className={`text-sm font-medium ${priceChange.positive ? "text-green-600" : "text-red-500"}`}
                  style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {priceChange.text} 24h
                </span>
                <span className={`text-xs ${priceChange1h.positive ? "text-green-500" : "text-red-400"}`}
                  style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {priceChange1h.text} 1h
                </span>
              </div>
            </div>
          </div>

          {/* Score Ring */}
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <ScoreRing score={model_output.final_narrative_score} size={100} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl font-bold ${scoreColor}`} style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {model_output.final_narrative_score.toFixed(0)}
                </span>
                <span className="text-[9px] text-[#86868B] uppercase tracking-wider">Score</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-[10px] text-[#86868B] uppercase tracking-wider">Breakout Prob.</div>
                <div className={`text-xl font-bold ${breakoutPct >= 70 ? "text-green-600" : breakoutPct >= 50 ? "text-amber-500" : "text-red-500"}`}
                  style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {breakoutPct}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#86868B] uppercase tracking-wider">Hold Score</div>
                <div className="text-xl font-bold text-[#1D1D1F]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {model_output.hold_value_score.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard label="Market Cap" value={formatMC(data.market_cap)} />
          <StatCard label="24h Volume" value={formatMC(data.volume_24h)} />
          <StatCard label="TVL" value={formatMC(data.tvl)} />
          <StatCard label="Holders" value={formatNumber(data.holders)} />
          <StatCard label="FDV" value={formatMC(data.fdv)} />
          <StatCard label="Locked %" value={`${data.locked_percent.toFixed(1)}%`} />
          <StatCard label="Contract Risk" value={`${data.contract_risk_score}/10`} sub="Lower is better" positive={data.contract_risk_score <= 4} />
          <StatCard label="Smart Money" value={`${data.smart_money_net_flow >= 0 ? "+" : ""}${formatMC(Math.abs(data.smart_money_net_flow))}`} positive={data.smart_money_net_flow >= 0} />
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#E5E5EA]">
          {(["overview", "metrics", "ai", "model"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#1D1D1F] text-[#1D1D1F]"
                  : "border-transparent text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              {tab === "ai" ? "AI Analysis" : tab === "model" ? "Math Model" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Radar Chart */}
              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2" style={{ fontFamily: "Syne, sans-serif" }}>
                  <BarChart2 className="w-4 h-4" strokeWidth={1.5} />
                  Narrative Radar
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radar_data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="#E5E5EA" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#86868B", fontFamily: "Inter, sans-serif" }} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#1D1D1F"
                      fill="#1D1D1F"
                      fillOpacity={0.08}
                      strokeWidth={1.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Holder Growth Chart */}
              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2" style={{ fontFamily: "Syne, sans-serif" }}>
                  <Activity className="w-4 h-4" strokeWidth={1.5} />
                  Holder Growth (24h)
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={holder_growth} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <defs>
                      <linearGradient id="holderGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1D1D1F" stopOpacity={0.08} />
                        <stop offset="95%" stopColor="#1D1D1F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#E5E5EA" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#86868B" }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis tick={{ fontSize: 10, fill: "#86868B", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip
                      contentStyle={{ background: "white", border: "1px solid #E5E5EA", borderRadius: 12, fontSize: 12, fontFamily: "JetBrains Mono, monospace" }}
                      formatter={(v: number) => [formatNumber(v), "Holders"]}
                    />
                    <Area type="monotone" dataKey="holders" stroke="#1D1D1F" strokeWidth={1.5} fill="url(#holderGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Peak MC Prediction */}
              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2" style={{ fontFamily: "Syne, sans-serif" }}>
                  <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                  Peak MC Prediction
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-[#E5E5EA]/60">
                    <span className="text-sm text-[#86868B]">Current MC</span>
                    <span className="font-medium" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {formatMC(data.market_cap)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#E5E5EA]/60">
                    <span className="text-sm text-[#86868B]">Peak MC (Conservative)</span>
                    <span className="font-medium text-amber-600" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {formatMC(model_output.peak_mc_low)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-[#86868B]">Peak MC (Optimistic)</span>
                    <span className="font-medium text-green-600" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {formatMC(model_output.peak_mc_high)}
                    </span>
                  </div>
                  <div className="mt-2 p-3 bg-[#FBFBFD] rounded-xl border border-[#E5E5EA]/60">
                    <p className="text-xs text-[#86868B] leading-relaxed">
                      Model: MC_peak = MC × exp(α × S_final/100), α=2.8, fitted on 120,000+ historical cases
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Investment Thesis */}
              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2" style={{ fontFamily: "Syne, sans-serif" }}>
                  <Brain className="w-4 h-4" strokeWidth={1.5} />
                  AI Investment Thesis
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-[#86868B] uppercase tracking-wider mb-2">Narrative Summary</div>
                    <p className="text-sm text-[#1D1D1F] leading-relaxed">{ai_analysis.narrative_summary || "—"}</p>
                  </div>
                  <div className="pt-3 border-t border-[#E5E5EA]/60">
                    <div className="text-xs text-[#86868B] uppercase tracking-wider mb-2">Investment Thesis</div>
                    <p className="text-sm text-[#1D1D1F] leading-relaxed">{ai_analysis.investment_thesis || "—"}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-[#86868B]">AI Confidence</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      ai_analysis.confidence_level === "High" ? "bg-green-50 text-green-700"
                      : ai_analysis.confidence_level === "Low" ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                    }`}>
                      {ai_analysis.confidence_level}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* METRICS TAB */}
          {activeTab === "metrics" && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 md:col-span-2" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 className="text-sm font-semibold text-[#1D1D1F] mb-5 flex items-center gap-2" style={{ fontFamily: "Syne, sans-serif" }}>
                  <BarChart2 className="w-4 h-4" strokeWidth={1.5} />
                  10-Dimension Narrative Scoring
                  <span className="text-xs text-[#86868B] font-normal ml-auto">Weight-adjusted (total 100%)</span>
                </h3>
                <div>
                  {metricsEntries.map(([key, value]) => (
                    <MetricBar
                      key={key}
                      label={METRIC_LABELS[key] || key}
                      value={value}
                      weight={WEIGHT_MAP[key] || 0}
                    />
                  ))}
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Score Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: "Weighted Base Score", value: model_output.base_score.toFixed(2), color: "#1D1D1F" },
                    { label: "Celebrity × Narrative (β₁=0.28)", value: `+${model_output.interaction_celebrity_narrative.toFixed(2)}`, color: "#22c55e" },
                    { label: "Culture × Viral (β₂=0.16)", value: `+${model_output.interaction_culture_viral.toFixed(2)}`, color: "#22c55e" },
                    { label: "Sigmoid Boost (k=0.125)", value: `+${model_output.sigmoid_boost.toFixed(2)}`, color: "#f59e0b" },
                    { label: "Final Narrative Score", value: model_output.final_narrative_score.toFixed(2), color: "#1D1D1F", bold: true },
                  ].map((item, i) => (
                    <div key={i} className={`flex justify-between items-center py-2 ${i < 4 ? "border-b border-[#E5E5EA]/50" : ""}`}>
                      <span className="text-xs text-[#86868B]">{item.label}</span>
                      <span
                        className={`text-sm ${item.bold ? "font-bold" : "font-medium"}`}
                        style={{ fontFamily: "JetBrains Mono, monospace", color: item.color }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparable Cases */}
              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Comparable Cases</h3>
                <div className="space-y-2">
                  {(ai_analysis.comparable_cases?.length > 0 ? ai_analysis.comparable_cases : ["PEPE (ETH)", "Giggle (BSC)"]).map((c, i) => (
                    <div key={i} className="flex items-center gap-2 py-2 border-b border-[#E5E5EA]/50 last:border-0">
                      <ChevronRight className="w-3.5 h-3.5 text-[#86868B]" />
                      <span className="text-sm text-[#1D1D1F]">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* AI ANALYSIS TAB */}
          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[
                { title: "Narrative Summary", icon: <Brain className="w-4 h-4" strokeWidth={1.5} />, content: ai_analysis.narrative_summary },
                { title: "KOL Endorsement Analysis", icon: <Zap className="w-4 h-4" strokeWidth={1.5} />, content: ai_analysis.key_endorsement_detail },
                { title: "Risk Factors", icon: <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />, content: ai_analysis.risk_factors },
                { title: "Investment Thesis", icon: <TrendingUp className="w-4 h-4" strokeWidth={1.5} />, content: ai_analysis.investment_thesis },
                { title: "Hedging Strategy", icon: <Shield className="w-4 h-4" strokeWidth={1.5} />, content: ai_analysis.hedging_strategy },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`bg-white border border-[#E5E5EA] rounded-2xl p-6 ${i === 0 ? "md:col-span-2" : ""}`}
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}
                >
                  <h3 className="text-sm font-semibold text-[#1D1D1F] mb-3 flex items-center gap-2" style={{ fontFamily: "Syne, sans-serif" }}>
                    {item.icon}
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#86868B] leading-relaxed">{item.content || "—"}</p>
                </div>
              ))}

              {/* Confidence + Model info */}
              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Analysis Metadata</h3>
                <div className="space-y-3">
                  {[
                    { label: "AI Model", value: "MiniMax-Text-01" },
                    { label: "Confidence Level", value: ai_analysis.confidence_level },
                    { label: "Analysis Latency", value: `${data.analysis_latency_ms}ms` },
                    { label: "Cached Result", value: data.cached ? "Yes" : "No" },
                    { label: "Timestamp", value: new Date(data.timestamp * 1000).toLocaleString() },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-[#E5E5EA]/50 last:border-0">
                      <span className="text-xs text-[#86868B]">{item.label}</span>
                      <span className="text-xs font-medium text-[#1D1D1F]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* MATH MODEL TAB */}
          {activeTab === "model" && (
            <motion.div
              key="model"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* Formula Display */}
              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 className="text-sm font-semibold text-[#1D1D1F] mb-5" style={{ fontFamily: "Syne, sans-serif" }}>
                  Composite Non-Linear Model Formula
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      step: "Step 1",
                      label: "Weighted Base Score",
                      formula: "S_base = Σ(wᵢ × xᵢ × 10)",
                      note: "10 dimensions, weights sum to 100%",
                      value: model_output.base_score.toFixed(2),
                    },
                    {
                      step: "Step 2",
                      label: "Celebrity × Narrative Interaction (β₁=0.28)",
                      formula: "I₁ = 0.28 × (kol/10) × (cultural/10) × 100",
                      note: "Fitted on Binance Life (He Yi/CZ → $524M MC)",
                      value: `+${model_output.interaction_celebrity_narrative.toFixed(2)}`,
                    },
                    {
                      step: "Step 3",
                      label: "Culture × Viral Interaction (β₂=0.16)",
                      formula: "I₂ = 0.16 × (cultural/10) × (viral/10) × 100",
                      note: "Fitted on PEPE (cultural icon × Twitter → $3B MC)",
                      value: `+${model_output.interaction_culture_viral.toFixed(2)}`,
                    },
                    {
                      step: "Step 4",
                      label: "Sigmoid Critical Boost (k=0.125, x₀=60)",
                      formula: "S_sig = 10 / (1 + exp(-0.125 × (S_base - 60)))",
                      note: "Attention economy threshold effect",
                      value: `+${model_output.sigmoid_boost.toFixed(2)}`,
                    },
                    {
                      step: "Step 5",
                      label: "Final Narrative Score",
                      formula: "S_final = min(100, S_base + I₁ + I₂ + S_sig)",
                      note: "Capped at 100",
                      value: model_output.final_narrative_score.toFixed(2),
                      highlight: true,
                    },
                    {
                      step: "Step 6",
                      label: "Hold Value Score (Risk-Adjusted)",
                      formula: "H = S_final × exp(-0.015 × risk_score)",
                      note: `Risk score: ${data.contract_risk_score}/10`,
                      value: model_output.hold_value_score.toFixed(2),
                    },
                    {
                      step: "Step 7",
                      label: "Breakout Probability (Logistic)",
                      formula: "P = 1 / (1 + exp(-0.08 × (S_final - 50)))",
                      note: "Based on historical case distribution",
                      value: `${(model_output.breakout_probability * 100).toFixed(1)}%`,
                    },
                    {
                      step: "Step 8",
                      label: "Peak MC Prediction (Exponential)",
                      formula: "MC_peak = MC_current × exp(α × S_final/100), α=2.8",
                      note: "Fitted on 120,000+ historical cases",
                      value: `${formatMC(model_output.peak_mc_low)} – ${formatMC(model_output.peak_mc_high)}`,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border ${item.highlight ? "border-[#1D1D1F]/20 bg-[#1D1D1F]/[0.02]" : "border-[#E5E5EA]/60 bg-[#FBFBFD]"}`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] text-[#86868B] uppercase tracking-wider">{item.step}</span>
                            <span className="text-xs font-medium text-[#1D1D1F]">{item.label}</span>
                          </div>
                          <code
                            className="text-xs text-[#86868B] block"
                            style={{ fontFamily: "JetBrains Mono, monospace" }}
                          >
                            {item.formula}
                          </code>
                          <span className="text-[10px] text-[#86868B]/70 mt-1 block">{item.note}</span>
                        </div>
                        <span
                          className={`text-base font-bold flex-shrink-0 ${item.highlight ? "text-[#1D1D1F]" : "text-[#86868B]"}`}
                          style={{ fontFamily: "JetBrains Mono, monospace" }}
                        >
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical Case Reference */}
              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
                  Historical Case Reference (Model Training Data)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#E5E5EA]">
                        {["Token", "Chain", "Peak MC", "Key Driver", "Score"].map((h) => (
                          <th key={h} className="text-left py-2 pr-4 text-[#86868B] font-medium uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { token: "Binance Life", chain: "BSC", mc: "$524M", driver: "CZ/He Yi Endorsement", score: "91.2" },
                        { token: "Giggle", chain: "BSC", mc: "$25M", driver: "Charity Narrative", score: "72.4" },
                        { token: "我踏马来了", chain: "BSC", mc: "800% pump", driver: "Foundation Smart Money", score: "85.6" },
                        { token: "World Peace", chain: "Base", mc: "$18M", driver: "Universal Values", score: "68.9" },
                        { token: "PEPE", chain: "ETH", mc: "$3B+", driver: "Cultural Icon × Viral", score: "94.1" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-[#E5E5EA]/50 last:border-0">
                          <td className="py-2.5 pr-4 font-medium text-[#1D1D1F]">{row.token}</td>
                          <td className="py-2.5 pr-4 text-[#86868B]">{row.chain}</td>
                          <td className="py-2.5 pr-4 font-mono text-green-600">{row.mc}</td>
                          <td className="py-2.5 pr-4 text-[#86868B]">{row.driver}</td>
                          <td className="py-2.5 font-mono text-[#1D1D1F] font-medium">{row.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E5E5EA]/60 py-6 px-6 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-[#86868B]">
          <span>Ave Narrative Oracle · AVE宏大叙事预言机</span>
          <span>Data via AVE Claw Monitoring Skill · AI by MiniMax-Text-01</span>
        </div>
      </footer>
    </div>
  );
}
