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
      scrollToSlide(currentSlideRef.current, false);
    };

    handleScroll();

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
        {/* SLIDE 1: Title / Company Purpose */}
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
              <ElixaLogo size={100} gradientFrom="#0077ED" gradientTo="#6366f1" />
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-7xl md:text-8xl font-bold tracking-tight text-foreground">
              ELIXA
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-2xl md:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light"
            >
              A workspace where businesses <span className="text-primary font-semibold">hire AI agents</span> to run
              functions—marketing, ops, finance, and more.
            </motion.p>

            <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              {[
                { icon: Clock, label: "60% Time Saved", desc: "on repetitive work" },
                { icon: TrendingUp, label: "3x Output", desc: "per team member" },
                { icon: Users, label: "Zero Headcount", desc: "pressure for growth" },
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

            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground mt-8">
              For SMBs, agencies, and operators ready to scale without the overhead.
            </motion.p>
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
                Scaling is <span className="text-rose-500">broken</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div variants={slideInLeft} className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground mb-6">Pain Points</h3>
                {[
                  {
                    icon: Layers,
                    title: "Tool Sprawl",
                    desc: "15+ disconnected SaaS tools, none talking to each other",
                  },
                  {
                    icon: DollarSign,
                    title: "Hiring Cost",
                    desc: "£50k+ per hire, 3-month ramp time, constant turnover",
                  },
                  { icon: Zap, title: "Execution Bottlenecks", desc: "Founders stuck doing ops instead of strategy" },
                  {
                    icon: X,
                    title: "Inconsistent Output",
                    desc: "Quality varies by who's available, not what's needed",
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
                <h3 className="text-xl font-semibold text-foreground mb-6">How They Do It Today</h3>
                <div className="space-y-3">
                  {[
                    { label: "Agencies", issue: "Expensive, slow, lack context" },
                    { label: "Freelancers", issue: "Inconsistent, hard to manage" },
                    { label: "Scattered SaaS", issue: "Tool fatigue, data silos" },
                    { label: "Internal Hires", issue: "Slow to onboard, expensive" },
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
                  <span className="font-bold text-2xl text-foreground">£180k+</span>
                  <span className="text-rose-600 text-sm block mt-1">avg. annual spend on workarounds</span>
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
                Hire AI agents that <span className="text-emerald-500">actually do the work</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Inside one unified workspace. No more tool hopping. No more hiring headaches.
              </p>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
              {[
                { before: "10+ tools, 50+ tabs", after: "One workspace", metric: "90% less context switching" },
                { before: "3-month hire ramp", after: "10-minute agent deploy", metric: "Instant productivity" },
                { before: "Variable quality", after: "Consistent excellence", metric: "24/7 reliability" },
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
                "It's like having a team of specialists, without the team"
              </div>
              <div className="text-muted-foreground">— Every founder's dream</div>
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 4: Why Now */}
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
                  title: "LLMs Can Now Execute",
                  desc: "GPT-4, Claude 3, Gemini—models finally capable of complex reasoning and tool use",
                  stat: "100x better than 2022",
                },
                {
                  icon: Workflow,
                  title: "Tool Calling Is Native",
                  desc: "Function calling, structured outputs, and API orchestration are now first-class features",
                  stat: "Reliable agentic loops",
                },
                {
                  icon: DollarSign,
                  title: "Inference Costs Crashed",
                  desc: "10x cheaper than 18 months ago, making multi-agent systems economically viable",
                  stat: "~$0.002 per task",
                },
                {
                  icon: Globe,
                  title: "Market Adoption Ready",
                  desc: "80% of businesses now use AI tools. The jump to AI workers is a small step.",
                  stat: "Mainstream acceptance",
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
                  The <span className="text-amber-600 font-semibold">infrastructure exists</span>. The{" "}
                  <span className="text-amber-600 font-semibold">market is ready</span>. We're building the{" "}
                  <span className="text-amber-600 font-semibold">interface</span>.
                </span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 5: Product Demo */}
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
                Product
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                The <span className="text-violet-500">Wow</span> Slide
              </h2>
              <p className="text-xl text-muted-foreground">
                Watch a complete workflow: request → plan → execute → deliver
              </p>
            </motion.div>

            <motion.div
              variants={scaleIn}
              className="bg-card backdrop-blur-xl border border-violet-200 rounded-3xl p-8 shadow-lg"
            >
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    1
                  </div>
                  <div className="flex-1 bg-muted/50 rounded-xl p-4 border border-border">
                    <div className="text-xs text-muted-foreground mb-2">USER REQUEST</div>
                    <div className="text-foreground">
                      "Create a weekly social media report and post engagement summary to Slack"
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold shrink-0">
                    2
                  </div>
                  <div className="flex-1 bg-violet-50 rounded-xl p-4 border border-violet-200">
                    <div className="text-xs text-violet-600 mb-2">AGENT PLAN</div>
                    <div className="text-foreground/80 space-y-1 text-sm">
                      {[
                        "Connect to social platforms",
                        "Pull engagement metrics",
                        "Generate visual report",
                        "Post to #marketing-updates",
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-violet-500" />
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                    3
                  </div>
                  <div className="flex-1 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <div className="text-xs text-emerald-600 mb-2">EXECUTING...</div>
                    <div className="flex flex-wrap gap-2">
                      {["Instagram API", "Twitter API", "LinkedIn API", "Chart Gen", "Slack Webhook"].map((tool) => (
                        <span
                          key={tool}
                          className="px-3 py-1 bg-emerald-100 rounded-full text-emerald-700 text-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold shrink-0">
                    4
                  </div>
                  <div className="flex-1 bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="text-xs text-amber-600 mb-2">OUTPUT READY</div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <div className="text-2xl font-bold text-foreground">+23%</div>
                        <div className="text-xs text-muted-foreground">Engagement</div>
                      </div>
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <div className="text-2xl font-bold text-foreground">12.4k</div>
                        <div className="text-xs text-muted-foreground">Impressions</div>
                      </div>
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <div className="text-2xl font-bold text-foreground">847</div>
                        <div className="text-xs text-muted-foreground">New Followers</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    5
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="text-xs text-primary mb-2">APPROVAL LOOP</div>
                    <div className="flex items-center gap-4">
                      <button className="px-4 py-2 bg-emerald-500 rounded-lg text-white text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve & Post
                      </button>
                      <button className="px-4 py-2 bg-muted rounded-lg text-foreground text-sm border border-border">
                        Edit
                      </button>
                      <button className="px-4 py-2 bg-muted rounded-lg text-foreground text-sm border border-border">
                        Schedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center text-muted-foreground">
              Total time: <span className="text-violet-600 font-semibold">47 seconds</span> — what used to take an
              intern 3 hours
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 6: How It Works - AI System & Trust */}
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
                Architecture
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                AI System + <span className="text-cyan-500">Trust</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Enterprise-grade safety with consumer-grade simplicity
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div variants={slideInLeft} className="bg-card border border-cyan-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-500" />
                  High-Level Architecture
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Agent Layer", desc: "Specialized AI workers with domain expertise" },
                    { label: "Tool Layer", desc: "200+ API integrations, webhooks, automations" },
                    { label: "Permission Layer", desc: "Granular access controls per agent/user" },
                    { label: "Audit Layer", desc: "Full logging of every action and decision" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 bg-cyan-50 rounded-lg border-l-4 border-cyan-500"
                    >
                      <div>
                        <div className="text-foreground font-medium">{item.label}</div>
                        <div className="text-muted-foreground text-sm">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={slideInRight} className="bg-card border border-cyan-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-500" />
                  Safety & Controls
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="text-emerald-600 font-semibold mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      What Agents CAN Do
                    </div>
                    <ul className="text-foreground/70 text-sm space-y-1">
                      <li>• Execute approved workflows</li>
                      <li>• Access connected tools/APIs</li>
                      <li>• Draft content for review</li>
                      <li>• Notify humans for edge cases</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                    <div className="text-rose-600 font-semibold mb-2 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      What Agents CAN'T Do
                    </div>
                    <ul className="text-foreground/70 text-sm space-y-1">
                      <li>• Spend money without approval</li>
                      <li>• Access data beyond scope</li>
                      <li>• Communicate externally unsupervised</li>
                      <li>• Override human decisions</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-4">
              {[
                { icon: Lock, label: "SOC 2 Type II", desc: "In progress" },
                { icon: Eye, label: "Full Audit Logs", desc: "Every action tracked" },
                { icon: Users, label: "Human-in-Loop", desc: "Approval workflows" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="text-center p-4 bg-card rounded-xl border border-border shadow-sm"
                >
                  <item.icon className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                  <div className="text-foreground font-medium">{item.label}</div>
                  <div className="text-muted-foreground text-sm">{item.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 7: Market Size */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-pink-50 via-white to-rose-50">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-pink-300/20 rounded-full blur-[120px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10 space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-pink-100 text-pink-600 border border-pink-200">
                Market
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                Market <span className="text-pink-500">Size</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div variants={slideInLeft} className="bg-card border border-pink-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-pink-500" />
                  Ideal Customer Profile
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      segment: "E-commerce Operators",
                      size: "2M+",
                      pain: "Order processing, customer service, inventory",
                    },
                    {
                      segment: "Digital Agencies",
                      size: "500k+",
                      pain: "Client deliverables, reporting, coordination",
                    },
                    { segment: "SMB Operators", size: "10M+", pain: "Marketing, finance, admin operations" },
                    { segment: "Startups (1-50)", size: "5M+", pain: "Do more with less, scale without hiring" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-4 bg-pink-50/50 rounded-lg border border-border hover:border-pink-300 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-foreground font-medium">{item.segment}</span>
                        <span className="text-pink-500 text-sm">{item.size} businesses</span>
                      </div>
                      <div className="text-muted-foreground text-sm">{item.pain}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={slideInRight} className="space-y-4">
                {[
                  {
                    label: "TAM",
                    title: "Total Addressable Market",
                    value: "$340B",
                    desc: "Global enterprise software + BPO",
                    color: "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200",
                  },
                  {
                    label: "SAM",
                    title: "Serviceable Available Market",
                    value: "$48B",
                    desc: "SMB automation + AI assistants",
                    color: "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200",
                  },
                  {
                    label: "SOM",
                    title: "Serviceable Obtainable Market",
                    value: "$2.4B",
                    desc: "English-speaking SMBs ready for AI agents",
                    color: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
                  },
                ].map((item, i) => (
                  <div key={i} className={`${item.color} border rounded-2xl p-6 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-muted-foreground text-sm">{item.label}</div>
                        <div className="text-foreground font-semibold">{item.title}</div>
                        <div className="text-muted-foreground text-sm mt-1">{item.desc}</div>
                      </div>
                      <div className="text-4xl font-bold text-foreground">{item.value}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-2xl p-6 text-center shadow-sm"
            >
              <div className="text-muted-foreground text-sm mb-2">5-Year Projection</div>
              <div className="text-3xl font-bold text-foreground">
                AI agent market growing at <span className="text-pink-500">47% CAGR</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 8: Competition */}
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
                    <th className="text-center py-4 px-4 text-muted-foreground font-medium">Multi-Agent</th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-medium">Work Execution</th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-medium">Unified Workspace</th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-medium">Marketplace</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Do Nothing", vals: [false, false, false, false] },
                    { name: "Hire Team", vals: [false, true, false, false] },
                    { name: "Agencies", vals: [false, true, false, false] },
                    { name: "Point Tools (Zapier, etc.)", vals: [false, false, false, true] },
                    { name: "Chatbots (ChatGPT, etc.)", vals: [false, false, false, false] },
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
              <h3 className="text-xl font-semibold text-foreground mb-6">Our Wedge</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "Multi-Agent Work Execution", desc: "Not just chat—agents that actually complete tasks" },
                  { title: "Unified Workspace", desc: "One place for all agents, tools, and outputs" },
                  { title: "Agent Marketplace", desc: "Install pre-built agents or create your own" },
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

        {/* SLIDE 9: Business Model & Pricing */}
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
                Simple, <span className="text-green-500">Scalable</span> Pricing
              </h2>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
              {[
                {
                  tier: "Starter",
                  price: "£20",
                  agents: "3 agents",
                  extra: "£10 per extra agent",
                  features: ["Core agent capabilities", "5GB storage", "Email support"],
                  popular: false,
                },
                {
                  tier: "Growth",
                  price: "£35",
                  agents: "6 agents",
                  extra: "£7 per extra agent",
                  features: ["Everything in Starter", "25GB storage", "Priority support", "Advanced analytics"],
                  popular: true,
                },
                {
                  tier: "Scale",
                  price: "£50",
                  agents: "10 agents",
                  extra: "£5 per extra agent",
                  features: [
                    "Everything in Growth",
                    "100GB storage",
                    "Dedicated success manager",
                    "Custom integrations",
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
                    <div className="text-muted-foreground text-sm">{plan.extra}</div>
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
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Add-Ons & Future Tiers</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { label: "Extra Storage", value: "£5/25GB" },
                  { label: "Slack Deploy", value: "£10/mo" },
                  { label: "Teams Deploy", value: "£10/mo" },
                  { label: "Workspace Tiering", value: "Coming Q2" },
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

        {/* SLIDE 10: Revenue Roadmap */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative print:break-after-page bg-gradient-to-br from-indigo-50 via-white to-violet-50">
          <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[120px]" />

          <motion.div
            className="max-w-6xl mx-auto relative z-10 space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-indigo-100 text-indigo-600 border border-indigo-200">
                Revenue
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                Phased <span className="text-indigo-500">Expansion</span>
              </h2>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
              {[
                {
                  phase: "Phase 1",
                  timeline: "Now - Q2 2025",
                  title: "Core Revenue",
                  items: ["Agent slot subscriptions", "Storage add-ons", "Usage-based pricing"],
                  revenue: "Primary MRR driver",
                  color: "border-indigo-200 bg-indigo-50/50",
                },
                {
                  phase: "Phase 2",
                  timeline: "Q3 - Q4 2025",
                  title: "Marketplace Revenue",
                  items: ["Developer subscriptions", "Agent marketplace fees", "Premium agent listings"],
                  revenue: "Platform take rate",
                  color: "border-purple-200 bg-purple-50/50",
                },
                {
                  phase: "Phase 3",
                  timeline: "2026+",
                  title: "Enterprise Expansion",
                  items: ["Workspace tiering", "Slack/Teams native apps", "Enterprise contracts"],
                  revenue: "Higher ACV deals",
                  color: "border-blue-200 bg-blue-50/50",
                },
              ].map((phase, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className={`bg-card border ${phase.color} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all`}
                >
                  <div className="text-indigo-600 text-sm font-semibold">{phase.phase}</div>
                  <div className="text-muted-foreground text-xs mb-2">{phase.timeline}</div>
                  <div className="text-xl font-bold text-foreground mb-4">{phase.title}</div>
                  <ul className="space-y-2 mb-4">
                    {phase.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-foreground/80 text-sm">
                        <ChevronRight className="w-4 h-4 text-indigo-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-border">
                    <span className="text-muted-foreground text-sm">{phase.revenue}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 11: Go-to-Market */}
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
                      channel: "Founder-Led Outbound",
                      desc: "Direct outreach to ICP via LinkedIn, email",
                      conversion: "12% reply rate",
                    },
                    {
                      channel: "Community Building",
                      desc: "Twitter/X, Reddit, Indie Hackers, Discord",
                      conversion: "Organic growth engine",
                    },
                    {
                      channel: "Strategic Partnerships",
                      desc: "Agency partnerships, tech integrations",
                      conversion: "Warm referrals",
                    },
                    {
                      channel: "Platform Integrations",
                      desc: "Shopify App Store, Slack Directory",
                      conversion: "Discovery at point of need",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-4 bg-rose-50/50 rounded-lg border border-border hover:border-rose-300 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-foreground font-medium">{item.channel}</span>
                        <span className="text-rose-500 text-xs">{item.conversion}</span>
                      </div>
                      <div className="text-muted-foreground text-sm">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={slideInRight} className="bg-card border border-rose-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-rose-500" />
                  Conversion Flywheel
                </h3>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
                    <div className="text-2xl font-bold text-foreground mb-2">Install 1 agent in 10 minutes</div>
                    <div className="text-muted-foreground">↓</div>
                    <div className="text-xl text-rose-500 mt-2">Expand to 6+ agents</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">72%</div>
                      <div className="text-muted-foreground text-xs">Day 1 activation</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">3.2</div>
                      <div className="text-muted-foreground text-xs">Avg agents/user</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">40%</div>
                      <div className="text-muted-foreground text-xs">Add agent week 2</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-6 text-center shadow-sm"
            >
              <div className="text-xl text-foreground">
                <span className="text-rose-500 font-semibold">Land & Expand:</span> Start with one agent, prove value,
                then become the operating system
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SLIDE 12: Traction */}
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
                Proof
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                Traction & <span className="text-teal-500">Validation</span>
              </h2>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid md:grid-cols-4 gap-6">
              {[
                { metric: "500+", label: "Waitlist Signups", trend: "+120 this week" },
                { metric: "12", label: "Pilot Customers", trend: "Active testing" },
                { metric: "89%", label: "Pilot Retention", trend: "Month 2+" },
                { metric: "4.8★", label: "NPS Score", trend: "From pilots" },
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

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div variants={slideInLeft} className="bg-card border border-teal-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-500" />
                  Pilot Case Studies
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      company: "E-commerce Brand (£2M ARR)",
                      result: "60% reduction in order processing time",
                      agent: "Ops Agent",
                    },
                    {
                      company: "Digital Agency (8 person)",
                      result: "3x client report throughput",
                      agent: "Reporting Agent",
                    },
                    {
                      company: "SaaS Startup (Seed)",
                      result: "Saved 20hrs/week on marketing tasks",
                      agent: "Marketing Agent",
                    },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-teal-50/50 rounded-lg border border-border">
                      <div className="text-foreground font-medium mb-1">{item.company}</div>
                      <div className="text-teal-600 text-sm mb-2">{item.result}</div>
                      <div className="text-muted-foreground text-xs">Using: {item.agent}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={slideInRight} className="bg-card border border-teal-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-teal-500" />
                  Usage Metrics
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Tasks Completed", value: "2,400+", period: "Last 30 days" },
                    { label: "Agent Messages", value: "15,000+", period: "Last 30 days" },
                    { label: "Avg Session Time", value: "23 min", period: "Per user" },
                    { label: "Weekly Active Users", value: "85%", period: "Of pilots" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                    >
                      <div>
                        <div className="text-foreground font-medium">{item.label}</div>
                        <div className="text-muted-foreground text-xs">{item.period}</div>
                      </div>
                      <div className="text-teal-600 font-bold text-xl">{item.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* SLIDE 13: Team + Ask */}
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
                    { name: "Founder Name", role: "CEO", bio: "Ex-[Company], built [product] to $XM ARR" },
                    { name: "Co-founder Name", role: "CTO", bio: "Ex-[Company], led engineering for [product]" },
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
                  <div className="text-muted-foreground text-sm mb-2">Combined Experience</div>
                  <div className="flex gap-2 flex-wrap">
                    {["AI/ML", "SaaS", "Scaling 0→1", "B2B Sales"].map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-primary/10 rounded-full text-primary text-sm">
                        {skill}
                      </span>
                    ))}
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
                    Raising <span className="text-indigo-500">£[X]M</span>
                  </h2>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8 mb-8 shadow-sm">
                  <div className="text-center mb-8">
                    <div className="text-5xl font-bold text-foreground mb-2">£[X]M</div>
                    <div className="text-muted-foreground">Seed Round</div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-foreground font-semibold">Use of Funds</h4>
                    {[
                      { label: "Engineering", percent: 50, desc: "Core platform + agent capabilities" },
                      { label: "Go-to-Market", percent: 30, desc: "Sales, marketing, partnerships" },
                      { label: "Operations", percent: 20, desc: "Infra, compliance, support" },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-foreground text-sm">{item.label}</span>
                          <span className="text-indigo-600 text-sm">{item.percent}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mb-1">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                        <div className="text-muted-foreground text-xs">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h4 className="text-foreground font-semibold mb-4">18-Month Milestones</h4>
                  <div className="space-y-2">
                    {["500 paying customers", "£500k ARR", "20+ agents in marketplace", "Series A ready"].map(
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
                <div className="text-2xl font-bold text-foreground">Let's build the future of work together.</div>
              </div>
              <div className="mt-6 text-muted-foreground">contact@elixa.ai • elixa.ai</div>
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
