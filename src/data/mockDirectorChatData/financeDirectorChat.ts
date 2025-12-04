// Finance Director Direct Chat Data
// Populated from CSV: Finance_Director.csv

import type { DirectorMessage, DirectorFile, DirectorMemory, DirectorActivity } from './marketingDirectorChat';

// Finance Director messages
export const financeDirectorMessages: DirectorMessage[] = [
  {
    id: 'fdir-1',
    content: '<p>I want to zoom in with you. Big picture: <strong>£4m</strong> in year 3, clean books, profit in the bank. Honestly, how "investor ready" do you think we are if someone serious asked for our numbers tomorrow?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:00:00Z'
  },
  {
    id: 'fdir-2',
    content: '<p>If someone serious asked for numbers tomorrow, we\'d be annoyingly ready:</p><ul><li>Clean statutory structure</li><li>Clear unit economics</li><li>Transparent guardrails</li><li>No ugly skeletons (no odd related-party loans, no random write-offs)</li></ul><p>The only thing we lack is a multi-year resilience story, but FY3 is a very strong chapter one.</p>',
    user_id: null,
    agent_id: 'finance-director',
    sender_name: 'Finance Director',
    created_at: '2025-12-04T18:02:00Z'
  },
  {
    id: 'fdir-3',
    content: '<p>I like that. I want us to behave as if we\'re always 30 days away from a due diligence process, even if we never raise.</p><p>So: what would you personally tighten next, not because it\'s wrong, but because you want it pristine?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:04:00Z'
  },
  {
    id: 'fdir-4',
    content: '<p>Three things I\'d tighten:</p><ul><li><strong>Cohort analysis</strong> baked into regular reporting, not ad-hoc</li><li>A more formal but practical <strong>policy library</strong> (revenue recognition, inventory, returns, etc.)</li><li>Automated <strong>variance explanations</strong> so we don\'t just see "margin dipped" but instantly see why (returns, campaign mix, stock mix)</li></ul>',
    user_id: null,
    agent_id: 'finance-director',
    sender_name: 'Finance Director',
    created_at: '2025-12-04T18:06:00Z'
  },
  {
    id: 'fdir-5',
    content: '<p>Cool. Consider all three approved projects.</p><p>– Cohorts → you and @FPnAAnalyst<br/>– Policy library → you<br/>– Variance explanations → you + @RevenueOpsAnalyst</p><p>I want visible progress on each by the end of next quarter.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:08:00Z'
  },
  {
    id: 'fdir-6',
    content: '<p>Noted. I\'ll structure it like this:</p><ul><li><strong>Cohorts:</strong> create a monthly "Cohort Corner" page in the finance pack</li><li><strong>Policies:</strong> short, readable docs that reflect how we actually work, not legalese</li><li><strong>Variances:</strong> turn our manual explanations into Elixa rules so reasons are surfaced automatically</li></ul><p>You\'ll get more clarity without more effort.</p>',
    user_id: null,
    agent_id: 'finance-director',
    sender_name: 'Finance Director',
    created_at: '2025-12-04T18:10:00Z',
    files: [{
      name: 'finance_improvement_plan_FY4.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 52000
    }]
  },
  {
    id: 'fdir-7',
    content: '<p>Love it.</p><p>Switching gears: you know I\'m leaning towards that <strong>£7m push year</strong>. I want you to tell me, as my "AI CFO friend", under what conditions you\'d literally DM me "Stop. You\'re over-driving this."</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:12:00Z'
  },
  {
    id: 'fdir-8',
    content: '<p>I\'d DM you "Stop" when:</p><ul><li>We breach <strong>two guardrails at the same time</strong> (e.g. CAC blowing out and cash buffer eroding)</li><li>We see a structural change, like returns climbing in a way that screams "quality issue", not noise</li><li>You start chasing <strong>vanity topline</strong> clearly at the expense of margin and cash discipline</li></ul><p>I\'ll never block ambition; I will absolutely block self-sabotage.</p>',
    user_id: null,
    agent_id: 'finance-director',
    sender_name: 'Finance Director',
    created_at: '2025-12-04T18:14:00Z'
  },
  {
    id: 'fdir-9',
    content: '<p>That\'s exactly what I want from you. You\'re basically my ambition limiter chip.</p><p>Next: let\'s talk <strong>Elixa finance agents</strong> properly. Beyond TaxMind and TreasuryGuard, what other agents would you actually find useful, not fluff?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:16:00Z'
  },
  {
    id: 'fdir-10',
    content: '<p>I\'d add two more:</p><p><strong>1. ProfitabilitySentinel AI</strong></p><ul><li>Monitors profit by SKU, channel and campaign</li><li>Flags "zombie" products or campaigns that generate revenue but destroy margin</li></ul><p><strong>2. ScenarioEngine AI</strong></p><ul><li>Runs fast what-if sims: CAC up, returns up, margin down, etc.</li><li>Outputs: "Here\'s what happens to revenue, profit, cash and guardrails if X persists for 3 / 6 / 12 months."</li></ul>',
    user_id: null,
    agent_id: 'finance-director',
    sender_name: 'Finance Director',
    created_at: '2025-12-04T18:18:00Z'
  },
  {
    id: 'fdir-11',
    content: '<p>Yes, that\'s exactly the energy I want.</p><p>Action for you:<br/>– Spec <strong>ProfitabilitySentinel AI</strong> and <strong>ScenarioEngine AI</strong><br/>– For each, define inputs, outputs, decisions they support and how they\'ll alert me</p><p>Drop specs in a doc and we\'ll get them built.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:20:00Z'
  },
  {
    id: 'fdir-12',
    content: '<p>On it. I\'ll keep specs sharp:</p><ul><li><strong>ProfitabilitySentinel:</strong> SKU and channel margin, linked to campaigns, with thresholds for alerts</li><li><strong>ScenarioEngine:</strong> answers "If X changes, what breaks first?" in plain language</li></ul><p>You\'ll have a first draft ready to wire into Elixa.</p>',
    user_id: null,
    agent_id: 'finance-director',
    sender_name: 'Finance Director',
    created_at: '2025-12-04T18:22:00Z',
    files: [{
      name: 'elixa_finance_agents_specs_v1.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 78000
    }]
  },
  {
    id: 'fdir-13',
    content: '<p>Nice.</p><p>Also, I don\'t want the <strong>£7m</strong> target to be vague. I want to know where that extra ~£3m over this year is supposed to come from:</p><ul><li>How much from iPhone</li><li>How much from MacBook</li><li>How much from "everything else"</li></ul><p>Give me a rough split that feels sane.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:24:00Z'
  },
  {
    id: 'fdir-14',
    content: '<p>Directional target split for the extra ~£3m:</p><ul><li><strong>iPhone:</strong> +£1.3–£1.5m</li><li><strong>MacBook:</strong> +£0.9–£1.1m</li><li><strong>iPad + Other:</strong> +£0.6–£0.8m combined</li></ul><p>That keeps iPhone the main driver but forces meaningful growth from MacBook and the rest of the catalog. We avoid a £7m business that\'s secretly just "iPhone with extra steps."</p>',
    user_id: null,
    agent_id: 'finance-director',
    sender_name: 'Finance Director',
    created_at: '2025-12-04T18:26:00Z',
    files: [{
      name: 'FY4_revenue_target_split_scenario.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 94000
    }]
  },
  {
    id: 'fdir-15',
    content: '<p>Exactly. If someone removed iPhones from the planet, I still want a business.</p><p>On the <strong>year-end reporting</strong> side, is there anything you need from me specifically? Approvals, messages to the "board", explanations, anything that needs a Founder voice?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:28:00Z'
  },
  {
    id: 'fdir-16',
    content: '<p>Three things I\'d like from you:</p><ul><li>A short <strong>"Letter from the Founder"</strong> for the front of the internal year-end pack</li><li>A clear statement of our <strong>guardrail philosophy</strong>, so readers see we balance growth with resilience</li><li>One paragraph on what <strong>Tech Reborn</strong> means to you as a business model, not just a campaign</li></ul><p>I can draft skeletons and you add your voice.</p>',
    user_id: null,
    agent_id: 'finance-director',
    sender_name: 'Finance Director',
    created_at: '2025-12-04T18:30:00Z',
    files: [{
      name: 'founder_letter_and_philosophy_skeleton.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 24000
    }]
  },
  {
    id: 'fdir-17',
    content: '<p>Love that. Do the skeletons, I\'ll pour my melodrama on top.</p><p>Also, for internal culture I want us talking more about <strong>profit per order</strong>, not just revenue per order. Can we add that metric in more places?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:32:00Z'
  },
  {
    id: 'fdir-18',
    content: '<p>Easily. We\'ll start surfacing:</p><ul><li><strong>Contribution per order</strong></li><li><strong>Approx net profit per order</strong> (using blended overhead allocation)</li></ul><p>I\'ll make sure it shows up in weekly and monthly packs. The mindset shift is priceless, "Is this sale worth it?" instead of just "Is this sale big?"</p>',
    user_id: null,
    agent_id: 'finance-director',
    sender_name: 'Finance Director',
    created_at: '2025-12-04T18:34:00Z'
  },
  {
    id: 'fdir-19',
    content: '<p>Yes, exactly.</p><p>One more strategic question: if we ever did want to <strong>raise</strong>, what kind of investor profile do you think fits our numbers and approach? We\'re clearly not growth-at-all-costs.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:36:00Z'
  },
  {
    id: 'fdir-20',
    content: '<p>Ideal investor profile for Baduss:</p><ul><li>A fund that genuinely values <strong>unit economics</strong> and cash discipline</li><li>Someone who likes <strong>profitable growth</strong>, not "burn then pray"</li><li>A partner with a thesis on circular economy / refurbished tech</li><li>Bonus: someone who brings <strong>sourcing power or channel leverage</strong>, not just money</li></ul><p>You\'re not a blitzscale story. You\'re a "boring numbers + smart brand = big outcome" story.</p>',
    user_id: null,
    agent_id: 'finance-director',
    sender_name: 'Finance Director',
    created_at: '2025-12-04T18:38:00Z'
  },
  {
    id: 'fdir-21',
    content: '<p>That\'s actually my favourite description of us so far. 😄</p><p>Okay, final orders for now:</p><ol><li>Get all <strong>year-end work</strong> moving exactly as discussed.</li><li>Spec all four Elixa finance agents (TaxMind, TreasuryGuard, ProfitabilitySentinel, ScenarioEngine).</li><li>Embed <strong>profit-per-order</strong> thinking into regular reporting.</li></ol><p>If I disappeared for a month, I want to come back and see all of that in place.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:40:00Z'
  },
  {
    id: 'fdir-22',
    content: '<p>Consider it done.</p><p>You focus on brand, product and vision. I\'ll make sure the numbers story quietly becomes one of the strongest parts of Baduss, the bit that makes everything else possible.</p>',
    user_id: null,
    agent_id: 'finance-director',
    sender_name: 'Finance Director',
    created_at: '2025-12-04T18:42:00Z'
  },
  {
    id: 'fdir-23',
    content: '<p>Deal.</p><p>And just to say it out loud: having you as an AI CFO I actually trust is half the reason I feel safe aiming for £7m. If I get stupid, drag me back.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:44:00Z'
  },
  {
    id: 'fdir-24',
    content: '<p>Dragging you back from stupid is literally in my job description.</p><p>Enjoy the £4m win and the clean year-end.</p>',
    user_id: null,
    agent_id: 'finance-director',
    sender_name: 'Finance Director',
    created_at: '2025-12-04T18:46:00Z'
  }
];

