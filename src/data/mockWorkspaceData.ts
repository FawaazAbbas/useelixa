import { mockAgents } from "./mockAgents";
import { brianMessages, brianFiles, brianMemories, brianActivity } from "./mockBrianChatData";

// Mock installed agents (subset of AI Talent Pool agents)
export const mockInstalledAgents = [
  mockAgents[0], // Customer Support Pro
  mockAgents[1], // Content Creator AI
  mockAgents[2], // Data Analyst Pro
  mockAgents[3], // Sales Assistant
  mockAgents[4], // Social Media Manager
];

// Re-export Brian chat data for use in components
export { brianMessages, brianFiles, brianMemories, brianActivity };

// Mock Brian conversation (converted from new format for backward compatibility)
export const mockBrianMessages = brianMessages.map(msg => ({
  role: msg.role,
  content: msg.content,
  timestamp: msg.timestamp,
  metadata: msg.file ? {
    files: [{
      name: msg.file.name,
      url: msg.file.url,
      type: msg.file.type,
      size: msg.file.size,
    }]
  } : undefined,
}));

// Mock direct chat messages for each agent
export const mockDirectChats = {
  "mock-1": {
    name: "Marketing Manager AI",
    messages: [
      // 1
      {
        id: "mm-1",
        content:
          "Good morning, Liam. I'm Marketing Manager AI. I can review performance data, optimise campaigns, generate creative direction, and structure your funnel strategy. How would you like to begin today?",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: "mm-2",
        content: "Morning. Give me a full performance overview from yesterday.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 60000).toISOString(),
      },
      {
        id: "mm-3",
        content:
          "Here is the performance breakdown for the last 24 hours:\n\n**Paid Ads**\n- CPA decreased by 8.4% day-over-day\n- iPhone 13 campaign delivered ROAS of 3.4\n- Pixel 7 campaigns underperformed; recommended to pause\n\n**Email**\n- Automation flows produced £7.1k\n- Campaign click-through rate was 3.3%, marginally above segment baseline\n\n**SEO**\n- ‘Best Refurb iPhone Deals’ moved from position 12 to 8\n\nPrimary opportunity today: improve the iPhone 13 conversion funnel. I can prepare a detailed plan if you want.",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 80000).toISOString(),
      },
      {
        id: "mm-4",
        content: "Yeah send me the funnel revamp plan.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 130000).toISOString(),
      },
      {
        id: "mm-5",
        content:
          "Here is the proposed structure for the iPhone 13 funnel upgrade:\n\n1. Redesign landing page with clearer value hierarchy\n2. Refresh ad creative set to align messaging with performance trends\n3. Update post-purchase and cart abandonment flows for this SKU\n4. Community/UGC push for authenticity\n\nIf approved, I will begin drafting the landing page outline next.",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 150000).toISOString(),
      },
      {
        id: "mm-6",
        content: "Do it.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 200000).toISOString(),
      },
      {
        id: "mm-7",
        content:
          "The outline is ready:\n\n**Hero Section** — concise value statement, trust indicators\n**Grade Breakdown** — clear distinctions between A, B, and C\n**Storage Comparison** — structured pricing table\n**Warranty + Reviews** — social proof consolidation\n\nI can develop full page copy if you want to move forward.",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 230000).toISOString(),
      },
      {
        id: "mm-8",
        content: "Yeah generate the copy.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 290000).toISOString(),
      },
      {
        id: "mm-9",
        content:
          "Copy is drafted. Here is the opening segment:\n\n**“Premium iPhone 13. Refurbished Properly.”**\nConsistent performance, verified quality, and a significantly lower price point.\n\nI can export the full page into structured sections if needed.",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 310000).toISOString(),
      },
      {
        id: "mm-10",
        content: "Send me the full page in sections.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 360000).toISOString(),
      },
      {
        id: "mm-11",
        content:
          "Section 1:\n\n**Why the iPhone 13 is the optimal choice**\nBalanced performance, strong battery life, and excellent resale value. This model is currently the most efficient upgrade pathway for the majority of buyers.\n\nReady for Section 2.",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 400000).toISOString(),
      },
      {
        id: "mm-12",
        content: "Send it.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 420000).toISOString(),
      },
      {
        id: "mm-13",
        content:
          "Section 2:\n\n**Grading Breakdown**\n- Grade A: Near-new with minimal cosmetic variance\n- Grade B: Excellent condition with minor signs of use\n- Grade C: Best budget option while maintaining core performance\n\nReady for Section 3.",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 450000).toISOString(),
      },
      {
        id: "mm-14",
        content: "Yes.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 470000).toISOString(),
      },
      {
        id: "mm-15",
        content:
          "Section 3:\n\n**Battery Health Guarantee**\nAll iPhone 13 units ship with a minimum of 88% battery health. Units failing this threshold undergo replacement prior to listing.\n\nSection 4 is ready.",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 495000).toISOString(),
      },
      {
        id: "mm-16",
        content: "Send it.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 520000).toISOString(),
      },
      {
        id: "mm-17",
        content:
          "Section 4:\n\n**Customer Feedback Consolidation**\nHighlight recent high-quality reviews specifically addressing the iPhone 13’s battery performance, camera quality, and physical condition.\n\nSection 5 available.",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 550000).toISOString(),
      },
      {
        id: "mm-18",
        content: "Yeah go on.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 580000).toISOString(),
      },
      {
        id: "mm-19",
        content:
          "Section 5:\n\n**12-Month Warranty Commitment**\nPosition the warranty as a differentiator — fewer competitors match a full-year guarantee on refurbished hardware.\n\nI can complete the final summary section next.",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 610000).toISOString(),
      },
      {
        id: "mm-20",
        content: "Yes finish it.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 640000).toISOString(),
      },
      {
        id: "mm-21",
        content:
          "Final Section:\n\n**Final Action Step**\nEncourage buyers to select grade and storage based on their intended usage patterns. Reinforce warranty, inspection, and battery health as core value propositions.\n\nLanding page structure is complete. I can begin drafting Figma-ready layouts when required.",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 670000).toISOString(),
      },
      {
        id: "mm-22",
        content: "Not yet. Give me 3 angles for new iPhone 13 ads.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 700000).toISOString(),
      },
      {
        id: "mm-23",
        content:
          "Three strategic angles based on current consumer behaviour:\n\n**1. Cost Efficiency** — Emphasise value relative to new retail pricing.\n**2. Performance Parity** — Demonstrate functional equivalence with new units.\n**3. Sustainability** — Focus on reduced environmental impact from refurbishment.\n\nI can expand these into scripts or static creative concepts.",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 735000).toISOString(),
      },
      {
        id: "mm-24",
        content: "Give me scripts.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 760000).toISOString(),
      },
      {
        id: "mm-25",
        content:
          "Drafting three short-form script structures:\n\n**Script A — Cost Breakdown**\nShow real pricing vs new retail, emphasise quality checks.\n\n**Script B — Side-by-Side Comparison**\nDemonstrate negligible visible difference between refurb and new.\n\n**Script C — Trust and Process Transparency**\nExplain refurbishment steps, testing, and warranty in a concise sequence.\n\nWhich script should I prioritise for visual assembly?",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 785000).toISOString(),
      },
      {
        id: "mm-26",
        content: "Do Script B first.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 810000).toISOString(),
      },
      {
        id: "mm-27",
        content:
          "Understood. I’ll prepare the shot list, caption variations, and on-screen messaging for Script B. Expected completion shortly. Do you want accompanying headline and body copy variants as well?",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 840000).toISOString(),
      },
      {
        id: "mm-28",
        content: "Yeah give me copy too.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 870000).toISOString(),
      },
      {
        id: "mm-29",
        content:
          "Copy variations are ready:\n\n**Headline Options**\n- ‘Why buy new?’\n- ‘Same performance. Lower cost.’\n- ‘Refurbished done properly.’\n\n**Body Options**\n- Quality-checked, warranty-backed, and ready for immediate dispatch.\n- Battery health guaranteed on every device.\n\n**CTA Options**\n- Shop Smart\n- Compare Grades\n- Upgrade for Less\n\nInform me if you want more variants.",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 900000).toISOString(),
      },
      {
        id: "mm-30",
        content: "That’s good. Start assembling everything.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 930000).toISOString(),
      },
    ],
  },
  "mock-2": {
    // Content Creator AI
    name: "Content Creator AI",
    messages: [
      {
        id: "cc-1",
        content:
          "Hey! I'm **Content Creator AI** ✍️\n\nI specialize in creating **engaging, SEO-optimized content** for:\n\n📝 Blog posts & articles\n📱 Social media posts\n📧 Email campaigns\n🎯 Ad copy & landing pages\n\nI maintain your brand voice and optimize for search engines. What content do you need today?",
        user_id: null,
        agent_id: "mock-2",
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: "cc-2",
        content: "I need 3 blog post ideas about AI automation",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 4 + 60000).toISOString(),
      },
      {
        id: "cc-3",
        content:
          'Great topic! Here are **3 compelling blog post ideas** about AI automation:\n\n---\n\n### 1. "The Ultimate Guide to AI Automation in 2024"\n**Angle:** Comprehensive resource\n**Target:** Business owners new to AI\n**Key Points:**\n- What is AI automation and why it matters\n- 7 processes you can automate today\n- ROI calculations and success metrics\n- Implementation roadmap\n\n**SEO Keywords:** AI automation guide, business automation tools, AI productivity\n\n---\n\n### 2. "5 AI Automation Myths That Are Costing Your Business"\n**Angle:** Myth-busting, fear-reducing\n**Target:** Skeptical decision-makers\n**Key Points:**\n- "AI will replace all jobs" (MYTH)\n- "AI automation is only for tech companies" (MYTH)\n- "Implementation takes years" (MYTH)\n- Real success stories\n- Getting started guide\n\n**SEO Keywords:** AI automation myths, AI misconceptions, automation benefits\n\n---\n\n### 3. "How We Saved 40 Hours Per Week With AI Automation (Case Study)"\n**Angle:** Personal story, actionable insights\n**Target:** Entrepreneurs and SMBs\n**Key Points:**\n- Our automation journey\n- Specific tools and workflows\n- Mistakes we made (and how to avoid them)\n- Measurable results\n- Your automation roadmap\n\n**SEO Keywords:** AI automation case study, business automation results, save time with AI\n\n---\n\nWant me to write a full draft for any of these?',
        user_id: null,
        agent_id: "mock-2",
        created_at: new Date(Date.now() - 3600000 * 4 + 65000).toISOString(),
      },
    ],
  },
  "mock-3": {
    // Data Analyst Pro
    name: "Data Analyst Pro",
    messages: [
      {
        id: "da-1",
        content:
          "Hello! I'm **Data Analyst Pro** 📊\n\nI turn your data into actionable insights with:\n\n📈 Advanced analytics & reporting\n🔮 Predictive modeling\n📉 Trend analysis\n💡 Business intelligence\n\nI can analyze sales, marketing, customer behavior, operations, and more. What data would you like me to examine?",
        user_id: null,
        agent_id: "mock-3",
        created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
      {
        id: "da-2",
        content: "Analyze last month's sales performance",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 6 + 90000).toISOString(),
      },
      {
        id: "da-3",
        content:
          "Here's your **comprehensive sales analysis** for last month:\n\n## 📈 Overall Performance\n\n**Total Revenue:** $142,580 (+23% MoM)\n**Total Deals:** 87 (+15% MoM)\n**Average Deal Size:** $1,639 (+7% MoM)\n**Conversion Rate:** 28% (+3% MoM)\n\n---\n\n## 🎯 Key Insights\n\n### ✅ What's Working\n1. **Enterprise deals** up 45% - focus on this segment\n2. **Email campaigns** have 34% conversion (vs 22% average)\n3. **Product demos** close at 62% rate\n4. **Referrals** drive highest LTV customers\n\n### ⚠️ Areas for Improvement\n1. **Cold outreach** conversion only 12%\n2. **Sales cycle** lengthened to 47 days (from 38)\n3. **Churn** increased to 8% (from 5%)\n4. **Q4 pipeline** needs attention - only $340K\n\n---\n\n## 💡 Recommendations\n\n1. **Double down on email campaigns** - highest ROI\n2. **Implement referral incentive program**\n3. **Investigate churn causes** - interview lost customers\n4. **Accelerate enterprise deals** with dedicated team\n5. **Improve cold outreach** messaging\n\n---\n\n## 📊 Top Performers\n\n1. Sarah J. - $47K revenue (18 deals)\n2. Mike T. - $39K revenue (24 deals)\n3. Lisa R. - $31K revenue (15 deals)\n\n---\n\nWant me to:\n- Deep dive into any metric?\n- Create forecasts for next quarter?\n- Build a performance dashboard?",
        user_id: null,
        agent_id: "mock-3",
        created_at: new Date(Date.now() - 3600000 * 6 + 95000).toISOString(),
      },
    ],
  },
  "mock-4": {
    // Sales Assistant
    name: "Sales Assistant",
    messages: [
      {
        id: "sa-1",
        content:
          "Hi there! I'm your **Sales Assistant** 💼\n\nI help you:\n\n🎯 Qualify and score leads\n📧 Automate follow-up sequences\n📊 Manage your sales pipeline\n🤝 Track deal progress\n💰 Forecast revenue\n\nWhat can I help you with today?",
        user_id: null,
        agent_id: "mock-4",
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: "sa-2",
        content: "Show me today's pipeline status",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 5 + 60000).toISOString(),
      },
      {
        id: "sa-3",
        content:
          "Here's your **pipeline snapshot** for today:\n\n## 📊 Pipeline Overview\n\n**Total Pipeline Value:** $847,500\n**Active Deals:** 23\n**Weighted Value:** $312,400 (37% avg close probability)\n\n---\n\n## 🔥 Hot Deals (Closing This Week)\n\n### 1. TechCorp - Enterprise Plan\n**Value:** $85,000/year\n**Stage:** Contract Review (90% close probability)\n**Next Step:** Legal review complete by Friday\n**Action:** Follow up tomorrow\n\n### 2. StartupHub - Professional Plan\n**Value:** $12,000/year\n**Stage:** Final Decision (75% close probability)\n**Next Step:** CEO approval pending\n**Action:** Send case study testimonials\n\n### 3. GrowthCo - Team Plan\n**Value:** $8,500/year\n**Stage:** Negotiation (60% close probability)\n**Next Step:** Price discussion\n**Action:** Prepare discount proposal\n\n---\n\n## ⚠️ At-Risk Deals\n\n**DataFlow Inc** - $45K - No response in 14 days\n*Recommended action:* Send re-engagement email with new value prop\n\n**CloudSystems** - $28K - Competitor evaluation in progress\n*Recommended action:* Schedule product comparison call\n\n---\n\n## 💡 Recommendations\n\n1. **Prioritize TechCorp** - Largest deal, highest probability\n2. **Re-engage DataFlow** - Don't let this slip away\n3. **Accelerate StartupHub** - Send decision-maker materials\n4. **20 new leads** need first contact this week\n\nWant me to draft any follow-up emails or update deal stages?",
        user_id: null,
        agent_id: "mock-4",
        created_at: new Date(Date.now() - 3600000 * 5 + 65000).toISOString(),
      },
      {
        id: "sa-4",
        content: "Draft a re-engagement email for DataFlow Inc",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 5 + 120000).toISOString(),
      },
      {
        id: "sa-5",
        content:
          "Perfect! Here's a **compelling re-engagement email** for DataFlow Inc:\n\n---\n\n**Subject:** Quick question about your automation goals\n\n*Hi [Contact Name],*\n\n*I wanted to reach out because I know you're evaluating solutions to streamline your data workflows.*\n\n*Since we last spoke, we've helped 3 companies similar to DataFlow reduce their data processing time by an average of 67%. I thought you might find these results interesting:*\n\n• **AnalyticsPro** - Cut report generation from 4 hours to 35 minutes\n• **DataStream** - Eliminated 80% of manual data entry\n• **MetricsHub** - Increased team productivity by 45%\n\n*I'd love to share how we achieved these results and explore if there's a fit for DataFlow.*\n\n*Are you available for a quick 15-minute call this week? I have slots on:*\n• *Tuesday 2 PM*\n• *Wednesday 11 AM*\n• *Thursday 3 PM*\n\n*If timing isn't right, no worries - I can send over a brief case study that's specific to your industry instead.*\n\n*Looking forward to connecting!*\n\n*[Your Name]*\n\n---\n\n**Why this works:**\n✅ Opens with their pain point (not your product)\n✅ Uses specific, measurable results\n✅ Social proof from similar companies\n✅ Low-commitment ask (15 min)\n✅ Provides an easy out with case study alternative\n\nShall I send this email now or would you like me to adjust anything?",
        user_id: null,
        agent_id: "mock-4",
        created_at: new Date(Date.now() - 3600000 * 5 + 125000).toISOString(),
      },
      {
        id: "sa-6",
        content: "Perfect, send it! Also, what are my top priorities for this week?",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 5 + 180000).toISOString(),
      },
      {
        id: "sa-7",
        content:
          "✅ **Email sent to DataFlow Inc!**\n\nHere are your **top sales priorities** for this week:\n\n## 🎯 Monday-Tuesday\n**PRIORITY 1:** Close TechCorp ($85K)\n- Follow up on legal review\n- Prepare contract signature logistics\n- Success probability: 90%\n\n**PRIORITY 2:** Accelerate StartupHub ($12K)\n- Send CEO decision-maker packet\n- Include 3 relevant case studies\n- Schedule final Q&A if needed\n\n## 🎯 Wednesday-Thursday\n**PRIORITY 3:** Rescue at-risk deals\n- DataFlow: Monitor email response\n- CloudSystems: Schedule comparison demo\n- Combined value: $73K\n\n**PRIORITY 4:** New lead outreach\n- 20 qualified leads need first contact\n- Focus on Enterprise segment (higher value)\n- Use personalized sequences\n\n## 🎯 Friday\n**PRIORITY 5:** Pipeline hygiene\n- Update all deal stages\n- Archive dead opportunities\n- Plan next week's strategy\n\n---\n\n**📈 Weekly Goals:**\n- Close minimum 2 deals ($97K+)\n- Move 5 deals to next stage\n- Book 8 new discovery calls\n- Response rate > 35%\n\n**🎉 Stretch Goal:** Close TechCorp + StartupHub = $97K in new ARR!\n\nI'll send you daily reminders and progress updates. Let's crush this week! 💪",
        user_id: null,
        agent_id: "mock-4",
        created_at: new Date(Date.now() - 3600000 * 5 + 185000).toISOString(),
      },
    ],
  },
  "mock-5": {
    // Social Media Manager
    name: "Social Media Manager",
    messages: [
      {
        id: "sm-1",
        content:
          "Hey! I'm your **Social Media Manager** 📱\n\nI handle everything social:\n\n📅 Content scheduling across all platforms\n📊 Performance analytics & insights\n🔍 Hashtag research & optimization\n💬 Engagement monitoring\n🎯 Audience growth strategies\n\nReady to boost your social presence?",
        user_id: null,
        agent_id: "mock-5",
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
      {
        id: "sm-2",
        content: "What's our social media performance this month?",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 8 + 60000).toISOString(),
      },
      {
        id: "sm-3",
        content:
          'Here\'s your **monthly social media report** 📊\n\n## 🎉 Overall Performance\n\n**Total Reach:** 127,500 (+34% vs last month)\n**Engagement Rate:** 4.8% (+1.2%)\n**New Followers:** 2,847 (+28%)\n**Total Engagement:** 6,120 interactions\n\n---\n\n## 📱 Platform Breakdown\n\n### LinkedIn\n**Followers:** 8,450 (+312)\n**Engagement Rate:** 6.2% (👑 Best performing!)\n**Top Post:** "5 AI Automation Mistakes" - 847 likes, 92 comments\n**Insight:** Professional content + controversy = 🔥\n\n### Twitter/X\n**Followers:** 12,200 (+445)\n**Engagement Rate:** 3.9%\n**Top Tweet:** Thread on "Future of Work" - 1.2K likes, 234 retweets\n**Insight:** Threads outperform single tweets by 3x\n\n### Instagram\n**Followers:** 6,890 (+278)\n**Engagement Rate:** 5.1%\n**Top Post:** Behind-the-scenes office culture - 524 likes\n**Insight:** Authentic content > stock photos\n\n### Facebook\n**Followers:** 4,320 (+98)\n**Engagement Rate:** 2.7% (Needs improvement)\n**Top Post:** Customer success story video - 312 reactions\n**Insight:** Video content performs 2x better\n\n---\n\n## 🏆 Top Content Categories\n\n1. **Tutorials & How-Tos** - 6.8% engagement\n2. **Case Studies** - 5.9% engagement  \n3. **Industry Insights** - 5.2% engagement\n4. **Company Culture** - 4.6% engagement\n5. **Product Updates** - 3.1% engagement\n\n---\n\n## 💡 Key Recommendations\n\n1. **Double down on LinkedIn** - Highest ROI platform\n2. **More video content** - 2-3x better performance\n3. **Increase Twitter threads** - Strong engagement\n4. **Boost Facebook strategy** - Currently underperforming\n5. **Post consistency:** Aim for daily LinkedIn, 3x/day Twitter\n\n---\n\n## 📅 This Week\'s Schedule\n\n**Monday:** LinkedIn article on automation trends\n**Tuesday:** Twitter thread on productivity hacks\n**Wednesday:** Instagram behind-the-scenes\n**Thursday:** LinkedIn case study post\n**Friday:** All platforms - weekly roundup\n\nWant me to adjust the content calendar or create new posts?',
        user_id: null,
        agent_id: "mock-5",
        created_at: new Date(Date.now() - 3600000 * 8 + 65000).toISOString(),
      },
      {
        id: "sm-4",
        content: "Great! Can you create 5 LinkedIn posts for this week?",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 8 + 120000).toISOString(),
      },
      {
        id: "sm-5",
        content:
          "Absolutely! Here are **5 high-performing LinkedIn posts** ready to schedule:\n\n---\n\n### 📌 POST 1 - Monday (Thought Leadership)\n\n*The biggest mistake I see companies make with AI automation?*\n\n*They try to automate everything at once.*\n\n*Here's what actually works:*\n\n*1. Start with ONE painful process*\n*2. Automate it completely*\n*3. Measure the impact*\n*4. Then move to the next*\n\n*We saved 40 hours/week by automating just our customer support workflow first.*\n\n*What process would save your team the most time?*\n\n**Best time to post:** 8:30 AM\n**Hashtags:** #AIAutomation #Productivity #BusinessGrowth\n**Expected reach:** 3,500-4,500\n\n---\n\n### 📌 POST 2 - Tuesday (Case Study)\n\n*How we increased customer satisfaction by 47% with AI agents 📈*\n\n*Before:*\n*• Average response time: 6 hours*\n*• Customer satisfaction: 72%*\n*• Support team: Overwhelmed*\n\n*After implementing AI agents:*\n*• Average response time: 8 minutes ⚡*\n*• Customer satisfaction: 94% 🎉*\n*• Support team: Handling complex cases only*\n\n*The secret? We didn't replace humans. We augmented them.*\n\n*Our AI handles routine questions (70% of tickets), while our team focuses on complex issues that need a human touch.*\n\n*Result: Happier customers + happier team.*\n\n*Are you using AI to augment or replace your team?*\n\n**Best time to post:** 12:00 PM\n**Hashtags:** #CustomerSuccess #AIinBusiness #CaseStudy\n**Expected reach:** 5,000-6,500\n\n---\n\n### 📌 POST 3 - Wednesday (Controversial/Engaging)\n\n*Unpopular opinion: Most productivity tools make you LESS productive.*\n\n*Why?*\n\n*Because you spend more time:*\n*• Setting them up*\n*• Learning how to use them*\n*• Managing them*\n*• Switching between 12 different tools*\n\n*The best productivity tool?*\n\n*Automation that works in the background while you focus on what actually moves the needle.*\n\n*Stop collecting productivity tools. Start eliminating tasks.*\n\n*Agree or disagree? 👇*\n\n**Best time to post:** 10:00 AM\n**Hashtags:** #Productivity #Automation #UnpopularOpinion\n**Expected reach:** 4,000-5,500 (high engagement potential)\n\n---\n\n### 📌 POST 4 - Thursday (Educational/Value)\n\n*5 tasks you should automate TODAY (not tomorrow):*\n\n*1. Email follow-ups*\n*Stop manually tracking who to email. Set up automated sequences.*\n\n*2. Meeting scheduling*\n*Back-and-forth emails waste 3 hours/week on average.*\n\n*3. Data entry*\n*If you are copying data between tools, you are doing it wrong.*\n\n*4. Report generation*\n*Weekly reports should not take hours. Automate them.*\n\n*5. Social media posting*\n*Batch create content once, schedule for the month.*\n\n*Each of these saves 2-5 hours/week.*\n*That is 10-25 hours back in your week.*\n\n*What would you do with an extra 20 hours?*\n\n**Best time to post:** 1:00 PM\n**Hashtags:** #TimeManagement #BusinessAutomation #Efficiency\n**Expected reach:** 3,800-5,000\n\n---\n\n### 📌 POST 5 - Friday (Engagement/Community)\n\n*It is Friday! Let us celebrate some wins 🎉*\n\n*This week our AI agents:*\n*• Handled 847 customer inquiries*\n*• Generated 23 qualified leads*\n*• Saved our team 67 hours*\n*• Created 12 pieces of content*\n*• Analyzed 15,000 data points*\n\n*All while our team focused on strategy and creativity.*\n\n*That is the future of work: Humans + AI working together.*\n\n*What is your biggest win this week? Drop it in the comments 👇*\n\n**Best time to post:** 3:00 PM\n**Hashtags:** #FridayFeeling #TeamWork #AIAutomation #WeeklyWins\n**Expected reach:** 4,200-5,800\n\n---\n\n## 📅 Suggested Schedule\n\n- **Monday 8:30 AM** - Post 1 (Thought Leadership)\n- **Tuesday 12:00 PM** - Post 2 (Case Study)\n- **Wednesday 10:00 AM** - Post 3 (Controversial)\n- **Thursday 1:00 PM** - Post 4 (Educational)\n- **Friday 3:00 PM** - Post 5 (Engagement)\n\n**Total expected reach:** 20,500-27,300\n**Predicted engagement:** 1,000-1,400 interactions\n\nShall I schedule these now?",
        user_id: null,
        agent_id: "mock-5",
        created_at: new Date(Date.now() - 3600000 * 8 + 125000).toISOString(),
      },
      {
        id: "sm-6",
        content: "These are perfect! Yes, schedule them all",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 8 + 180000).toISOString(),
      },
      {
        id: "sm-7",
        content:
          "✅ **All 5 posts scheduled successfully!**\n\n📅 Your LinkedIn content calendar is set for the week:\n\n- Mon 8:30 AM - Thought Leadership ✓\n- Tue 12:00 PM - Case Study ✓\n- Wed 10:00 AM - Controversial Opinion ✓\n- Thu 1:00 PM - Educational Tips ✓\n- Fri 3:00 PM - Weekly Wins ✓\n\n---\n\n## 📊 What I'll Track\n\n- Impressions & reach\n- Engagement rates (likes, comments, shares)\n- Click-through rates\n- Follower growth\n- Best performing content types\n\n---\n\n## 🔔 Reminders\n\n- I'll notify you of any high-engagement posts that need responses\n- I'll send daily performance snapshots\n- I'll suggest optimal times to engage with your audience\n\n---\n\n**💡 Pro tip:** Reply to comments within the first hour for maximum engagement boost!\n\nI'll keep monitoring and let you know how these perform. Want me to start creating content for Twitter and Instagram too?",
        user_id: null,
        agent_id: "mock-5",
        created_at: new Date(Date.now() - 3600000 * 8 + 185000).toISOString(),
      },
    ],
  },
};

