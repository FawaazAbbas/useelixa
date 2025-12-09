import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  ArrowLeft,
  Users,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Globe,
  BarChart3,
  CheckCircle2,
  Rocket,
  ArrowRight,
  ChevronRight,
  Clock,
  DollarSign,
  Layers,
  Brain,
  Lock,
  Eye,
  Workflow,
  PieChart,
  Check,
  X,
  Bot,
  MessageSquare,
  Briefcase,
  Building2,
  Sparkles,
  Coffee,
  Moon,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ElixaLogo } from "@/components/ElixaLogo";
import { motion } from "framer-motion";
import { SlideProgressIndicator } from "@/components/pitch-deck/SlideProgressIndicator";
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
  slideInLeft,
  slideInRight,
} from "@/components/pitch-deck/slideAnimations";
import "@/styles/pitch-deck.css";

const PitchDeck = () => {
  const navigate = useNavigate();
  const deckRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideSectionsRef = useRef<HTMLElement[]>([]);
  const currentSlideRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const animationTimeoutRef = useRef<number | null>(null);
  const scrollAccumulatorRef = useRef(0);
  const wheelLockedRef = useRef(false);
  const wheelLockTimeoutRef = useRef<number | null>(null);
  const wheelUnlockTimeoutRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef(0);
  const SCROLL_THRESHOLD = 60;
  const SCROLL_COOLDOWN_MS = 800;
  const WHEEL_UNLOCK_DELAY_MS = 300;
  const WHEEL_LOCK_MS = 800;

  const handleExportPDF = () => {
    window.print();
  };

  const scrollToSlide = (index: number, smooth = true) => {
    const sections = slideSectionsRef.current;
    if (!sections.length) return;

    const clampedIndex = Math.min(Math.max(index, 0), sections.length - 1);
    const targetSection = sections[clampedIndex];
    if (!targetSection) return;

    isAnimatingRef.current = true;
    lastScrollTimeRef.current = Date.now();
    currentSlideRef.current = clampedIndex;
    setCurrentSlide(clampedIndex);

    const behavior: ScrollBehavior = smooth ? "smooth" : "auto";
    window.scrollTo({
      top: targetSection.offsetTop,
      behavior,
    });

    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = window.setTimeout(
      () => {
        isAnimatingRef.current = false;
      },
      smooth ? SCROLL_COOLDOWN_MS : 0,
    );
  };

  useEffect(() => {
    if (!deckRef.current) return;
    slideSectionsRef.current = Array.from(deckRef.current.querySelectorAll("section")) as HTMLElement[];

    const computeSlideScale = () => {
      const sections = slideSectionsRef.current;
      if (!sections.length) return;

      const availableHeight = Math.max(window.innerHeight - 40, 480);

      sections.forEach((section) => {
        const contentHeight = section.scrollHeight;
        const scale = contentHeight > availableHeight ? Math.max(0.7, availableHeight / contentHeight) : 1;
        section.style.setProperty("--slide-scale", scale.toString());
      });
    };

    const handleScroll = () => {
      const sections = slideSectionsRef.current;
      if (!sections.length) return;
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      const activeIndex = sections.findIndex((section) => scrollPosition < section.offsetTop + section.offsetHeight);
      const resolvedIndex = activeIndex === -1 ? sections.length - 1 : activeIndex;

      if (resolvedIndex !== currentSlideRef.current) {
        currentSlideRef.current = resolvedIndex;
        setCurrentSlide(resolvedIndex);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (!slideSectionsRef.current.length) return;
      event.preventDefault();

      if (isAnimatingRef.current || wheelLockedRef.current) return;

      scrollAccumulatorRef.current += event.deltaY;
      if (Math.abs(scrollAccumulatorRef.current) < SCROLL_THRESHOLD) {
        if (wheelUnlockTimeoutRef.current) {
          window.clearTimeout(wheelUnlockTimeoutRef.current);
        }
        wheelUnlockTimeoutRef.current = window.setTimeout(() => {
          scrollAccumulatorRef.current = 0;
        }, WHEEL_UNLOCK_DELAY_MS);
        return;
      }

      const direction = scrollAccumulatorRef.current > 0 ? 1 : -1;
      scrollAccumulatorRef.current = 0;

      wheelLockedRef.current = true;
      scrollToSlide(currentSlideRef.current + direction);

      if (wheelUnlockTimeoutRef.current) {
        window.clearTimeout(wheelUnlockTimeoutRef.current);
      }
      wheelUnlockTimeoutRef.current = window.setTimeout(() => {
        scrollAccumulatorRef.current = 0;
      }, SCROLL_COOLDOWN_MS);

      if (wheelLockTimeoutRef.current) {
        window.clearTimeout(wheelLockTimeoutRef.current);
      }
      wheelLockTimeoutRef.current = window.setTimeout(() => {
        wheelLockedRef.current = false;
      }, WHEEL_LOCK_MS);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

      if (["ArrowDown", "ArrowRight", "PageDown"].includes(event.key)) {
        event.preventDefault();
        scrollToSlide(currentSlideRef.current + 1);
      }
      if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        scrollToSlide(currentSlideRef.current - 1);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (event: TouchEvent) => {
      if (!event.touches[0]) return;
      touchStartY = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!slideSectionsRef.current.length) return;
      event.preventDefault();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!slideSectionsRef.current.length || !event.changedTouches[0]) return;
      const deltaY = touchStartY - event.changedTouches[0].clientY;
      if (Math.abs(deltaY) < 30) return;
      if (deltaY > 0) {
        scrollToSlide(currentSlideRef.current + 1);
      } else {
        scrollToSlide(currentSlideRef.current - 1);
      }
    };

    const handleResize = () => {
      computeSlideScale();
      scrollToSlide(currentSlideRef.current, false);
    };

    computeSlideScale();
    handleScroll();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(computeSlideScale);
      slideSectionsRef.current.forEach((section) => resizeObserver?.observe(section));
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
      if (wheelUnlockTimeoutRef.current) {
        window.clearTimeout(wheelUnlockTimeoutRef.current);
      }
      if (wheelLockTimeoutRef.current) {
        window.clearTimeout(wheelLockTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SlideProgressIndicator />
      {/* Controls */}
      <div className="print:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleExportPDF} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div ref={deckRef} className="pitch-deck-wrapper print:p-0" data-current-slide={currentSlide}>
        {/* SLIDE 1: Title - The Team That Never Sleeps */}
        <section className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden print:break-after-page pt-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[80px]" />
          </div>

          <motion.div
            className="relative z-10 text-center space-y-8 px-6 max-w-5xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={scaleIn} className="flex justify-center mb-6">
              <ElixaLogo size={120} gradientFrom="#0077ED" gradientTo="#6366f1" />
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-7xl md:text-8xl font-bold tracking-tight text-foreground">
              ELIXA
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-3xl md:text-4xl text-foreground max-w-4xl mx-auto leading-relaxed font-semibold"
            >
              The Team That <span className="text-primary">Never Sleeps</span>
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Hire AI employees that actually get work done. Your team, reimagined.
            </motion.p>

            <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              {[
                { icon: Moon, label: "24/7 Operations", desc: "Works while you sleep" },
                { icon: Bot, label: "95+ AI Agents", desc: "Ready to deploy" },
                { icon: Zap, label: "Instant Hiring", desc: "No onboarding needed" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <item.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                  <div className="text-2xl font-bold text-foreground mb-1">{item.label}</div>
                  <div className="text-muted-foreground">{item.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 2: Problem */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-rose-50 via-white to-orange-50">
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-rose-300/20 rounded-full blur-[100px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10 space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-rose-100 text-rose-600 border border-rose-200">
                The Problem
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                Growing a business is <span className="text-rose-500">exhausting</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div variants={slideInLeft} className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground mb-6">What Founders Face</h3>
                {[
                  {
                    icon: Clock,
                    title: "Never Enough Hours",
                    desc: "Founders work 80+ hour weeks and still can't keep up",
                  },
                  {
                    icon: DollarSign,
                    title: "Hiring is Expensive",
                    desc: "£50k+ per hire, months to onboard, risk of bad fit",
                  },
                  {
                    icon: Layers,
                    title: "Tool Overload",
                    desc: "15+ SaaS tools, none talking to each other",
                  },
                  {
                    icon: Coffee,
                    title: "Burnout Risk",
                    desc: "No one to delegate to, everything depends on you",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-card border border-rose-200 rounded-xl p-5 hover:border-rose-300 transition-all shadow-sm"
                  >
                    <div className="p-2 bg-rose-100 rounded-lg">
                      <item.icon className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <div className="text-foreground font-semibold">{item.title}</div>
                      <div className="text-muted-foreground text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={slideInRight} className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-6">Current "Solutions"</h3>
                <div className="space-y-3">
                  {[
                    { label: "Hire full-time", issue: "Slow, expensive, risky" },
                    { label: "Use freelancers", issue: "Inconsistent, hard to manage" },
                    { label: "Agency retainers", issue: "£5k+/month, lacks context" },
                    { label: "Do it yourself", issue: "Unsustainable, limits growth" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
                    >
                      <span className="text-foreground font-medium">{item.label}</span>
                      <span className="text-rose-500 text-sm">{item.issue}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-rose-50 border border-rose-200 rounded-lg text-center">
                  <span className="font-bold text-2xl text-foreground">67%</span>
                  <span className="text-rose-600 text-sm block mt-1">of SMBs cite lack of resources as #1 barrier to growth</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* SLIDE 3: Solution */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-[120px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10 space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-emerald-100 text-emerald-600 border border-emerald-200">
                The Solution
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                Your AI-powered <span className="text-emerald-500">workforce</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Elixa is a marketplace where you hire AI agents to run your business functions—marketing, customer service, finance, operations, and more.
              </p>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
              {[
                { before: "Hire in months", after: "Deploy in minutes", metric: "95+ ready-to-work agents" },
                { before: "£50k+ salaries", after: "Affordable subscriptions", metric: "Fraction of the cost" },
                { before: "9-5 availability", after: "24/7 operations", metric: "Never stops working" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="bg-card border border-emerald-200 rounded-2xl p-6 hover:border-emerald-300 transition-all shadow-sm"
                >
                  <div className="text-rose-400 text-sm line-through">{item.before}</div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground my-2" />
                  <div className="text-emerald-600 font-semibold text-lg">{item.after}</div>
                  <div className="pt-4 border-t border-border mt-4">
                    <div className="text-muted-foreground text-sm">{item.metric}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-8 text-center shadow-sm"
            >
              <div className="text-2xl text-foreground font-semibold mb-2">
                "Like having a team of specialists, available 24/7, without the overhead"
              </div>
              <div className="text-muted-foreground">— The future of work for SMBs</div>
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 4: How It Works */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-violet-50 via-white to-purple-50">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-violet-300/20 rounded-full blur-[120px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10 space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-violet-100 text-violet-600 border border-violet-200">
                How It Works
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                Three simple <span className="text-violet-500">steps</span>
              </h2>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Browse the Talent Pool",
                  desc: "Explore 95+ AI agents across 13 categories—marketing, finance, customer service, operations, and more.",
                  icon: Users,
                  color: "bg-violet-100 text-violet-600",
                },
                {
                  step: "2",
                  title: "Hire Your Team",
                  desc: "Install agents instantly. Connect your tools. They're ready to work in minutes, not months.",
                  icon: Bot,
                  color: "bg-purple-100 text-purple-600",
                },
                {
                  step: "3",
                  title: "Chat & Delegate",
                  desc: "Message your agents like colleagues. They execute tasks, report back, and learn your preferences.",
                  icon: MessageSquare,
                  color: "bg-indigo-100 text-indigo-600",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="bg-card border border-violet-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-6`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold text-violet-500 mb-2">Step {item.step}</div>
                  <div className="text-xl font-semibold text-foreground mb-3">{item.title}</div>
                  <div className="text-muted-foreground">{item.desc}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-card border border-violet-200 rounded-2xl p-8 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-foreground mb-6">The Unified Workspace</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { icon: MessageSquare, label: "Team Chat", desc: "Talk to all your agents" },
                  { icon: BarChart3, label: "Activity Logs", desc: "Full transparency" },
                  { icon: Workflow, label: "Automations", desc: "Set & forget workflows" },
                  { icon: Layers, label: "Integrations", desc: "60+ tools connected" },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 bg-violet-50 rounded-xl border border-violet-100">
                    <item.icon className="w-8 h-8 text-violet-500 mx-auto mb-2" />
                    <div className="text-foreground font-medium">{item.label}</div>
                    <div className="text-muted-foreground text-sm">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 5: Agent Categories */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-cyan-50 via-white to-sky-50">
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-300/20 rounded-full blur-[120px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10 space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-cyan-100 text-cyan-600 border border-cyan-200">
                AI Talent Pool
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                95+ Agents. <span className="text-cyan-500">13 Categories.</span>
              </h2>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Marketing", count: 18, color: "bg-purple-100 border-purple-200 text-purple-600" },
                { name: "Customer Service", count: 12, color: "bg-blue-100 border-blue-200 text-blue-600" },
                { name: "Sales", count: 10, color: "bg-green-100 border-green-200 text-green-600" },
                { name: "Finance", count: 8, color: "bg-orange-100 border-orange-200 text-orange-600" },
                { name: "Operations", count: 9, color: "bg-pink-100 border-pink-200 text-pink-600" },
                { name: "Analytics", count: 7, color: "bg-cyan-100 border-cyan-200 text-cyan-600" },
                { name: "E-commerce", count: 11, color: "bg-amber-100 border-amber-200 text-amber-600" },
                { name: "Development", count: 6, color: "bg-indigo-100 border-indigo-200 text-indigo-600" },
              ].map((cat, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className={`${cat.color} border rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all`}
                >
                  <div className="text-2xl font-bold">{cat.count}</div>
                  <div className="font-medium">{cat.name}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-card border border-cyan-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground mb-6">Example Agents</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Social Media Manager",
                    tasks: "Content creation, scheduling, engagement tracking",
                    category: "Marketing",
                  },
                  {
                    name: "Customer Support Agent",
                    tasks: "Ticket handling, FAQ responses, escalation management",
                    category: "Customer Service",
                  },
                  {
                    name: "Financial Analyst",
                    tasks: "Report generation, expense tracking, forecasting",
                    category: "Finance",
                  },
                ].map((agent, i) => (
                  <div key={i} className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-200 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{agent.name}</div>
                        <div className="text-xs text-cyan-600">{agent.category}</div>
                      </div>
                    </div>
                    <div className="text-muted-foreground text-sm">{agent.tasks}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 6: Why Now */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-amber-50 via-white to-orange-50">
          <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-amber-300/20 rounded-full blur-[100px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10 space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-amber-100 text-amber-600 border border-amber-200">
                Timing
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                Why <span className="text-amber-500">now?</span>
              </h2>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Brain,
                  title: "AI Can Finally Execute",
                  desc: "GPT-4, Claude, Gemini—models now capable of complex reasoning and reliable tool use",
                  stat: "100x better than 2022",
                },
                {
                  icon: Workflow,
                  title: "Tool Integration Is Native",
                  desc: "Function calling and structured outputs make multi-step automations reliable",
                  stat: "Consistent execution",
                },
                {
                  icon: DollarSign,
                  title: "Inference Costs Crashed",
                  desc: "10x cheaper than 18 months ago, making AI workers economically viable for SMBs",
                  stat: "$0.002 per task",
                },
                {
                  icon: Globe,
                  title: "SMBs Are AI-Ready",
                  desc: "80% of businesses now use AI tools. The jump to AI workers is the next natural step.",
                  stat: "Market adoption ready",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="bg-card border border-amber-200 rounded-2xl p-6 hover:border-amber-300 transition-all shadow-sm group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-all">
                      <item.icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-foreground font-semibold text-lg mb-2">{item.title}</div>
                      <div className="text-muted-foreground text-sm mb-4">{item.desc}</div>
                      <div className="inline-block px-3 py-1 bg-amber-100 rounded-full text-amber-700 text-sm">
                        {item.stat}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="inline-block bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-full px-8 py-4 shadow-sm">
                <span className="text-xl text-foreground">
                  The <span className="text-amber-600 font-semibold">AI infrastructure exists</span>. The{" "}
                  <span className="text-amber-600 font-semibold">market is ready</span>. We're building the{" "}
                  <span className="text-amber-600 font-semibold">interface</span>.
                </span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 7: Market Opportunity */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-[120px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10 space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                Market
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                Massive <span className="text-primary">Opportunity</span>
              </h2>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
              {[
                { size: "$500B", label: "Global SMB Software Spend", desc: "Growing 15% annually" },
                { size: "$150B", label: "Business Process Outsourcing", desc: "Ripe for AI disruption" },
                { size: "$50B", label: "AI Agent Market by 2028", desc: "From ~$5B today" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="bg-card border border-primary/20 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-all"
                >
                  <div className="text-4xl font-bold text-primary mb-2">{item.size}</div>
                  <div className="text-foreground font-medium mb-2">{item.label}</div>
                  <div className="text-muted-foreground text-sm">{item.desc}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground mb-6">Our Target: SMBs & Operators</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { segment: "E-commerce Brands", size: "5M+", pain: "Operations overwhelm" },
                  { segment: "Digital Agencies", size: "500K+", pain: "Margin pressure" },
                  { segment: "SaaS Startups", size: "1M+", pain: "Lean teams" },
                  { segment: "Professional Services", size: "3M+", pain: "Admin burden" },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-muted/50 rounded-xl text-center">
                    <div className="font-semibold text-foreground">{item.segment}</div>
                    <div className="text-primary font-bold text-lg">{item.size}</div>
                    <div className="text-muted-foreground text-sm">{item.pain}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 8: Competitive Landscape */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-orange-50 via-white to-amber-50">
          <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-orange-300/20 rounded-full blur-[120px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10 space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-orange-100 text-orange-600 border border-orange-200">
                Competition
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                Alternatives vs <span className="text-orange-500">Elixa</span>
              </h2>
            </motion.div>

            <motion.div
              variants={scaleIn}
              className="overflow-x-auto bg-card rounded-2xl border border-border shadow-sm"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Alternative</th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-medium">AI Workforce</th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-medium">Work Execution</th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-medium">Unified Workspace</th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-medium">Agent Marketplace</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "ChatGPT / Claude", vals: [false, false, false, false] },
                    { name: "Zapier / Make", vals: [false, false, false, true] },
                    { name: "Virtual Assistants", vals: [false, true, false, false] },
                    { name: "Hire Employees", vals: [false, true, false, false] },
                    { name: "Agency Retainers", vals: [false, true, false, false] },
                    { name: "Elixa", vals: [true, true, true, true], highlight: true },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-border ${row.highlight ? "bg-orange-50" : ""}`}>
                      <td
                        className={`py-4 px-6 ${row.highlight ? "text-orange-600 font-semibold" : "text-foreground"}`}
                      >
                        {row.name}
                      </td>
                      {row.vals.map((v, j) => (
                        <td key={j} className="text-center py-4 px-4">
                          {v ? (
                            <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-8 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-foreground mb-6">Our Unique Position</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "AI Employees, Not Tools", desc: "Agents that understand context and execute autonomously" },
                  { title: "Unified Team Experience", desc: "Chat with your entire AI workforce in one place" },
                  { title: "Pre-Built Talent Pool", desc: "95+ agents ready to hire—no custom development needed" },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="text-orange-600 font-semibold mb-1">{item.title}</div>
                    <div className="text-muted-foreground text-sm">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 9: Business Model */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-green-300/20 rounded-full blur-[120px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10 space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-green-100 text-green-600 border border-green-200">
                Business Model
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                Simple, <span className="text-green-500">Scalable</span> Revenue
              </h2>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
              {[
                {
                  tier: "Starter",
                  price: "£29",
                  agents: "5 agents",
                  features: ["Core capabilities", "Basic integrations", "Email support"],
                  popular: false,
                },
                {
                  tier: "Growth",
                  price: "£79",
                  agents: "15 agents",
                  features: ["Everything in Starter", "Advanced analytics", "Priority support", "Custom workflows"],
                  popular: true,
                },
                {
                  tier: "Scale",
                  price: "£199",
                  agents: "Unlimited agents",
                  features: [
                    "Everything in Growth",
                    "Dedicated success manager",
                    "Custom integrations",
                    "SLA guarantee",
                  ],
                  popular: false,
                },
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className={`relative bg-card border rounded-2xl p-6 shadow-sm ${plan.popular ? "border-green-400 ring-2 ring-green-200" : "border-border"}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 rounded-full text-white text-xs font-semibold">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <div className="text-muted-foreground text-sm">{plan.tier}</div>
                    <div className="text-4xl font-bold text-foreground mt-1">
                      {plan.price}
                      <span className="text-lg font-normal text-muted-foreground">/mo</span>
                    </div>
                    <div className="text-green-600 font-medium mt-2">{plan.agents}</div>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-foreground/80 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Revenue Expansion</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { label: "Usage-Based Add-ons", value: "AI credits" },
                  { label: "Platform Deployments", value: "Slack, Teams" },
                  { label: "Developer Marketplace", value: "Agent listings" },
                  { label: "Enterprise Contracts", value: "Custom deals" },
                ].map((addon, i) => (
                  <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-muted-foreground text-sm">{addon.label}</div>
                    <div className="text-foreground font-semibold">{addon.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 10: Go-to-Market */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-rose-50 via-white to-pink-50">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-rose-300/20 rounded-full blur-[120px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10 space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-rose-100 text-rose-600 border border-rose-200">
                GTM Strategy
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                Go-to-<span className="text-rose-500">Market</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div variants={slideInLeft} className="bg-card border border-rose-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-rose-500" />
                  Acquisition Channels
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      channel: "Content & SEO",
                      desc: "AI productivity content targeting SMB operators",
                      target: "Organic discovery",
                    },
                    {
                      channel: "Community Building",
                      desc: "Twitter/X, LinkedIn, Indie Hackers, Reddit",
                      target: "Founder communities",
                    },
                    {
                      channel: "Strategic Partnerships",
                      desc: "E-commerce platforms, SaaS tools, agencies",
                      target: "Distribution deals",
                    },
                    {
                      channel: "Product-Led Growth",
                      desc: "Free trial, viral loops, referrals",
                      target: "Self-serve adoption",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-4 bg-rose-50/50 rounded-lg border border-border hover:border-rose-300 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-foreground font-medium">{item.channel}</span>
                        <span className="text-rose-500 text-xs">{item.target}</span>
                      </div>
                      <div className="text-muted-foreground text-sm">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={slideInRight} className="bg-card border border-rose-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-rose-500" />
                  Land & Expand
                </h3>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
                    <div className="text-2xl font-bold text-foreground mb-2">Hire 1 agent in 10 minutes</div>
                    <div className="text-muted-foreground">↓</div>
                    <div className="text-xl text-rose-500 mt-2">Expand to full team of 10+</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">80%</div>
                      <div className="text-muted-foreground text-xs">Day 1 activation</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">5.2</div>
                      <div className="text-muted-foreground text-xs">Avg agents/user</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">45%</div>
                      <div className="text-muted-foreground text-xs">Upgrade week 2</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* SLIDE 11: Traction */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-teal-50 via-white to-cyan-50">
          <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-teal-300/20 rounded-full blur-[120px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10 space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-teal-100 text-teal-600 border border-teal-200">
                Traction
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                Early <span className="text-teal-500">Validation</span>
              </h2>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid md:grid-cols-4 gap-6">
              {[
                { metric: "2,400+", label: "Waitlist Signups", trend: "Growing 200+/week" },
                { metric: "95", label: "AI Agents Built", trend: "Across 13 categories" },
                { metric: "60+", label: "Integrations", trend: "Connected tools" },
                { metric: "4.8★", label: "Pilot Feedback", trend: "Early users" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="bg-card border border-teal-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all"
                >
                  <div className="text-4xl font-bold text-foreground mb-2">{item.metric}</div>
                  <div className="text-muted-foreground text-sm mb-2">{item.label}</div>
                  <div className="text-teal-500 text-xs">{item.trend}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-card border border-teal-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-500" />
                What We've Built
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: "AI Talent Pool Marketplace",
                    desc: "Full browse & discovery experience with 95+ agents across 13 categories",
                  },
                  {
                    title: "Unified Workspace",
                    desc: "Team chat, activity logs, automations, and full agent management",
                  },
                  {
                    title: "Integration Framework",
                    desc: "60+ connected tools including Google, Slack, Shopify, Stripe, and more",
                  },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-teal-50/50 rounded-xl border border-border">
                    <div className="font-semibold text-foreground mb-2">{item.title}</div>
                    <div className="text-muted-foreground text-sm">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 12: Team + Ask */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-300/20 rounded-full blur-[100px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <div className="grid md:grid-cols-2 gap-12">
              {/* Team */}
              <motion.div variants={slideInLeft}>
                <div className="space-y-4 mb-8">
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                    The Team
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                    Why <span className="text-primary">Us</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    { name: "Liam Baduss", role: "CEO & Founder", bio: "Building the future of AI-powered work" },
                  ].map((person, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 bg-card border border-primary/20 rounded-xl p-5 shadow-sm"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                        {person.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="text-foreground font-semibold">{person.name}</div>
                        <div className="text-primary text-sm">{person.role}</div>
                        <div className="text-muted-foreground text-sm mt-1">{person.bio}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-card rounded-xl border border-border shadow-sm">
                  <div className="text-muted-foreground text-sm mb-2">Vision</div>
                  <div className="text-foreground">
                    To make AI employees accessible to every business, enabling teams of any size to operate like Fortune 500 companies.
                  </div>
                </div>
              </motion.div>

              {/* The Ask */}
              <motion.div variants={slideInRight}>
                <div className="space-y-4 mb-8">
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-indigo-100 text-indigo-600 border border-indigo-200">
                    The Ask
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                    Let's <span className="text-indigo-500">Talk</span>
                  </h2>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8 mb-8 shadow-sm">
                  <div className="text-center mb-8">
                    <div className="text-3xl font-bold text-foreground mb-2">Seeking Strategic Partners</div>
                    <div className="text-muted-foreground">Investors who understand the future of work</div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-foreground font-semibold">What We're Building</h4>
                    {[
                      { label: "Product", desc: "Expanding agent capabilities & integrations" },
                      { label: "Growth", desc: "Scaling user acquisition & partnerships" },
                      { label: "Team", desc: "Hiring key engineering & GTM talent" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        <div>
                          <span className="text-foreground font-medium">{item.label}: </span>
                          <span className="text-muted-foreground">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h4 className="text-foreground font-semibold mb-4">12-Month Goals</h4>
                  <div className="space-y-2">
                    {["1,000 paying customers", "£1M ARR", "50+ agents in marketplace", "Enterprise pilot program"].map(
                      (milestone, i) => (
                        <div key={i} className="flex items-center gap-3 text-foreground/80">
                          <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                          {milestone}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="mt-16 text-center">
              <div className="inline-flex items-center gap-4">
                <ElixaLogo size={40} gradientFrom="#0077ED" gradientTo="#6366f1" />
                <div className="text-2xl font-bold text-foreground">The Team That Never Sleeps</div>
              </div>
              <div className="mt-6 text-muted-foreground">support@elixa.app • elixa.app</div>
            </motion.div>
          </motion.div>
        </section>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 0.5in; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};

export default PitchDeck;
