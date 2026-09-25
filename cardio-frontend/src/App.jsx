import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Zap,
  Share2,
  Gauge,
  Flame,
  Wine,
  Dumbbell,
  Sliders,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Radio,
  SlidersHorizontal,
  Compass,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// API URL resolver
const getApiUrl = () => {
  let envUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  if (envUrl) {
    if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
      return envUrl;
    }
    if (envUrl.includes(".")) {
      return `https://${envUrl}`;
    }
    if (!envUrl.includes(":")) {
      return `https://${envUrl}.onrender.com`;
    }
    return `http://${envUrl}`;
  }
  if (typeof window !== "undefined") {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:8000";
    }
    return window.location.origin;
  }
  return "http://localhost:8000";
};

const API_URL = getApiUrl();

const DEFAULT_DATA = {
  age: 45,
  gender: 2,
  height: 175,
  weight: 76,
  ap_hi: 125,
  ap_lo: 82,
  cholesterol: 1,
  gluc: 1,
  smoke: 0,
  alco: 0,
  active: 1,
};

export default function App() {
  const [activeTab, setActiveTab] = useState("scanner"); // "scanner" | "simulator"
  const [form, setForm] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Live BMI calculation
  const bmi = useMemo(() => {
    const h = form.height / 100;
    const val = form.weight / (h * h);
    let category = "Optimal";
    let color = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    let meter = Math.min(Math.max(((val - 16) / (38 - 16)) * 100, 5), 95);

    if (val < 18.5) {
      category = "Underweight";
      color = "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    } else if (val >= 25 && val < 30) {
      category = "Overweight";
      color = "text-amber-400 bg-amber-500/10 border-amber-500/30";
    } else if (val >= 30) {
      category = "High BMI";
      color = "text-rose-400 bg-rose-500/10 border-rose-500/30";
    }
    return { val: val.toFixed(1), category, color, meter };
  }, [form.height, form.weight]);

  // Live BP Hemodynamics
  const bpStatus = useMemo(() => {
    const { ap_hi, ap_lo } = form;
    if (ap_hi < 120 && ap_lo < 80)
      return {
        label: "Normal Pressure",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        rate: 72,
      };
    if (ap_hi < 130 && ap_lo < 80)
      return {
        label: "Elevated Pressure",
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
        rate: 78,
      };
    if (ap_hi < 140 || ap_lo < 90)
      return {
        label: "Stage 1 Hypertension",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        rate: 84,
      };
    if (ap_hi >= 140 || ap_lo >= 90)
      return {
        label: "Stage 2 Hypertension",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        rate: 92,
      };
    return {
      label: "Hypertensive Crisis",
      color: "text-red-500 bg-red-600/20 border-red-600/40",
      rate: 104,
    };
  }, [form.ap_hi, form.ap_lo]);

  // Risk factor tags
  const activeRiskFactors = useMemo(() => {
    const factors = [];
    if (form.ap_hi >= 130 || form.ap_lo >= 85)
      factors.push({ name: "Blood Pressure Load", level: "critical" });
    if (form.cholesterol > 1)
      factors.push({ name: "Elevated Serum Cholesterol", level: "high" });
    if (form.gluc > 1)
      factors.push({ name: "High Glucose Level", level: "medium" });
    if (form.smoke === 1)
      factors.push({ name: "Tobacco Smoke Exposure", level: "high" });
    if (parseFloat(bmi.val) >= 27)
      factors.push({ name: `Elevated BMI (${bmi.val})`, level: "medium" });
    if (form.active === 0)
      factors.push({ name: "Physical Inactivity", level: "medium" });
    if (form.age >= 55)
      factors.push({ name: "Age Factor (55+)", level: "low" });
    return factors;
  }, [form, bmi]);

  // Execute Neural Health Scan
  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setResult(data);
      toast.success("Neural assessment complete!");
    } catch (err) {
      toast.error("Unable to connect to AI engine. Check API connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(DEFAULT_DATA);
    setResult(null);
    toast("Metrics reset to baseline");
  };

  const handleCopyReport = () => {
    if (!result) return;
    const report = `🫀 CARDIO-IQ BIOMETRIC REPORT
-----------------------------------------
• Prediction: ${result.risk === 1 ? "HIGH RISK DETECTED" : "OPTIMAL / LOW RISK"}
• Risk Probability: ${result.risk_percentage}%
• Vitals: BP ${form.ap_hi}/${form.ap_lo} mmHg (${bpStatus.label})
• Biometrics: BMI ${bmi.val} (${bmi.category}) | Age: ${form.age}
• Cholesterol: ${form.cholesterol === 1 ? "Normal" : form.cholesterol === 2 ? "Above Normal" : "High"}
• Glucose: ${form.gluc === 1 ? "Normal" : form.gluc === 2 ? "Above Normal" : "High"}
• Lifestyle: Smoke: ${form.smoke ? "Yes" : "No"} | Active: ${form.active ? "Yes" : "No"}
-----------------------------------------
AI Engine: CardioRisk Neural Assessment`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    toast.success("Biometric report copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black cyber-grid relative overflow-x-hidden">
      <Toaster position="top-right" richColors />

      {/* Ambient background neon glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none animate-pulse-slow" />

      {/* Futuristic HUD Header */}
      <header className="border-b border-cyan-500/20 bg-[#050814]/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-400 relative group shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Heart className="w-5 h-5 fill-cyan-400/20 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-white">
                  CARDIO<span className="text-cyan-400">IQ</span>
                </span>
                <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 tracking-widest uppercase">
                  NEURAL SCAN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight">
                Cardiovascular Biometric Intelligence
              </p>
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab("scanner")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                  activeTab === "scanner"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>AI Scan</span>
              </button>
              <button
                onClick={() => setActiveTab("simulator")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                  activeTab === "simulator"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Optimizer</span>
              </button>
            </div>

            <button
              onClick={resetForm}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 transition-all text-xs flex items-center gap-1"
              title="Reset metrics"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Cyber Waveform Status Bar */}
      <div className="bg-[#03060f]/90 border-b border-cyan-500/15 py-2 px-4 relative overflow-hidden backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              HEMODYNAMIC MONITOR
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="font-mono text-[11px] text-slate-300 hidden sm:inline">
              Estimated Rate: <strong className="text-cyan-300 font-bold">{bpStatus.rate}</strong> BPM
            </span>
          </div>

          {/* Animated Neon ECG Wave */}
          <div className="w-56 h-4 overflow-hidden relative hidden md:block opacity-70">
            <svg viewBox="0 0 200 20" className="w-full h-full stroke-cyan-400 fill-none stroke-[1.5]">
              <path d="M0,10 L30,10 L35,2 L40,18 L45,6 L50,14 L55,10 L100,10 L130,10 L135,2 L140,18 L145,6 L150,14 L155,10 L200,10" />
            </svg>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-slate-400">BP:</span>
            <span className="text-white font-bold">{form.ap_hi}/{form.ap_lo}</span>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", bpStatus.color)}>
              {bpStatus.label}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "scanner" && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Biometric Inputs (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Demographics Card */}
                <div className="hud-panel hud-card rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center border border-cyan-400/40">
                        01
                      </span>
                      Demographic Parameters
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Age */}
                    <div className="bg-[#080d1e]/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Age</span>
                        <span className="font-mono text-sm font-bold text-cyan-400">
                          {form.age} <span className="text-[10px] text-slate-500 font-normal">YRS</span>
                        </span>
                      </div>
                      <NeonSlider
                        min={18}
                        max={95}
                        value={form.age}
                        onChange={(v) => updateForm("age", v)}
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>18</span>
                        <span>95</span>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="bg-[#080d1e]/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <span className="text-xs text-slate-400 font-medium">Biological Sex</span>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => updateForm("gender", 1)}
                          className={cn(
                            "py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5",
                            form.gender === 1
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                              : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200"
                          )}
                        >
                          Female
                        </button>
                        <button
                          type="button"
                          onClick={() => updateForm("gender", 2)}
                          className={cn(
                            "py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5",
                            form.gender === 2
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                              : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200"
                          )}
                        >
                          Male
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Biometrics & Blood Pressure */}
                <div className="hud-panel hud-card rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center border border-cyan-400/40">
                        02
                      </span>
                      Physical Biometrics & Arterial Pressure
                    </h3>
                    <span className={cn("text-[11px] px-2.5 py-0.5 rounded-full border font-mono font-bold", bmi.color)}>
                      BMI: {bmi.val} ({bmi.category})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Height */}
                    <div className="bg-[#080d1e]/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Height</span>
                        <span className="font-mono text-sm font-bold text-cyan-400">
                          {form.height} <span className="text-[10px] text-slate-500 font-normal">CM</span>
                        </span>
                      </div>
                      <NeonSlider
                        min={120}
                        max={220}
                        value={form.height}
                        onChange={(v) => updateForm("height", v)}
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>120 cm</span>
                        <span>220 cm</span>
                      </div>
                    </div>

                    {/* Weight */}
                    <div className="bg-[#080d1e]/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Weight</span>
                        <span className="font-mono text-sm font-bold text-cyan-400">
                          {form.weight} <span className="text-[10px] text-slate-500 font-normal">KG</span>
                        </span>
                      </div>
                      <NeonSlider
                        min={40}
                        max={160}
                        value={form.weight}
                        onChange={(v) => updateForm("weight", v)}
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>40 kg</span>
                        <span>160 kg</span>
                      </div>
                    </div>

                    {/* Systolic BP */}
                    <div className="bg-[#080d1e]/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Systolic Pressure</span>
                        <span className="font-mono text-sm font-bold text-cyan-400">
                          {form.ap_hi} <span className="text-[10px] text-slate-500 font-normal">MMHG</span>
                        </span>
                      </div>
                      <NeonSlider
                        min={80}
                        max={220}
                        value={form.ap_hi}
                        onChange={(v) => updateForm("ap_hi", v)}
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>80</span>
                        <span>220</span>
                      </div>
                    </div>

                    {/* Diastolic BP */}
                    <div className="bg-[#080d1e]/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Diastolic Pressure</span>
                        <span className="font-mono text-sm font-bold text-cyan-400">
                          {form.ap_lo} <span className="text-[10px] text-slate-500 font-normal">MMHG</span>
                        </span>
                      </div>
                      <NeonSlider
                        min={50}
                        max={140}
                        value={form.ap_lo}
                        onChange={(v) => updateForm("ap_lo", v)}
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>50</span>
                        <span>140</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Biomarkers & Lifestyle */}
                <div className="hud-panel hud-card rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center border border-cyan-400/40">
                        03
                      </span>
                      Biomarkers & Lifestyle Habit Matrix
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Cholesterol */}
                    <div className="bg-[#080d1e]/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <span className="text-xs text-slate-400 font-medium">Serum Cholesterol</span>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { val: 1, label: "Normal" },
                          { val: 2, label: "Elevated" },
                          { val: 3, label: "High" },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => updateForm("cholesterol", opt.val)}
                            className={cn(
                              "py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border",
                              form.cholesterol === opt.val
                                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                                : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Glucose */}
                    <div className="bg-[#080d1e]/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <span className="text-xs text-slate-400 font-medium">Blood Glucose</span>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { val: 1, label: "Normal" },
                          { val: 2, label: "Elevated" },
                          { val: 3, label: "High" },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => updateForm("gluc", opt.val)}
                            className={cn(
                              "py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border",
                              form.gluc === opt.val
                                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                                : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <NeonToggle
                      icon={<Flame className="w-4 h-4 text-amber-400" />}
                      label="Tobacco Smoker"
                      checked={form.smoke === 1}
                      onChange={(c) => updateForm("smoke", c ? 1 : 0)}
                    />
                    <NeonToggle
                      icon={<Wine className="w-4 h-4 text-purple-400" />}
                      label="Alcohol Intake"
                      checked={form.alco === 1}
                      onChange={(c) => updateForm("alco", c ? 1 : 0)}
                    />
                    <NeonToggle
                      icon={<Dumbbell className="w-4 h-4 text-emerald-400" />}
                      label="Active Workout"
                      checked={form.active === 1}
                      onChange={(c) => updateForm("active", c ? 1 : 0)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: AI Scan Output (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* Trigger Scan Button */}
                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className={cn(
                    "w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group border",
                    loading
                      ? "bg-cyan-600/40 text-cyan-200 cursor-wait border-cyan-500/30"
                      : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-black font-extrabold border-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-[0.99]"
                  )}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full"
                      />
                      <span>INITIALIZING NEURAL ASSESSMENT...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-black" />
                      <span>INITIALIZE CARDIAC AI SCAN</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Circular HUD Risk Output */}
                <div className="hud-panel-glow rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                      Neural Diagnosis Output
                    </h4>
                    {result && (
                      <button
                        onClick={handleCopyReport}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                      >
                        <Share2 className="w-3 h-3" />
                        {copied ? "COPIED" : "EXPORT"}
                      </button>
                    )}
                  </div>

                  {!result ? (
                    <div className="py-12 px-4 text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative">
                        <Heart className="w-8 h-8 stroke-[1.5]" />
                        <div className="absolute inset-0 rounded-2xl bg-cyan-400/10 animate-ping opacity-30" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm font-bold text-white tracking-wide">
                          Awaiting Biometric Execution
                        </p>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                          Adjust your biometric parameters and execute the neural scan to generate an instant risk analysis.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Radial HUD Score Indicator */}
                      <div className="flex flex-col items-center justify-center py-2 relative">
                        <div className="relative w-44 h-44 flex items-center justify-center">
                          {/* Outer Rotating Glowing Ring */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              className="stroke-slate-800/80 fill-none stroke-[10]"
                            />
                            <motion.circle
                              cx="80"
                              cy="80"
                              r="70"
                              className={cn(
                                "fill-none stroke-[10] stroke-linecap-round",
                                result.risk === 1 ? "stroke-rose-500" : "stroke-cyan-400"
                              )}
                              strokeDasharray={440}
                              initial={{ strokeDashoffset: 440 }}
                              animate={{ strokeDashoffset: 440 - (440 * result.risk_percentage) / 100 }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                          </svg>

                          {/* Inner Score Label */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className={cn(
                              "text-3xl font-black font-mono tracking-tight",
                              result.risk === 1 ? "text-rose-400 glow-rose-text" : "text-cyan-300 glow-cyan-text"
                            )}>
                              {result.risk_percentage}%
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                              Risk Probability
                            </span>
                          </div>
                        </div>

                        {/* Status Pill Badge */}
                        <div className="mt-3">
                          <span
                            className={cn(
                              "px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border shadow-lg",
                              result.risk === 1
                                ? "bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-rose-500/20"
                                : "bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-cyan-500/20"
                            )}
                          >
                            {result.risk === 1 ? "⚠️ Elevated Risk Detected" : "✅ Optimal / Low Risk Profile"}
                          </span>
                        </div>
                      </div>

                      {/* Contributing Factors */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
                          Impact Breakdown:
                        </span>
                        {activeRiskFactors.length === 0 ? (
                          <p className="text-xs text-emerald-400 flex items-center gap-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Optimal health metrics across all vectors.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {activeRiskFactors.map((f, i) => (
                              <span
                                key={i}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/20 text-slate-200 font-semibold"
                              >
                                • {f.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Directives */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          Recommended Protocol:
                        </span>
                        <ul className="text-xs text-slate-300 space-y-1.5">
                          {result.risk === 1 ? (
                            <>
                              <li className="flex items-start gap-1.5">
                                <span className="text-rose-400 font-bold">•</span>
                                Schedule cardiovascular consultation with medical provider.
                              </li>
                              <li className="flex items-start gap-1.5">
                                <span className="text-rose-400 font-bold">•</span>
                                Implement sodium restriction & daily BP tracking.
                              </li>
                            </>
                          ) : (
                            <>
                              <li className="flex items-start gap-1.5">
                                <span className="text-cyan-400 font-bold">•</span>
                                Maintain regular aerobic exercise (150+ mins/week).
                              </li>
                              <li className="flex items-start gap-1.5">
                                <span className="text-cyan-400 font-bold">•</span>
                                Continue annual wellness and biomarker tracking.
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-500 leading-normal">
                    <strong className="text-slate-400">DISCLAIMER:</strong> AI screening platform for educational insights. Not a replacement for professional clinical evaluation.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: LIFESTYLE OPTIMIZER (WHAT-IF) */}
          {activeTab === "simulator" && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="hud-panel rounded-2xl p-6 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/40">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Interactive Lifestyle & Risk Optimizer
                    </h2>
                    <p className="text-xs text-slate-400">
                      Simulate real-time risk reduction by applying targeted clinical and lifestyle interventions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Mod 1 */}
                <div className="hud-panel hud-card rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Optimize Arterial Pressure</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Targeting optimal 120/80 mmHg blood pressure reduces immediate cardiac strain and risk score.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Target BP:</span>
                    <span className="text-cyan-400 font-bold">120/80 mmHg</span>
                  </div>
                  <button
                    onClick={() => {
                      updateForm("ap_hi", 120);
                      updateForm("ap_lo", 80);
                      setActiveTab("scanner");
                      toast.success("Applied BP target (120/80 mmHg). Click Initialize Scan!");
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-bold transition-all"
                  >
                    Apply Target & Scan
                  </button>
                </div>

                {/* Mod 2 */}
                <div className="hud-panel hud-card rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Smoking Cessation</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Eliminating tobacco reduces arterial inflammation and normalizes endothelial vascular elasticity.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold">Non-Smoker (0)</span>
                  </div>
                  <button
                    onClick={() => {
                      updateForm("smoke", 0);
                      setActiveTab("scanner");
                      toast.success("Applied Smoking Cessation. Click Initialize Scan!");
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-bold transition-all"
                  >
                    Apply Target & Scan
                  </button>
                </div>

                {/* Mod 3 */}
                <div className="hud-panel hud-card rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Dumbbell className="w-4 h-4 text-emerald-400" />
                    <span>Active Training & BMI ≤ 24</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Daily aerobic exercise combined with balanced body mass optimizes metabolic and lipid pathways.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Activity:</span>
                    <span className="text-emerald-400 font-bold">Active / 70 kg</span>
                  </div>
                  <button
                    onClick={() => {
                      updateForm("active", 1);
                      updateForm("weight", 70);
                      setActiveTab("scanner");
                      toast.success("Applied Active Habit & Normal Weight. Click Initialize Scan!");
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-bold transition-all"
                  >
                    Apply Target & Scan
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Neon Slider Component
function NeonSlider({ min, max, value, onChange }) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      min={min}
      max={max}
      step={1}
      onValueChange={(v) => onChange(v[0])}
      className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
    >
      <SliderPrimitive.Track className="bg-slate-800 relative grow rounded-full h-1.5 overflow-hidden">
        <SliderPrimitive.Range className="absolute bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full h-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block w-4 h-4 bg-cyan-300 rounded-full border-2 border-black shadow-[0_0_10px_rgba(6,182,212,0.9)] transition-transform focus:outline-none focus:scale-125 active:scale-125" />
    </SliderPrimitive.Root>
  );
}

// Neon Toggle Component
function NeonToggle({ icon, label, checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={cn(
        "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
        checked
          ? "bg-cyan-500/10 border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
      )}
    >
      <div className="flex items-center gap-2 font-medium text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onChange}
        className={cn(
          "w-8 h-4 rounded-full transition-colors relative focus:outline-none",
          checked ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "bg-slate-800"
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "block w-3 h-3 bg-black rounded-full transition-transform",
            checked ? "translate-x-4 bg-black" : "translate-x-0.5 bg-slate-400"
          )}
        />
      </SwitchPrimitive.Root>
    </div>
  );
}
