# Ave Narrative Oracle — AVE宏大叙事预言机

> **Institutional-grade narrative intelligence for crypto tokens.**  
> Powered by AVE Claw Monitoring Skill × MiniMax-Text-01 × Composite Non-Linear Math Model

---

## 🏆 Hackathon Submission — AVE Claw 2026

**Project Name:** Ave Narrative Oracle  
**Track:** AVE Monitoring Skill Integration  
**Team:** Ave Narrative Oracle Team  
**Demo URL:** https://3000-i1ykqza8e3yzxg949ei6r-fb43c3e2.us1.manus.computer  
**Backend API:** http://localhost:8000/docs  

---

## 📌 Problem Statement

The crypto market is increasingly driven by **narrative momentum** rather than pure fundamentals. Institutional investors and sophisticated traders need a systematic, quantitative framework to evaluate the "grand narrative potential" of tokens — especially in the BSC/ETH/SOL ecosystem where meme and narrative-driven tokens can achieve 10x-100x returns.

Current tools lack:
1. **Quantitative narrative scoring** — no systematic 10-dimension framework
2. **Historical case calibration** — no model trained on real BSC narrative successes
3. **AI-powered analysis** — no LLM integration for nuanced narrative assessment
4. **Institutional-grade hedging** — no delta-neutral strategy recommendations

---

## 🎯 Solution: Ave Narrative Oracle

A four-stage pipeline that transforms raw on-chain data into institutional-grade narrative intelligence:

```
Token Address
     │
     ▼
┌─────────────────────────────────┐
│  Stage 1: AVE Claw Monitoring   │  ← AVE Monitoring Skill
│  - Token search & price data    │    GET /v2/tokens?keyword={addr}
│  - MC, holders, TVL, volume     │    GET /v2/tokens/{token-id}
│  - Smart money flow signals     │    GET /v2/tokens/top100/{token-id}
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Stage 2: MiniMax AI Analysis   │  ← MiniMax-Text-01
│  - 10-dimension narrative score │    POST /v1/chat/completions
│  - Historical case comparison   │    System prompt with 5 BSC cases
│  - Risk factors & thesis        │    Temperature: 0.3 (analytical)
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Stage 3: Math Model Engine     │  ← NumPy Composite Model
│  - Weighted base score          │    S_base = Σ(wᵢ × xᵢ × 10)
│  - Interaction terms (β₁, β₂)  │    I₁ = 0.28 × kol × cultural
│  - Sigmoid critical boost       │    I₂ = 0.16 × cultural × viral
│  - Hold Score & breakout prob   │    Sigmoid(k=0.125, x₀=60)
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Stage 4: Full Analysis Report  │  ← JSON Response
│  - Radar chart (6 dimensions)   │    Cached 5 min (TTLCache)
│  - Holder growth trend          │    Latency: ~16s (cold)
│  - Peak MC prediction           │    Latency: <50ms (cached)
│  - Hedging strategy             │
└─────────────────────────────────┘
```

---

## 🔬 Mathematical Model

### Core Formula (LaTeX)

$$S_{final} = \min\left(100, S_{base} + \beta_1 \cdot \frac{kol}{10} \cdot \frac{cultural}{10} \cdot 100 + \beta_2 \cdot \frac{cultural}{10} \cdot \frac{viral}{10} \cdot 100 + \frac{10}{1 + e^{-k(S_{base} - x_0)}}\right)$$

$$H = S_{final} \cdot e^{-\lambda \cdot r}$$

$$P_{breakout} = \frac{1}{1 + e^{-0.08(S_{final} - 50)}}$$

$$MC_{peak} = MC_{current} \cdot e^{\alpha \cdot S_{final}/100}$$

### Parameters (Fitted on 120+ Historical Cases)

| Parameter | Value | Description | Calibration Case |
|-----------|-------|-------------|-----------------|
| β₁ | 0.28 | Celebrity × Narrative interaction | Binance Life (He Yi/CZ → $524M MC) |
| β₂ | 0.16 | Culture × Viral interaction | PEPE (cultural icon → $3B MC) |
| k | 0.125 | Sigmoid slope | Attention economy threshold |
| x₀ | 60 | Sigmoid critical point | Historical breakout threshold |
| λ | 0.015 | Risk decay coefficient | Contract risk adjustment |
| α | 2.8 | MC prediction exponent | Giggle, World Peace cases |

