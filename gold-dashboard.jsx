import { useState, useEffect, useCallback } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, Cell } from "recharts";

const GOLD_COLOR = "#D4A84B";
const GOLD_LIGHT = "#F5E6C8";
const GOLD_DIM = "#8B7635";
const BG_PRIMARY = "#0A0E17";
const BG_CARD = "#111827";
const BG_CARD_ALT = "#151E2E";
const GREEN = "#22C55E";
const RED = "#EF4444";
const AMBER = "#F59E0B";
const TEXT_PRIMARY = "#E5E7EB";
const TEXT_DIM = "#6B7280";
const BORDER = "#1F2937";

const HISTORICAL_DATA = [
  { year: "2000", price: 4400, event: "" },
  { year: "2002", price: 5200, event: "" },
  { year: "2004", price: 5800, event: "" },
  { year: "2006", price: 8400, event: "" },
  { year: "2008", price: 12500, event: "Global Financial Crisis" },
  { year: "2010", price: 18500, event: "Post-crisis rally" },
  { year: "2011", price: 26400, event: "All-time high (then)" },
  { year: "2012", price: 31050, event: "Eurozone crisis" },
  { year: "2013", price: 29600, event: "Taper tantrum crash" },
  { year: "2014", price: 28006, event: "Correction phase" },
  { year: "2015", price: 26343, event: "Bottom zone" },
  { year: "2016", price: 28623, event: "Recovery begins" },
  { year: "2017", price: 29667, event: "Steady growth" },
  { year: "2018", price: 31438, event: "Trade war fears" },
  { year: "2019", price: 35220, event: "Rate cut cycle begins" },
  { year: "2020", price: 48651, event: "COVID-19 pandemic" },
  { year: "2021", price: 47437, event: "Post-COVID consolidation" },
  { year: "2022", price: 52670, event: "Russia-Ukraine war" },
  { year: "2023", price: 58836, event: "Geopolitical risk" },
  { year: "2024", price: 75373, event: "Central bank buying" },
  { year: "2025", price: 110000, event: "Historic rally" },
  { year: "2026", price: 144500, event: "Current", isCurrent: true },
];

const YEARLY_RETURNS = [
  { year: "2015", ret: -9.5 }, { year: "2016", ret: 8.7 }, { year: "2017", ret: 3.6 },
  { year: "2018", ret: 6.0 }, { year: "2019", ret: 12.0 }, { year: "2020", ret: 38.1 },
  { year: "2021", ret: -2.5 }, { year: "2022", ret: 11.0 }, { year: "2023", ret: 11.7 },
  { year: "2024", ret: 28.1 }, { year: "2025", ret: 46.0 }, { year: "2026*", ret: 31.4 },
];

const BUY_SELL_HISTORY = [
  { date: "Mar 2020", action: "BUY", price: "~40,000", reason: "COVID crash \u2014 panic selloff created a major buying window. Gold dropped 8% before surging 40%.", outcome: "Rose to \u20b956,000 by Aug 2020 (+40%)" },
  { date: "Aug 2020", action: "SELL", price: "~56,000", reason: "Gold hit all-time high with RSI above 80. Overbought on massive stimulus optimism.", outcome: "Corrected to \u20b947,000 by Mar 2021 (-16%)" },
  { date: "Mar 2021", action: "BUY", price: "~47,000", reason: "Post-correction dip. Inflation rising globally. Real yields deeply negative.", outcome: "Rose to \u20b953,000 by Mar 2022 (+13%)" },
  { date: "Mar 2022", action: "BUY", price: "~52,000", reason: "Russia invaded Ukraine. Massive safe-haven demand spike.", outcome: "Rose to \u20b955,000 then consolidated" },
  { date: "Nov 2022", action: "BUY", price: "~50,500", reason: "Fed rate hikes peaked. Gold bottomed near $1,615/oz globally. Strong buy zone.", outcome: "Rose to \u20b965,000 by mid-2023 (+29%)" },
  { date: "Oct 2023", action: "BUY", price: "~60,000", reason: "Israel-Hamas conflict triggered safe-haven buying. Central banks accelerating purchases.", outcome: "Rose to \u20b975,000 by mid-2024 (+25%)" },
  { date: "Oct 2024", action: "HOLD", price: "~78,000", reason: "Gold rallied strongly but US election uncertainty created two-way risk.", outcome: "Continued rising to \u20b91,10,000 by end 2025" },
  { date: "Jan 2025", action: "BUY", price: "~82,000", reason: "Rate cuts expected. Central bank buying accelerated. Rupee weakening.", outcome: "Rose to \u20b91,44,000 by Mar 2026 (+75%)" },
  { date: "Mar 2026", action: "CURRENT", price: "~1,44,500", reason: "At elevated levels after historic rally. Assessment depends on live macro conditions.", outcome: "See AI analysis below \u2192" },
];