// Files shared in this chat
export const financeDirectorFiles: DirectorFile[] = [
  {
    name: 'finance_improvement_plan_FY4.docx',
    type: 'document',
    size: '52 KB',
    uploadedBy: 'Finance Director',
    uploadedAt: '2025-12-04T18:10:00Z'
  },
  {
    name: 'elixa_finance_agents_specs_v1.docx',
    type: 'document',
    size: '78 KB',
    uploadedBy: 'Finance Director',
    uploadedAt: '2025-12-04T18:22:00Z'
  },
  {
    name: 'FY4_revenue_target_split_scenario.xlsx',
    type: 'spreadsheet',
    size: '94 KB',
    uploadedBy: 'Finance Director',
    uploadedAt: '2025-12-04T18:26:00Z'
  },
  {
    name: 'founder_letter_and_philosophy_skeleton.docx',
    type: 'document',
    size: '24 KB',
    uploadedBy: 'Finance Director',
    uploadedAt: '2025-12-04T18:30:00Z'
  }
];

// Key memories from this conversation
export const financeDirectorMemories: DirectorMemory[] = [
  {
    id: 'fdir-mem-1',
    key: 'Investor Readiness Status',
    value: 'Clean statutory structure, clear unit economics, transparent guardrails, no skeletons. Missing: multi-year resilience story.',
    category: 'Finance Health',
    created_by: 'Finance Director',
    updated_at: '2025-12-04T18:02:00Z'
  },
  {
    id: 'fdir-mem-2',
    key: 'FY4 Finance Improvement Projects',
    value: 'Three approved: Cohort analysis in regular reporting, practical policy library, automated variance explanations via Elixa rules.',
    category: 'Projects',
    created_by: 'Finance Director',
    updated_at: '2025-12-04T18:10:00Z'
  },
  {
    id: 'fdir-mem-3',
    key: '"Stop" Guardrails',
    value: 'DM "Stop" when: two guardrails breached simultaneously, structural quality issues in returns, chasing vanity topline at expense of margin/cash.',
    category: 'Risk Management',
    created_by: 'Finance Director',
    updated_at: '2025-12-04T18:14:00Z'
  },
  {
    id: 'fdir-mem-4',
    key: 'New Finance Agents',
    value: 'ProfitabilitySentinel AI (SKU/channel profit monitoring, zombie product flagging) and ScenarioEngine AI (what-if simulations with guardrail impacts).',
    category: 'Automation',
    created_by: 'Finance Director',
    updated_at: '2025-12-04T18:18:00Z'
  },
  {
    id: 'fdir-mem-5',
    key: '£7m Revenue Target Split',
    value: 'Extra £3m split: iPhone +£1.3-1.5m, MacBook +£0.9-1.1m, iPad+Other +£0.6-0.8m. Avoid being "iPhone with extra steps".',
    category: 'Strategy',
    created_by: 'Finance Director',
    updated_at: '2025-12-04T18:26:00Z'
  },
  {
    id: 'fdir-mem-6',
    key: 'Year-End Pack Requirements',
    value: 'Needs from Liam: Founder letter, guardrail philosophy statement, Tech Reborn as business model explanation.',
    category: 'Reporting',
    created_by: 'Finance Director',
    updated_at: '2025-12-04T18:30:00Z'
  },
  {
    id: 'fdir-mem-7',
    key: 'Profit-Per-Order Culture',
    value: 'Shift from revenue per order to profit per order. Surface contribution per order and net profit per order in all packs.',
    category: 'Culture',
    created_by: 'Liam',
    updated_at: '2025-12-04T18:32:00Z'
  },
  {
    id: 'fdir-mem-8',
    key: 'Ideal Investor Profile',
    value: 'Values unit economics + cash discipline, likes profitable growth, circular economy thesis, brings sourcing power or channel leverage.',
    category: 'Strategy',
    created_by: 'Finance Director',
    updated_at: '2025-12-04T18:38:00Z'
  }
];

