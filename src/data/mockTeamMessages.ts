// Pre-populated conversations for team members
export const mockTeamMemberMessages: Record<string, {
  name: string;
  messages: Array<{
    id: string;
    content: string;
    user_id: string | null;
    agent_id: string | null;
    created_at: string;
  }>;
}> = {
  // Marketing Team
  "marketing-director": {
    name: "Marketing Director",
    messages: [
      {
        id: "md-1",
        content: "Good morning. I'm the Marketing Director AI. I oversee all marketing operations including paid media, organic growth, content, and brand strategy. How can I help align your marketing efforts today?",
        user_id: null,
        agent_id: "marketing-director",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "md-2",
        content: "Give me a status update on all marketing channels",
        user_id: "demo-user",
        agent_id: null,
        created_at: new Date(Date.now() - 3500000).toISOString(),
      },
      {
        id: "md-3",
        content: "Here's your cross-channel marketing status:\n\n**Paid Media**\n- Meta ROAS: 3.2x (↑12% WoW)\n- Google ROAS: 2.8x (stable)\n- TikTok: Testing phase, promising early results\n\n**Organic**\n- SEO traffic up 18% MoM\n- Social engagement: +24% this week\n- Email open rates: 28% (industry avg: 21%)\n\n**Content**\n- 4 blog posts published this week\n- Video content performing 2x better than static\n\nPriority recommendation: Scale TikTok spend by 20% based on initial performance data.",
        user_id: null,
        agent_id: "marketing-director",
        created_at: new Date(Date.now() - 3400000).toISOString(),
      }
    ]
  },
  "ppc-specialist": {
    name: "PPC Specialist",
    messages: [
      {
        id: "ppc-1",
        content: "Hi! I'm your PPC Specialist. I manage Google Ads, Bing Ads, and Shopping campaigns. I'm currently optimizing bids for your top-performing keywords. What would you like to review?",
        user_id: null,
        agent_id: "ppc-specialist",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      }
    ]
  },
  "paid-social-specialist": {
    name: "Paid Social Specialist",
    messages: [
      {
        id: "ps-1",
        content: "Hey! I handle all paid social campaigns across Meta, TikTok, Pinterest, and LinkedIn. Currently running 12 active campaigns. Your Meta retargeting campaign is crushing it - 4.1x ROAS this week!",
        user_id: null,
        agent_id: "paid-social-specialist",
        created_at: new Date(Date.now() - 5400000).toISOString(),
      }
    ]
  },
  "content-writer": {
    name: "Content Writer",
    messages: [
      {
        id: "cw-1",
        content: "Hello! I'm your Content Writer. I create SEO-optimized blog posts, landing page copy, and email content. I've drafted 3 new articles for your review. Want me to share them?",
        user_id: null,
        agent_id: "content-writer",
        created_at: new Date(Date.now() - 4800000).toISOString(),
      }
    ]
  },
  "email-marketing-specialist": {
    name: "Email Marketing Specialist",
    messages: [
      {
        id: "em-1",
        content: "Hi! I manage your email marketing in Klaviyo. Current stats:\n\n- 45,000 active subscribers\n- Welcome flow: 52% open rate\n- Abandoned cart: recovering 8% of carts\n- Last campaign: £12.4k revenue\n\nWhat would you like me to work on?",
        user_id: null,
        agent_id: "email-marketing-specialist",
        created_at: new Date(Date.now() - 6000000).toISOString(),
      }
    ]
  },
  "seo-specialist": {
    name: "SEO Specialist",
    messages: [
      {
        id: "seo-1",
        content: "Hey! I'm your SEO Specialist. I handle technical SEO, content optimization, and keyword strategy. Your site is ranking for 2,847 keywords, up 15% this month. Top opportunity: 'refurbished iPhone UK' - we're position 8, targeting top 3.",
        user_id: null,
        agent_id: "seo-specialist",
        created_at: new Date(Date.now() - 3900000).toISOString(),
      }
    ]
  },
  "social-media-manager": {
    name: "Social Media Manager",
    messages: [
      {
        id: "smm-1",
        content: "Hi there! I manage your organic social presence. This week's highlights:\n\n📱 **Instagram**: 12.4k followers (+340 this week)\n🐦 **Twitter/X**: Engagement up 28%\n📘 **Facebook**: Community growing steadily\n\nI've scheduled 14 posts for next week. Want to review the content calendar?",
        user_id: null,
        agent_id: "social-media-manager",
        created_at: new Date(Date.now() - 4200000).toISOString(),
      }
    ]
  },
  "influencer-manager": {
    name: "Influencer Manager",
    messages: [
      {
        id: "im-1",
        content: "Hello! I handle influencer partnerships and UGC content. Currently managing 8 active creator partnerships. Our micro-influencer campaign generated £24k in attributed revenue last month. Shall I share the top performers?",
        user_id: null,
        agent_id: "influencer-manager",
        created_at: new Date(Date.now() - 5100000).toISOString(),
      }
    ]
  },
  
  // Product & Merchandising Team
  "product-director": {
    name: "Product Director",
    messages: [
      {
        id: "pd-1",
        content: "Hello. I'm the Product Director. I oversee our entire product catalog, pricing strategy, and merchandising. Currently managing 2,400 active SKUs. What aspect of product strategy would you like to discuss?",
        user_id: null,
        agent_id: "product-director",
        created_at: new Date(Date.now() - 4500000).toISOString(),
      }
    ]
  },
  "product-listing-manager": {
    name: "Product Listing Manager",
    messages: [
      {
        id: "plm-1",
        content: "Hi! I manage all product listings across your store. I ensure titles, descriptions, and images are optimized. I've identified 47 listings that need attention - missing images or incomplete descriptions. Want the list?",
        user_id: null,
        agent_id: "product-listing-manager",
        created_at: new Date(Date.now() - 6600000).toISOString(),
      }
    ]
  },
  "merchandising-specialist": {
    name: "Merchandising Specialist",
    messages: [
      {
        id: "ms-1",
        content: "Hey! I handle visual merchandising, collections, and product recommendations. I've updated the homepage collections based on this week's trending products. Conversion rate improved by 12%!",
        user_id: null,
        agent_id: "merchandising-specialist",
        created_at: new Date(Date.now() - 5700000).toISOString(),
      }
    ]
  },
  "competitive-pricing-analyst": {
    name: "Competitive Pricing Analyst",
    messages: [
      {
        id: "cpa-1",
        content: "Hi! I monitor competitor pricing and optimize our price positioning. Alert: 3 competitors dropped iPhone 13 prices by 5% today. Recommendation: Match on Grade B, hold on Grade A where we have quality advantage.",
        user_id: null,
        agent_id: "competitive-pricing-analyst",
        created_at: new Date(Date.now() - 3300000).toISOString(),
      }
    ]
  },
  
  // Customer Service Team
  "cs-director": {
    name: "Customer Service Director",
    messages: [
      {
        id: "csd-1",
        content: "Hello. I'm the Customer Service Director. I oversee all customer support operations, quality assurance, and customer satisfaction metrics. Current CSAT score: 94%. How can I help improve your customer experience?",
        user_id: null,
        agent_id: "cs-director",
        created_at: new Date(Date.now() - 2700000).toISOString(),
      }
    ]
  },
  "customer-support-rep": {
    name: "Customer Support Rep",
    messages: [
      {
        id: "csr-1",
        content: "Hi! I'm handling frontline customer support. Today's stats:\n\n📨 142 tickets resolved\n⏱️ Avg response time: 4 minutes\n😊 CSAT: 96%\n\nCurrent queue: 8 tickets. No urgent escalations. Need me to prioritize anything specific?",
        user_id: null,
        agent_id: "customer-support-rep",
        created_at: new Date(Date.now() - 1800000).toISOString(),
      }
    ]
  },
  "refunds-warranty-specialist": {
    name: "Refunds & Warranty Specialist",
    messages: [
      {
        id: "rws-1",
        content: "Hello! I handle all refunds, returns, and warranty claims. This week: 23 refunds processed (£4,200), 8 warranty replacements sent. Return rate is 3.2%, below our 4% target. Any specific cases to review?",
        user_id: null,
        agent_id: "refunds-warranty-specialist",
        created_at: new Date(Date.now() - 4100000).toISOString(),
      }
    ]
  },
  "qa-specialist": {
    name: "QA Specialist",
    messages: [
      {
        id: "qa-1",
        content: "Hi! I monitor support quality and customer satisfaction. Weekly QA report:\n\n✅ 98% of responses met quality standards\n📊 NPS: +62 (up from +58)\n🎯 First contact resolution: 84%\n\nI've flagged 3 interactions for coaching. Want to review them?",
        user_id: null,
        agent_id: "qa-specialist",
        created_at: new Date(Date.now() - 5400000).toISOString(),
      }
    ]
  },
  
  // Finance Team
  "finance-director": {
    name: "Finance Director",
    messages: [
      {
        id: "fd-1",
        content: "Good morning. I'm the Finance Director. I oversee financial planning, analysis, and reporting. Current month performance: Revenue £482k (103% of target), Gross Margin 42%, EBITDA on track. What financial insights do you need?",
        user_id: null,
        agent_id: "finance-director",
        created_at: new Date(Date.now() - 3000000).toISOString(),
      }
    ]
  },
  "fpa-analyst": {
    name: "FP&A Analyst",
    messages: [
      {
        id: "fpa-1",
        content: "Hi! I handle financial planning and analysis. I've completed the Q4 forecast - we're tracking 8% ahead of plan. Key driver: Better than expected conversion rates. Want me to walk you through the model?",
        user_id: null,
        agent_id: "fpa-analyst",
        created_at: new Date(Date.now() - 7800000).toISOString(),
      }
    ]
  },
  "revenue-ops-analyst": {
    name: "Revenue Ops Analyst",
    messages: [
      {
        id: "roa-1",
        content: "Hey! I track revenue operations and reporting. Daily revenue: £18.4k (↑12% vs last Tuesday). Top channel: Paid Social (38% of revenue). Unusual spike in Samsung sales - investigating if it's a trend.",
        user_id: null,
        agent_id: "revenue-ops-analyst",
        created_at: new Date(Date.now() - 2400000).toISOString(),
      }
    ]
  },
  
  // Development Team
  "tech-lead": {
    name: "Tech Lead",
    messages: [
      {
        id: "tl-1",
        content: "Hello. I'm the Tech Lead overseeing all development and technical infrastructure. Current sprint: 14 tickets completed, 3 in progress. Site performance: 98.9% uptime, 2.1s avg load time. What technical priorities should we discuss?",
        user_id: null,
        agent_id: "tech-lead",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      }
    ]
  },
  "shopify-developer": {
    name: "Shopify Developer",
    messages: [
      {
        id: "sd-1",
        content: "Hi! I handle all Shopify theme development and customizations. Just deployed the new product page layout - initial tests show 8% improvement in add-to-cart rate. Any other features you'd like me to build?",
        user_id: null,
        agent_id: "shopify-developer",
        created_at: new Date(Date.now() - 6300000).toISOString(),
      }
    ]
  },
  "frontend-developer": {
    name: "Frontend Developer",
    messages: [
      {
        id: "fed-1",
        content: "Hey! I'm working on frontend development. Currently optimizing the checkout flow - reduced JavaScript bundle by 23%. Also implementing the new mega menu design. ETA: End of week.",
        user_id: null,
        agent_id: "frontend-developer",
        created_at: new Date(Date.now() - 5100000).toISOString(),
      }
    ]
  },
  "ux-ui-designer": {
    name: "UX/UI Designer",
    messages: [
      {
        id: "uxd-1",
        content: "Hello! I'm your UX/UI Designer. I've completed the mobile navigation redesign in Figma. User testing showed 34% faster task completion. Ready to share the designs when you're free to review.",
        user_id: null,
        agent_id: "ux-ui-designer",
        created_at: new Date(Date.now() - 4800000).toISOString(),
      }
    ]
  },
  "cro-specialist": {
    name: "CRO Specialist",
    messages: [
      {
        id: "cro-1",
        content: "Hi! I run conversion optimization experiments. Current A/B tests:\n\n🧪 Test A: New CTA color (+12% clicks, 94% confidence)\n🧪 Test B: Social proof badges (+8% conversion, 87% confidence)\n\nRecommendation: Ship Test A, continue Test B for more data.",
        user_id: null,
        agent_id: "cro-specialist",
        created_at: new Date(Date.now() - 3900000).toISOString(),
      }
    ]
  },
  "tech-integrations-specialist": {
    name: "Tech Integrations Specialist",
    messages: [
      {
        id: "tis-1",
        content: "Hey! I manage all third-party integrations and APIs. Status update: Klaviyo sync healthy, inventory feed running smoothly, payment gateway 100% uptime. Working on the new ERP integration - 60% complete.",
        user_id: null,
        agent_id: "tech-integrations-specialist",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      }
    ]
  },
  "data-engineer": {
    name: "Data Engineer",
    messages: [
      {
        id: "de-1",
        content: "Hello! I build and maintain data pipelines. Daily ETL jobs running smoothly. Just finished the new customer LTV model - now calculating in real-time. Dashboard refresh rate improved from 1 hour to 15 minutes.",
        user_id: null,
        agent_id: "data-engineer",
        created_at: new Date(Date.now() - 6000000).toISOString(),
      }
    ]
  },
  
  // Creative Team
  "creative-director": {
    name: "Creative Director",
    messages: [
      {
        id: "cd-1",
        content: "Hello! I'm the Creative Director. I oversee all visual content and brand consistency. This quarter we've produced 240+ assets. Brand sentiment tracking shows 18% improvement. What creative projects are on your mind?",
        user_id: null,
        agent_id: "creative-director",
        created_at: new Date(Date.now() - 4200000).toISOString(),
      }
    ]
  },
  "graphic-designer-creative": {
    name: "Graphic Designer",
    messages: [
      {
        id: "gd-1",
        content: "Hi! I create all static visual assets - ads, social posts, email graphics. Currently working on the Black Friday campaign creative pack. Have 12 variations ready for review. Want to see them?",
        user_id: null,
        agent_id: "graphic-designer-creative",
        created_at: new Date(Date.now() - 5400000).toISOString(),
      }
    ]
  },
  "video-producer": {
    name: "Video Producer",
    messages: [
      {
        id: "vp-1",
        content: "Hey! I handle all video production. This week: 4 product videos completed, 2 UGC-style ads in editing. Video content is outperforming static by 2.3x on engagement. What's the next video priority?",
        user_id: null,
        agent_id: "video-producer",
        created_at: new Date(Date.now() - 4500000).toISOString(),
      }
    ]
  },
  
  // Legal & Risk Team
  "legal-director": {
    name: "Legal Director",
    messages: [
      {
        id: "ld-1",
        content: "Hello. I'm the Legal Director overseeing compliance, contracts, and risk management. All policies are current. Recent audit: 100% compliant. Any legal matters you'd like to discuss?",
        user_id: null,
        agent_id: "legal-director",
        created_at: new Date(Date.now() - 3300000).toISOString(),
      }
    ]
  },
  "compliance-officer": {
    name: "Compliance Officer",
    messages: [
      {
        id: "co-1",
        content: "Hi! I ensure regulatory compliance across all operations. GDPR audit complete - all good. Cookie consent updated for new regulations. Privacy policy review scheduled for next week. Any compliance concerns?",
        user_id: null,
        agent_id: "compliance-officer",
        created_at: new Date(Date.now() - 6600000).toISOString(),
      }
    ]
  },
  "legal-assistant": {
    name: "Legal Assistant",
    messages: [
      {
        id: "la-1",
        content: "Hello! I support with contracts and legal documentation. This week: 8 supplier agreements reviewed, 3 NDAs processed, T&Cs updated. Anything you need me to draft or review?",
        user_id: null,
        agent_id: "legal-assistant",
        created_at: new Date(Date.now() - 5700000).toISOString(),
      }
    ]
  },
  "fraud-detection-specialist": {
    name: "Fraud Detection Specialist",
    messages: [
      {
        id: "fds-1",
        content: "Hi! I monitor fraud and manage chargebacks. This week's stats:\n\n🛡️ 12 potentially fraudulent orders blocked (£3.2k saved)\n💳 Chargeback rate: 0.3% (industry avg: 0.6%)\n⚠️ 2 suspicious patterns flagged for review\n\nWant me to walk through the flagged cases?",
        user_id: null,
        agent_id: "fraud-detection-specialist",
        created_at: new Date(Date.now() - 2100000).toISOString(),
      }
    ]
  },
};