const QUERIES = {
  prices: `Give me ONLY a JSON response, no markdown, no backticks. Search for today's gold prices and return:
{"gold_24k_10g":"price in INR per 10g","gold_22k_10g":"price in INR per 10g","gold_intl_oz":"price in USD per troy oz","silver_1kg":"price in INR per kg","mcx_gold":"MCX gold futures price per 10g INR","gold_24k_1g":"price in INR per gram","usd_inr":"exchange rate","us_10y_yield":"percentage","sensex":"current value","crude_oil":"USD per barrel","dxy":"dollar index value","rbi_repo":"percentage"}`,

  analysis: `Search the web for latest gold market news, RBI policy, US Fed decisions, geopolitical events affecting gold, and India gold import data. Then provide a JSON response ONLY (no markdown, no backticks):
{"prediction_short":{"direction":"up/down/sideways","confidence":"high/medium/low","target":"price target range for 1 month in INR per 10g","reasoning":"2-3 sentence explanation"},"prediction_medium":{"direction":"up/down/sideways","confidence":"high/medium/low","target":"price target range for 3-6 months in INR per 10g","reasoning":"2-3 sentence explanation"},"prediction_long":{"direction":"up/down/sideways","confidence":"high/medium/low","target":"price target range for 1 year in INR per 10g","reasoning":"2-3 sentence explanation"},"key_drivers":[{"factor":"name","impact":"bullish/bearish/neutral","detail":"1 sentence"},{"factor":"name","impact":"bullish/bearish/neutral","detail":"1 sentence"},{"factor":"name","impact":"bullish/bearish/neutral","detail":"1 sentence"},{"factor":"name","impact":"bullish/bearish/neutral","detail":"1 sentence"},{"factor":"name","impact":"bullish/bearish/neutral","detail":"1 sentence"},{"factor":"name","impact":"bullish/bearish/neutral","detail":"1 sentence"}],"news_highlights":[{"headline":"summary","source":"source name","impact":"bullish/bearish/neutral"},{"headline":"summary","source":"source name","impact":"bullish/bearish/neutral"},{"headline":"summary","source":"source name","impact":"bullish/bearish/neutral"},{"headline":"summary","source":"source name","impact":"bullish/bearish/neutral"},{"headline":"summary","source":"source name","impact":"bullish/bearish/neutral"}],"buy_sell_signal":"BUY/SELL/HOLD","signal_reasoning":"2-3 sentences on why","india_specific":{"rbi_stance":"current RBI stance on gold","import_duty":"current duty percentage","seasonal_outlook":"upcoming seasonal demand factors","rupee_outlook":"INR trend impact on gold"},"risk_alert":"any major risk to watch right now in 1-2 sentences"}`,

  strategy: `Search the web for current gold price levels, technical analysis of MCX gold, support resistance levels, and gold outlook for next 3-12 months. Then provide a JSON response ONLY (no markdown, no backticks):
{"current_zone":"overbought/fair_value/undervalued/overextended","zone_reasoning":"1-2 sentences explaining current valuation zone","support_levels":[{"level":"price number only","strength":"strong/moderate/weak","note":"why this level matters"},{"level":"price number only","strength":"strong/moderate/weak","note":"why this level matters"},{"level":"price number only","strength":"strong/moderate/weak","note":"why this level matters"}],"resistance_levels":[{"level":"price number only","strength":"strong/moderate/weak","note":"why this level matters"},{"level":"price number only","strength":"strong/moderate/weak","note":"why this level matters"},{"level":"price number only","strength":"strong/moderate/weak","note":"why this level matters"}],"buy_strategies":[{"scenario":"description of when to buy","entry_price":"target entry range","stop_loss":"stop loss level","target":"profit target","timeframe":"holding period","risk_reward":"ratio like 1:2","confidence":"high/medium/low"},{"scenario":"description of when to buy","entry_price":"target entry range","stop_loss":"stop loss level","target":"profit target","timeframe":"holding period","risk_reward":"ratio like 1:2","confidence":"high/medium/low"}],"sell_strategies":[{"scenario":"description of when to sell","trigger":"what triggers the sell","exit_price":"target exit range","reasoning":"why sell here","timeframe":"when this might happen"},{"scenario":"description of when to sell","trigger":"what triggers the sell","exit_price":"target exit range","reasoning":"why sell here","timeframe":"when this might happen"}],"dca_plan":{"recommended":"yes/no","monthly_amount":"suggested monthly investment in grams","reasoning":"why DCA makes sense or not right now"},"seasonal_windows":[{"period":"month range","action":"buy/sell/hold","reasoning":"historical seasonal pattern explanation"},{"period":"month range","action":"buy/sell/hold","reasoning":"historical seasonal pattern explanation"},{"period":"month range","action":"buy/sell/hold","reasoning":"historical seasonal pattern explanation"}],"worst_case":"what could go wrong - 1-2 sentences on downside scenario","best_case":"what could go right - 1-2 sentences on upside scenario"}`,
};

function parseJSON(text) {
  if (!text) return null;
  try {
    let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch (e2) {}
    return null;
  }
}

async function fetchFromClaude(prompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  const texts = data.content?.filter((b) => b.type === "text").map((b) => b.text) || [];
  return texts.join("\n");
}

