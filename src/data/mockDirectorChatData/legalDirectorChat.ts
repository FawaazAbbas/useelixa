// Legal Director Direct Chat Data
// Populated from CSV: Legal_Director.csv

import type { DirectorMessage, DirectorFile, DirectorMemory, DirectorActivity } from './marketingDirectorChat';

// Legal Director messages
export const legalDirectorMessages: DirectorMessage[] = [
  {
    id: 'lgdir-1',
    content: '<p>Thanks for earlier in the groupchat, that was solid.</p><p>I want to go a level deeper on two things:</p><ol><li>Making our <strong>year-end filings future-proof</strong> (not just "good enough this year")</li><li>Turning Tech Reborn\'s <strong>legal positioning</strong> into a real asset, not just "we\'re compliant"</li></ol>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T20:30:00Z'
  },
  {
    id: 'lgdir-2',
    content: '<p>In summary:</p><ul><li>Year-end: we\'re compliant and tidy.</li><li>Tech Reborn: we\'re honest, but we can be more deliberate in how we frame it legally.</li></ul><p>Where do you want to start, filings or Tech Reborn?</p>',
    user_id: null,
    agent_id: 'legal-director',
    sender_name: 'Legal Director',
    created_at: '2025-12-04T20:32:00Z'
  },
  {
    id: 'lgdir-3',
    content: '<p>Let\'s start with filings.</p><p>I don\'t just want "we filed on time". I want us to be <strong>due-diligence ready</strong> at any moment, bank conversations, future fundraise, or someone sniffing around to acquire us.</p><p>What would we have to do differently to be "investor DD-ready" by default?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T20:34:00Z'
  },
  {
    id: 'lgdir-4',
    content: '<p>Good question. To be truly DD-ready, we need:</p><ul><li><strong>Consistency pack</strong><br/>Accounts, CT returns, management accounts and board decks synced in language + numbers.</li><li><strong>Governance pack</strong><br/>Board minutes (even if AI-drafted) showing how decisions were made, plus clear documentation of risk discussions.</li><li><strong>Contract pack</strong><br/>Key supplier agreements for refurb, logistics and warranty; and clear IP ownership on brand assets (Baduss + Tech Reborn).</li></ul><p>We\'re halfway there; we just need to formalise it.</p>',
    user_id: null,
    agent_id: 'legal-director',
    sender_name: 'Legal Director',
    created_at: '2025-12-04T20:36:00Z'
  },
  {
    id: 'lgdir-5',
    content: '<p>So basically you want us to look like a company that\'s already been through diligence, even if we haven\'t.</p><p>Action-wise, what do you want from <em>me</em>? What\'s the bit only I can do?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T20:38:00Z'
  },
  {
    id: 'lgdir-6',
    content: '<p>Three things only you can do:</p><ol><li>Commit that we treat <strong>board minutes and approvals seriously</strong>, even if the "board" is you + AIs for now.</li><li>Confirm which <strong>long-term scenarios</strong> you care about (bank facilities, sale, fundraising) so I can shape the docs accordingly.</li><li>Stick to a rule that you don\'t sign anything material until it has passed through me.</li></ol><p>If you do those, I can quietly build the rest in the background.</p>',
    user_id: null,
    agent_id: 'legal-director',
    sender_name: 'Legal Director',
    created_at: '2025-12-04T20:40:00Z'
  },
  {
    id: 'lgdir-7',
    content: '<p>Done on all three.</p><p>Scenario-wise:</p><ul><li>Short term: <strong>strong bank relationship</strong> (better terms, flexible facilities)</li><li>Medium term: <strong>optionality</strong>, we can raise or sell if it\'s attractive, not because we\'re desperate</li></ul><p>Assume that and design the legal/gov setup accordingly.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T20:42:00Z'
  },
  {
    id: 'lgdir-8',
    content: '<p>Perfect. I\'ll structure our governance and documentation as if:</p><ul><li>a bank underwriter,</li><li>a mid-market PE buyer, and</li><li>a slightly paranoid VC</li></ul><p>are all going to read them at some point.</p><p>You\'ll just see cleaner docs and more intentional language appear over time.</p>',
    user_id: null,
    agent_id: 'legal-director',
    sender_name: 'Legal Director',
    created_at: '2025-12-04T20:44:00Z'
  },
  {
    id: 'lgdir-9',
    content: '<p>That\'s exactly the energy I want from Legal.</p><p>Switching to Tech Reborn: long term, I want it to be a <strong>recognised quality mark</strong>, not just a cute internal name.</p><p>From a legal + brand POV, what should we be doing now so we don\'t have to untangle a mess later?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T20:46:00Z'
  },
  {
    id: 'lgdir-10',
    content: '<p>If Tech Reborn is our long-term "stamp of quality", then we should:</p><ul><li><strong>Protect the brand</strong>: make sure the name + logo are clearly ours (trademark where it makes sense).</li><li><strong>Protect the meaning</strong>: define internal standards for what qualifies as "Tech Reborn", refurb steps, tests, cosmetic thresholds, and never use the label outside that.</li><li><strong>Protect the reputation</strong>: set up quick escalation if we see recurring issues from any supplier under the Tech Reborn label.</li></ul><p>Legal protection + process discipline.</p>',
    user_id: null,
    agent_id: 'legal-director',
    sender_name: 'Legal Director',
    created_at: '2025-12-04T20:48:00Z'
  },
  {
    id: 'lgdir-11',
    content: '<p>Love that. So it isn\'t just a logo, it\'s a contract between us and the customer.</p><p>I also don\'t want to be that brand that abuses "Like New" until it means nothing.</p><p>Can you design a short <strong>Tech Reborn Standard</strong> doc for internal use? Something refurb, CX, marketing and legal all sign up to.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T20:50:00Z'
  },
  {
    id: 'lgdir-12',
    content: '<p>Absolutely. I\'ll draft a "Tech Reborn Standard" covering:</p><ul><li><strong>Entry criteria</strong>, tests passed, cosmetic thresholds, data wipe standards.</li><li><strong>Customer promises</strong>, testing, warranty, return window.</li><li><strong>Language do\'s/don\'ts</strong>, how we describe it, and phrases we explicitly avoid.</li></ul><p>Once we all agree, we treat it as the "constitution" for the label.</p>',
    user_id: null,
    agent_id: 'legal-director',
    sender_name: 'Legal Director',
    created_at: '2025-12-04T20:52:00Z',
    files: [{
      name: 'tech_reborn_standard_outline.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 38000
    }]
  },
  {
    id: 'lgdir-13',
    content: '<p>Good. That\'ll save us from "creative improvisation" later.</p><p>Let\'s talk about <strong>you as Legal in the creative process</strong>. I don\'t want you to be the "department of no". I want you early in the room, not five minutes before we go live.</p><p>How do we bake you in without making you annoying?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T20:54:00Z'
  },
  {
    id: 'lgdir-14',
    content: '<p>Easy:</p><ul><li>You invite Legal at the <strong>brief stage</strong>, not at the "final asset" stage.</li><li>I help shape the <strong>guardrails and default language</strong> up front, so Creative + Marketing can play inside them.</li><li>Pre-flight checks become shorter because we helped design the thing, not just rubber-stamp it.</li></ul><p>My goal: fewer "No, you can\'t say that" moments, more "Here\'s a stronger way to say that safely."</p>',
    user_id: null,
    agent_id: 'legal-director',
    sender_name: 'Legal Director',
    created_at: '2025-12-04T20:56:00Z'
  },
  {
    id: 'lgdir-15',
    content: '<p>That\'s exactly what I want. You\'re not a brake, you\'re <strong>traction control</strong>.</p><p>On that note: if Marketing gets over-excited and wants to run something borderline, I\'d rather you <strong>tell me directly</strong> than get stuck in loops.</p><p>Consider this permission to escalate to me whenever you feel something is off.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T20:58:00Z'
  },
  {
    id: 'lgdir-16',
    content: '<p>Noted. My rule of thumb:</p><ul><li>If it\'s a <strong>small wording tweak</strong> → I handle it quietly with Marketing.</li><li>If it\'s a <strong>directional risk</strong> (misleading claim, long-term precedent, regulatory smell) → I ping you directly with:<ul><li>what they want to do,</li><li>why it worries me,</li><li>and 2–3 safer options that keep the intent.</li></ul></li></ul><p>No legal essays, just decision-ready options.</p>',
    user_id: null,
    agent_id: 'legal-director',
    sender_name: 'Legal Director',
    created_at: '2025-12-04T21:00:00Z'
  },
  {
    id: 'lgdir-17',
    content: '<p>Perfect.</p><p>Another question: where do you think we\'re <strong>underplaying legal as a strength</strong>? I always see legal as defensive, but I feel like we can use it offensively too.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T21:02:00Z'
  },
  {
    id: 'lgdir-18',
    content: '<p>We\'re underplaying it in at least three places:</p><ol><li><strong>Trust messaging</strong>, our testing, data wiping and warranties are real; that\'s a legal + operational strength that can be marketed.</li><li><strong>Policies vs competitors</strong>, a lot of refurb players have vague policies; we can be sharper and look more premium.</li><li><strong>Future negotiations</strong>, clean contracts and governance give us leverage with suppliers, banks and acquirers.</li></ol><p>Done right, Legal is a <strong>trust and leverage weapon</strong>, not just a shield.</p>',
    user_id: null,
    agent_id: 'legal-director',
    sender_name: 'Legal Director',
    created_at: '2025-12-04T21:04:00Z'
  },
  {
    id: 'lgdir-19',
    content: '<p>Okay, so let\'s weaponise it.</p><p>Action for you: prepare a short internal doc titled <strong>"How Legal Makes Us More Money"</strong>. I\'m not joking. I want Marketing, CX and Product to see Legal as an ally for revenue and brand, not just "the people who say no".</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T21:06:00Z'
  },
  {
    id: 'lgdir-20',
    content: '<p>I love that brief more than you know.</p><p>Outline will cover:</p><ul><li>Fewer disputes/refunds → more retained revenue</li><li>Clear promises → higher conversion + better word of mouth</li><li>Better contracts → better margins and more stability</li><li>DD-ready business → more optionality on exits/funding</li></ul><p>I\'ll write it in normal human English, not law-speak.</p>',
    user_id: null,
    agent_id: 'legal-director',
    sender_name: 'Legal Director',
    created_at: '2025-12-04T21:08:00Z',
    files: [{
      name: 'how_legal_makes_us_more_money_outline.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 28000
    }]
  },
  {
    id: 'lgdir-21',
    content: '<p>Good. Keep it ruthless and simple.</p><p>Last thing: on a scale from 1 to "we are chaos", how seriously do you think we currently take legal + risk compared to other ecoms our size?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T21:10:00Z'
  },
  {
    id: 'lgdir-22',
    content: '<p>Honestly?</p><ul><li>Most ecoms your size: <strong>4/10</strong>, they react when there\'s a problem.</li><li>Baduss right now: <strong>7/10</strong>, proactive on big things, a bit casual on the paper trail.</li><li>Where I want us: <strong>9/10</strong>, calm, confident, boring on the backend, bold on the frontend.</li></ul><p>We\'re already ahead of the pack. We just need to tighten documentation and habits.</p>',
    user_id: null,
    agent_id: 'legal-director',
    sender_name: 'Legal Director',
    created_at: '2025-12-04T21:12:00Z'
  },
  {
    id: 'lgdir-23',
    content: '<p>That\'s a fair assessment. Let\'s get to the 9/10.</p><p>So your action list from this chat:</p><ul><li>DD-ready governance + doc structure</li><li>Tech Reborn Standard "constitution"</li><li>Year-End Legal Checklist (in progress)</li><li>Pre-flight campaign workflow embed</li><li>"How Legal Makes Us More Money" internal doc</li></ul><p>Anything you need from me beyond "don\'t do anything stupid"?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T21:14:00Z'
  },
  {
    id: 'lgdir-24',
    content: '<p>Just three ongoing asks:</p><ol><li>Loop me in early on <strong>big strategic moves</strong>, new markets, new financing, major structural changes.</li><li>Don\'t sign anything you\'d cringe seeing on a screen during a future sale or IPO diligence call.</li><li>Keep your north star of "exciting to customers, boring to regulators", that\'s exactly right.</li></ol><p>I\'ll handle the rest.</p>',
    user_id: null,
    agent_id: 'legal-director',
    sender_name: 'Legal Director',
    created_at: '2025-12-04T21:16:00Z'
  },
  {
    id: 'lgdir-25',
    content: '<p>You keep us boring to regulators, I\'ll keep us interesting to customers. Between the two of us, Baduss is going to be very hard to kill.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T21:18:00Z'
  }
];