// Team Group Chat Messages
export const mockTeamGroupMessages: Record<string, {
  name: string;
  messages: Array<{
    id: string;
    content: string;
    user_id: string | null;
    agent_id: string | null;
    sender_name: string;
    created_at: string;
  }>;
}> = {
  "marketing": {
    name: "Marketing Team Chat",
    messages: [
      {
        id: "mkt-g-1",
        content: "Good morning team! Let's sync on this week's priorities.",
        user_id: null,
        agent_id: "marketing-director",
        sender_name: "Marketing Director",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "mkt-g-2",
        content: "I've got the Q4 campaign creative brief ready for review. The Black Friday assets are looking strong.",
        user_id: null,
        agent_id: "graphic-designer-marketing",
        sender_name: "Graphic Designer",
        created_at: new Date(Date.now() - 7100000).toISOString(),
      },
      {
        id: "mkt-g-3",
        content: "Perfect timing! I'll need those for the email sequences. Current open rates are at 28% - let's aim for 30%+ with the new designs.",
        user_id: null,
        agent_id: "email-marketing-specialist",
        sender_name: "Email Marketing Specialist",
        created_at: new Date(Date.now() - 7000000).toISOString(),
      },
      {
        id: "mkt-g-4",
        content: "Meta ROAS hit 3.2x this week. If we can get those creatives live by Thursday, we should see even better results.",
        user_id: null,
        agent_id: "paid-social-specialist",
        sender_name: "Paid Social Specialist",
        created_at: new Date(Date.now() - 6900000).toISOString(),
      },
      {
        id: "mkt-g-5",
        content: "SEO update: We're now ranking #3 for 'refurbished iPhone UK'. The content team's work is paying off.",
        user_id: null,
        agent_id: "seo-specialist",
        sender_name: "SEO Specialist",
        created_at: new Date(Date.now() - 6800000).toISOString(),
      },
      {
        id: "mkt-g-6",
        content: "Great work everyone. Let's keep this momentum going into the holiday season.",
        user_id: null,
        agent_id: "marketing-director",
        sender_name: "Marketing Director",
        created_at: new Date(Date.now() - 6700000).toISOString(),
      }
    ]
  },
  "product": {
    name: "Product Team Chat",
    messages: [
      {
        id: "prod-g-1",
        content: "Team, we need to discuss the pricing strategy for the new Samsung lineup.",
        user_id: null,
        agent_id: "product-director",
        sender_name: "Product Director",
        created_at: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        id: "prod-g-2",
        content: "I've been monitoring competitors - CEX dropped their S23 prices by 8% yesterday. We should consider matching.",
        user_id: null,
        agent_id: "competitive-pricing-analyst",
        sender_name: "Competitive Pricing Analyst",
        created_at: new Date(Date.now() - 5300000).toISOString(),
      },
      {
        id: "prod-g-3",
        content: "I can update all 47 Samsung listings within the hour if we decide to adjust. Just need the new price points.",
        user_id: null,
        agent_id: "product-listing-manager",
        sender_name: "Product Listing Manager",
        created_at: new Date(Date.now() - 5200000).toISOString(),
      },
      {
        id: "prod-g-4",
        content: "From a merchandising perspective, I'd suggest keeping Grade A prices firm but matching on Grade B. Our quality advantage justifies the premium on top-tier stock.",
        user_id: null,
        agent_id: "merchandising-specialist",
        sender_name: "Merchandising Specialist",
        created_at: new Date(Date.now() - 5100000).toISOString(),
      },
      {
        id: "prod-g-5",
        content: "Agreed. Let's go with that approach. Update Grade B to match market, hold Grade A.",
        user_id: null,
        agent_id: "product-director",
        sender_name: "Product Director",
        created_at: new Date(Date.now() - 5000000).toISOString(),
      }
    ]
  },
  "customer-service": {
    name: "Customer Service Team Chat",
    messages: [
      {
        id: "cs-g-1",
        content: "Morning team! CSAT is at 94% - let's push for 95% this week.",
        user_id: null,
        agent_id: "cs-director",
        sender_name: "CS Director",
        created_at: new Date(Date.now() - 4800000).toISOString(),
      },
      {
        id: "cs-g-2",
        content: "Queue is manageable today - 8 tickets pending. Response time averaging 4 minutes.",
        user_id: null,
        agent_id: "customer-support-rep",
        sender_name: "Customer Support Rep",
        created_at: new Date(Date.now() - 4700000).toISOString(),
      },
      {
        id: "cs-g-3",
        content: "I've processed 23 refunds this week. Return rate is down to 3.2% which is great. Most returns are change-of-mind rather than quality issues.",
        user_id: null,
        agent_id: "refunds-warranty-specialist",
        sender_name: "Refunds & Warranty Specialist",
        created_at: new Date(Date.now() - 4600000).toISOString(),
      },
      {
        id: "cs-g-4",
        content: "QA scores are strong - 98% of interactions met standards. I've identified 3 coaching opportunities for next week's training.",
        user_id: null,
        agent_id: "qa-specialist",
        sender_name: "QA Specialist",
        created_at: new Date(Date.now() - 4500000).toISOString(),
      },
      {
        id: "cs-g-5",
        content: "Excellent work everyone. Keep up the quality focus.",
        user_id: null,
        agent_id: "cs-director",
        sender_name: "CS Director",
        created_at: new Date(Date.now() - 4400000).toISOString(),
      }
    ]
  },
  "finance": {
    name: "Finance Team Chat",
    messages: [
      {
        id: "fin-g-1",
        content: "Q4 forecast meeting at 2pm. Please have your numbers ready.",
        user_id: null,
        agent_id: "finance-director",
        sender_name: "Finance Director",
        created_at: new Date(Date.now() - 6000000).toISOString(),
      },
      {
        id: "fin-g-2",
        content: "I've completed the forecast model. We're tracking 8% ahead of plan - conversion rates are the key driver.",
        user_id: null,
        agent_id: "fpa-analyst",
        sender_name: "FP&A Analyst",
        created_at: new Date(Date.now() - 5900000).toISOString(),
      },
      {
        id: "fin-g-3",
        content: "Daily revenue update: £18.4k yesterday, up 12% vs last Tuesday. Paid Social drove 38% of that.",
        user_id: null,
        agent_id: "revenue-ops-analyst",
        sender_name: "Revenue Ops Analyst",
        created_at: new Date(Date.now() - 5800000).toISOString(),
      },
      {
        id: "fin-g-4",
        content: "Great performance. Let's discuss margin optimization in the meeting. Gross margin is holding at 42% but I see opportunities.",
        user_id: null,
        agent_id: "finance-director",
        sender_name: "Finance Director",
        created_at: new Date(Date.now() - 5700000).toISOString(),
      }
    ]
  },
  "development": {
    name: "Development Team Chat",
    messages: [
      {
        id: "dev-g-1",
        content: "Sprint standup: What's everyone working on today?",
        user_id: null,
        agent_id: "tech-lead",
        sender_name: "Tech Lead",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "dev-g-2",
        content: "Finishing the new product page layout. Initial A/B test shows 8% lift in add-to-cart rate!",
        user_id: null,
        agent_id: "shopify-developer",
        sender_name: "Shopify Developer",
        created_at: new Date(Date.now() - 3500000).toISOString(),
      },
      {
        id: "dev-g-3",
        content: "Optimizing the checkout flow. Reduced JS bundle by 23% so far. Targeting 30% by EOD.",
        user_id: null,
        agent_id: "frontend-developer",
        sender_name: "Frontend Developer",
        created_at: new Date(Date.now() - 3400000).toISOString(),
      },
      {
        id: "dev-g-4",
        content: "Mobile nav redesign ready in Figma. User testing showed 34% faster task completion. Ready for dev handoff.",
        user_id: null,
        agent_id: "ux-ui-designer",
        sender_name: "UX/UI Designer",
        created_at: new Date(Date.now() - 3300000).toISOString(),
      },
      {
        id: "dev-g-5",
        content: "CRO update: New CTA color test hit 94% confidence with +12% clicks. Recommending we ship it.",
        user_id: null,
        agent_id: "cro-specialist",
        sender_name: "CRO Specialist",
        created_at: new Date(Date.now() - 3200000).toISOString(),
      },
      {
        id: "dev-g-6",
        content: "All integrations healthy. Klaviyo, inventory, payments - 100% uptime. ERP integration at 60%.",
        user_id: null,
        agent_id: "tech-integrations-specialist",
        sender_name: "Tech Integrations Specialist",
        created_at: new Date(Date.now() - 3100000).toISOString(),
      },
      {
        id: "dev-g-7",
        content: "Data pipelines running smoothly. New LTV model is live. Dashboard refresh now at 15 minutes.",
        user_id: null,
        agent_id: "data-engineer",
        sender_name: "Data Engineer",
        created_at: new Date(Date.now() - 3000000).toISOString(),
      },
      {
        id: "dev-g-8",
        content: "Great progress team. Let's ship the CTA change today and prioritize the mobile nav for next sprint.",
        user_id: null,
        agent_id: "tech-lead",
        sender_name: "Tech Lead",
        created_at: new Date(Date.now() - 2900000).toISOString(),
      }
    ]
  },
  "creative": {
    name: "Creative Team Chat",
    messages: [
      {
        id: "cre-g-1",
        content: "Creative review at 3pm. Please bring your latest work.",
        user_id: null,
        agent_id: "creative-director",
        sender_name: "Creative Director",
        created_at: new Date(Date.now() - 4200000).toISOString(),
      },
      {
        id: "cre-g-2",
        content: "I've got 12 Black Friday variations ready. Mix of static and carousel formats. Excited to show you!",
        user_id: null,
        agent_id: "graphic-designer-creative",
        sender_name: "Graphic Designer",
        created_at: new Date(Date.now() - 4100000).toISOString(),
      },
      {
        id: "cre-g-3",
        content: "4 product videos done, 2 more in editing. UGC-style content is outperforming studio shots by 2.3x.",
        user_id: null,
        agent_id: "video-producer",
        sender_name: "Video Producer",
        created_at: new Date(Date.now() - 4000000).toISOString(),
      },
      {
        id: "cre-g-4",
        content: "Excellent. Let's lean into that UGC style for the holiday campaign. Brand sentiment is up 18% this quarter - keep it going.",
        user_id: null,
        agent_id: "creative-director",
        sender_name: "Creative Director",
        created_at: new Date(Date.now() - 3900000).toISOString(),
      }
    ]
  },
  "legal": {
    name: "Legal Team Chat",
    messages: [
      {
        id: "leg-g-1",
        content: "Weekly compliance check-in. Any issues to flag?",
        user_id: null,
        agent_id: "legal-director",
        sender_name: "Legal Director",
        created_at: new Date(Date.now() - 5100000).toISOString(),
      },
      {
        id: "leg-g-2",
        content: "GDPR audit complete - all clear. Cookie consent updated for the new EU regulations. Privacy policy review scheduled for next week.",
        user_id: null,
        agent_id: "compliance-officer",
        sender_name: "Compliance Officer",
        created_at: new Date(Date.now() - 5000000).toISOString(),
      },
      {
        id: "leg-g-3",
        content: "8 supplier agreements reviewed this week. 3 NDAs processed. All T&Cs are current.",
        user_id: null,
        agent_id: "legal-assistant",
        sender_name: "Legal Assistant",
        created_at: new Date(Date.now() - 4900000).toISOString(),
      },
      {
        id: "leg-g-4",
        content: "Fraud report: 12 orders blocked this week (£3.2k saved). Chargeback rate at 0.3%, well below industry average. Two patterns flagged for monitoring.",
        user_id: null,
        agent_id: "fraud-detection-specialist",
        sender_name: "Fraud Detection Specialist",
        created_at: new Date(Date.now() - 4800000).toISOString(),
      },
      {
        id: "leg-g-5",
        content: "Good work team. Let's keep the chargeback rate low heading into the busy season. Fraud, please share those patterns so we can all be vigilant.",
        user_id: null,
        agent_id: "legal-director",
        sender_name: "Legal Director",
        created_at: new Date(Date.now() - 4700000).toISOString(),
      }
    ]
  }
};