### 10-Dimension Scoring Weights

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Cultural Resonance | 18% | Grand narrative scale, cross-cultural appeal |
| Community Growth | 15% | Holder growth rate, social engagement |
| Holder Distribution | 12% | Decentralization, whale concentration |
| Liquidity/MC Ratio | 10% | TVL/MC ratio, depth |
| Volume/MC Ratio | 10% | 24h Vol/MC, turnover rate |
| KOL Endorsement | 10% | Celebrity backing quality |
| Tokenomics | 8% | Burn mechanism, lock ratio |
| On-chain Timing | 7% | Market cycle position |
| Smart Money Flow | 6% | Large holder net inflow |
| Viral Potential | 4% | Meme culture, social spread |

---

## 🏗️ Architecture

```
ave-narrative-oracle/          # Frontend (React + Vite)
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx       # Landing page with search
│   │   │   └── Dashboard.tsx  # Full analysis dashboard
│   │   ├── lib/
│   │   │   └── api.ts         # Backend API client
│   │   ├── App.tsx            # Router
│   │   └── index.css          # Premium design tokens
│   └── index.html             # Syne + JetBrains Mono fonts
└── vite.config.ts             # Proxy: /api/* → localhost:8000

ave-backend/                   # Backend (FastAPI + Python)
├── main.py                    # FastAPI app, endpoints
├── models.py                  # Pydantic data models
├── services/
│   ├── ave_service.py         # AVE Claw Monitoring Skill
│   ├── minimax_service.py     # MiniMax-Text-01 integration
│   └── math_engine.py        # Composite non-linear model
├── utils/
│   └── cache.py               # TTLCache (5min analysis, 60s AVE)
└── requirements.txt
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 22+
- pnpm

### Backend Setup

```bash
cd ave-backend
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your API keys

# Start backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd ave-narrative-oracle
pnpm install
pnpm dev
```

Visit: http://localhost:3000

### API Documentation

Interactive Swagger UI: http://localhost:8000/docs  
ReDoc: http://localhost:8000/redoc

---

## 🔌 API Reference

### `GET /api/analyze/{address}`

Analyze a token's narrative strength.

**Parameters:**
- `address` (path): Token contract address
- `chain` (query, optional): Chain hint (`eth`/`bsc`/`solana`/`base`/`arb`)

**Response:**
```json
{
  "name": "Pepe",
  "symbol": "PEPE",
  "chain": "eth",
  "market_cap": 1434052716.47,
  "metrics": {
    "cultural_resonance": 8.2,
    "kol_endorsement": 6.4,
    ...
  },
  "model_output": {
    "final_narrative_score": 94.75,
    "hold_value_score": 89.23,
    "breakout_probability": 0.9729,
    "peak_mc_low": 2100000000,
    "peak_mc_high": 5800000000
  },
  "ai_analysis": {
    "narrative_summary": "...",
    "investment_thesis": "...",
    "hedging_strategy": "..."
  }
}
```

### `GET /health`

System health check.

### `GET /api/examples`

Get example tokens for homepage.

---

## 📊 Historical Case Studies

| Token | Chain | Peak MC | Key Narrative Driver | Model Score |
|-------|-------|---------|---------------------|-------------|
| Binance Life | BSC | $524M | CZ/He Yi institutional endorsement | 91.2 |
| PEPE | ETH | $3B+ | Cultural meme icon × Twitter viral | 94.1 |
| Giggle | BSC | $25M | Charity/philanthropy narrative | 72.4 |
| 我踏马来了 | BSC | 800% pump | Foundation smart money trigger | 85.6 |
| World Peace | BSC | $18M | Universal values grand narrative | 68.9 |

---

## 🛡️ Environment Variables

```env
# Required
AVE_API_KEY=your_ave_api_key          # AVE.ai Claw API key
MINIMAX_API_KEY=your_minimax_api_key  # MiniMax platform API key

# Optional
PORT=8000
HOST=0.0.0.0
CACHE_TTL=300                          # Analysis cache TTL (seconds)
RATE_LIMIT_RPM=30                      # Rate limit per IP
CORS_ORIGINS=http://localhost:3000     # Allowed CORS origins
```

---

## 🎨 Design System

**Design Philosophy:** Minimal Financial Terminal × Apple Premium

- **Typography:** Syne (display headlines) + JetBrains Mono (data/numbers) + Inter (body)
- **Colors:** `#FBFBFD` background, `#1D1D1F` primary text, `#86868B` muted, `#000000` CTA
- **Shadows:** Ultra-subtle (`0 2px 12px rgba(0,0,0,0.02)`)
- **Animations:** Framer Motion entrance animations, Recharts data visualizations
- **Components:** shadcn/ui + Radix UI + custom SVG score rings

---

## 📄 License

MIT License — See LICENSE file for details.

---

## 🙏 Acknowledgments

- **AVE.ai** for the Claw Monitoring Skill API
- **MiniMax** for the Text-01 language model
- Historical case data from public BSC/ETH blockchain explorers
- Design inspiration from Apple's Human Interface Guidelines
