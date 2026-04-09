/**
 * Ave Narrative Oracle — Landing Page
 * Design: Minimal Financial Terminal × Apple Premium
 * Typography: Syne (display) + JetBrains Mono (data) + Inter (body)
 * Colors: #FBFBFD bg, #1D1D1F text, #86868B muted, #000 CTA
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Search, Loader2, BarChart2, Activity, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import { getExampleTokens, type ExampleToken } from "@/lib/api";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663533466413/6q72EgneTKauJ75f2rjz8v/hero-bg-PdC6msResuBPHCz8r8tEGo.webp";
const ORACLE_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663533466413/6q72EgneTKauJ75f2rjz8v/oracle-icon-MKMtQxzo5X3db7QiUypErx.webp";

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5" strokeWidth={1.5} />,
    title: "AVE Claw Monitoring",
    desc: "Real-time on-chain metrics via AVE Monitoring Skill — MC, holders, liquidity, smart money flows.",
  },
  {
    icon: <Activity className="w-5 h-5" strokeWidth={1.5} />,
    title: "MiniMax AI Scoring",
    desc: "MiniMax-Text-01 powered narrative intelligence with 10-dimension scoring and BSC case references.",
  },
  {
    icon: <Shield className="w-5 h-5" strokeWidth={1.5} />,
    title: "Non-Linear Math Model",
    desc: "Composite formula with interaction terms, Sigmoid boost, and exponential MC prediction.",
  },
  {
    icon: <TrendingUp className="w-5 h-5" strokeWidth={1.5} />,
    title: "Institutional Precision",
    desc: "Delta-neutral hedging strategies and peak MC estimates for portfolio management.",
  },
];

export default function Home() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [examples, setExamples] = useState<ExampleToken[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    getExampleTokens().then(setExamples);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) return;
    setLoading(true);
    setTimeout(() => {
      navigate(`/result/${trimmed}`);
    }, 300);
  };

  const handleExampleClick = (token: ExampleToken) => {
    navigate(`/result/${token.address}`);
  };

  return (
    <div
      className="min-h-screen text-[#1D1D1F] font-[Inter,sans-serif] selection:bg-black selection:text-white flex flex-col"
      style={{ backgroundColor: "#FBFBFD" }}
    >
      {/* Top Progress Bar */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-black/10">
          <div className="h-full bg-black progress-bar-animate" />
        </div>
      )}

      {/* Navigation */}
      <nav
        className="w-full px-6 md:px-10 py-5 flex justify-between items-center sticky top-0 z-50 border-b border-[#E5E5EA]/60"
        style={{ backgroundColor: "rgba(251,251,253,0.85)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3">
          <img src={ORACLE_ICON} alt="Oracle" className="w-7 h-7 rounded-full" />
          <div>
            <span className="font-[Syne,sans-serif] font-semibold text-base tracking-tight text-[#1D1D1F]">
              Ave Narrative Oracle
            </span>
            <span className="hidden md:inline text-[10px] text-[#86868B] ml-2 tracking-widest uppercase">
              AVE宏大叙事预言机
            </span>
          </div>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-[#86868B]">
          <button
            className="hover:text-[#1D1D1F] transition-colors"
            onClick={() => {
              const el = document.getElementById("features");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Methodology
          </button>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1D1D1F] transition-colors"
          >
            API Docs
          </a>
          <a
            href="https://ave.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1D1D1F] font-semibold hover:opacity-70 transition-opacity"
          >
            AVE.ai
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-8 pt-16 pb-24 relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl text-center space-y-6 relative z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 border border-[#E5E5EA] rounded-full px-4 py-1.5 text-xs font-medium text-[#86868B] shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot inline-block" />
            Powered by AVE Monitoring Skill &amp; MiniMax AI
          </motion.div>

          {/* Headline */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl tracking-tight text-[#1D1D1F] leading-[1.05]"
            style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}
          >
            Institutional-grade
            <br />
            <span style={{ fontWeight: 400 }}>narrative intelligence.</span>
          </h1>

          <p className="text-[#86868B] text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Analyze on-chain metrics and grand narrative potential with enterprise precision.
            10-dimension scoring model trained on 120,000+ historical cases.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="w-full pt-4">
            <div
              className="relative flex items-center bg-white border border-[#E5E5EA] rounded-full p-2 max-w-2xl mx-auto transition-all duration-200"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
              onFocus={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = "0 8px 40px rgba(0,0,0,0.12)";
                el.style.borderColor = "#1D1D1F";
              }}
              onBlur={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)";
                el.style.borderColor = "#E5E5EA";
              }}
            >
              <Search className="text-[#86868B] ml-4 w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter token address (BSC, ETH, SOL...)"
                className="flex-1 bg-transparent border-none outline-none text-base px-4 py-3 text-[#1D1D1F] placeholder:text-[#86868B] placeholder:font-light"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.875rem" }}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !address.trim()}
                className="bg-black text-white font-medium px-7 py-3 rounded-full hover:bg-[#1D1D1F] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <>Analyze <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          </form>

          {/* Quick examples */}
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            <span className="text-xs text-[#86868B]">Try:</span>
            {[
              { label: "PEPE (ETH)", addr: "0x6982508145454Ce325dDbE47a25d4ec3d2311933" },
              { label: "BNB (BSC)", addr: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" },
            ].map((ex) => (
              <button
                key={ex.addr}
                onClick={() => {
                  setAddress(ex.addr);
                  navigate(`/result/${ex.addr}`);
                }}
                className="text-xs text-[#86868B] hover:text-[#1D1D1F] underline underline-offset-2 transition-colors"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sample Analysis Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl mt-20 relative z-10"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-[#86868B] uppercase tracking-widest mb-5 px-1">
            <BarChart2 className="w-4 h-4" strokeWidth={1.5} />
            Sample Analysis
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(examples.length > 0 ? examples : [
              { name: "Binance Life", chain: "BSC", tag: "Institutional Backed", mc: "524M", change: "+12%", address: "0x9d2f680639e1d425488c2f77b3d6d550cc8a4444", symbol: "LIFE", description: "" },
              { name: "Giggle", chain: "BSC", tag: "Philanthropy", mc: "25M", change: "+45%", address: "0x20d6015660b3fe52e6690a889b5c51f69902ce0e", symbol: "GIGGLE", description: "" },
              { name: "PEPE", chain: "ETH", tag: "Cultural Icon", mc: "3B", change: "-2%", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", symbol: "PEPE", description: "" },
            ]).map((token, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                onClick={() => handleExampleClick(token)}
                className="bg-white border border-[#E5E5EA] rounded-2xl p-6 cursor-pointer flex flex-col justify-between h-44 group"
                style={{
                  boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                }}
                whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      className="font-semibold text-[#1D1D1F] text-lg"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {token.name}
                    </h3>
                    <span className="text-xs text-[#86868B] mt-1 block">{token.tag}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider bg-[#FBFBFD] border border-[#E5E5EA] px-2.5 py-1 rounded-md text-[#86868B]">
                    {token.chain}
                  </span>
                </div>
                <div className="flex justify-between items-end mt-4 pt-4 border-t border-[#E5E5EA]/60">
                  <div className="flex flex-col">
                    <span className="text-xs text-[#86868B]">Market Cap</span>
                    <span
                      className="font-medium text-[#1D1D1F] text-base"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      ${token.mc}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm font-medium ${
                        token.change.startsWith("+") ? "text-green-600" : "text-red-500"
                      }`}
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {token.change}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#1D1D1F] transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-8 border-t border-[#E5E5EA]/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl text-[#1D1D1F] mb-4"
              style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}
            >
              How it works
            </h2>
            <p className="text-[#86868B] max-w-xl mx-auto font-light">
              A four-stage pipeline combining on-chain data, AI analysis, and quantitative modeling.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white border border-[#E5E5EA] rounded-2xl p-7"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#FBFBFD] border border-[#E5E5EA] flex items-center justify-center text-[#1D1D1F] mb-4">
                  {f.icon}
                </div>
                <h3
                  className="font-semibold text-[#1D1D1F] mb-2"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-[#86868B] leading-relaxed font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E5EA]/60 py-8 px-6 md:px-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#86868B]">
          <div className="flex items-center gap-2">
            <img src={ORACLE_ICON} alt="Oracle" className="w-5 h-5 rounded-full opacity-60" />
            <span>Ave Narrative Oracle · AVE宏大叙事预言机</span>
          </div>
          <div className="flex gap-6">
            <span>Powered by AVE Claw Monitoring Skill</span>
            <span>·</span>
            <span>MiniMax-Text-01</span>
            <span>·</span>
            <span>AVE Claw 2026 Hackathon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