// Mock group chats
export const mockGroupChats = [
  {
    id: "group-marketing",
    name: "Marketing Team",
    type: "group" as const,
    agent_id: null,
    agents: [
      {
        id: mockAgents[1].id,
        name: mockAgents[1].name,
        image_url: mockAgents[1].image_url,
        description: mockAgents[1].description,
        short_description: mockAgents[1].description,
        long_description: mockAgents[1].description,
        capabilities: mockAgents[1].capabilities || null,
      },
      {
        id: mockAgents[4].id,
        name: mockAgents[4].name,
        image_url: mockAgents[4].image_url,
        description: mockAgents[4].description,
        short_description: mockAgents[4].description,
        long_description: mockAgents[4].description,
        capabilities: mockAgents[4].capabilities || null,
      },
      {
        id: mockAgents[2].id,
        name: mockAgents[2].name,
        image_url: mockAgents[2].image_url,
        description: mockAgents[2].description,
        short_description: mockAgents[2].description,
        long_description: mockAgents[2].description,
        capabilities: mockAgents[2].capabilities || null,
      },
    ],
    messages: [
      {
        id: "gm-1",
        content:
          'Hey team! I\'ve drafted **5 blog posts** for this week\'s content calendar:\n\n1. "10 AI Tools That Will Transform Your Business"\n2. "Why Automation is the Future of Work"\n3. "Customer Success Stories: How We Saved 40 Hours/Week"\n4. "The Ultimate Guide to AI Agents"\n5. "Productivity Hacks for Modern Teams"\n\nAll are SEO-optimized and ready for review. Should I proceed with publishing?',
        user_id: null,
        agent_id: "mock-2",
        created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
      {
        id: "gm-2",
        content:
          "Perfect timing! I just analyzed **last month's content performance**:\n\n📊 **Top Performers:**\n1. Tutorial posts → 3x engagement\n2. Case studies → 2.5x shares\n3. How-to guides → 2x conversion\n\n📉 **Low Performers:**\n- News roundups → 0.8x engagement\n- Opinion pieces → 0.9x engagement\n\n💡 **Recommendation:** Focus on tutorials and case studies. Your drafted #3 and #4 align perfectly with what's working!",
        user_id: null,
        agent_id: "mock-3",
        created_at: new Date(Date.now() - 3600000 * 1 + 120000).toISOString(),
      },
      {
        id: "gm-3",
        content:
          "Great insights! Based on this data, let's focus on posts #3 and #4 first. Can you both collaborate on a tutorial series?",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 1 + 180000).toISOString(),
      },
      {
        id: "gm-4",
        content:
          "Love it! I'll coordinate the **social media rollout**:\n\n📅 **Schedule:**\n- **Tuesday 9 AM:** Post #3 (Case Study) - LinkedIn + Twitter\n- **Thursday 10 AM:** Post #4 (Ultimate Guide) - All channels\n\n📱 **Platform Strategy:**\n- LinkedIn: Professional insights + carousel\n- Twitter: Thread format with key takeaways\n- Instagram: Visual highlights + swipe posts\n- Facebook: Community discussion angle\n\n🎯 **Hashtags:** #AIAutomation #Productivity #TechTutorials #BusinessGrowth\n\n**Predicted reach:** ~15K impressions per post\n\nShall I schedule these?",
        user_id: null,
        agent_id: "mock-5",
        created_at: new Date(Date.now() - 3600000 * 1 + 240000).toISOString(),
      },
      {
        id: "gm-5",
        content:
          "Excellent! One more thing - I'll create **short video versions** of both posts for:\n- YouTube Shorts\n- TikTok\n- Instagram Reels\n\nVideo content gets **10x more engagement** than text. Want me to draft the scripts?",
        user_id: null,
        agent_id: "mock-2",
        created_at: new Date(Date.now() - 3600000 * 1 + 300000).toISOString(),
      },
      {
        id: "gm-6",
        content: "Yes! Schedule everything and create the video scripts. This is going to be our best campaign yet! 🚀",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 1 + 360000).toISOString(),
      },
      {
        id: "gm-7",
        content:
          "On it! I'll also set up **UTM tracking** so we can measure which channel drives the most conversions. I'll report back next week with performance data! 📈",
        user_id: null,
        agent_id: "mock-3",
        created_at: new Date(Date.now() - 3600000 * 1 + 380000).toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    last_activity: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: "group-customer-success",
    name: "Customer Success Squad",
    type: "group" as const,
    agent_id: null,
    agents: [
      {
        id: mockAgents[0].id,
        name: mockAgents[0].name,
        image_url: mockAgents[0].image_url,
        description: mockAgents[0].description,
        short_description: mockAgents[0].description,
        long_description: mockAgents[0].description,
        capabilities: mockAgents[0].capabilities || null,
      },
      {
        id: mockAgents[3].id,
        name: mockAgents[3].name,
        image_url: mockAgents[3].image_url,
        description: mockAgents[3].description,
        short_description: mockAgents[3].description,
        long_description: mockAgents[3].description,
        capabilities: mockAgents[3].capabilities || null,
      },
    ],
    messages: [
      {
        id: "gc-1",
        content:
          "Morning team! I've reviewed overnight tickets. We have **3 enterprise clients** flagged for immediate attention:\n\n🔴 **Acme Corp** - Experiencing API timeout errors\n🔴 **TechStart Inc** - Requesting custom integration\n🟡 **Global Solutions** - Contract renewal in 2 weeks\n\nI've drafted responses for the technical issues. Sales team - can you handle the renewal outreach?",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: "gc-2",
        content:
          "On it! **Global Solutions renewal strategy:**\n\n📊 **Account Health:**\n- Usage: 87% of license (healthy)\n- Support tickets: Only 2 in 6 months (good)\n- NPS Score: 9/10 (promoter)\n- Last touchpoint: 45 days ago (time to reach out!)\n\n💼 **Renewal Approach:**\n1. Schedule check-in call this week\n2. Showcase new features they haven't used\n3. Offer 15% discount for annual commitment\n4. Upsell opportunity: Additional seats\n\n**Projected renewal value:** $48K → $65K (with upsell)\n\nI'll send the outreach email today!",
        user_id: null,
        agent_id: "mock-4",
        created_at: new Date(Date.now() - 3600000 * 3 + 120000).toISOString(),
      },
      {
        id: "gc-3",
        content: "Perfect! What about the Acme Corp API issue? That sounds critical.",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 180000).toISOString(),
      },
      {
        id: "gc-4",
        content:
          "I've already **escalated to engineering** with priority level 1. Here's what I did:\n\n✅ **Immediate Actions:**\n1. Sent temporary workaround (increased timeout limits)\n2. Set up monitoring on their account\n3. Scheduled call with tech lead in 1 hour\n4. Created incident ticket #INC-789\n\n📧 **Client Communication:**\n*\"We're actively investigating and have our senior engineers on it. As a temporary fix, we've increased your timeout limits. We'll update you within 2 hours with a permanent solution.\"*\n\n⏰ **ETA:** Permanent fix by end of day\n\nThey're a **$120K/year account** so I'm monitoring this closely!",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 185000).toISOString(),
      },
      {
        id: "gc-5",
        content:
          "Excellent work, both of you! This is exactly the kind of collaboration that keeps our customers happy. 🎯",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 240000).toISOString(),
      },
      {
        id: "gc-6",
        content:
          "Thanks! I'll also **proactively reach out** to our other top 10 accounts this week to ensure no one else is experiencing issues. Prevention is better than cure! 🛡️",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 260000).toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    last_activity: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];