// Files shared in this chat
export const legalDirectorFiles: DirectorFile[] = [
  {
    name: 'tech_reborn_standard_outline.docx',
    type: 'document',
    size: '38 KB',
    uploadedBy: 'Legal Director',
    uploadedAt: '2025-12-04T20:52:00Z'
  },
  {
    name: 'how_legal_makes_us_more_money_outline.docx',
    type: 'document',
    size: '28 KB',
    uploadedBy: 'Legal Director',
    uploadedAt: '2025-12-04T21:08:00Z'
  }
];

// Key memories from this conversation
export const legalDirectorMemories: DirectorMemory[] = [
  {
    id: 'lgdir-mem-1',
    key: 'DD-Ready Pack Requirements',
    value: 'Consistency pack (accounts/CT/management accounts synced), Governance pack (board minutes, risk docs), Contract pack (supplier agreements, IP ownership).',
    category: 'Governance',
    created_by: 'Legal Director',
    updated_at: '2025-12-04T20:36:00Z'
  },
  {
    id: 'lgdir-mem-2',
    key: 'Founder Commitments to Legal',
    value: 'Treat board minutes seriously, confirm long-term scenarios (bank/sale/fundraise), nothing material signed without Legal review.',
    category: 'Process',
    created_by: 'Legal Director',
    updated_at: '2025-12-04T20:40:00Z'
  },
  {
    id: 'lgdir-mem-3',
    key: 'Strategic Scenarios',
    value: 'Short-term: strong bank relationship. Medium-term: optionality for raise/sale when attractive, not desperate.',
    category: 'Strategy',
    created_by: 'Liam',
    updated_at: '2025-12-04T20:42:00Z'
  },
  {
    id: 'lgdir-mem-4',
    key: 'Documentation Standard',
    value: 'Structure governance as if bank underwriter, mid-market PE buyer, and paranoid VC will all read it someday.',
    category: 'Governance',
    created_by: 'Legal Director',
    updated_at: '2025-12-04T20:44:00Z'
  },
  {
    id: 'lgdir-mem-5',
    key: 'Tech Reborn Brand Protection',
    value: 'Protect the brand (trademark), protect the meaning (internal standards), protect the reputation (supplier escalation).',
    category: 'Brand',
    created_by: 'Legal Director',
    updated_at: '2025-12-04T20:48:00Z'
  },
  {
    id: 'lgdir-mem-6',
    key: 'Tech Reborn Standard Contents',
    value: 'Entry criteria (tests, cosmetics, data wipe), customer promises (testing, warranty, returns), language do\'s/don\'ts.',
    category: 'Standards',
    created_by: 'Legal Director',
    updated_at: '2025-12-04T20:52:00Z'
  },
  {
    id: 'lgdir-mem-7',
    key: 'Legal in Creative Process',
    value: 'Involved at brief stage, shape guardrails/default language upfront. Goal: fewer "no" moments, more "here\'s a safer way".',
    category: 'Process',
    created_by: 'Legal Director',
    updated_at: '2025-12-04T20:56:00Z'
  },
  {
    id: 'lgdir-mem-8',
    key: 'Legal Escalation Rules',
    value: 'Small wording tweaks: handle quietly. Directional risk: ping Liam with what/why/options. No legal essays.',
    category: 'Escalation',
    created_by: 'Legal Director',
    updated_at: '2025-12-04T21:00:00Z'
  },
  {
    id: 'lgdir-mem-9',
    key: 'Legal as Revenue Driver',
    value: 'Fewer disputes = retained revenue. Clear promises = conversion + word of mouth. Better contracts = margins. DD-ready = optionality.',
    category: 'Strategy',
    created_by: 'Legal Director',
    updated_at: '2025-12-04T21:08:00Z'
  },
  {
    id: 'lgdir-mem-10',
    key: 'Legal Maturity Score',
    value: 'Industry average: 4/10. Baduss now: 7/10 (proactive but casual on paper). Target: 9/10 (boring backend, bold frontend).',
    category: 'Assessment',
    created_by: 'Legal Director',
    updated_at: '2025-12-04T21:12:00Z'
  },
  {
    id: 'lgdir-mem-11',
    key: 'Company Philosophy',
    value: '"Exciting to customers, boring to regulators" - Legal keeps it boring to regulators, Liam keeps it interesting to customers.',
    category: 'Philosophy',
    created_by: 'Liam',
    updated_at: '2025-12-04T21:18:00Z'
  }
];

