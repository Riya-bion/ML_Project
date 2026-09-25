import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Stethoscope,
  ChevronRight,
  Info,
  SlidersHorizontal,
  Zap,
  Share2,
  FileText,
  Layers,
  Gauge,
  BrainCircuit,
  Flame,
  Wine,
  Dumbbell,
  Check,
  ArrowDownRight,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Resilient API URL resolver
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

// Curated interactive clinical presets
const PRESETS = [
  {
    id: "healthy",
    name: "Active Athlete",
    badge: "Low Risk",
    icon: "🏃",
    data: {
      age: 28,
      gender: 1,
      height: 170,
      weight: 62,
      ap_hi: 110,
      ap_lo: 70,
      cholesterol: 1,
      gluc: 1,
      smoke: 0,
      alco: 0,
      active: 1,
    },
  },
  {
    id: "moderate",
    name: "Average Adult",
    badge: "Moderate",
    icon: "💼",
    data: {
      age: 48,
      gender: 2,
      height: 175,
      weight: 78,
      ap_hi: 125,
      ap_lo: 82,
      cholesterol: 1,
      gluc: 1,
      smoke: 0,
      alco: 0,
      active: 1,
    },
  },
  {
    id: "elevated",
    name: "Sedentary Smoker",
    badge: "High Risk",
    icon: "🚬",
    data: {
      age: 54,
      gender: 2,
      height: 172,
      weight: 86,
      ap_hi: 142,
      ap_lo: 92,
      cholesterol: 2,
      gluc: 1,
      smoke: 1,
      alco: 1,
      active: 0,
    },
  },
  {
    id: "hypertension",
    name: "Stage-2 Hypertension",
    badge: "Critical",
    icon: "⚠️",
    data: {
      age: 62,
      gender: 1,
      height: 164,
      weight: 84,
      ap_hi: 160,
      ap_lo: 100,
      cholesterol: 3,
      gluc: 2,
      smoke: 0,
      alco: 0,
      active: 0,
    },
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("assessment"); // "assessment" | "simulator" | "model"
  const [form, setForm] = useState(PRESETS[1].data);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Calculated BMI with clinical spectrum
  const bmi = useMemo(() => {
    const h = form.height / 100;
    const val = form.weight / (h * h);
    let category = "Normal";
    let color = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    let pct = Math.min(Math.max(((val - 15) / (40 - 15)) * 100, 5), 95);

    if (val < 18.5) {
      category = "Underweight";
      color = "text-sky-400 bg-sky-500/10 border-sky-500/20";
    } else if (val >= 25 && val < 30) {
      category = "Overweight";
      color = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    } else if (val >= 30) {
      category = "Obese";
      color = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
    return { val: val.toFixed(1), category, color, pct };
  }, [form.height, form.weight]);

  // Calculated Blood Pressure status
  const bpStatus = useMemo(() => {
    const { ap_hi, ap_lo } = form;
    if (ap_hi < 120 && ap_lo < 80)
      return {
        label: "Normal",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        pulseRate: 72,
      };
    if (ap_hi < 130 && ap_lo < 80)
      return {
        label: "Elevated",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        pulseRate: 78,
      };
    if (ap_hi < 140 || ap_lo < 90)
      return {
        label: "Stage 1 High",
        color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
        pulseRate: 84,
      };
    if (ap_hi >= 140 || ap_lo >= 90)
      return {
        label: "Stage 2 High",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        pulseRate: 92,
      };
    return {
      label: "Hypertensive Crisis",
      color: "text-rose-500 bg-rose-600/20 border-rose-600/30",
      pulseRate: 105,
    };
  }, [form.ap_hi, form.ap_lo]);

  // Breakdown of active risk indicators
  const activeRiskFactors = useMemo(() => {
    const factors = [];
    if (form.ap_hi >= 130 || form.ap_lo >= 85)
      factors.push({ name: "High Blood Pressure", weight: 35, type: "high" });
    if (form.cholesterol > 1)
      factors.push({ name: "Elevated Cholesterol", weight: 25, type: "high" });
    if (form.gluc > 1)
      factors.push({ name: "High Blood Glucose", weight: 20, type: "medium" });
    if (form.smoke === 1)
      factors.push({ name: "Tobacco Smoking", weight: 18, type: "high" });
    if (parseFloat(bmi.val) >= 27)
      factors.push({ name: `Elevated BMI (${bmi.val})`, weight: 15, type: "medium" });
    if (form.active === 0)
      factors.push({ name: "Sedentary Lifestyle", weight: 12, type: "medium" });
    if (form.age >= 55)
      factors.push({ name: "Age > 55 Years", weight: 10, type: "low" });
    return factors;
  }, [form, bmi]);

  // Execute ML prediction
  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      toast.success("Cardiovascular risk analyzed successfully");
    } catch (err) {
      toast.error(
        "Could not connect to backend API. Please check your connection."
      );
      console.error("Prediction Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Preset loader
  const applyPreset = (preset) => {
    setForm(preset.data);
    setResult(null);
    toast.info(`Applied "${preset.name}" preset`);
  };

  const resetForm = () => {
    setForm(PRESETS[1].data);
    setResult(null);
    toast("Form reset to default parameters");
  };

  // Copy clinical summary report
  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `🩺 CardioRisk AI Assessment Report
--------------------------------------
• Risk Classification: ${result.risk === 1 ? "Elevated Risk (Positive)" : "Low Risk Profile (Negative)"}
• Risk Probability: ${result.risk_percentage}%
• Age/Gender: ${form.age} yrs / ${form.gender === 1 ? "Female" : "Male"}
• Blood Pressure: ${form.ap_hi}/${form.ap_lo} mmHg (${bpStatus.label})
• BMI: ${bmi.val} kg/m² (${bmi.category})
• Cholesterol: ${form.cholesterol === 1 ? "Normal" : form.cholesterol === 2 ? "Above Normal" : "High"}
• Glucose: ${form.gluc === 1 ? "Normal" : form.gluc === 2 ? "Above Normal" : "High"}
• Smoker: ${form.smoke ? "Yes" : "No"} | Alcohol: ${form.alco ? "Yes" : "No"} | Active: ${form.active ? "Yes" : "No"}
--------------------------------------
Model: XGBoost Clinical Decision Pipeline`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    toast.success("Assessment report copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white subtle-mesh">
      <Toaster position="top-right" richColors />

      {/* Modern Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 relative group">
              <Heart className="w-5 h-5 fill-blue-500/20 animate-pulse" />
              <div className="absolute -inset-0.5 rounded-xl bg-blue-500/20 blur opacity-40 group-hover:opacity-75 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  CardioRisk <span className="text-blue-400 font-mono">AI</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hidden sm:inline-block">
                  XGBoost v3.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Cardiovascular Risk Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("assessment")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                activeTab === "assessment"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Assessment</span>
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                activeTab === "simulator"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">What-If Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab("model")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                activeTab === "model"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Model Info</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetForm}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-colors text-xs flex items-center gap-1.5"
              title="Reset parameters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Live ECG Vitals Banner */}
      <div className="bg-slate-950/60 border-b border-slate-800/60 py-2 px-4 overflow-hidden relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-blue-400 font-mono text-[11px]">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Live Vitals Simulation
            </span>
            <span className="hidden sm:inline-block text-slate-600">|</span>
            <span className="font-mono text-[11px] text-slate-300">
              Est. Heart Rate: <strong className="text-white">{bpStatus.pulseRate}</strong> BPM
            </span>
          </div>

          {/* Animated ECG Pulse Line */}
          <div className="w-48 h-4 overflow-hidden relative hidden md:block opacity-60">
            <svg viewBox="0 0 200 20" className="w-full h-full stroke-blue-400 fill-none stroke-[1.5]">
              <path d="M0,10 L30,10 L35,2 L40,18 L45,6 L50,14 L55,10 L100,10 L130,10 L135,2 L140,18 L145,6 L150,14 L155,10 L200,10" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-400">
              BP Ratio: <span className="text-slate-200 font-semibold">{form.ap_hi}/{form.ap_lo}</span>
            </span>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-mono", bpStatus.color)}>
              {bpStatus.label}
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: MAIN ASSESSMENT */}
          {activeTab === "assessment" && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Presets Row */}
              <div className="glass-panel rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 pl-1">
                  <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                  <span>Clinical Patient Presets:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 group"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.name}</span>
                      <span className="text-[10px] opacity-60 font-mono">({preset.badge})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs Column (7 Cols) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Card 1: Demographics */}
                  <div className="glass-panel interactive-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-mono flex items-center justify-center border border-blue-500/30">
                          1
                        </span>
                        Demographics & Age
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Age Slider */}
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Patient Age</span>
                          <span className="font-mono text-sm font-semibold text-blue-400">
                            {form.age} <span className="text-[11px] text-slate-500 font-normal">years</span>
                          </span>
                        </div>
                        <MinimalSlider
                          min={18}
                          max={95}
                          value={form.age}
                          onChange={(v) => updateForm("age", v)}
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>18 yrs</span>
                          <span>95 yrs</span>
                        </div>
                      </div>

                      {/* Biological Sex */}
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                        <span className="text-xs text-slate-400">Biological Sex</span>
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => updateForm("gender", 1)}
                            className={cn(
                              "py-2 px-3 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5",
                              form.gender === 1
                                ? "bg-blue-600/20 border-blue-500/60 text-blue-300 font-semibold shadow-sm"
                                : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                            )}
                          >
                            <span>👩</span> Female
                          </button>
                          <button
                            type="button"
                            onClick={() => updateForm("gender", 2)}
                            className={cn(
                              "py-2 px-3 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5",
                              form.gender === 2
                                ? "bg-blue-600/20 border-blue-500/60 text-blue-300 font-semibold shadow-sm"
                                : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                            )}
                          >
                            <span>👨</span> Male
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Biometrics & Blood Pressure */}
                  <div className="glass-panel interactive-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-mono flex items-center justify-center border border-blue-500/30">
                          2
                        </span>
                        Biometrics & Blood Pressure
                      </h3>
                      <span className={cn("text-[11px] px-2.5 py-0.5 rounded-full border font-mono", bmi.color)}>
                        BMI: {bmi.val} ({bmi.category})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Height */}
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Height</span>
                          <span className="font-mono text-sm font-semibold text-blue-400">
                            {form.height} <span className="text-[11px] text-slate-500 font-normal">cm</span>
                          </span>
                        </div>
                        <MinimalSlider
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
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Weight</span>
                          <span className="font-mono text-sm font-semibold text-blue-400">
                            {form.weight} <span className="text-[11px] text-slate-500 font-normal">kg</span>
                          </span>
                        </div>
                        <MinimalSlider
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
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Systolic Pressure (Upper)</span>
                          <span className="font-mono text-sm font-semibold text-blue-400">
                            {form.ap_hi} <span className="text-[11px] text-slate-500 font-normal">mmHg</span>
                          </span>
                        </div>
                        <MinimalSlider
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
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Diastolic Pressure (Lower)</span>
                          <span className="font-mono text-sm font-semibold text-blue-400">
                            {form.ap_lo} <span className="text-[11px] text-slate-500 font-normal">mmHg</span>
                          </span>
                        </div>
                        <MinimalSlider
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

                  {/* Card 3: Lab Biomarkers & Lifestyle */}
                  <div className="glass-panel interactive-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-mono flex items-center justify-center border border-blue-500/30">
                          3
                        </span>
                        Biomarkers & Lifestyle Factors
                      </h3>
                    </div>

                    {/* Cholesterol and Glucose */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                        <span className="text-xs text-slate-400">Cholesterol</span>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { val: 1, label: "Normal" },
                            { val: 2, label: "Above" },
                            { val: 3, label: "High" },
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => updateForm("cholesterol", opt.val)}
                              className={cn(
                                "py-1.5 px-2 rounded-lg text-xs transition-all border",
                                form.cholesterol === opt.val
                                  ? "bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold"
                                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                        <span className="text-xs text-slate-400">Glucose</span>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { val: 1, label: "Normal" },
                            { val: 2, label: "Above" },
                            { val: 3, label: "High" },
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => updateForm("gluc", opt.val)}
                              className={cn(
                                "py-1.5 px-2 rounded-lg text-xs transition-all border",
                                form.gluc === opt.val
                                  ? "bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold"
                                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
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
                      <MinimalToggle
                        icon={<Flame className="w-3.5 h-3.5 text-amber-400" />}
                        label="Smoker"
                        checked={form.smoke === 1}
                        onChange={(c) => updateForm("smoke", c ? 1 : 0)}
                      />
                      <MinimalToggle
                        icon={<Wine className="w-3.5 h-3.5 text-purple-400" />}
                        label="Alcohol"
                        checked={form.alco === 1}
                        onChange={(c) => updateForm("alco", c ? 1 : 0)}
                      />
                      <MinimalToggle
                        icon={<Dumbbell className="w-3.5 h-3.5 text-emerald-400" />}
                        label="Active Habit"
                        checked={form.active === 1}
                        onChange={(c) => updateForm("active", c ? 1 : 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Results Column (5 Cols) */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Action Prediction Button */}
                  <button
                    onClick={handlePredict}
                    disabled={loading}
                    className={cn(
                      "w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 shadow-xl flex items-center justify-center gap-2.5 relative overflow-hidden group",
                      loading
                        ? "bg-blue-600/50 text-blue-200 cursor-wait"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white active:scale-[0.99] border border-blue-400/30 shadow-blue-500/20"
                    )}
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        <span>Evaluating Clinical Model...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Run Cardiovascular Assessment</span>
                        <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Results Card */}
                  <div className="glass-panel rounded-2xl p-5 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-blue-400" />
                        Risk Diagnosis & Probability
                      </h3>
                      {result && (
                        <button
                          onClick={handleCopyReport}
                          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono transition-colors"
                        >
                          <Share2 className="w-3 h-3" />
                          {copied ? "Copied!" : "Export Summary"}
                        </button>
                      )}
                    </div>

                    {!result ? (
                      <div className="py-10 px-4 text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                          <Heart className="w-7 h-7 stroke-[1.5]" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-200">
                            Ready for Analysis
                          </p>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                            Click the button above to calculate cardiovascular disease risk using our trained XGBoost pipeline.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Circular Meter + Score */}
                        <div
                          className={cn(
                            "p-4 rounded-xl border flex items-center justify-between",
                            result.risk === 1
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center text-lg",
                                result.risk === 1 ? "bg-rose-500/20" : "bg-emerald-500/20"
                              )}
                            >
                              {result.risk === 1 ? "⚠️" : "✅"}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm">
                                {result.risk === 1
                                  ? "High Risk Detected"
                                  : "Low Risk Profile"}
                              </h4>
                              <p className="text-xs opacity-80">
                                {result.risk === 1
                                  ? "Clinical follow-up advised"
                                  : "Maintain healthy routine"}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-2xl font-bold font-mono">
                              {result.risk_percentage}%
                            </span>
                            <p className="text-[10px] opacity-70 font-mono">PROBABILITY</p>
                          </div>
                        </div>

                        {/* Spectrum Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                            <span>Risk Threshold Meter</span>
                            <span>{result.risk_percentage}% / 100%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${result.risk_percentage}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={cn(
                                "h-full rounded-full",
                                result.risk === 1
                                  ? "bg-gradient-to-r from-amber-500 via-rose-500 to-red-600"
                                  : "bg-gradient-to-r from-teal-400 to-emerald-500"
                              )}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>0% (Optimal)</span>
                            <span className="text-amber-400/80">50% (Cutoff)</span>
                            <span>100%</span>
                          </div>
                        </div>

                        {/* Identified Factors */}
                        <div className="space-y-2">
                          <span className="text-xs text-slate-400 font-medium">
                            Clinical Factors Flagged:
                          </span>
                          {activeRiskFactors.length === 0 ? (
                            <p className="text-xs text-emerald-400/90 flex items-center gap-1.5 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              No major adverse risk factors detected.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {activeRiskFactors.map((f, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                                >
                                  • {f.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            Preventive Guidelines:
                          </span>
                          <ul className="text-xs text-slate-300 space-y-1.5 pl-1">
                            {result.risk === 1 ? (
                              <>
                                <li className="flex items-start gap-1.5">
                                  <span className="text-rose-400 font-bold">•</span>
                                  Consult a primary care physician or cardiologist.
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <span className="text-rose-400 font-bold">•</span>
                                  Log daily blood pressure readings for 2 weeks.
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <span className="text-rose-400 font-bold">•</span>
                                  Reduce dietary sodium and saturated fats.
                                </li>
                              </>
                            ) : (
                              <>
                                <li className="flex items-start gap-1.5">
                                  <span className="text-emerald-400 font-bold">•</span>
                                  Maintain 150 mins of moderate physical activity weekly.
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <span className="text-emerald-400 font-bold">•</span>
                                  Schedule standard annual lipid & glucose screenings.
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                      <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <p className="leading-normal">
                        <strong className="text-slate-300">Disclaimer:</strong> Screening support only. Not a substitute for diagnostic medical evaluation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: WHAT-IF SIMULATOR */}
          {activeTab === "simulator" && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="glass-panel rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Interactive "What-If" Scenario Simulator
                    </h2>
                    <p className="text-xs text-slate-400">
                      Explore how targeted lifestyle and clinical modifications directly reduce cardiovascular risk.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Scenario 1: Blood Pressure Optimization */}
                <div className="glass-panel interactive-card rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-200">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Optimize Blood Pressure</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Lowering systolic pressure to ≤120 mmHg and diastolic to ≤80 mmHg typically yields the largest single risk reduction in the model.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Target BP:</span>
                    <span className="text-emerald-400 font-bold">120/80 mmHg</span>
                  </div>
                  <button
                    onClick={() => {
                      updateForm("ap_hi", 120);
                      updateForm("ap_lo", 80);
                      setActiveTab("assessment");
                      toast.success("Applied optimal BP (120/80 mmHg). Click Analyze Risk!");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-medium transition-all"
                  >
                    Apply Scenario & Test
                  </button>
                </div>

                {/* Scenario 2: Smoking Cessation */}
                <div className="glass-panel interactive-card rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-200">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Smoking Cessation</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Eliminating tobacco reduces immediate vascular constriction and restores endothelial arterial elasticity over time.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Tobacco Status:</span>
                    <span className="text-emerald-400 font-bold">Non-Smoker (0)</span>
                  </div>
                  <button
                    onClick={() => {
                      updateForm("smoke", 0);
                      setActiveTab("assessment");
                      toast.success("Applied Smoking Cessation (Smoke = 0). Click Analyze Risk!");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-medium transition-all"
                  >
                    Apply Scenario & Test
                  </button>
                </div>

                {/* Scenario 3: Weight & Daily Exercise */}
                <div className="glass-panel interactive-card rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-200">
                    <Dumbbell className="w-4 h-4 text-emerald-400" />
                    <span>Active Habit & BMI ≤ 24</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Combining daily aerobic activity with a healthy BMI reduces systemic cardiac workload and improves glucose metabolism.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Activity / Weight:</span>
                    <span className="text-emerald-400 font-bold">Active / 68 kg</span>
                  </div>
                  <button
                    onClick={() => {
                      updateForm("active", 1);
                      updateForm("weight", 68);
                      setActiveTab("assessment");
                      toast.success("Applied Active Lifestyle & Normal BMI. Click Analyze Risk!");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-medium transition-all"
                  >
                    Apply Scenario & Test
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: MODEL & DATASET INFO */}
          {activeTab === "model" && (
            <motion.div
              key="model"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel rounded-2xl p-5 space-y-2">
                  <span className="text-xs text-slate-400 font-mono">MODEL ARCHITECTURE</span>
                  <p className="text-lg font-bold text-white">XGBoost Classifier</p>
                  <p className="text-xs text-slate-400">
                    Gradient boosted decision trees with calibrated probability outputs.
                  </p>
                </div>
                <div className="glass-panel rounded-2xl p-5 space-y-2">
                  <span className="text-xs text-slate-400 font-mono">TRAINING DATASET</span>
                  <p className="text-lg font-bold text-white">70,000 Patient Records</p>
                  <p className="text-xs text-slate-400">
                    Comprehensive clinical demographic, biometric, and lifestyle observations.
                  </p>
                </div>
                <div className="glass-panel rounded-2xl p-5 space-y-2">
                  <span className="text-xs text-slate-400 font-mono">INPUT FEATURES</span>
                  <p className="text-lg font-bold text-white">11 Clinical Features</p>
                  <p className="text-xs text-slate-400">
                    Systolic/Diastolic BP, Age, Gender, BMI, Cholesterol, Glucose, Habits.
                  </p>
                </div>
              </div>

              {/* Feature Importance Table */}
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Key Feature Weights in XGBoost Model
                </h3>

                <div className="space-y-3">
                  {[
                    { feature: "Systolic Blood Pressure (ap_hi)", weight: 38, color: "bg-rose-500" },
                    { feature: "Age (Years)", weight: 22, color: "bg-blue-500" },
                    { feature: "Cholesterol Level", weight: 18, color: "bg-cyan-500" },
                    { feature: "Weight / BMI", weight: 11, color: "bg-emerald-500" },
                    { feature: "Smoking & Lifestyle Status", weight: 7, color: "bg-amber-500" },
                    { feature: "Blood Glucose Level", weight: 4, color: "bg-purple-500" },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{item.feature}</span>
                        <span className="font-mono text-slate-400">{item.weight}% relative influence</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={cn("h-full rounded-full", item.color)}
                          style={{ width: `${item.weight * 2.5}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Minimal Slider Component
function MinimalSlider({ min, max, value, onChange }) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      min={min}
      max={max}
      step={1}
      onValueChange={(v) => onChange(v[0])}
      className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
    >
      <SliderPrimitive.Track className="bg-slate-800 relative grow rounded-full h-1.5">
        <SliderPrimitive.Range className="absolute bg-blue-500 rounded-full h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block w-4 h-4 bg-white rounded-full border-2 border-blue-500 shadow transition-transform focus:outline-none focus:scale-110 active:scale-125" />
    </SliderPrimitive.Root>
  );
}

// Minimal Toggle Switch Component
function MinimalToggle({ icon, label, checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={cn(
        "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
        checked
          ? "bg-blue-600/10 border-blue-500/50 text-blue-200"
          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onChange}
        className={cn(
          "w-8 h-4 rounded-full transition-colors relative focus:outline-none",
          checked ? "bg-blue-600" : "bg-slate-800"
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "block w-3 h-3 bg-white rounded-full transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </SwitchPrimitive.Root>
    </div>
  );
}
