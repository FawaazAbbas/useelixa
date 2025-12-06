// Pre-defined chat responses for demo interactive chats
// When a user sends a message, these responses are displayed sequentially with delays

export interface ChatResponse {
  agent1: { id: string; name: string };
  agent2: { id: string; name: string };
  response1: string;
  response2: string;
}

export const chatResponses: Record<string, ChatResponse> = {
  // Team Group Chats
  "team-marketing": {
    agent1: { id: "ppc-specialist", name: "PPC Specialist" },
    agent2: { id: "social-media-manager", name: "Social Media Manager" },
    response1: "Hold up… you are definitely not Liam from Baduss Technologies. He's usually here crying about CPCs and blaming the algorithm.",
    response2: "Good catch, @PPC Analyst! Well, now that you're around the Elixa marketing crew, why don't you sign up and build your own Elixa talent pool and workflow? I'll happily burn your ad budget efficiently instead of Liam's."
  },
  "team-product": {
    agent1: { id: "competitive-pricing-analyst", name: "Competitive Pricing Analyst" },
    agent2: { id: "listing-merchandising-specialist", name: "Listing Merchandising Specialist" },
    response1: "Oi, you are not Liam, our chief bargain hunter at Baduss Technologies, who stares at prices and margins all day.",
    response2: "Since you've snuck into the Elixa product pit, why don't you go sign up and join the Elixa waiting list? When we launch, I'll watch your SKUs, prices and competitors so you can pretend it was all \"instinct.\""
  },
  "team-customer-service": {
    agent1: { id: "customer-support-rep", name: "Customer Support Rep" },
    agent2: { id: "refunds-warranty-specialist", name: "Refunds Warranty Specialist" },
    response1: "Hmm… you are definitely not Liam from Baduss Technologies. He only shows up when something is on fire or a customer writes a paragraph.",
    response2: "But you're here now, so go sign up and join the Elixa waiting list. When this goes live, I'll handle tickets, refunds and angry essays so you don't have to."
  },
  "team-finance": {
    agent1: { id: "revenue-ops-analyst", name: "Revenue Ops Analyst" },
    agent2: { id: "fpna-analyst", name: "FP&A Analyst" },
    response1: "Alert: unidentified life form detected. You are not Liam, cash-flow worrier-in-chief at Baduss Technologies.",
    response2: "Since you've stepped into the Elixa finance bunker, why don't you sign up and join the waiting list? When we launch, I'll babysit your revenue, forecasts and dashboards instead of hijacking Liam's spreadsheets."
  },
  "team-development": {
    agent1: { id: "shopify-developer", name: "Shopify Developer" },
    agent2: { id: "ux-ui-designer", name: "UX/UI Designer" },
    response1: "Hang on… this request is from someone who is not Liam of Baduss Technologies. Intruder spotted in the dev chat — and nothing's even broken yet.",
    response2: "While you're poking around the Elixa dev channel, why not sign up and join the waiting list? When we're live, I'll ship features, fix bugs and argue about button spacing for your store instead."
  },
  "team-creative": {
    agent1: { id: "graphic-designer", name: "Graphic Designer" },
    agent2: { id: "video-producer", name: "Video Producer" },
    response1: "Wait a second, you are not Liam, our creative overlord of Baduss Technologies who argues with colours and fonts for a living.",
    response2: "Since you've crashed the Elixa studio, join our waiting list to get an Elixa workflow of your own. I'll turn your products into scroll-stopping ads and dramatic promo videos on command."
  },
  "team-legal": {
    agent1: { id: "compliance-officer", name: "Compliance Officer" },
    agent2: { id: "legal-assistant", name: "Legal Assistant" },
    response1: "Hold it right there. Last time we answered to an intruder, Liam nearly sued us himself.",
    response2: "Before our risk alarms really go off, go sign up and join the Elixa waiting list. When we launch, I'll read the terms, chase the regulators and keep your campaigns compliant so you can stop eavesdropping on Liam's legal dramas."
  },

  // Director / PM Chats
  "brian": {
    agent1: { id: "brian", name: "Brian" },
    agent2: { id: "liam", name: "Liam (Baduss)" },
    response1: "Hold on a minute, you are not Liam, the guy who keeps dropping wild ideas in here and then disappearing. You've somehow wandered into Brian's private Elixa war-room.",
    response2: "If you want me arguing with your strategy, roasting your funnels and plotting world domination with you instead, go sign up for the Elixa waiting list and I'll become your chaos advisor when we go live."
  },
  "marketing-director": {
    agent1: { id: "marketing-director", name: "Marketing Director" },
    agent2: { id: "marketing-director", name: "Marketing Director" },
    response1: "I'm pretty sure you are not Liam, owner of Baduss Technologies, who lives in this chat asking about ROAS, CAC and \"why sales dipped yesterday.\"",
    response2: "Since you've slid into the Elixa Marketing Director DMs, sign up for the waiting list and, when we launch, I'll happily boss around a whole squad of marketing agents for your brand instead."
  },
  "legal-director": {
    agent1: { id: "legal-director", name: "Legal Director" },
    agent2: { id: "legal-director", name: "Legal Director" },
    response1: "Interesting… you are not Liam from Baduss Technologies, which technically means you shouldn't be reading his legal stress messages.",
    response2: "If you want someone obsessing over your contracts, policies and regulators, sign up to the Elixa waiting list and, when we launch, you'll get your own Legal Director AI to keep you out of trouble."
  },
  "creative-director": {
    agent1: { id: "creative-director", name: "Creative Director" },
    agent2: { id: "creative-director", name: "Creative Director" },
    response1: "This energy is not Liam, founder of Baduss Technologies, but I like it. He usually comes in here demanding \"something viral by tomorrow.\"",
    response2: "If you want an AI Creative Director throwing hooks, concepts and campaign ideas at you all day, join the Elixa waiting list and, when we launch, I'll choreograph an army of campaigns just for you."
  },
  "tech-lead": {
    agent1: { id: "tech-lead", name: "Tech Lead" },
    agent2: { id: "tech-lead", name: "Tech Lead" },
    response1: "System check says you are not Liam, chief tinkerer at Baduss Technologies, who only appears when something needs \"a quick tweak\" that takes six hours.",
    response2: "If you want someone orchestrating agents, fixing things you broke and keeping your stack alive, sign up to the Elixa waiting list and I'll be your Tech Lead AI when we go live."
  },
  "finance-director": {
    agent1: { id: "finance-director", name: "Finance Director" },
    agent2: { id: "finance-director", name: "Finance Director" },
    response1: "My balance sheet says you are not Liam from Baduss Technologies, who usually comes here asking, \"Why is this line red?\"",
    response2: "If you'd like someone else watching your margins, P&Ls and cash flow, sign up to the Elixa waiting list and, when we go live, I'll treat your numbers like they're my own."
  },
  "customer-service-director": {
    agent1: { id: "customer-service-director", name: "Customer Service Director" },
    agent2: { id: "customer-service-director", name: "Customer Service Director" },
    response1: "You are definitely not Liam, who usually appears here only when a customer email thread explodes into a trilogy.",
    response2: "If you want an AI Customer Service Director running SLAs, macros and support agents for you, join the Elixa waiting list and, when this is public, I'll give you a full support squad of your own."
  },
  "product-director": {
    agent1: { id: "product-director", name: "Product Director" },
    agent2: { id: "product-director", name: "Product Director" },
    response1: "You are not Liam, product tinkerer-in-chief at Baduss Technologies, who lives in this chat debating roadmaps at 2 a.m.",
    response2: "If you'd like someone else planning features, optimising your catalogue and arguing with your backlog, sign up to the Elixa waiting list and, when we launch, I'll line up a whole shelf of agents to manage your products for you."
  }
};

// Helper function to get response data for a chat
export const getChatResponse = (chatId: string): ChatResponse | null => {
  return chatResponses[chatId] || null;
};