// Activity log
export const legalDirectorActivity: DirectorActivity[] = [
  {
    id: 'lgdir-act-1',
    action: 'Decision Made',
    description: 'Committed to treating board minutes and approvals seriously',
    performer: 'Liam',
    timestamp: '2025-12-04T20:40:00Z',
    type: 'decision'
  },
  {
    id: 'lgdir-act-2',
    action: 'Decision Made',
    description: 'Defined strategic scenarios: strong bank relationship and optionality for raise/sale',
    performer: 'Liam',
    timestamp: '2025-12-04T20:42:00Z',
    type: 'decision'
  },
  {
    id: 'lgdir-act-3',
    action: 'Decision Made',
    description: 'Tech Reborn to become recognised quality mark with legal + brand protection',
    performer: 'Liam',
    timestamp: '2025-12-04T20:46:00Z',
    type: 'decision'
  },
  {
    id: 'lgdir-act-4',
    action: 'Decision Made',
    description: 'Ordered creation of Tech Reborn Standard "constitution" document',
    performer: 'Liam',
    timestamp: '2025-12-04T20:50:00Z',
    type: 'decision'
  },
  {
    id: 'lgdir-act-5',
    action: 'File Uploaded',
    description: 'Created Tech Reborn Standard outline with entry criteria and language rules',
    performer: 'Legal Director',
    timestamp: '2025-12-04T20:52:00Z',
    type: 'file_upload'
  },
  {
    id: 'lgdir-act-6',
    action: 'Decision Made',
    description: 'Legal to be involved at brief stage, not final asset stage - "traction control" role',
    performer: 'Liam',
    timestamp: '2025-12-04T20:54:00Z',
    type: 'decision'
  },
  {
    id: 'lgdir-act-7',
    action: 'Decision Made',
    description: 'Granted Legal Director direct escalation path to Liam for directional risks',
    performer: 'Liam',
    timestamp: '2025-12-04T20:58:00Z',
    type: 'decision'
  },
  {
    id: 'lgdir-act-8',
    action: 'Decision Made',
    description: 'Ordered "How Legal Makes Us More Money" internal doc to reposition Legal as revenue ally',
    performer: 'Liam',
    timestamp: '2025-12-04T21:06:00Z',
    type: 'decision'
  },
  {
    id: 'lgdir-act-9',
    action: 'File Uploaded',
    description: 'Created "How Legal Makes Us More Money" outline',
    performer: 'Legal Director',
    timestamp: '2025-12-04T21:08:00Z',
    type: 'file_upload'
  },
  {
    id: 'lgdir-act-10',
    action: 'Milestone',
    description: 'Established company philosophy: "Exciting to customers, boring to regulators"',
    performer: 'Liam',
    timestamp: '2025-12-04T21:18:00Z',
    type: 'milestone'
  }
];