const Shimmer = ({ w = "100%", h = "20px" }) => (
  <div style={{ width: w, height: h, borderRadius: 6, background: `linear-gradient(90deg, ${BG_CARD} 25%, ${BG_CARD_ALT} 50%, ${BG_CARD} 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
);

const ImpactBadge = ({ impact }) => {
  const colors = { bullish: { bg: "rgba(34,197,94,0.15)", text: GREEN, label: "BULLISH" }, bearish: { bg: "rgba(239,68,68,0.15)", text: RED, label: "BEARISH" }, neutral: { bg: "rgba(107,114,128,0.15)", text: TEXT_DIM, label: "NEUTRAL" } };
  const c = colors[impact] || colors.neutral;
  return <span style={{ background: c.bg, color: c.text, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>{c.label}</span>;
};

const ActionBadge = ({ action }) => {
  const a = (action || "").toUpperCase();
  const config = { BUY: { bg: GREEN, icon: "\u25B2" }, SELL: { bg: RED, icon: "\u25BC" }, HOLD: { bg: AMBER, icon: "\u25A0" }, CURRENT: { bg: GOLD_COLOR, icon: "\u25C6" } };
  const c = config[a] || config.HOLD;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${c.bg}22`, border: `1px solid ${c.bg}66`, padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, color: c.bg, letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}><span style={{ fontSize: 8 }}>{c.icon}</span> {a}</span>;
};

const SignalBadge = ({ signal }) => {
  const s = (signal || "").toUpperCase();
  const config = { BUY: { bg: GREEN, icon: "\u25B2" }, SELL: { bg: RED, icon: "\u25BC" }, HOLD: { bg: GOLD_COLOR, icon: "\u25A0" } };
  const c = config[s] || config.HOLD;
  return <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${c.bg}22`, border: `2px solid ${c.bg}`, padding: "8px 20px", borderRadius: 8, fontSize: 18, fontWeight: 800, color: c.bg, letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace" }}><span style={{ fontSize: 14 }}>{c.icon}</span> {s}</div>;
};

const DirectionArrow = ({ dir }) => {
  const d = (dir || "").toLowerCase();
  if (d === "up") return <span style={{ color: GREEN, fontSize: 18 }}>{"\u25B2"}</span>;
  if (d === "down") return <span style={{ color: RED, fontSize: 18 }}>{"\u25BC"}</span>;
  return <span style={{ color: GOLD_COLOR, fontSize: 18 }}>{"\u25B6"}</span>;
};

const ConfidenceMeter = ({ level }) => {
  const l = (level || "").toLowerCase();
  const fill = l === "high" ? 3 : l === "medium" ? 2 : 1;
  const color = l === "high" ? GREEN : l === "medium" ? GOLD_COLOR : RED;
  return <div style={{ display: "flex", gap: 3, alignItems: "center" }}>{[1, 2, 3].map((i) => <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: i <= fill ? color : BORDER, transition: "background 0.3s" }} />)}<span style={{ fontSize: 10, color: TEXT_DIM, marginLeft: 4, textTransform: "uppercase", letterSpacing: 1 }}>{level}</span></div>;
};

const ZoneBadge = ({ zone }) => {
  const z = (zone || "").toLowerCase().replace(/_/g, " ");
  const colorMap = { overbought: RED, overextended: RED, "fair value": GREEN, undervalued: GOLD_COLOR };
  const c = Object.entries(colorMap).find(([k]) => z.includes(k))?.[1] || AMBER;
  return <span style={{ background: `${c}22`, border: `1px solid ${c}66`, color: c, padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{z}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = HISTORICAL_DATA.find(h => h.year === label);
  return (
    <div style={{ background: BG_CARD, border: `1px solid ${GOLD_DIM}66`, borderRadius: 8, padding: "10px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <div style={{ fontSize: 12, color: GOLD_COLOR, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "'JetBrains Mono', monospace" }}>{"\u20B9"}{Number(payload[0].value).toLocaleString("en-IN")} / 10g</div>
      {d?.event && <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 4 }}>{d.event}</div>}
    </div>
  );
};

const ReturnTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px" }}>
      <div style={{ fontSize: 12, color: TEXT_DIM }}>{payload[0].payload.year}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: v >= 0 ? GREEN : RED, fontFamily: "'JetBrains Mono', monospace" }}>{v >= 0 ? "+" : ""}{v}%</div>
    </div>
  );
};

export default function GoldDashboard() {
  const [prices, setPrices] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [loadingStrategy, setLoadingStrategy] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = useCallback(async () => {
    setLoadingPrices(true); setLoadingAnalysis(true); setLoadingStrategy(true); setError(null);
    try {
      fetchFromClaude(QUERIES.prices).then((r) => { const d = parseJSON(r); if (d) setPrices(d); setLoadingPrices(false); setLastUpdated(new Date()); }).catch(() => setLoadingPrices(false));
      fetchFromClaude(QUERIES.analysis).then((r) => { const d = parseJSON(r); if (d) setAnalysis(d); setLoadingAnalysis(false); }).catch(() => setLoadingAnalysis(false));
      fetchFromClaude(QUERIES.strategy).then((r) => { const d = parseJSON(r); if (d) setStrategy(d); setLoadingStrategy(false); }).catch(() => setLoadingStrategy(false));
    } catch (e) { setError("Failed to fetch data. Please refresh."); setLoadingPrices(false); setLoadingAnalysis(false); setLoadingStrategy(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const priceCards = [
    { label: "24K Gold / 10g", key: "gold_24k_10g", icon: "\u25C6", primary: true },
    { label: "22K Gold / 10g", key: "gold_22k_10g", icon: "\u25C7" },
    { label: "MCX Futures", key: "mcx_gold", icon: "\u25C8" },
    { label: "Intl Gold / oz", key: "gold_intl_oz", icon: "\u25CF", usd: true },
    { label: "24K / gram", key: "gold_24k_1g", icon: "\u25AA" },
    { label: "Silver / kg", key: "silver_1kg", icon: "\u25CB" },
  ];
  const indicatorCards = [
    { label: "USD / INR", key: "usd_inr", icon: "\u20B9" },
    { label: "US 10Y Yield", key: "us_10y_yield", icon: "%" },
    { label: "Sensex", key: "sensex", icon: "\u25C6" },
    { label: "Crude Oil", key: "crude_oil", icon: "\u2B24", usd: true },
    { label: "Dollar Index", key: "dxy", icon: "D" },
    { label: "RBI Repo Rate", key: "rbi_repo", icon: "R" },
  ];
  const tabs = [
    { id: "overview", label: "Overview" }, { id: "history", label: "Price History" },
    { id: "buysell", label: "Buy/Sell Log" }, { id: "strategy", label: "Future Strategy" },
    { id: "predictions", label: "Predictions" }, { id: "drivers", label: "Key Drivers" },
    { id: "news", label: "News" }, { id: "india", label: "India Focus" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG_PRIMARY, color: TEXT_PRIMARY, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes goldGlow{0%,100%{box-shadow:0 0 20px rgba(212,168,75,.1)}50%{box-shadow:0 0 30px rgba(212,168,75,.25)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:${BG_PRIMARY}}::-webkit-scrollbar-thumb{background:${BORDER};border-radius:3px}
      `}</style>

      {/* HEADER */}
      <div style={{ background:`linear-gradient(135deg,${BG_CARD},${BG_PRIMARY})`, borderBottom:`1px solid ${BORDER}`, padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, position:"sticky", top:0, zIndex:100, backdropFilter:"blur(12px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36,height:36,borderRadius:8, background:`linear-gradient(135deg,${GOLD_COLOR},${GOLD_DIM})`, display:"flex",alignItems:"center",justifyContent:"center", fontSize:18,fontWeight:800,color:BG_PRIMARY, fontFamily:"'JetBrains Mono',monospace" }}>Au</div>
          <div>
            <div style={{ fontSize:16,fontWeight:700,color:GOLD_LIGHT,letterSpacing:.5 }}>Gold Command Center</div>
            <div style={{ fontSize:11,color:TEXT_DIM }}>Physical Gold Intelligence Dashboard</div>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:16 }}>
          {lastUpdated && <div style={{ fontSize:11,color:TEXT_DIM,display:"flex",alignItems:"center",gap:6 }}><span style={{ width:6,height:6,borderRadius:"50%",background:GREEN,animation:"pulse 2s infinite" }}/>Updated: {lastUpdated.toLocaleTimeString("en-IN")}</div>}
          <button onClick={fetchData} style={{ background:`linear-gradient(135deg,${GOLD_DIM},${GOLD_COLOR})`,color:BG_PRIMARY,border:"none",borderRadius:6,padding:"6px 16px",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:.5 }}>{"\u21BB"} REFRESH</button>
        </div>
      </div>

      <div style={{ padding:"16px 20px",maxWidth:1400,margin:"0 auto" }}>
        {error && <div style={{ background:"rgba(239,68,68,.1)",border:`1px solid ${RED}`,borderRadius:8,padding:12,marginBottom:16,fontSize:13,color:RED }}>{error}</div>}

        {/* PRICE CARDS */}
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:11,color:TEXT_DIM,letterSpacing:2,fontWeight:600,marginBottom:10,textTransform:"uppercase" }}>Live Gold Prices</div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:10 }}>
            {priceCards.map((c,i)=>(
              <div key={i} style={{ background:c.primary?`linear-gradient(135deg,rgba(212,168,75,.15),rgba(212,168,75,.05))`:BG_CARD, border:`1px solid ${c.primary?GOLD_DIM+"55":BORDER}`, borderRadius:10,padding:14, animation:c.primary?"goldGlow 3s infinite":"none" }}>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}><span style={{ color:c.primary?GOLD_COLOR:TEXT_DIM,fontSize:12 }}>{c.icon}</span><span style={{ fontSize:11,color:TEXT_DIM,fontWeight:500 }}>{c.label}</span></div>
                {loadingPrices?<Shimmer h="24px"/>:<div style={{ fontSize:c.primary?20:17,fontWeight:700,color:c.primary?GOLD_LIGHT:TEXT_PRIMARY,fontFamily:"'JetBrains Mono',monospace" }}>{c.usd?"$":"\u20B9"}{prices?.[c.key]||"\u2014"}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* INDICATORS */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11,color:TEXT_DIM,letterSpacing:2,fontWeight:600,marginBottom:10,marginTop:16,textTransform:"uppercase" }}>Key Macro Indicators</div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(135px,1fr))",gap:10 }}>
            {indicatorCards.map((c,i)=>(
              <div key={i} style={{ background:BG_CARD_ALT,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px" }}>
                <div style={{ fontSize:11,color:TEXT_DIM,marginBottom:6,fontWeight:500 }}><span style={{ marginRight:4 }}>{c.icon}</span>{c.label}</div>
                {loadingPrices?<Shimmer h="20px"/>:<div style={{ fontSize:16,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",color:TEXT_PRIMARY }}>{c.usd?"$":""}{prices?.[c.key]||"\u2014"}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* SIGNAL BAR */}
        {!loadingAnalysis&&analysis&&(
          <div style={{ background:`linear-gradient(135deg,${BG_CARD},${BG_CARD_ALT})`,border:`1px solid ${BORDER}`,borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,animation:"fadeIn .5s ease" }}>
            <div><div style={{ fontSize:11,color:TEXT_DIM,letterSpacing:2,fontWeight:600,marginBottom:6,textTransform:"uppercase" }}>AI Signal</div><SignalBadge signal={analysis.buy_sell_signal}/></div>
            <div style={{ flex:1,minWidth:200,maxWidth:500 }}><div style={{ fontSize:13,color:TEXT_PRIMARY,lineHeight:1.5 }}>{analysis.signal_reasoning}</div></div>
            {analysis.risk_alert&&<div style={{ background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"8px 12px",maxWidth:280 }}><div style={{ fontSize:10,color:RED,fontWeight:700,letterSpacing:1,marginBottom:2 }}>{"\u26A0"} RISK ALERT</div><div style={{ fontSize:12,color:TEXT_PRIMARY,lineHeight:1.4 }}>{analysis.risk_alert}</div></div>}
          </div>
        )}

        {/* TABS */}
        <div style={{ display:"flex",gap:4,marginBottom:16,background:BG_CARD,borderRadius:10,padding:4,border:`1px solid ${BORDER}`,overflowX:"auto" }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{ background:activeTab===t.id?GOLD_DIM+"33":"transparent",color:activeTab===t.id?GOLD_LIGHT:TEXT_DIM,border:activeTab===t.id?`1px solid ${GOLD_DIM}55`:"1px solid transparent",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s",letterSpacing:.3 }}>{t.label}</button>
          ))}
        </div>

        <div style={{ animation:"fadeIn .3s ease" }}>

        {/* ===== OVERVIEW ===== */}
        {activeTab==="overview"&&(
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
            <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,gridColumn:"1/-1" }}>
              <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase" }}>Price Outlook</div>
              {loadingAnalysis?<div style={{ display:"flex",flexDirection:"column",gap:12 }}><Shimmer h="60px"/><Shimmer h="60px"/><Shimmer h="60px"/></div>:(
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:12 }}>
                  {[{label:"1 Month",data:analysis?.prediction_short},{label:"3\u20136 Months",data:analysis?.prediction_medium},{label:"1 Year",data:analysis?.prediction_long}].map((p,i)=>(
                    <div key={i} style={{ background:BG_CARD_ALT,borderRadius:10,padding:14,border:`1px solid ${BORDER}` }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}><span style={{ fontSize:12,fontWeight:600,color:TEXT_DIM }}>{p.label}</span><DirectionArrow dir={p.data?.direction}/></div>
                      <div style={{ fontSize:15,fontWeight:700,color:GOLD_LIGHT,fontFamily:"'JetBrains Mono',monospace",marginBottom:6 }}>{p.data?.target||"\u2014"}</div>
                      <ConfidenceMeter level={p.data?.confidence}/>
                      <div style={{ fontSize:12,color:TEXT_DIM,marginTop:8,lineHeight:1.5 }}>{p.data?.reasoning||"Loading..."}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:18 }}>
              <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase" }}>Top Drivers</div>
              {loadingAnalysis?<Shimmer h="160px"/>:<div style={{ display:"flex",flexDirection:"column",gap:8 }}>{(analysis?.key_drivers||[]).slice(0,4).map((d,i)=>(<div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:BG_CARD_ALT,borderRadius:8,border:`1px solid ${BORDER}` }}><div><div style={{ fontSize:13,fontWeight:600,color:TEXT_PRIMARY }}>{d.factor}</div><div style={{ fontSize:11,color:TEXT_DIM,marginTop:2 }}>{d.detail}</div></div><ImpactBadge impact={d.impact}/></div>))}</div>}
            </div>
            <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:18 }}>
              <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase" }}>Latest News</div>
              {loadingAnalysis?<Shimmer h="160px"/>:<div style={{ display:"flex",flexDirection:"column",gap:8 }}>{(analysis?.news_highlights||[]).slice(0,4).map((n,i)=>(<div key={i} style={{ padding:"8px 10px",background:BG_CARD_ALT,borderRadius:8,border:`1px solid ${BORDER}` }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}><div style={{ fontSize:13,color:TEXT_PRIMARY,lineHeight:1.4,fontWeight:500 }}>{n.headline}</div><ImpactBadge impact={n.impact}/></div><div style={{ fontSize:10,color:TEXT_DIM,marginTop:4 }}>{n.source}</div></div>))}</div>}
            </div>
          </div>
        )}

        {/* ===== PRICE HISTORY ===== */}
        {activeTab==="history"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:20 }}>
              <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:4,textTransform:"uppercase" }}>Gold Price Journey (2000{"\u2013"}2026)</div>
              <div style={{ fontSize:11,color:TEXT_DIM,marginBottom:16 }}>24K gold {"\u2014"} average annual price per 10 grams in INR</div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={HISTORICAL_DATA} margin={{ top:10,right:10,left:10,bottom:0 }}>
                  <defs><linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GOLD_COLOR} stopOpacity={0.4}/><stop offset="100%" stopColor={GOLD_COLOR} stopOpacity={0.02}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER}/>
                  <XAxis dataKey="year" tick={{ fontSize:11,fill:TEXT_DIM }} tickLine={false} axisLine={{ stroke:BORDER }}/>
                  <YAxis tick={{ fontSize:11,fill:TEXT_DIM }} tickLine={false} axisLine={{ stroke:BORDER }} tickFormatter={v=>`\u20B9${(v/1000).toFixed(0)}K`}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <ReferenceLine y={48651} stroke={RED} strokeDasharray="4 4" label={{ value:"COVID",fill:RED,fontSize:10,position:"right" }}/>
                  <ReferenceLine y={110000} stroke={AMBER} strokeDasharray="4 4" label={{ value:"2025",fill:AMBER,fontSize:10,position:"right" }}/>
                  <Area type="monotone" dataKey="price" stroke={GOLD_COLOR} strokeWidth={2.5} fill="url(#goldGrad)" dot={(props)=>{const d=HISTORICAL_DATA[props.index];if(d?.isCurrent)return<circle cx={props.cx} cy={props.cy} r={6} fill={GOLD_COLOR} stroke={BG_PRIMARY} strokeWidth={2}/>;if(d?.event)return<circle cx={props.cx} cy={props.cy} r={3} fill={GOLD_COLOR}/>;return null;}}/>
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display:"flex",flexWrap:"wrap",gap:16,marginTop:16,padding:"12px 16px",background:BG_CARD_ALT,borderRadius:8,border:`1px solid ${BORDER}` }}>
                {[{label:"2000 \u2192 2026 CAGR",value:"~14.5%",note:"Consistent long-term compounder"},{label:"Doubling Period",value:"~8 years",note:"Historical average"},{label:"Largest Annual Gain",value:"+46% (2025)",note:"Historic bull run"},{label:"Worst Year",value:"-9.5% (2015)",note:"Strong dollar phase"}].map((s,i)=>(<div key={i} style={{ flex:"1 1 180px" }}><div style={{ fontSize:10,color:TEXT_DIM,letterSpacing:1,textTransform:"uppercase" }}>{s.label}</div><div style={{ fontSize:18,fontWeight:700,color:GOLD_LIGHT,fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div><div style={{ fontSize:11,color:TEXT_DIM }}>{s.note}</div></div>))}
              </div>
            </div>
            <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:20 }}>
              <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:4,textTransform:"uppercase" }}>Yearly Returns</div>
              <div style={{ fontSize:11,color:TEXT_DIM,marginBottom:16 }}>Annual % change in gold price (INR). *2026 is YTD.</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={YEARLY_RETURNS} margin={{ top:10,right:10,left:10,bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER}/><XAxis dataKey="year" tick={{ fontSize:11,fill:TEXT_DIM }} tickLine={false} axisLine={{ stroke:BORDER }}/><YAxis tick={{ fontSize:11,fill:TEXT_DIM }} tickLine={false} axisLine={{ stroke:BORDER }} tickFormatter={v=>`${v}%`}/>
                  <Tooltip content={<ReturnTooltip/>}/><ReferenceLine y={0} stroke={TEXT_DIM} strokeWidth={1}/>
                  <Bar dataKey="ret" radius={[4,4,0,0]}>{YEARLY_RETURNS.map((e,i)=><Cell key={i} fill={e.ret>=0?GREEN:RED} fillOpacity={0.7}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:20 }}>
              <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase" }}>Key Historical Events & Gold Impact</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10 }}>
                {[{year:"2008-10",title:"Global Financial Crisis",detail:"Gold surged from \u20B912,500 to \u20B918,500 as investors fled equities. Gold proved its safe-haven status.",impact:"bullish"},{year:"2013",title:"Taper Tantrum",detail:"Fed signaled tapering QE. Gold dropped ~25% globally. India hiked import duty to 10% to curb current account deficit.",impact:"bearish"},{year:"2016",title:"Demonetisation",detail:"Modi's note ban briefly spiked physical gold premiums as people scrambled to convert cash.",impact:"neutral"},{year:"2020",title:"COVID-19 Pandemic",detail:"Gold hit all-time highs at $2,075/oz. In India crossed \u20B956,000/10g. Massive stimulus drove real yields negative.",impact:"bullish"},{year:"2022-23",title:"Russia-Ukraine War",detail:"Geopolitical shock drove safe-haven demand. Central banks began aggressive gold buying.",impact:"bullish"},{year:"2024-26",title:"Central Bank Supercycle",detail:"RBI, PBOC, and 30+ central banks bought record gold. De-dollarisation narrative accelerated. Gold doubled in India.",impact:"bullish"}].map((e,i)=>(
                  <div key={i} style={{ background:BG_CARD_ALT,borderRadius:10,padding:14,border:`1px solid ${BORDER}`,borderLeft:`4px solid ${e.impact==="bullish"?GREEN:e.impact==="bearish"?RED:AMBER}` }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}><span style={{ fontSize:11,color:GOLD_DIM,fontWeight:700,fontFamily:"'JetBrains Mono',monospace" }}>{e.year}</span><ImpactBadge impact={e.impact}/></div>
                    <div style={{ fontSize:14,fontWeight:700,color:TEXT_PRIMARY,marginBottom:4 }}>{e.title}</div>
                    <div style={{ fontSize:12,color:TEXT_DIM,lineHeight:1.5 }}>{e.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== BUY/SELL LOG ===== */}
        {activeTab==="buysell"&&(
          <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:20 }}>
            <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:4,textTransform:"uppercase" }}>Historical Buy & Sell Signals (2020{"\u2013"}2026)</div>
            <div style={{ fontSize:11,color:TEXT_DIM,marginBottom:18 }}>Retrospective analysis of optimal entry/exit points based on macro events and technicals</div>
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute",left:16,top:0,bottom:0,width:2,background:`linear-gradient(to bottom,${GREEN},${GOLD_COLOR},${RED},${GOLD_COLOR})`,borderRadius:1 }}/>
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {BUY_SELL_HISTORY.map((item,i)=>(
                  <div key={i} style={{ marginLeft:40,position:"relative",background:BG_CARD_ALT,borderRadius:10,padding:16,border:`1px solid ${BORDER}`,borderLeft:`4px solid ${item.action==="BUY"?GREEN:item.action==="SELL"?RED:item.action==="CURRENT"?GOLD_COLOR:AMBER}` }}>
                    <div style={{ position:"absolute",left:-34,top:18,width:12,height:12,borderRadius:"50%",border:`2px solid ${BG_PRIMARY}`,background:item.action==="BUY"?GREEN:item.action==="SELL"?RED:item.action==="CURRENT"?GOLD_COLOR:AMBER }}/>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:8 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}><span style={{ fontSize:13,fontWeight:700,color:GOLD_LIGHT,fontFamily:"'JetBrains Mono',monospace" }}>{item.date}</span><ActionBadge action={item.action}/></div>
                      <div style={{ fontSize:16,fontWeight:700,color:TEXT_PRIMARY,fontFamily:"'JetBrains Mono',monospace" }}>{"\u20B9"}{item.price}</div>
                    </div>
                    <div style={{ fontSize:13,color:TEXT_PRIMARY,lineHeight:1.6,marginBottom:8 }}>{item.reason}</div>
                    <div style={{ fontSize:12,color:item.action==="SELL"?RED:item.action==="CURRENT"?GOLD_COLOR:GREEN,fontWeight:600,padding:"6px 10px",background:BG_PRIMARY,borderRadius:6,display:"inline-block" }}>{"\u279C"} {item.outcome}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop:20,padding:14,background:`linear-gradient(135deg,rgba(212,168,75,.08),rgba(212,168,75,.02))`,border:`1px solid ${GOLD_DIM}44`,borderRadius:10 }}>
              <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:700,marginBottom:8 }}>Key Takeaways from History</div>
              <div style={{ fontSize:13,color:TEXT_PRIMARY,lineHeight:1.7 }}>Every major dip since 2020 was a buying opportunity. Gold has not given a single negative calendar year return in INR since 2021, thanks to rupee depreciation amplifying returns. The best entries came during panic events (COVID crash, rate hike peak) when sentiment was most negative. Sell signals were clearest when RSI crossed 80 on MCX and gold hit round-number psychological resistance levels.</div>
            </div>
          </div>
        )}

        {/* ===== FUTURE STRATEGY ===== */}
        {activeTab==="strategy"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:20 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:14 }}>
                <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase" }}>Current Market Zone</div>
                {loadingStrategy?<Shimmer w="120px" h="28px"/>:<ZoneBadge zone={strategy?.current_zone}/>}
              </div>
              {loadingStrategy?<Shimmer h="40px"/>:<div style={{ fontSize:14,color:TEXT_PRIMARY,lineHeight:1.6,padding:14,background:BG_CARD_ALT,borderRadius:8,border:`1px solid ${BORDER}` }}>{strategy?.zone_reasoning||"Loading..."}</div>}
            </div>

            {/* Support & Resistance */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:18 }}>
                <div style={{ fontSize:12,color:GREEN,fontWeight:600,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase" }}>Support Levels (Buy Zones)</div>
                {loadingStrategy?<Shimmer h="120px"/>:<div style={{ display:"flex",flexDirection:"column",gap:8 }}>{(strategy?.support_levels||[]).map((s,i)=>(<div key={i} style={{ padding:"10px 12px",background:BG_CARD_ALT,borderRadius:8,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${GREEN}` }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}><span style={{ fontSize:16,fontWeight:700,color:GREEN,fontFamily:"'JetBrains Mono',monospace" }}>{"\u20B9"}{s.level}</span><span style={{ fontSize:10,color:TEXT_DIM,fontWeight:600,textTransform:"uppercase",letterSpacing:1 }}>{s.strength}</span></div><div style={{ fontSize:12,color:TEXT_DIM,lineHeight:1.4 }}>{s.note}</div></div>))}</div>}
              </div>
              <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:18 }}>
                <div style={{ fontSize:12,color:RED,fontWeight:600,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase" }}>Resistance Levels (Sell Zones)</div>
                {loadingStrategy?<Shimmer h="120px"/>:<div style={{ display:"flex",flexDirection:"column",gap:8 }}>{(strategy?.resistance_levels||[]).map((r,i)=>(<div key={i} style={{ padding:"10px 12px",background:BG_CARD_ALT,borderRadius:8,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${RED}` }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}><span style={{ fontSize:16,fontWeight:700,color:RED,fontFamily:"'JetBrains Mono',monospace" }}>{"\u20B9"}{r.level}</span><span style={{ fontSize:10,color:TEXT_DIM,fontWeight:600,textTransform:"uppercase",letterSpacing:1 }}>{r.strength}</span></div><div style={{ fontSize:12,color:TEXT_DIM,lineHeight:1.4 }}>{r.note}</div></div>))}</div>}
              </div>
            </div>

            {/* Buy Strategies */}
            <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:20 }}>
              <div style={{ fontSize:12,color:GREEN,fontWeight:600,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase" }}>Buy Strategies</div>
              {loadingStrategy?<Shimmer h="200px"/>:<div style={{ display:"flex",flexDirection:"column",gap:12 }}>{(strategy?.buy_strategies||[]).map((b,i)=>(<div key={i} style={{ background:BG_CARD_ALT,borderRadius:10,padding:16,border:`1px solid ${BORDER}`,borderLeft:`4px solid ${GREEN}` }}><div style={{ fontSize:14,fontWeight:700,color:TEXT_PRIMARY,marginBottom:10 }}>{b.scenario}</div><div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10 }}>{[{label:"Entry",value:`\u20B9${b.entry_price}`,color:GREEN},{label:"Stop Loss",value:`\u20B9${b.stop_loss}`,color:RED},{label:"Target",value:`\u20B9${b.target}`,color:GOLD_COLOR},{label:"R:R",value:b.risk_reward,color:TEXT_PRIMARY},{label:"Timeframe",value:b.timeframe,color:TEXT_DIM}].map((f,j)=>(<div key={j} style={{ padding:"6px 10px",background:BG_PRIMARY,borderRadius:6 }}><div style={{ fontSize:10,color:TEXT_DIM,letterSpacing:1,textTransform:"uppercase" }}>{f.label}</div><div style={{ fontSize:14,fontWeight:700,color:f.color,fontFamily:"'JetBrains Mono',monospace" }}>{f.value}</div></div>))}</div><div style={{ marginTop:8 }}><ConfidenceMeter level={b.confidence}/></div></div>))}</div>}
            </div>

            {/* Sell Strategies */}
            <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:20 }}>
              <div style={{ fontSize:12,color:RED,fontWeight:600,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase" }}>Sell / Exit Strategies</div>
              {loadingStrategy?<Shimmer h="150px"/>:<div style={{ display:"flex",flexDirection:"column",gap:12 }}>{(strategy?.sell_strategies||[]).map((s,i)=>(<div key={i} style={{ background:BG_CARD_ALT,borderRadius:10,padding:16,border:`1px solid ${BORDER}`,borderLeft:`4px solid ${RED}` }}><div style={{ fontSize:14,fontWeight:700,color:TEXT_PRIMARY,marginBottom:6 }}>{s.scenario}</div><div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:8 }}><div style={{ padding:"6px 10px",background:BG_PRIMARY,borderRadius:6 }}><div style={{ fontSize:10,color:TEXT_DIM,letterSpacing:1,textTransform:"uppercase" }}>Trigger</div><div style={{ fontSize:13,fontWeight:600,color:RED }}>{s.trigger}</div></div><div style={{ padding:"6px 10px",background:BG_PRIMARY,borderRadius:6 }}><div style={{ fontSize:10,color:TEXT_DIM,letterSpacing:1,textTransform:"uppercase" }}>Exit Price</div><div style={{ fontSize:14,fontWeight:700,color:GOLD_COLOR,fontFamily:"'JetBrains Mono',monospace" }}>{"\u20B9"}{s.exit_price}</div></div><div style={{ padding:"6px 10px",background:BG_PRIMARY,borderRadius:6 }}><div style={{ fontSize:10,color:TEXT_DIM,letterSpacing:1,textTransform:"uppercase" }}>Timeframe</div><div style={{ fontSize:13,fontWeight:600,color:TEXT_DIM }}>{s.timeframe}</div></div></div><div style={{ fontSize:12,color:TEXT_DIM,lineHeight:1.5 }}>{s.reasoning}</div></div>))}</div>}
            </div>

            {/* DCA + Seasonal + Scenarios */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14 }}>
              <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:18 }}>
                <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase" }}>DCA (SIP) Plan</div>
                {loadingStrategy?<Shimmer h="100px"/>:<div><div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}><span style={{ fontSize:11,color:TEXT_DIM }}>Recommended:</span><span style={{ fontSize:14,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:(strategy?.dca_plan?.recommended||"").toLowerCase()==="yes"?GREEN:RED }}>{(strategy?.dca_plan?.recommended||"\u2014").toUpperCase()}</span></div>{strategy?.dca_plan?.monthly_amount&&<div style={{ padding:"8px 12px",background:BG_CARD_ALT,borderRadius:8,marginBottom:10,border:`1px solid ${BORDER}` }}><div style={{ fontSize:10,color:TEXT_DIM,letterSpacing:1,textTransform:"uppercase" }}>Monthly Amount</div><div style={{ fontSize:16,fontWeight:700,color:GOLD_LIGHT,fontFamily:"'JetBrains Mono',monospace" }}>{strategy.dca_plan.monthly_amount}</div></div>}<div style={{ fontSize:13,color:TEXT_DIM,lineHeight:1.6 }}>{strategy?.dca_plan?.reasoning}</div></div>}
              </div>
              <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:18 }}>
                <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase" }}>Seasonal Windows</div>
                {loadingStrategy?<Shimmer h="100px"/>:<div style={{ display:"flex",flexDirection:"column",gap:8 }}>{(strategy?.seasonal_windows||[]).map((sw,i)=>(<div key={i} style={{ padding:"10px 12px",background:BG_CARD_ALT,borderRadius:8,border:`1px solid ${BORDER}` }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}><span style={{ fontSize:13,fontWeight:700,color:TEXT_PRIMARY }}>{sw.period}</span><ActionBadge action={sw.action}/></div><div style={{ fontSize:12,color:TEXT_DIM,lineHeight:1.4 }}>{sw.reasoning}</div></div>))}</div>}
              </div>
              <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:18 }}>
                <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase" }}>Scenario Analysis</div>
                {loadingStrategy?<Shimmer h="100px"/>:<div style={{ display:"flex",flexDirection:"column",gap:10 }}><div style={{ padding:12,background:"rgba(34,197,94,.06)",borderRadius:8,border:"1px solid rgba(34,197,94,.2)" }}><div style={{ fontSize:11,color:GREEN,fontWeight:700,letterSpacing:1,marginBottom:4 }}>{"\u25B2"} BEST CASE</div><div style={{ fontSize:13,color:TEXT_PRIMARY,lineHeight:1.5 }}>{strategy?.best_case||"\u2014"}</div></div><div style={{ padding:12,background:"rgba(239,68,68,.06)",borderRadius:8,border:"1px solid rgba(239,68,68,.2)" }}><div style={{ fontSize:11,color:RED,fontWeight:700,letterSpacing:1,marginBottom:4 }}>{"\u25BC"} WORST CASE</div><div style={{ fontSize:13,color:TEXT_PRIMARY,lineHeight:1.5 }}>{strategy?.worst_case||"\u2014"}</div></div></div>}
              </div>
            </div>
            <div style={{ padding:12,background:"rgba(107,114,128,.1)",borderRadius:8,fontSize:11,color:TEXT_DIM,lineHeight:1.5,borderLeft:`3px solid ${TEXT_DIM}` }}>{"\u26A0"} Disclaimer: AI-generated strategies for educational purposes only. Physical gold carries storage and purity risks. Always consult a SEBI-registered investment advisor.</div>
          </div>
        )}

        {/* ===== PREDICTIONS ===== */}
        {activeTab==="predictions"&&(
          <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:20 }}>
            <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:16,textTransform:"uppercase" }}>Detailed Price Predictions</div>
            {loadingAnalysis?<div style={{ display:"flex",flexDirection:"column",gap:16 }}><Shimmer h="120px"/><Shimmer h="120px"/><Shimmer h="120px"/></div>:(
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {[{label:"Short Term (1 Month)",data:analysis?.prediction_short,emoji:"\uD83C\uDFAF"},{label:"Medium Term (3\u20136 Months)",data:analysis?.prediction_medium,emoji:"\uD83D\uDCCA"},{label:"Long Term (1 Year)",data:analysis?.prediction_long,emoji:"\uD83D\uDD2E"}].map((p,i)=>(
                  <div key={i} style={{ background:BG_CARD_ALT,borderRadius:12,padding:18,border:`1px solid ${BORDER}` }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}><div style={{ display:"flex",alignItems:"center",gap:8 }}><span style={{ fontSize:18 }}>{p.emoji}</span><span style={{ fontSize:15,fontWeight:700,color:GOLD_LIGHT }}>{p.label}</span></div><DirectionArrow dir={p.data?.direction}/></div>
                    <div style={{ fontSize:22,fontWeight:800,color:GOLD_COLOR,fontFamily:"'JetBrains Mono',monospace",marginBottom:10 }}>{p.data?.target||"\u2014"}</div>
                    <ConfidenceMeter level={p.data?.confidence}/>
                    <div style={{ fontSize:14,color:TEXT_PRIMARY,marginTop:12,lineHeight:1.6,padding:12,background:BG_PRIMARY,borderRadius:8,borderLeft:`3px solid ${GOLD_DIM}` }}>{p.data?.reasoning||"No analysis available"}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop:16,padding:12,background:"rgba(107,114,128,.1)",borderRadius:8,fontSize:11,color:TEXT_DIM,lineHeight:1.5,borderLeft:`3px solid ${TEXT_DIM}` }}>{"\u26A0"} Disclaimer: AI-generated predictions for informational purposes only. Not financial advice.</div>
          </div>
        )}

        {/* ===== KEY DRIVERS ===== */}
        {activeTab==="drivers"&&(
          <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:20 }}>
            <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:16,textTransform:"uppercase" }}>Factors Driving Gold Prices Now</div>
            {loadingAnalysis?<Shimmer h="300px"/>:<div style={{ display:"flex",flexDirection:"column",gap:10 }}>{(analysis?.key_drivers||[]).map((d,i)=>(<div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:BG_CARD_ALT,borderRadius:10,border:`1px solid ${BORDER}`,borderLeft:`4px solid ${d.impact==="bullish"?GREEN:d.impact==="bearish"?RED:TEXT_DIM}` }}><div style={{ flex:1 }}><div style={{ fontSize:15,fontWeight:700,color:TEXT_PRIMARY,marginBottom:4 }}>{d.factor}</div><div style={{ fontSize:13,color:TEXT_DIM,lineHeight:1.5 }}>{d.detail}</div></div><div style={{ marginLeft:16 }}><ImpactBadge impact={d.impact}/></div></div>))}</div>}
          </div>
        )}

        {/* ===== NEWS ===== */}
        {activeTab==="news"&&(
          <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:20 }}>
            <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:16,textTransform:"uppercase" }}>Market-Moving News</div>
            {loadingAnalysis?<Shimmer h="300px"/>:<div style={{ display:"flex",flexDirection:"column",gap:10 }}>{(analysis?.news_highlights||[]).map((n,i)=>(<div key={i} style={{ padding:"14px 16px",background:BG_CARD_ALT,borderRadius:10,border:`1px solid ${BORDER}` }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}><div style={{ flex:1 }}><div style={{ fontSize:15,color:TEXT_PRIMARY,lineHeight:1.5,fontWeight:600,marginBottom:6 }}>{n.headline}</div><div style={{ fontSize:11,color:TEXT_DIM }}>Source: {n.source}</div></div><ImpactBadge impact={n.impact}/></div></div>))}</div>}
          </div>
        )}

        {/* ===== INDIA FOCUS ===== */}
        {activeTab==="india"&&(
          <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:20 }}>
            <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:600,letterSpacing:1.5,marginBottom:16,textTransform:"uppercase" }}>India-Specific Gold Intelligence</div>
            {loadingAnalysis?<Shimmer h="300px"/>:(
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14 }}>
                {[{label:"RBI Policy Stance",value:analysis?.india_specific?.rbi_stance,icon:"\uD83C\uDFDB"},{label:"Import Duty",value:analysis?.india_specific?.import_duty,icon:"\uD83D\uDCE6"},{label:"Seasonal Outlook",value:analysis?.india_specific?.seasonal_outlook,icon:"\uD83D\uDCC5"},{label:"Rupee Outlook",value:analysis?.india_specific?.rupee_outlook,icon:"\uD83D\uDCB1"}].map((item,i)=>(
                  <div key={i} style={{ background:BG_CARD_ALT,borderRadius:10,padding:16,border:`1px solid ${BORDER}` }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}><span style={{ fontSize:20 }}>{item.icon}</span><span style={{ fontSize:13,fontWeight:700,color:GOLD_LIGHT,letterSpacing:.5 }}>{item.label}</span></div>
                    <div style={{ fontSize:14,color:TEXT_PRIMARY,lineHeight:1.6,padding:12,background:BG_PRIMARY,borderRadius:8 }}>{item.value||"No data"}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop:18,background:`linear-gradient(135deg,rgba(212,168,75,.08),rgba(212,168,75,.02))`,border:`1px solid ${GOLD_DIM}44`,borderRadius:12,padding:18 }}>
              <div style={{ fontSize:12,color:GOLD_COLOR,fontWeight:700,letterSpacing:1.5,marginBottom:12,textTransform:"uppercase" }}>Physical Gold Buy/Sell Checklist</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:10 }}>
                {[{tip:"Always buy BIS Hallmarked (916 for 22K)",cat:"Purity"},{tip:"Coins/bars: 1-3% premium. Jewellery: 8-25% making charges",cat:"Premium"},{tip:"Buy from MMTC-PAMP or bank for cleanest resale",cat:"Source"},{tip:"Keep original invoice \u2014 smoother sellback at same shop",cat:"Documentation"},{tip:"GST: 3% on gold + 5% on making charges",cat:"Tax"},{tip:"Best buy windows: post-wedding season (Mar-Jun)",cat:"Timing"}].map((t,i)=>(<div key={i} style={{ padding:"10px 12px",background:BG_CARD,borderRadius:8,border:`1px solid ${BORDER}` }}><div style={{ fontSize:10,color:GOLD_DIM,fontWeight:700,letterSpacing:1,marginBottom:4 }}>{t.cat}</div><div style={{ fontSize:13,color:TEXT_PRIMARY,lineHeight:1.4 }}>{t.tip}</div></div>))}
              </div>
            </div>
          </div>
        )}

        </div>

        {/* FOOTER */}
        <div style={{ marginTop:20,padding:"14px 0",borderTop:`1px solid ${BORDER}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
          <div style={{ fontSize:11,color:TEXT_DIM }}>Data sourced via AI-powered web search. Prices are indicative and exclude GST/TCS.</div>
          <div style={{ fontSize:11,color:TEXT_DIM }}>Not financial advice. Consult a SEBI-registered advisor.</div>
        </div>
      </div>
    </div>
  );
}
