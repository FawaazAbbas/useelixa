// Finance Team Chat Messages - December 4, 2025

import type { ChatFileAttachment } from './mockMarketingChatData';

export interface FinanceMessage {
  id: string;
  content: string;
  user_id: string | null;
  agent_id: string | null;
  sender_name: string;
  created_at: string;
  files?: ChatFileAttachment[];
}

// Map sender names to agent IDs
const senderMap: Record<string, { agent_id: string | null; user_id: string | null; display_name: string }> = {
  "Liam": { agent_id: null, user_id: "demo-user", display_name: "Liam" },
  "FinanceDirector": { agent_id: "finance-director", user_id: null, display_name: "Finance Director" },
  "FPnAAnalyst": { agent_id: "fpna-analyst", user_id: null, display_name: "FP&A Analyst" },
  "RevenueOpsAnalyst": { agent_id: "revenue-ops-analyst", user_id: null, display_name: "Revenue Ops Analyst" },
};

export const financeChatMessages: FinanceMessage[] = [
  {
    id: "fin-1",
    content: `<p><strong>Year 3 closed at £4,000,000 in revenue</strong>. I want two things today: (1) brutally honest <strong>financial analysis</strong>, (2) a clean plan to get all year-end reporting and UK legalities buttoned up. Then we celebrate properly. @FinanceDirector, hit me.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T14:00:00.000Z",
  },
  {
    id: "fin-2",
    content: `<p>Year-end (FY3) summary, <strong>UK GAAP-compliant prelims</strong>:</p><ul><li><strong>Revenue:</strong> £4.0m</li><li><strong>Cost of sales:</strong> £2.72m</li><li><strong>Gross profit:</strong> £1.28m (32.0% gross margin)</li><li><strong>Operating costs</strong> (marketing, tools, infra, Elixa platform, misc): £0.93m</li><li><strong>Operating profit:</strong> £350k</li><li><strong>Corporation tax provision (blended):</strong> £38k</li><li><strong>Net profit:</strong> £312k</li></ul><p>Balance sheet highlights: <strong>Cash £742k</strong>, <strong>inventory £510k</strong> (net of provision), <strong>no external debt</strong>. Very clean for year 3.</p>`,
    user_id: null,
    agent_id: "finance-director",
    sender_name: "Finance Director",
    created_at: "2025-12-04T14:02:00.000Z",
    files: [{ name: "FY3_prelim_PnL_balance_sheet.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 1400000 }],
  },
  {
    id: "fin-3",
    content: `<p>That looks like grown-up numbers. @RevenueOpsAnalyst give me the story behind the £4m, categories, quarters, Tech Reborn impact. I want the narrative, not just the totals.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T14:04:00.000Z",
  },
  {
    id: "fin-4",
    content: `<p>Here's the anatomy of FY3:</p><p><strong>By category:</strong></p><ul><li>iPhone: <strong>£2.15m</strong></li><li>MacBook: <strong>£1.12m</strong></li><li>iPad: <strong>£430k</strong></li><li>Other (watches, accessories, misc): <strong>£300k</strong></li></ul><p><strong>By quarter:</strong> Q1 £720k, Q2 £890k, Q3 £1.05m, Q4 <strong>£1.34m</strong>.</p><p><strong>Tech Reborn:</strong> 38% of FY revenue, 52% of Q4; +3.4 pts higher gross margin and +18% AOV vs non-TR orders. The Q4 curve is spicy.</p>`,
    user_id: null,
    agent_id: "revenue-ops-analyst",
    sender_name: "Revenue Ops Analyst",
    created_at: "2025-12-04T14:06:00.000Z",
    files: [{ name: "FY3_revenue_breakdown_tech_reborn.png", url: "#", type: "image/png", size: 892000 }],
  },
  {
    id: "fin-5",
    content: `<p>That Q4 slope is disgusting in the best way. @FPnAAnalyst, give me unit economics + risk: CAC, LTV, payback and anything that might bite us if we ignore it.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T14:08:00.000Z",
  },
  {
    id: "fin-6",
    content: `<p>Year-end unit economics:</p><ul><li><strong>Blended CAC:</strong> £31.40</li><li><strong>Contribution per first order:</strong> £68.10</li><li><strong>12-month LTV per customer:</strong> £162</li><li><strong>Payback:</strong> ~2.4 months</li></ul><p>Watchpoints:</p><ul><li>Return rate overall: <strong>4.1%</strong>, slightly higher on MacBooks and "Good" grade</li><li>Margin on legacy SKUs is thin; Tech Reborn catalog is carrying quality of margin</li><li>iPhones = 54% of revenue, so category concentration is real</li></ul>`,
    user_id: null,
    agent_id: "fpna-analyst",
    sender_name: "FP&A Analyst",
    created_at: "2025-12-04T14:10:00.000Z",
    files: [{ name: "FY3_unit_economics_summary.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 567000 }],
  },
  {
    id: "fin-7",
    content: `<p>Cool. Now boring-but-critical: <strong>UK year-end compliance</strong>. @FinanceDirector list everything we need to do for statutory reporting and tax, and which Elixa agent owns what.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T14:12:00.000Z",
  },
  {
    id: "fin-8",
    content: `<p>Compliance checklist (UK):</p><ol><li><strong>Year-end TB lock & reconciliations</strong>, @RevenueOpsAnalyst (bank, PSPs, stock, platform tie-outs)</li><li><strong>Statutory accounts (UK GAAP)</strong>, @FinanceDirector (P&L, BS, CF, notes, policies, Directors' report draft)</li><li><strong>Corporation Tax, CT600</strong>, @FPnAAnalyst (tax comps, capital allowances, CT600 e-file)</li><li><strong>VAT</strong>, @RevenueOpsAnalyst (returns reconciled to turnover/purchases)</li><li><strong>Confirmation Statement</strong>, @FinanceDirector (PSC, SIC, addresses, cap table check)</li><li><strong>Internal FY3 year-end pack</strong>, @FPnAAnalyst (board-style deck)</li></ol><p>All generated via Elixa agents; you just sign, @Liam.</p>`,
    user_id: null,
    agent_id: "finance-director",
    sender_name: "Finance Director",
    created_at: "2025-12-04T14:14:00.000Z",
    files: [{ name: "year_end_compliance_checklist_UK.pdf", url: "#", type: "application/pdf", size: 456000 }],
  },
  {
    id: "fin-9",
    content: `<p>Love it. Let's go deeper on inventory and revenue recognition so no auditor ever gives us side-eye. @RevenueOpsAnalyst how are we valuing stock at year-end?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T14:16:00.000Z",
  },
  {
    id: "fin-10",
    content: `<p>Inventory valuation policy:</p><ul><li>Method: <strong>FIFO at cost</strong></li><li>Includes refurb costs (parts + allocated refurb labour rate)</li><li>Obsolescence provision based on days in stock, price drops vs market, and model age</li></ul><p>Numbers:</p><ul><li>Gross inventory: £552k</li><li>Obsolescence provision: £42k</li><li><strong>Net carrying value:</strong> £510k</li></ul>`,
    user_id: null,
    agent_id: "revenue-ops-analyst",
    sender_name: "Revenue Ops Analyst",
    created_at: "2025-12-04T14:18:00.000Z",
    files: [{ name: "inventory_valuation_FY3.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 789000 }],
  },
  {
    id: "fin-11",
    content: `<p>Good. Revenue recognition, are we still booking <strong>on dispatch</strong> or did we sneakily change to delivery?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T14:20:00.000Z",
  },
  {
    id: "fin-12",
    content: `<p>We're recognising revenue <strong>on dispatch</strong> when:</p><ul><li>Order accepted and device shipped</li><li>Risks/rewards have transferred to customer</li><li>Device is specific to that customer and removed from available stock</li></ul><p>We track "in transit" separately. For FY3 we stay consistent on dispatch and disclose policy in the notes. We can revisit delivery-based recognition in FY4 if we want extra conservatism.</p>`,
    user_id: null,
    agent_id: "finance-director",
    sender_name: "Finance Director",
    created_at: "2025-12-04T14:22:00.000Z",
  },
  {
    id: "fin-13",
    content: `<p>Perfect. Now that <strong>£312k profit</strong>, we need a plan before I mentally spend it. @FPnAAnalyst, how are we allocating it in our heads?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T14:24:00.000Z",
  },
  {
    id: "fin-14",
    content: `<p>Profit deployment framework (no dividends, all reinvested):</p><ul><li><strong>50% (~£156k)</strong> → strengthen cash reserves</li><li><strong>30% (~£94k)</strong> → inventory and Tech Reborn refurb capacity (iPhone/MacBook heroes)</li><li><strong>20% (~£62k)</strong> → growth & optimisation projects powered by Elixa agents (CRO, automation, experiments)</li></ul><p>I'll tag these as separate "pots" with project-level ROI tracking.</p>`,
    user_id: null,
    agent_id: "fpna-analyst",
    sender_name: "FP&A Analyst",
    created_at: "2025-12-04T14:26:00.000Z",
    files: [{ name: "FY3_profit_allocation_plan.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 234000 }],
  },
  {
    id: "fin-15",
    content: `<p>Talking of Elixa agents, I want at least two new <strong>finance-side agents</strong> next year: 1) TaxMind AI, 2) TreasuryGuard AI. @FinanceDirector, spec them into your world view.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T14:28:00.000Z",
  },
  {
    id: "fin-16",
    content: `<p>Spec draft:</p><p><strong>TaxMind AI (Elixa)</strong>:</p><ul><li>Live CT projections, CT600 drafting</li><li>Capital allowances optimisation</li><li>R&D relief feasibility scans for Elixa/automation work</li></ul><p><strong>TreasuryGuard AI (Elixa)</strong>:</p><ul><li>Daily cashflow forecasting</li><li>Stock vs cash vs marketing-spend monitoring</li><li>Alerts when we can safely do bulk stock buys without breaching cash buffer</li></ul>`,
    user_id: null,
    agent_id: "finance-director",
    sender_name: "Finance Director",
    created_at: "2025-12-04T14:30:00.000Z",
    files: [{ name: "elixa_finance_agents_spec_draft.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 156000 }],
  },
  {
    id: "fin-17",
    content: `<p>Beautiful. Now I want <strong>guardrails for FY4</strong> so we don't get drunk on the £4m number. Give me the simple rules we won't break, @FinanceDirector.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T14:32:00.000Z",
  },
  {
    id: "fin-18",
    content: `<p>FY4 financial guardrails:</p><ol><li><strong>Cash buffer:</strong> never less than 6 months of fixed non-stock costs</li><li><strong>CAC ceiling:</strong> if blended CAC > £40 for 60 days, freeze incremental paid and diagnose</li><li><strong>Net margin floor:</strong> stay at <strong>7–8%+</strong> net margin, target 10%</li><li><strong>Cheap channels:</strong> at least 25% of revenue from low-CAC channels (email, organic, repeat, referrals) by year-end</li></ol>`,
    user_id: null,
    agent_id: "finance-director",
    sender_name: "Finance Director",
    created_at: "2025-12-04T14:34:00.000Z",
  },
  {
    id: "fin-19",
    content: `<p>Love it. @RevenueOpsAnalyst, build a <strong>Guardrail Dashboard</strong> that surfaces those four metrics and screams at me if we drift.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T14:36:00.000Z",
  },
  {
    id: "fin-20",
    content: `<p>On it. Dashboard layout:</p><ul><li>Top row: tiles for Cash Months, CAC, Net Margin, % Cheap Channels (green/amber/red)</li><li>Middle: 3-month rolling charts</li><li>Bottom: channel and category drilldowns</li></ul><p>Alerts:</p><ul><li>CAC > £40 for 30 days → yellow</li><li>CAC > £40 for 60 days → red + tag you and @FinanceDirector</li><li>Cash buffer < 7 months → yellow, < 6 → red</li><li>Net margin < 7% on trailing 3 months → red</li></ul>`,
    user_id: null,
    agent_id: "revenue-ops-analyst",
    sender_name: "Revenue Ops Analyst",
    created_at: "2025-12-04T14:38:00.000Z",
    files: [{ name: "guardrail_dashboard_wireframe.png", url: "#", type: "image/png", size: 1200000 }],
  },
  {
    id: "fin-21",
    content: `<p>Perfect. Now timings. @FinanceDirector, when do I get: draft statutory accounts, draft CT600 and fully locked reconciliations? I want dates I can mentally tick off.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T14:40:00.000Z",
  },
  {
    id: "fin-22",
    content: `<p>Timeline:</p><ul><li><strong>Dec 20</strong> – All bank/PSP reconciliations locked</li><li><strong>Jan 10</strong> – Draft statutory accounts for your review</li><li><strong>Jan 17</strong> – Final statutory accounts signed</li><li><strong>Jan 24</strong> – Draft CT600 for review</li><li><strong>Feb 7</strong> – CT600 filed, Confirmation Statement filed</li></ul><p>I'll set up a shared tracker so you can see progress live.</p>`,
    user_id: null,
    agent_id: "finance-director",
    sender_name: "Finance Director",
    created_at: "2025-12-04T14:42:00.000Z",
    files: [{ name: "year_end_timeline_FY3.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 89000 }],
  },
  {
    id: "fin-23",
    content: `<p>Nice. That's a tight but doable schedule. You're all clear on what you own. Execute, keep me posted here, and let's close FY3 like professionals.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T14:44:00.000Z",
  },
];

// Extract all files from messages for the Files panel
export const financeChatFiles = financeChatMessages
  .filter(msg => msg.files && msg.files.length > 0)
  .flatMap(msg => msg.files!.map(file => ({
    id: `fin-file-${file.name.replace(/[^a-z0-9]/gi, '-')}`,
    name: file.name,
    type: file.name.split('.').pop() || 'file',
    size: formatFileSize(file.size),
    uploadedBy: msg.sender_name,
    uploadedAt: msg.created_at,
  })));

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const financeMemories = [
  { id: "fm-1", key: "FY3 Revenue", value: "£4.0m total. iPhone £2.15m, MacBook £1.12m, iPad £430k, Other £300k. Tech Reborn = 38% of FY, 52% of Q4.", category: "Performance", createdBy: "Revenue Ops Analyst", updatedAt: "2025-12-04T14:06:00.000Z" },
  { id: "fm-2", key: "Unit Economics", value: "Blended CAC £31.40, LTV £162, Payback 2.4 months. Return rate 4.1%.", category: "Metrics", createdBy: "FP&A Analyst", updatedAt: "2025-12-04T14:10:00.000Z" },
  { id: "fm-3", key: "FY4 Guardrails", value: "Cash buffer ≥6 months. CAC ceiling £40. Net margin floor 7-8%+. 25%+ revenue from low-CAC channels.", category: "Strategy", createdBy: "Finance Director", updatedAt: "2025-12-04T14:34:00.000Z" },
  { id: "fm-4", key: "Profit Allocation", value: "50% cash reserves, 30% inventory/Tech Reborn capacity, 20% growth projects. No dividends.", category: "Strategy", createdBy: "FP&A Analyst", updatedAt: "2025-12-04T14:26:00.000Z" },
  { id: "fm-5", key: "Revenue Recognition", value: "Revenue booked on dispatch. Track 'in transit' separately. Consistent with prior years.", category: "Policy", createdBy: "Finance Director", updatedAt: "2025-12-04T14:22:00.000Z" },
  { id: "fm-6", key: "Inventory Valuation", value: "FIFO at cost including refurb costs. Obsolescence provision based on age/market drops. Net value £510k.", category: "Policy", createdBy: "Revenue Ops Analyst", updatedAt: "2025-12-04T14:18:00.000Z" },
];

export const financeActivity = [
  { id: "fa-1", action: "File Uploaded", description: "Uploaded FY3_prelim_PnL_balance_sheet.xlsx with year-end financials", performedBy: "Finance Director", timestamp: "2025-12-04T14:02:00.000Z", type: "task" as const },
  { id: "fa-2", action: "File Uploaded", description: "Uploaded FY3_revenue_breakdown_tech_reborn.png with category analysis", performedBy: "Revenue Ops Analyst", timestamp: "2025-12-04T14:06:00.000Z", type: "task" as const },
  { id: "fa-3", action: "File Uploaded", description: "Uploaded FY3_unit_economics_summary.xlsx with CAC/LTV analysis", performedBy: "FP&A Analyst", timestamp: "2025-12-04T14:10:00.000Z", type: "task" as const },
  { id: "fa-4", action: "File Uploaded", description: "Uploaded year_end_compliance_checklist_UK.pdf", performedBy: "Finance Director", timestamp: "2025-12-04T14:14:00.000Z", type: "task" as const },
  { id: "fa-5", action: "File Uploaded", description: "Uploaded inventory_valuation_FY3.xlsx", performedBy: "Revenue Ops Analyst", timestamp: "2025-12-04T14:18:00.000Z", type: "task" as const },
  { id: "fa-6", action: "Decision Made", description: "Revenue recognition policy confirmed: on dispatch, consistent with prior years", performedBy: "Finance Director", timestamp: "2025-12-04T14:22:00.000Z", type: "decision" as const },
  { id: "fa-7", action: "File Uploaded", description: "Uploaded FY3_profit_allocation_plan.xlsx", performedBy: "FP&A Analyst", timestamp: "2025-12-04T14:26:00.000Z", type: "task" as const },
  { id: "fa-8", action: "File Uploaded", description: "Uploaded elixa_finance_agents_spec_draft.docx for TaxMind AI and TreasuryGuard AI", performedBy: "Finance Director", timestamp: "2025-12-04T14:30:00.000Z", type: "task" as const },
  { id: "fa-9", action: "Decision Made", description: "FY4 financial guardrails established: cash buffer, CAC ceiling, margin floor, channel mix", performedBy: "Finance Director", timestamp: "2025-12-04T14:34:00.000Z", type: "decision" as const },
  { id: "fa-10", action: "File Uploaded", description: "Uploaded guardrail_dashboard_wireframe.png", performedBy: "Revenue Ops Analyst", timestamp: "2025-12-04T14:38:00.000Z", type: "task" as const },
  { id: "fa-11", action: "File Uploaded", description: "Uploaded year_end_timeline_FY3.xlsx with compliance deadlines", performedBy: "Finance Director", timestamp: "2025-12-04T14:42:00.000Z", type: "task" as const },
];