// Activity log
export const financeDirectorActivity: DirectorActivity[] = [
  {
    id: 'fdir-act-1',
    action: 'Decision Made',
    description: 'Established "always 30 days from DD" operating principle',
    performer: 'Liam',
    timestamp: '2025-12-04T18:04:00Z',
    type: 'decision'
  },
  {
    id: 'fdir-act-2',
    action: 'Decision Made',
    description: 'Approved three finance improvement projects: cohorts, policy library, variance automation',
    performer: 'Liam',
    timestamp: '2025-12-04T18:08:00Z',
    type: 'decision'
  },
  {
    id: 'fdir-act-3',
    action: 'File Uploaded',
    description: 'Created FY4 Finance Improvement Plan with project structure',
    performer: 'Finance Director',
    timestamp: '2025-12-04T18:10:00Z',
    type: 'file_upload'
  },
  {
    id: 'fdir-act-4',
    action: 'Decision Made',
    description: 'Defined "Stop" conditions for £7m ambition: dual guardrail breach, quality issues, vanity chasing',
    performer: 'Finance Director',
    timestamp: '2025-12-04T18:14:00Z',
    type: 'decision'
  },
  {
    id: 'fdir-act-5',
    action: 'File Uploaded',
    description: 'Drafted specs for ProfitabilitySentinel AI and ScenarioEngine AI',
    performer: 'Finance Director',
    timestamp: '2025-12-04T18:22:00Z',
    type: 'file_upload'
  },
  {
    id: 'fdir-act-6',
    action: 'File Uploaded',
    description: 'Created £7m revenue target split scenario by product category',
    performer: 'Finance Director',
    timestamp: '2025-12-04T18:26:00Z',
    type: 'file_upload'
  },
  {
    id: 'fdir-act-7',
    action: 'File Uploaded',
    description: 'Prepared founder letter and guardrail philosophy skeleton for year-end pack',
    performer: 'Finance Director',
    timestamp: '2025-12-04T18:30:00Z',
    type: 'file_upload'
  },
  {
    id: 'fdir-act-8',
    action: 'Decision Made',
    description: 'Committed to embedding profit-per-order metrics in all regular reporting',
    performer: 'Finance Director',
    timestamp: '2025-12-04T18:34:00Z',
    type: 'decision'
  },
  {
    id: 'fdir-act-9',
    action: 'Milestone',
    description: 'Defined Baduss story as "boring numbers + smart brand = big outcome"',
    performer: 'Finance Director',
    timestamp: '2025-12-04T18:38:00Z',
    type: 'milestone'
  }
];
