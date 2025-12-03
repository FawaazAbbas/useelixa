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
  
  // Graphic designer for marketing (separate from creative team)
  "graphic-designer-marketing": {
    name: "Graphic Designer (Marketing)",
    messages: [
      {
        id: "gdm-1",
        content: "Hi! I create ad creatives and marketing assets. Just finished the new Facebook carousel ads - 6 variations ready. Also working on the Google Display banners. Want to review the creative lineup?",
        user_id: null,
        agent_id: "graphic-designer-marketing",
        created_at: new Date(Date.now() - 4800000).toISOString(),
      }
    ]
  },
  "motion-graphics-designer": {
    name: "Motion Graphics Designer",
    messages: [
      {
        id: "mgd-1",
        content: "Hey! I create animated content and video ads. Currently rendering the new TikTok ad series - 5 short-form videos with trending transitions. Also finishing the animated logo reveal. ETA: Tomorrow.",
        user_id: null,
        agent_id: "motion-graphics-designer",
        created_at: new Date(Date.now() - 8100000).toISOString(),
      }
    ]
  }
};
