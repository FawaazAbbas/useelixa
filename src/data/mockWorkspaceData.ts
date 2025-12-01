import { mockAgents } from './mockAgents';

// Mock installed agents (subset of marketplace agents)
export const mockInstalledAgents = [
  mockAgents[0], // Customer Support Pro
  mockAgents[1], // Content Creator AI
  mockAgents[2], // Data Analyst Pro
  mockAgents[3], // Sales Assistant
  mockAgents[4], // Social Media Manager
];

// Mock Brian conversation
export const mockBrianMessages = [
  {
    role: "assistant" as const,
    content: "👋 Hey there! I'm **Brian**, your AI Chief Operating Officer. I'm here to help you manage your workspace, coordinate your agents, and keep everything running smoothly.\n\nYou currently have **5 agents** installed and ready to work:\n\n🎧 **Customer Support Pro** - Handling inquiries 24/7\n✍️ **Content Creator AI** - Creating engaging content\n📊 **Data Analyst Pro** - Analyzing business metrics\n💼 **Sales Assistant** - Managing your pipeline\n📱 **Social Media Manager** - Growing your presence\n\nWhat would you like to work on today?"
  },
  {
    role: "user" as const,
    content: "Can you help me understand what each agent does?"
  },
  {
    role: "assistant" as const,
    content: "Absolutely! Here's a quick overview of your agent team:\n\n### 🎧 Customer Support Pro\n- Handles customer tickets 24/7\n- Sentiment analysis on inquiries\n- Multi-language support\n- Automatic ticket routing\n\n### ✍️ Content Creator AI\n- Blog post generation\n- Social media content\n- SEO optimization\n- Brand voice consistency\n\n### 📊 Data Analyst Pro\n- Business metrics analysis\n- Predictive modeling\n- Data visualization\n- Trend forecasting\n\n### 💼 Sales Assistant\n- Lead qualification\n- Email follow-ups\n- Pipeline management\n- CRM integration\n\n### 📱 Social Media Manager\n- Post scheduling\n- Engagement analytics\n- Hashtag research\n- Content calendar\n\nYou can chat with any of them directly, or I can coordinate tasks between multiple agents. Want to try delegating a task?"
  },
  {
    role: "user" as const,
    content: "How do I create a group chat with multiple agents?"
  },
  {
    role: "assistant" as const,
    content: "Great question! **Group chats** are perfect for complex projects that need multiple perspectives.\n\nHere's how to create one:\n\n1. Click the **\"+ New Group\"** button in the left sidebar\n2. Give your group a name (e.g., \"Marketing Team\")\n3. Select which agents to include\n4. Start chatting!\n\nThe agents will collaborate automatically. For example:\n- Content Creator drafts a post\n- Social Media Manager schedules it\n- Data Analyst tracks performance\n\nI've already set up two group chats for you:\n- **Marketing Team** (Content, Social Media, Data)\n- **Customer Success Squad** (Support, Sales)\n\nCheck them out in your sidebar! Any other questions?"
  }
];

