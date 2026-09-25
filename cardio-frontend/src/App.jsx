import { motion, useScroll, useTransform } from "framer-motion";
import { useState, forwardRef } from "react";
import { Heart, Activity, Shield, TrendingDown, ChevronRight, Sparkles, Check, AlertCircle, Star, Users, Zap, ArrowRight, BarChart3, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import './index.css' 

const getApiUrl = () => {
  let envUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (envUrl) {
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl;
    }
    if (envUrl.includes('.')) {
      return `https://${envUrl}`;
    }
    if (!envUrl.includes(':')) {
      return `https://${envUrl}.onrender.com`;
    }
    return `http://${envUrl}`;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return window.location.origin;
  }
  return 'http://localhost:8000';
};

const API_URL = getApiUrl();

// Utility function
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ========== Button Component ==========
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// ========== Slider Component ==========
const Slider = forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

// ========== Switch Component ==========
// ========== Switch Component ==========
const Switch = forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      // FIXED COLORS HERE:
      "data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-700", 
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;
// ========== Label Component ==========
const Label = forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

// ========== Select Components ==========
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

// ========== AnimatedHeart Component ==========
function AnimatedHeart() {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Pulsing rings */}
      <motion.div
        className="absolute w-64 h-64 rounded-full border-2 border-primary/30"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0.2, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full border-2 border-accent/30"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 0.3, 0.6],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full border-2 border-secondary/30"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Center heart with gradient and glow */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.svg
          width="200"
          height="200"
          viewBox="0 0 24 24"
          fill="none"
          className="drop-shadow-2xl"
          animate={{
            filter: [
              "drop-shadow(0 0 20px rgba(88, 101, 242, 0.5))",
              "drop-shadow(0 0 40px rgba(255, 107, 157, 0.7))",
              "drop-shadow(0 0 20px rgba(88, 101, 242, 0.5))",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop
                offset="0%"
                stopColor="#5865f2"
                animate={{
                  stopColor: ["#5865f2", "#ff6b9d", "#a855f7", "#5865f2"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              <motion.stop
                offset="50%"
                stopColor="#ff6b9d"
                animate={{
                  stopColor: ["#ff6b9d", "#a855f7", "#5865f2", "#ff6b9d"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              <motion.stop
                offset="100%"
                stopColor="#a855f7"
                animate={{
                  stopColor: ["#a855f7", "#5865f2", "#ff6b9d", "#a855f7"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
            </linearGradient>
          </defs>
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill="url(#heartGradient)"
            stroke="url(#heartGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent"
          style={{
            left: `${50 + Math.cos((i * Math.PI * 2) / 12) * 40}%`,
            top: `${50 + Math.sin((i * Math.PI * 2) / 12) * 40}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.8, 0],
            x: [0, Math.cos((i * Math.PI * 2) / 12) * 30],
            y: [0, Math.sin((i * Math.PI * 2) / 12) * 30],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 0.2,
          }}
        />
      ))}

      {/* ECG-style line animation */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-48 h-16 overflow-hidden">
        <svg width="192" height="64" viewBox="0 0 192 64" className="w-full h-full">
          <motion.path
            d="M 0 32 L 40 32 L 50 10 L 60 50 L 70 32 L 192 32"
            stroke="url(#heartGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
            transition={{
              pathLength: { duration: 2, repeat: Infinity, ease: "linear" },
              opacity: { duration: 2, repeat: Infinity, ease: "linear" },
            }}
          />
        </svg>
      </div>

      {/* Stats overlay */}
      <motion.div
        className="absolute top-10 right-10 glass-card px-4 py-2 rounded-xl"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="text-xs text-muted-foreground">Heart Rate</div>
        <motion.div
          className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          72 BPM
        </motion.div>
      </motion.div>
    </div>
  );
}

// ========== Main Landing Component ==========
export default function Landing() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [form, setForm] = useState({
    age: 30,
    gender: 1,
    height: 170,
    weight: 70,
    ap_hi: 120,
    ap_lo: 80,
    cholesterol: 1,
    gluc: 1,
    smoke: 0,
    alco: 0,
    active: 1,
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const calculateBMI = () => {
    const heightInMeters = form.height / 100;
    return (form.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBloodPressureCategory = () => {
    const { ap_hi: systolic, ap_lo: diastolic } = form;

    if (systolic < 120 && diastolic < 80) return "Normal";
    if (systolic < 130 && diastolic < 80) return "Elevated";
    if (systolic < 140 || diastolic < 90) return "Stage 1 High";
    if (systolic >= 140 || diastolic >= 90) return "Stage 2 High";
    if (systolic >= 180 || diastolic >= 120) return "Crisis";

    return "Check Required";
  };

  const submit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      setResult(data);
      toast.success("Assessment completed successfully");
    } catch (err) {
      toast.error("Failed to get prediction. Please check your connection.");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      age: 30,
      gender: 1,
      height: 170,
      weight: 70,
      ap_hi: 120,
      ap_lo: 80,
      cholesterol: 1,
      gluc: 1,
      smoke: 0,
      alco: 0,
      active: 1,
    });
    setResult(null);
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[90px]"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {!showAssessment ? (
        <HeroSection onStart={() => setShowAssessment(true)} opacity={opacity} />
      ) : (
        <AssessmentSection
          form={form}
          updateForm={updateForm}
          calculateBMI={calculateBMI}
          getBloodPressureCategory={getBloodPressureCategory}
          submit={submit}
          resetForm={resetForm}
          loading={loading}
          result={result}
          onBack={() => setShowAssessment(false)}
        />
      )}
    </div>
  );
}

// ========== Hero Section ==========
function HeroSection({ onStart, opacity }) {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="p-4 md:p-8"
      >
        <div className="max-w-7xl mx-auto glass-premium rounded-3xl px-6 py-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg glow-pulse">
                <Heart className="w-7 h-7 text-white" fill="white" />
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent text-gradient-animate">
                CardioPredict AI
              </span>
            </motion.div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-semibold hover:text-primary transition-all hover:scale-105">
                Features
              </a>
              <a href="#stats" className="text-sm font-semibold hover:text-accent transition-all hover:scale-105">
                Statistics
              </a>
              <a href="#about" className="text-sm font-semibold hover:text-secondary transition-all hover:scale-105">
                About
              </a>
              <Button
                size="sm"
                className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all shadow-lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left space-y-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 glass-card px-5 py-2.5 rounded-full mb-6 hover-scale">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-sm font-semibold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  AI-Powered Medical Intelligence
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.1] tracking-tight"
            >
              Predict Your
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent text-gradient-animate inline-block">
                Heart Health
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Leverage cutting-edge AI technology to analyze your vital health metrics and receive
              instant, accurate cardiovascular risk predictions. Your path to better heart health
              starts now.
            </motion.p>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button
                size="lg"
                onClick={onStart}
                className="glass-premium text-lg px-10 py-7 rounded-2xl hover:scale-105 transition-all duration-300 group shadow-2xl text-white bg-gradient-to-r from-primary to-accent border-0"
              >
                <Zap className="mr-2 w-6 h-6" />
                Start Free Assessment
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="glass-strong text-lg px-10 py-7 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg border-2"
              >
                <BarChart3 className="mr-2 w-5 h-5" />
                View Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-3 gap-6 max-w-xl mx-auto lg:mx-0 pt-8"
            >
              <TrustStat icon={<Users />} value="50K+" label="Users Trust Us" />
              <TrustStat icon={<Star />} value="98%" label="Accuracy Rate" />
              <TrustStat icon={<Shield />} value="100%" label="Data Security" />
            </motion.div>
          </div>

          {/* Right Column - 3D Visual */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, x: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden lg:block relative h-[600px]"
          >
            <div className="absolute inset-0 glass-card rounded-3xl overflow-hidden shadow-2xl">
              <AnimatedHeart />
            </div>
            {/* Floating Stats Cards */}
            <FloatingCard
              className="absolute top-10 -left-10"
              delay={0.8}
              icon={<Activity className="w-5 h-5 text-primary" />}
              label="Real-time Analysis"
              value="Instant"
            />
            <FloatingCard
              className="absolute bottom-20 -right-10"
              delay={1}
              icon={<TrendingDown className="w-5 h-5 text-accent" />}
              label="Risk Assessment"
              value="AI-Powered"
            />
          </motion.div>
        </div>
      </div>

      {/* Feature Cards */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="px-4 pb-20 relative z-10"
        style={{ opacity }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Activity className="w-10 h-10" />}
            title="Real-time Analysis"
            description="Lightning-fast AI predictions with comprehensive health insights in milliseconds"
            gradient="from-primary/20 to-accent/20"
            delay={0.8}
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10" />}
            title="Privacy First"
            description="Bank-level encryption ensures your sensitive health data remains completely secure"
            gradient="from-accent/20 to-secondary/20"
            delay={0.9}
          />
          <FeatureCard
            icon={<TrendingDown className="w-10 h-10" />}
            title="Actionable Insights"
            description="Receive personalized, evidence-based recommendations for optimal heart health"
            gradient="from-secondary/20 to-primary/20"
            delay={1}
          />
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        style={{ opacity }}
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-7 h-12 border-2 border-primary/60 rounded-full p-1.5 glass"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-3 bg-gradient-to-b from-primary to-accent rounded-full mx-auto"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function TrustStat({ icon, value, label }) {
  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div className="text-primary mb-1">{icon}</div>
      <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

function FloatingCard({
  className,
  delay,
  icon,
  label,
  value,
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`${className} glass-premium p-4 rounded-2xl shadow-xl backdrop-blur-md animate-float`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
          {icon}
        </div>
        <div>
          <div className="text-xs text-muted-foreground font-medium">{label}</div>
          <div className="text-sm font-bold">{value}</div>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay,
}) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass-premium p-8 rounded-3xl hover:glass-strong transition-all duration-300 group cursor-pointer shadow-xl"
    >
      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        <div className="text-primary group-hover:text-accent transition-colors">{icon}</div>
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-6 flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
        Learn more <ChevronRight className="ml-1 w-4 h-4" />
      </div>
    </motion.div>
  );
}

// ========== Assessment Section ==========
function AssessmentSection({
  form,
  updateForm,
  calculateBMI,
  getBloodPressureCategory,
  submit,
  resetForm,
  loading,
  result,
  onBack,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-4 md:p-8 relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="glass-premium rounded-3xl p-6 md:p-8 mb-6 shadow-2xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="glass-card hover:glass-strong rounded-xl"
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Health Assessment
                </h1>
                <p className="text-muted-foreground mt-2">
                  Provide your health metrics for AI-powered analysis
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              className="glass-card hover:glass-strong rounded-xl border-2"
            >
              Reset Form
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Info */}
            <FormSection title="Personal Information" icon={<Heart className="w-6 h-6" />}>
              <div className="grid md:grid-cols-2 gap-6">
                <SliderInput
                  label="Age"
                  min={18}
                  max={100}
                  value={form.age}
                  onChange={(v) => updateForm("age", v)}
                  unit="years"
                />
                <SelectInput
                  label="Gender"
                  value={form.gender}
                  onChange={(v) => updateForm("gender", v)}
                  options={[
                    { label: "Female", value: 0 },
                    { label: "Male", value: 1 },
                  ]}
                />
              </div>
            </FormSection>

            {/* Body Measurements */}
            <FormSection title="Body Measurements" icon={<Activity className="w-6 h-6" />}>
              <div className="grid md:grid-cols-2 gap-6">
                <SliderInput
                  label="Height"
                  min={140}
                  max={210}
                  value={form.height}
                  onChange={(v) => updateForm("height", v)}
                  unit="cm"
                />
                <SliderInput
                  label="Weight"
                  min={40}
                  max={150}
                  value={form.weight}
                  onChange={(v) => updateForm("weight", v)}
                  unit="kg"
                />
              </div>
              <InfoBox label="Body Mass Index (BMI)" value={`${calculateBMI()} kg/m²`} />
            </FormSection>

            {/* Blood Pressure */}
            <FormSection title="Blood Pressure" icon={<TrendingDown className="w-6 h-6" />}>
              <div className="grid md:grid-cols-2 gap-6">
                <SliderInput
                  label="Systolic (Upper)"
                  min={90}
                  max={200}
                  value={form.ap_hi}
                  onChange={(v) => updateForm("ap_hi", v)}
                  unit="mmHg"
                />
                <SliderInput
                  label="Diastolic (Lower)"
                  min={60}
                  max={130}
                  value={form.ap_lo}
                  onChange={(v) => updateForm("ap_lo", v)}
                  unit="mmHg"
                />
              </div>
              <InfoBox label="BP Category" value={getBloodPressureCategory()} />
            </FormSection>

            {/* Health Indicators */}
            <FormSection title="Health Indicators" icon={<Shield className="w-6 h-6" />}>
              <div className="grid md:grid-cols-2 gap-6">
                <SelectInput
                  label="Cholesterol Level"
                  value={form.cholesterol}
                  onChange={(v) => updateForm("cholesterol", v)}
                  options={[
                    { label: "Normal", value: 1 },
                    { label: "Above Normal", value: 2 },
                    { label: "Well Above Normal", value: 3 },
                  ]}
                />
                <SelectInput
                  label="Glucose Level"
                  value={form.gluc}
                  onChange={(v) => updateForm("gluc", v)}
                  options={[
                    { label: "Normal", value: 1 },
                    { label: "Above Normal", value: 2 },
                    { label: "Well Above Normal", value: 3 },
                  ]}
                />
              </div>
            </FormSection>

            {/* Lifestyle */}
            <FormSection title="Lifestyle Factors" icon={<Sparkles className="w-6 h-6" />}>
              <div className="space-y-4">
                <ToggleInput
                  label="Smoker"
                  description="Currently smoking tobacco"
                  value={form.smoke}
                  onChange={(v) => updateForm("smoke", v)}
                />
                <ToggleInput
                  label="Alcohol Consumption"
                  description="Regular alcohol intake"
                  value={form.alco}
                  onChange={(v) => updateForm("alco", v)}
                />
                <ToggleInput
                  label="Physically Active"
                  description="Regular physical activity"
                  value={form.active}
                  onChange={(v) => updateForm("active", v)}
                />
              </div>
            </FormSection>

            {/* Submit Button */}
            <Button
              size="lg"
              onClick={submit}
              disabled={loading}
              className="w-full glass-premium text-xl py-8 rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-2xl text-white bg-gradient-to-r from-primary via-accent to-secondary border-0"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-white border-t-transparent rounded-full mr-3"
                  />
                  Analyzing Your Health Data...
                </>
              ) : (
                <>
                  <Zap className="mr-3 w-6 h-6" />
                  Predict Cardiovascular Risk
                  <ArrowRight className="ml-3 w-6 h-6" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="glass-premium rounded-3xl p-6 md:p-8 sticky top-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                Assessment Results
              </h2>

              {!result ? (
                <div className="text-center py-16">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 rounded-full glass-card flex items-center justify-center mx-auto mb-6 shadow-lg"
                  >
                    <Heart className="w-12 h-12 text-primary" />
                  </motion.div>
                  <p className="text-muted-foreground leading-relaxed">
                    Complete the assessment form and submit to receive your personalized cardiovascular
                    risk analysis powered by AI
                  </p>
                </div>
              ) : (
                <ResultsDisplay result={result} />
              )}

              {/* Disclaimer */}
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex items-start gap-3 text-xs text-muted-foreground glass p-4 rounded-xl">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-accent" />
                  <p className="leading-relaxed">
                    <strong className="font-semibold text-foreground">Medical Disclaimer:</strong>{" "}
                    This assessment tool is designed for educational purposes only and should not
                    replace professional medical advice, diagnosis, or treatment.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function FormSection({
  title,
  icon,
  children,
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="glass-card rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all"
    >
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
          <div className="text-primary">{icon}</div>
        </div>
        {title}
      </h3>
      <div className="space-y-6">{children}</div>
    </motion.div>
  );
}

function SliderInput({
  label,
  min,
  max,
  value,
  onChange,
  unit,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-foreground">{label}</Label>
        <span className="text-base font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {value} {unit}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        className="cursor-pointer"
      />
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <Select value={value.toString()} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="glass-card border-border/50 h-12 rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass-strong rounded-xl">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value.toString()} className="rounded-lg">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ToggleInput({ label, description, value, onChange }) {
  return (
    <div 
      className="flex items-center justify-between p-4 glass rounded-xl border border-white/10 hover:border-primary/30 transition-all cursor-pointer group"
      onClick={() => onChange(value === 1 ? 0 : 1)}
    >
      <div className="space-y-1">
        <Label className="text-base font-semibold cursor-pointer text-white group-hover:text-primary transition-colors">
          {label}
        </Label>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Status Text Indicator */}
        <span className={`text-sm font-bold px-2 py-1 rounded-md transition-colors ${
          value === 1 
            ? "text-blue-400 bg-blue-400/10" 
            : "text-slate-500"
        }`}>
          {value === 1 ? "Yes" : "No"}
        </span>

        {/* The Switch Component */}
        <Switch
          checked={value === 1}
          onCheckedChange={(checked) => onChange(checked ? 1 : 0)}
        />
      </div>
    </div>
  );
}
function InfoBox({ label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-xl p-5 flex items-center justify-between shadow-md"
    >
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <span className="text-base font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {value}
      </span>
    </motion.div>
  );
}

function ResultsDisplay({ result }) {
  const isHighRisk = result.risk;
  const probability = (result.probability * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Risk Status */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className={`p-6 rounded-2xl shadow-lg ${
          isHighRisk
            ? "bg-gradient-to-br from-destructive/20 to-destructive/10 border-2 border-destructive/40"
            : "bg-gradient-to-br from-green-500/20 to-green-500/10 border-2 border-green-500/40"
        }`}
      >
        <div className="flex items-center gap-4 mb-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
              isHighRisk ? "bg-destructive/30" : "bg-green-500/30"
            }`}
          >
            {isHighRisk ? (
              <AlertCircle className="w-8 h-8 text-destructive" />
            ) : (
              <Check className="w-8 h-8 text-green-500" />
            )}
          </motion.div>
          <div>
            <h3 className={`text-2xl font-black ${isHighRisk ? "text-destructive" : "text-green-500"}`}>
              {isHighRisk ? "High Risk Detected" : "Low Risk Profile"}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              {isHighRisk ? "Medical consultation recommended" : "Maintain healthy lifestyle"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Risk Meter */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Risk Probability</span>
          <span className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {probability}%
          </span>
        </div>
        <div className="h-4 bg-muted/50 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${probability}%` }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
            className={`h-full rounded-full shadow-lg ${
              isHighRisk
                ? "bg-gradient-to-r from-destructive/70 to-destructive"
                : "bg-gradient-to-r from-green-500/70 to-green-500"
            }`}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>Low Risk</span>
          <span>Medium</span>
          <span>High Risk</span>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Personalized Recommendations
        </h4>
        <div className="space-y-3">
          {isHighRisk ? (
            <>
              <RecommendationItem text="Schedule immediate consultation with a cardiologist" priority="high" />
              <RecommendationItem text="Monitor blood pressure twice daily" priority="high" />
              <RecommendationItem text="Implement lifestyle modifications immediately" priority="medium" />
              <RecommendationItem text="Complete comprehensive cardiac screening" priority="medium" />
            </>
          ) : (
            <>
              <RecommendationItem text="Continue current healthy lifestyle habits" priority="low" />
              <RecommendationItem text="Maintain regular physical activity routine" priority="low" />
              <RecommendationItem text="Schedule annual preventive health check-ups" priority="low" />
              <RecommendationItem text="Monitor key health indicators quarterly" priority="low" />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function RecommendationItem({ text, priority }) {
  const colors = {
    high: "text-destructive",
    medium: "text-accent",
    low: "text-primary",
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 text-sm glass p-4 rounded-xl hover:glass-strong transition-all"
    >
      <Check className={`w-5 h-5 ${colors[priority]} mt-0.5 flex-shrink-0`} />
      <span className="leading-relaxed font-medium">{text}</span>
    </motion.div>
  );
}
