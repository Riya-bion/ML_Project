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
  TrendingUp,
  Stethoscope,
  ChevronRight,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as LabelPrimitive from "@radix-ui/react-label";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// API URL resolver supporting local, containerized, and Render environments
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

const PRESETS = {
  healthy: {
    name: "Low Risk Profile",
    data: {
      age: 32,
      gender: 1,
      height: 168,
      weight: 62,
      ap_hi: 115,
      ap_lo: 75,
      cholesterol: 1,
      gluc: 1,
      smoke: 0,
      alco: 0,
      active: 1,
    },
  },
  moderate: {
    name: "Average Adult",
    data: {
      age: 50,
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
  elevated: {
    name: "Elevated Risk",
    data: {
      age: 58,
      gender: 2,
      height: 172,
      weight: 88,
      ap_hi: 145,
      ap_lo: 92,
      cholesterol: 2,
      gluc: 2,
      smoke: 1,
      alco: 1,
      active: 0,
    },
  },
};

export default function App() {
  const [form, setForm] = useState(PRESETS.moderate.data);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const bmi = useMemo(() => {
    const h = form.height / 100;
    const val = form.weight / (h * h);
    let category = "Normal";
    let color = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (val < 18.5) {
      category = "Underweight";
      color = "text-amber-400 border-amber-500/30 bg-amber-500/10";
    } else if (val >= 25 && val < 30) {
      category = "Overweight";
      color = "text-amber-400 border-amber-500/30 bg-amber-500/10";
    } else if (val >= 30) {
      category = "Obese";
      color = "text-rose-400 border-rose-500/30 bg-rose-500/10";
    }
    return { val: val.toFixed(1), category, color };
  }, [form.height, form.weight]);

  const bpStatus = useMemo(() => {
    const { ap_hi, ap_lo } = form;
    if (ap_hi < 120 && ap_lo < 80)
      return {
        label: "Normal",
        color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      };
    if (ap_hi < 130 && ap_lo < 80)
      return {
        label: "Elevated",
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      };
    if (ap_hi < 140 || ap_lo < 90)
      return {
        label: "Stage 1 High",
        color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
      };
    if (ap_hi >= 140 || ap_lo >= 90)
      return {
        label: "Stage 2 High",
        color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      };
    return {
      label: "Critical",
      color: "text-rose-500 border-rose-600/30 bg-rose-600/10",
    };
  }, [form.ap_hi, form.ap_lo]);

  const activeRiskFactors = useMemo(() => {
    const factors = [];
    if (form.ap_hi >= 130 || form.ap_lo >= 85)
      factors.push("Elevated Blood Pressure");
    if (form.cholesterol > 1) factors.push("Elevated Cholesterol");
    if (form.gluc > 1) factors.push("Elevated Blood Glucose");
    if (form.smoke === 1) factors.push("Tobacco Smoker");
    if (form.active === 0) factors.push("Physical Inactivity");
    if (parseFloat(bmi.val) >= 28) factors.push("High BMI / Overweight");
    if (form.age >= 55) factors.push("Age Factor (55+)");
    return factors;
  }, [form, bmi]);

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
        "Could not connect to the API. Please ensure the backend is running."
      );
      console.error("Prediction Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (key) => {
    setForm(PRESETS[key].data);
    setResult(null);
    toast.info(`Loaded ${PRESETS[key].name} preset`);
  };

  const resetForm = () => {
    setForm(PRESETS.moderate.data);
    setResult(null);
    toast("Form reset to default parameters");
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Toaster position="top-right" richColors />

      {/* Clean Minimal Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Heart className="w-5 h-5 fill-blue-500/20" />
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-white flex items-center gap-2">
                CardioRisk <span className="text-blue-400 text-xs font-mono px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">AI</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono">
                XGBoost Clinical Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Connected
            </div>
            <button
              onClick={resetForm}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-colors text-xs flex items-center gap-1.5"
              title="Reset parameters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Preset Selector Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl minimal-card">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <span>Quick Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-white transition-all"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Clinical & Lifestyle Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Demographics Card */}
            <div className="minimal-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-blue-400 text-xs font-mono">
                    1
                  </span>
                  Demographics
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age Slider */}
                <div className="input-panel rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Age</span>
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
                    <span>18</span>
                    <span>95</span>
                  </div>
                </div>

                {/* Gender Toggle */}
                <div className="input-panel rounded-xl p-3.5 space-y-2">
                  <span className="text-xs text-slate-400">Biological Sex</span>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => updateForm("gender", 1)}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-medium border transition-all",
                        form.gender === 1
                          ? "bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold"
                          : "bg-slate-800/30 border-slate-800 text-slate-400 hover:text-slate-200"
                      )}
                    >
                      Female
                    </button>
                    <button
                      type="button"
                      onClick={() => updateForm("gender", 2)}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-medium border transition-all",
                        form.gender === 2
                          ? "bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold"
                          : "bg-slate-800/30 border-slate-800 text-slate-400 hover:text-slate-200"
                      )}
                    >
                      Male
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Biometrics & Vitals Card */}
            <div className="minimal-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-blue-400 text-xs font-mono">
                    2
                  </span>
                  Biometrics & Blood Pressure
                </h2>
                <span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-mono", bmi.color)}>
                  BMI: {bmi.val} ({bmi.category})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Height */}
                <div className="input-panel rounded-xl p-3.5 space-y-2">
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
                <div className="input-panel rounded-xl p-3.5 space-y-2">
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
                <div className="input-panel rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Systolic (Upper)</span>
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
                <div className="input-panel rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Diastolic (Lower)</span>
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

              <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">AHA Blood Pressure Status:</span>
                <span className={cn("px-2 py-0.5 rounded font-mono text-xs border", bpStatus.color)}>
                  {bpStatus.label} ({form.ap_hi}/{form.ap_lo} mmHg)
                </span>
              </div>
            </div>

            {/* 3. Biomarkers & Lifestyle Card */}
            <div className="minimal-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-blue-400 text-xs font-mono">
                    3
                  </span>
                  Lab Biomarkers & Habits
                </h2>
              </div>

              {/* Cholesterol & Glucose Segmented Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="input-panel rounded-xl p-3.5 space-y-2">
                  <span className="text-xs text-slate-400">Cholesterol Level</span>
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
                            : "bg-slate-800/30 border-slate-800 text-slate-400 hover:text-slate-200"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-panel rounded-xl p-3.5 space-y-2">
                  <span className="text-xs text-slate-400">Glucose Level</span>
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
                            : "bg-slate-800/30 border-slate-800 text-slate-400 hover:text-slate-200"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lifestyle Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <MinimalToggle
                  label="Smoker"
                  checked={form.smoke === 1}
                  onChange={(c) => updateForm("smoke", c ? 1 : 0)}
                />
                <MinimalToggle
                  label="Alcohol"
                  checked={form.alco === 1}
                  onChange={(c) => updateForm("alco", c ? 1 : 0)}
                />
                <MinimalToggle
                  label="Active Exercise"
                  checked={form.active === 1}
                  onChange={(c) => updateForm("active", c ? 1 : 0)}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Prediction Engine & Results (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Primary Action Button */}
            <button
              onClick={handlePredict}
              disabled={loading}
              className={cn(
                "w-full py-3.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg flex items-center justify-center gap-2",
                loading
                  ? "bg-blue-600/50 text-blue-200 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-500 text-white active:scale-[0.99] border border-blue-400/30"
              )}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Evaluating Risk Model...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Analyze Cardiovascular Risk</span>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </>
              )}
            </button>

            {/* Assessment Output Card */}
            <div className="minimal-card rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-400" />
                  Risk Assessment
                </h3>
                {result && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Confidence: High
                  </span>
                )}
              </div>

              {!result ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex items-center justify-center mx-auto text-slate-400">
                    <Heart className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-300">
                      Ready for Evaluation
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Click the button above to execute the XGBoost model across the current clinical metrics.
                    </p>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {/* Score Box */}
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
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            result.risk === 1 ? "bg-rose-500/20" : "bg-emerald-500/20"
                          )}
                        >
                          {result.risk === 1 ? (
                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {result.risk === 1
                              ? "Elevated Risk Detected"
                              : "Low Risk Profile"}
                          </h4>
                          <p className="text-xs opacity-80">
                            {result.risk === 1
                              ? "Clinical evaluation recommended"
                              : "Standard preventive maintenance"}
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

                    {/* Risk Bar Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>Risk Spectrum</span>
                        <span>{result.risk_percentage}% / 100%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.risk_percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full",
                            result.risk === 1
                              ? "bg-gradient-to-r from-amber-500 to-rose-500"
                              : "bg-gradient-to-r from-teal-500 to-emerald-400"
                          )}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0% (Low)</span>
                        <span>50% (Threshold)</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Contributing Risk Indicators */}
                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 font-medium">
                        Identified Clinical Factors:
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
                              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 font-medium"
                            >
                              • {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actionable Recommendations */}
                    <div className="space-y-2 pt-1 border-t border-slate-800/60">
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        Next Steps & Recommendations:
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1.5 pl-1">
                        {result.risk === 1 ? (
                          <>
                            <li className="flex items-start gap-1.5">
                              <span className="text-rose-400 font-bold">•</span>
                              Schedule a routine cardiovascular consultation with a physician.
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span className="text-rose-400 font-bold">•</span>
                              Monitor systolic/diastolic blood pressure weekly.
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span className="text-rose-400 font-bold">•</span>
                              Adopt a low-sodium Mediterranean dietary plan.
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              Maintain 150+ minutes of moderate aerobic activity weekly.
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              Keep annual wellness checks and biomarker screenings.
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="leading-normal">
                  <strong className="text-slate-300">Disclaimer:</strong> For educational & screening assistance. Not a substitute for professional clinical diagnosis.
                </p>
              </div>
            </div>
          </div>
        </div>
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
function MinimalToggle({ label, checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={cn(
        "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
        checked
          ? "bg-blue-600/10 border-blue-500/40 text-blue-200"
          : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
      )}
    >
      <span className="text-xs font-medium">{label}</span>
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