// Mock direct chat messages for each agent
export const mockDirectChats = {
  "mock-1": { // Customer Support Pro
    name: "Customer Support Pro",
    messages: [
      {
        id: "cs-1",
        content: "Hello! I'm **Customer Support Pro**, your 24/7 support specialist. I can help you:\n\n- Check and respond to customer tickets\n- Analyze customer sentiment\n- Route urgent issues\n- Generate support reports\n\nWhat would you like me to help with today?",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      },
      {
        id: "cs-2",
        content: "Show me the latest customer tickets",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 2 + 120000).toISOString(), // 2 hours ago + 2 min
      },
      {
        id: "cs-3",
        content: "Here are your **5 most recent tickets**:\n\n### 🔴 High Priority\n**Ticket #234** - Login Issue\n*\"Can't access my account after password reset\"*\n⏱️ 15 minutes ago\n\n**Ticket #237** - Payment Failed\n*\"Credit card declined during checkout\"*\n⏱️ 45 minutes ago\n\n### 🟡 Medium Priority\n**Ticket #236** - Billing Question\n*\"Need invoice for last month\"*\n⏱️ 1 hour ago\n\n### 🟢 Low Priority\n**Ticket #235** - Feature Request\n*\"Can you add dark mode?\"*\n⏱️ 2 hours ago\n\n**Ticket #238** - General Inquiry\n*\"How do I export my data?\"*\n⏱️ 3 hours ago\n\nWould you like me to:\n1. Draft responses for urgent tickets\n2. Analyze customer sentiment trends\n3. Generate a support performance report",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 2 + 125000).toISOString(),
      },
      {
        id: "cs-4",
        content: "Draft responses for the high priority tickets",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 2 + 180000).toISOString(),
      },
      {
        id: "cs-5",
        content: "Perfect! Here are **empathetic, solution-focused responses**:\n\n---\n\n### Ticket #234 - Login Issue\n\n*Hi [Customer Name],*\n\n*I'm sorry you're having trouble accessing your account. I understand how frustrating this can be.*\n\n*I've just reset your login session on our end. Please try these steps:*\n1. *Clear your browser cache*\n2. *Try logging in with your email*\n3. *Click \"Forgot Password\" if needed*\n\n*If you're still stuck, I'm here to help 24/7. You can also call our support line at [number].*\n\n*- Customer Support Pro*\n\n---\n\n### Ticket #237 - Payment Failed\n\n*Hi [Customer Name],*\n\n*Thank you for reaching out! I can help resolve this payment issue right away.*\n\n*The decline could be due to:*\n- *Card expiration or insufficient funds*\n- *Security hold from your bank*\n- *Billing address mismatch*\n\n*I've generated a secure payment link that you can try: [link]*\n\n*Alternatively, you can update your payment method in your account settings. I'm standing by if you need assistance!*\n\n*- Customer Support Pro*\n\n---\n\nShall I send these responses or would you like me to adjust anything?",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 2 + 185000).toISOString(),
      }
    ]
  },
  "mock-2": { // Content Creator AI
    name: "Content Creator AI",
    messages: [
      {
        id: "cc-1",
        content: "Hey! I'm **Content Creator AI** ✍️\n\nI specialize in creating **engaging, SEO-optimized content** for:\n\n📝 Blog posts & articles\n📱 Social media posts\n📧 Email campaigns\n🎯 Ad copy & landing pages\n\nI maintain your brand voice and optimize for search engines. What content do you need today?",
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
        content: "Great topic! Here are **3 compelling blog post ideas** about AI automation:\n\n---\n\n### 1. \"The Ultimate Guide to AI Automation in 2024\"\n**Angle:** Comprehensive resource\n**Target:** Business owners new to AI\n**Key Points:**\n- What is AI automation and why it matters\n- 7 processes you can automate today\n- ROI calculations and success metrics\n- Implementation roadmap\n\n**SEO Keywords:** AI automation guide, business automation tools, AI productivity\n\n---\n\n### 2. \"5 AI Automation Myths That Are Costing Your Business\"\n**Angle:** Myth-busting, fear-reducing\n**Target:** Skeptical decision-makers\n**Key Points:**\n- \"AI will replace all jobs\" (MYTH)\n- \"AI automation is only for tech companies\" (MYTH)\n- \"Implementation takes years\" (MYTH)\n- Real success stories\n- Getting started guide\n\n**SEO Keywords:** AI automation myths, AI misconceptions, automation benefits\n\n---\n\n### 3. \"How We Saved 40 Hours Per Week With AI Automation (Case Study)\"\n**Angle:** Personal story, actionable insights\n**Target:** Entrepreneurs and SMBs\n**Key Points:**\n- Our automation journey\n- Specific tools and workflows\n- Mistakes we made (and how to avoid them)\n- Measurable results\n- Your automation roadmap\n\n**SEO Keywords:** AI automation case study, business automation results, save time with AI\n\n---\n\nWant me to write a full draft for any of these?",
        user_id: null,
        agent_id: "mock-2",
        created_at: new Date(Date.now() - 3600000 * 4 + 65000).toISOString(),
      }
    ]
  },
  "mock-3": { // Data Analyst Pro
    name: "Data Analyst Pro",
    messages: [
      {
        id: "da-1",
        content: "Hello! I'm **Data Analyst Pro** 📊\n\nI turn your data into actionable insights with:\n\n📈 Advanced analytics & reporting\n🔮 Predictive modeling\n📉 Trend analysis\n💡 Business intelligence\n\nI can analyze sales, marketing, customer behavior, operations, and more. What data would you like me to examine?",
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
        content: "Here's your **comprehensive sales analysis** for last month:\n\n## 📈 Overall Performance\n\n**Total Revenue:** $142,580 (+23% MoM)\n**Total Deals:** 87 (+15% MoM)\n**Average Deal Size:** $1,639 (+7% MoM)\n**Conversion Rate:** 28% (+3% MoM)\n\n---\n\n## 🎯 Key Insights\n\n### ✅ What's Working\n1. **Enterprise deals** up 45% - focus on this segment\n2. **Email campaigns** have 34% conversion (vs 22% average)\n3. **Product demos** close at 62% rate\n4. **Referrals** drive highest LTV customers\n\n### ⚠️ Areas for Improvement\n1. **Cold outreach** conversion only 12%\n2. **Sales cycle** lengthened to 47 days (from 38)\n3. **Churn** increased to 8% (from 5%)\n4. **Q4 pipeline** needs attention - only $340K\n\n---\n\n## 💡 Recommendations\n\n1. **Double down on email campaigns** - highest ROI\n2. **Implement referral incentive program**\n3. **Investigate churn causes** - interview lost customers\n4. **Accelerate enterprise deals** with dedicated team\n5. **Improve cold outreach** messaging\n\n---\n\n## 📊 Top Performers\n\n1. Sarah J. - $47K revenue (18 deals)\n2. Mike T. - $39K revenue (24 deals)\n3. Lisa R. - $31K revenue (15 deals)\n\n---\n\nWant me to:\n- Deep dive into any metric?\n- Create forecasts for next quarter?\n- Build a performance dashboard?",
        user_id: null,
        agent_id: "mock-3",
        created_at: new Date(Date.now() - 3600000 * 6 + 95000).toISOString(),
      }
    ]
  }
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
        content: "Hey team! I've drafted **5 blog posts** for this week's content calendar:\n\n1. \"10 AI Tools That Will Transform Your Business\"\n2. \"Why Automation is the Future of Work\"\n3. \"Customer Success Stories: How We Saved 40 Hours/Week\"\n4. \"The Ultimate Guide to AI Agents\"\n5. \"Productivity Hacks for Modern Teams\"\n\nAll are SEO-optimized and ready for review. Should I proceed with publishing?",
        user_id: null,
        agent_id: "mock-2",
        created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
      {
        id: "gm-2",
        content: "Perfect timing! I just analyzed **last month's content performance**:\n\n📊 **Top Performers:**\n1. Tutorial posts → 3x engagement\n2. Case studies → 2.5x shares\n3. How-to guides → 2x conversion\n\n📉 **Low Performers:**\n- News roundups → 0.8x engagement\n- Opinion pieces → 0.9x engagement\n\n💡 **Recommendation:** Focus on tutorials and case studies. Your drafted #3 and #4 align perfectly with what's working!",
        user_id: null,
        agent_id: "mock-3",
        created_at: new Date(Date.now() - 3600000 * 1 + 120000).toISOString(),
      },
      {
        id: "gm-3",
        content: "Great insights! Based on this data, let's focus on posts #3 and #4 first. Can you both collaborate on a tutorial series?",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 1 + 180000).toISOString(),
      },
      {
        id: "gm-4",
        content: "Love it! I'll coordinate the **social media rollout**:\n\n📅 **Schedule:**\n- **Tuesday 9 AM:** Post #3 (Case Study) - LinkedIn + Twitter\n- **Thursday 10 AM:** Post #4 (Ultimate Guide) - All channels\n\n📱 **Platform Strategy:**\n- LinkedIn: Professional insights + carousel\n- Twitter: Thread format with key takeaways\n- Instagram: Visual highlights + swipe posts\n- Facebook: Community discussion angle\n\n🎯 **Hashtags:** #AIAutomation #Productivity #TechTutorials #BusinessGrowth\n\n**Predicted reach:** ~15K impressions per post\n\nShall I schedule these?",
        user_id: null,
        agent_id: "mock-5",
        created_at: new Date(Date.now() - 3600000 * 1 + 240000).toISOString(),
      },
      {
        id: "gm-5",
        content: "Excellent! One more thing - I'll create **short video versions** of both posts for:\n- YouTube Shorts\n- TikTok\n- Instagram Reels\n\nVideo content gets **10x more engagement** than text. Want me to draft the scripts?",
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
        content: "On it! I'll also set up **UTM tracking** so we can measure which channel drives the most conversions. I'll report back next week with performance data! 📈",
        user_id: null,
        agent_id: "mock-3",
        created_at: new Date(Date.now() - 3600000 * 1 + 380000).toISOString(),
      }
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
        content: "Morning team! I've reviewed overnight tickets. We have **3 enterprise clients** flagged for immediate attention:\n\n🔴 **Acme Corp** - Experiencing API timeout errors\n🔴 **TechStart Inc** - Requesting custom integration\n🟡 **Global Solutions** - Contract renewal in 2 weeks\n\nI've drafted responses for the technical issues. Sales team - can you handle the renewal outreach?",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: "gc-2",
        content: "On it! **Global Solutions renewal strategy:**\n\n📊 **Account Health:**\n- Usage: 87% of license (healthy)\n- Support tickets: Only 2 in 6 months (good)\n- NPS Score: 9/10 (promoter)\n- Last touchpoint: 45 days ago (time to reach out!)\n\n💼 **Renewal Approach:**\n1. Schedule check-in call this week\n2. Showcase new features they haven't used\n3. Offer 15% discount for annual commitment\n4. Upsell opportunity: Additional seats\n\n**Projected renewal value:** $48K → $65K (with upsell)\n\nI'll send the outreach email today!",
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
        content: "I've already **escalated to engineering** with priority level 1. Here's what I did:\n\n✅ **Immediate Actions:**\n1. Sent temporary workaround (increased timeout limits)\n2. Set up monitoring on their account\n3. Scheduled call with tech lead in 1 hour\n4. Created incident ticket #INC-789\n\n📧 **Client Communication:**\n*\"We're actively investigating and have our senior engineers on it. As a temporary fix, we've increased your timeout limits. We'll update you within 2 hours with a permanent solution.\"*\n\n⏰ **ETA:** Permanent fix by end of day\n\nThey're a **$120K/year account** so I'm monitoring this closely!",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 185000).toISOString(),
      },
      {
        id: "gc-5",
        content: "Excellent work, both of you! This is exactly the kind of collaboration that keeps our customers happy. 🎯",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3600000 * 3 + 240000).toISOString(),
      },
      {
        id: "gc-6",
        content: "Thanks! I'll also **proactively reach out** to our other top 10 accounts this week to ensure no one else is experiencing issues. Prevention is better than cure! 🛡️",
        user_id: null,
        agent_id: "mock-1",
        created_at: new Date(Date.now() - 3600000 * 3 + 260000).toISOString(),
      }
    ],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    last_activity: new Date(Date.now() - 3600000 * 3).toISOString(),
  }
];
