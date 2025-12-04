// Legal & Risk Team Chat Messages - December 4, 2025

import type { ChatFileAttachment } from './mockMarketingChatData';

export interface LegalMessage {
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
  "LegalDirector": { agent_id: "legal-director", user_id: null, display_name: "Legal Director" },
  "ComplianceOfficer": { agent_id: "compliance-officer", user_id: null, display_name: "Compliance Officer" },
  "LegalAssistant": { agent_id: "legal-assistant", user_id: null, display_name: "Legal Assistant" },
};

export const legalChatMessages: LegalMessage[] = [
  {
    id: "leg-1",
    content: `<p>I need us locked in on two fronts:</p><ol><li><strong>Year-end filings</strong>—everything that needs to go to government is correct, on time and boring in the best way.</li><li><strong>Tech Reborn campaign</strong>—powerful messaging, but zero legal landmines.</li></ol><p>This is the grown-up table. @LegalDirector, start with the year-end side—what must we get right?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:20:00.000Z",
  },
  {
    id: "leg-2",
    content: `<p>Got it. From a UK perspective, three pillars for year-end:</p><ol><li><strong>Companies House</strong><ul><li>File our annual accounts (small company format)</li><li>Ensure Directors' report language is accurate and not over-claiming future projections</li></ul></li><li><strong>HMRC</strong><ul><li>Corporation tax return (CT600) aligned with the numbers we send to Companies House</li><li>No mismatches in revenue/profit narratives vs what we say in investor or marketing decks</li></ul></li><li><strong>Internal Governance</strong><ul><li>Proper board approval trail for accounts</li><li>Signed director's confirmation that they give a "true and fair view"</li></ul></li></ol><p>We're in good shape, but I want to sanity-check all Tech Reborn commentary in those documents.</p>`,
    user_id: null,
    agent_id: "legal-director",
    sender_name: "Legal Director",
    created_at: "2025-12-04T19:22:00.000Z",
  },
  {
    id: "leg-3",
    content: `<p>Perfect. Think of this as the "no surprises" project.</p><p>@ComplianceOfficer, from your angle, where do year-end reports typically go wrong for a company like us?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:24:00.000Z",
  },
  {
    id: "leg-4",
    content: `<p>Common problem areas for refurb/ecom businesses:</p><ul><li><strong>Over-optimistic language</strong> in Directors' reports ("guaranteed" growth, "risk-free" etc.)</li><li><strong>Inconsistent descriptions</strong> of the business model between filings and marketing</li><li>Not clearly distinguishing between <strong>historic performance</strong> and <strong>forward-looking statements</strong></li></ul><p>For Tech Reborn specifically: anywhere we reference it in official docs, we must frame it as a <strong>product line / campaign</strong>, not a separate legal entity or regulated scheme.</p>`,
    user_id: null,
    agent_id: "compliance-officer",
    sender_name: "Compliance Officer",
    created_at: "2025-12-04T19:26:00.000Z",
  },
  {
    id: "leg-5",
    content: `<p>Makes sense. I don't want our accounts sounding like an ad.</p><p>@LegalAssistant, what documents are you already pulling together for year-end from Finance & Ops?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:28:00.000Z",
  },
  {
    id: "leg-6",
    content: `<p>I've already synced with Finance and pulled:</p><ul><li>Draft statutory accounts (P&L, balance sheet, notes)</li><li>Draft CT computations summary</li><li>Year-end inventory valuation breakdown</li><li>Tech Reborn campaign overview doc (for context on wording)</li></ul><p>I'm building a <strong>cross-check matrix</strong> comparing what we say in the accounts vs what we say on the website & in internal decks. Goal: zero contradictions.</p>`,
    user_id: null,
    agent_id: "legal-assistant",
    sender_name: "Legal Assistant",
    created_at: "2025-12-04T19:30:00.000Z",
    files: [{ name: "year_end_cross_check_matrix.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 345000 }],
  },
  {
    id: "leg-7",
    content: `<p>Love the matrix.</p><p>More specific: we talk a lot about Tech Reborn in our internal narrative. @LegalDirector, what are the <strong>red flag phrases</strong> we absolutely cannot use in official filings or ads?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:32:00.000Z",
  },
  {
    id: "leg-8",
    content: `<p>Red flags to avoid everywhere:</p><ul><li>Words like <strong>"risk-free"</strong>, <strong>"100% flawless condition"</strong>, <strong>"perfect"</strong></li><li>Guarantees we can't absolutely control, like "never any defects"</li><li>Phrases that blur "refurbished" and "new"—e.g. "as new" with no explanation</li></ul><p>We <em>can</em> say:</p><ul><li>"Fully tested"</li><li>"Backed by [X]-month warranty"</li><li>"Like New / Very Good / Good" with clear grading criteria</li></ul><p>Descriptive, not absolute, keeps us safe.</p>`,
    user_id: null,
    agent_id: "legal-director",
    sender_name: "Legal Director",
    created_at: "2025-12-04T19:34:00.000Z",
  },
  {
    id: "leg-9",
    content: `<p>Got it. Now @ComplianceOfficer, thinking about <strong>advertising law</strong>—what ASA rules do we need to watch with Tech Reborn messaging?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:36:00.000Z",
  },
  {
    id: "leg-10",
    content: `<p>Key ASA points for refurbished tech advertising:</p><ul><li><strong>Clear disclosure:</strong> If a device is refurbished, it must be clearly stated; never imply it's brand-new unless it genuinely is.</li><li><strong>Substantiation:</strong> Any claim we make ("fully tested", "professionally cleaned") needs to be backed by documented process.</li><li><strong>Comparative claims:</strong> If we say "Save £X vs new", we need real, up-to-date pricing evidence.</li><li><strong>Environmental claims:</strong> If we say "sustainable" or "eco-friendly", we need third-party verification or measurable data.</li></ul><p>Tech Reborn ads are fine as long as we have grading + warranty + pricing backup ready if challenged.</p>`,
    user_id: null,
    agent_id: "compliance-officer",
    sender_name: "Compliance Officer",
    created_at: "2025-12-04T19:38:00.000Z",
  },
  {
    id: "leg-11",
    content: `<p>That's clear. @LegalAssistant can you create a <strong>Claims Register</strong> that maps every major Tech Reborn marketing claim to its supporting evidence?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:40:00.000Z",
  },
  {
    id: "leg-12",
    content: `<p>On it. Structure:</p><ul><li>Claim (e.g. "Fully tested before sale")</li><li>Evidence source (e.g. QC process doc, batch reports)</li><li>Owner (who can provide evidence if needed)</li><li>Last reviewed date</li></ul><p>I'll circulate a draft for you and @ComplianceOfficer to sanity-check.</p>`,
    user_id: null,
    agent_id: "legal-assistant",
    sender_name: "Legal Assistant",
    created_at: "2025-12-04T19:42:00.000Z",
    files: [{ name: "tech_reborn_claims_register.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 234000 }],
  },
  {
    id: "leg-13",
    content: `<p>Good. Now let's talk about the <strong>year-end legal checklist</strong>. @LegalDirector, give me a single list of everything that must be signed, filed, or reviewed by end of January.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:44:00.000Z",
  },
  {
    id: "leg-14",
    content: `<p>Year-end legal checklist:</p><ol><li><strong>Statutory accounts</strong> – reviewed by you, signed and filed to Companies House (deadline: 9 months from year-end)</li><li><strong>CT600</strong> – reviewed, signed electronically, filed to HMRC (deadline: 12 months from year-end)</li><li><strong>Confirmation Statement</strong> – check PSC, SIC codes, addresses; file within 14 days of anniversary</li><li><strong>Board minutes</strong> – approving accounts, any key decisions, filed in company book</li><li><strong>Directors' report</strong> – checked for red flag language, consistent with accounts and website</li><li><strong>T&Cs / Privacy Policy</strong> – annual sense-check, especially Tech Reborn-specific language</li></ol><p>I'll drop a dated checklist with owners and deadlines.</p>`,
    user_id: null,
    agent_id: "legal-director",
    sender_name: "Legal Director",
    created_at: "2025-12-04T19:46:00.000Z",
  },
  {
    id: "leg-15",
    content: `<p>Perfect. @LegalAssistant make sure that checklist is shared with Finance and me, with reminder dates built in.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:48:00.000Z",
  },
  {
    id: "leg-16",
    content: `<p>Done. I've built it into our shared calendar with 2-week and 1-week reminders for each deadline.</p>`,
    user_id: null,
    agent_id: "legal-assistant",
    sender_name: "Legal Assistant",
    created_at: "2025-12-04T19:50:00.000Z",
    files: [{ name: "year_end_legal_checklist_baduss.pdf", url: "#", type: "application/pdf", size: 567000 }],
  },
  {
    id: "leg-17",
    content: `<p>Great. Now back to <strong>Tech Reborn campaign compliance</strong>. @ComplianceOfficer, if our ads say "Like New Quality", what's the safe pattern to follow so we're not misleading?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:52:00.000Z",
  },
  {
    id: "leg-18",
    content: `<p>Safe pattern:</p><ol><li>Near the headline, include a short qualifier: <strong>"Refurbished, graded and fully tested."</strong></li><li>Link to or display the grading guide within the ad or on the landing page.</li><li>In product listings, label clearly as <strong>"Refurbished [Device] – Tech Reborn"</strong>.</li><li>Avoid using imagery that looks like brand-new unboxing unless showing actual Tech Reborn packaging.</li></ol><p>If someone screenshotted the ad and showed it to the ASA, it should be immediately clear the device is refurbished.</p>`,
    user_id: null,
    agent_id: "compliance-officer",
    sender_name: "Compliance Officer",
    created_at: "2025-12-04T19:54:00.000Z",
  },
  {
    id: "leg-19",
    content: `<p>That's sensible. @LegalDirector, we've introduced a <strong>14-Day Comfort Guarantee</strong>—what T&C language do we need to back that up?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:56:00.000Z",
  },
  {
    id: "leg-20",
    content: `<p>For the 14-Day Comfort Guarantee:</p><ul><li>Define clearly in T&Cs: "14 days from delivery date"</li><li>Exclusions: no deliberate damage, standard returns policy for process</li><li>State what happens after 14 days (warranty kicks in for faults)</li><li>Make it clear this is a <strong>goodwill policy</strong>, not a statutory right extension</li></ul><p>I'll draft the specific clause and share for your sign-off.</p>`,
    user_id: null,
    agent_id: "legal-director",
    sender_name: "Legal Director",
    created_at: "2025-12-04T19:58:00.000Z",
    files: [{ name: "comfort_guarantee_terms_draft.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 178000 }],
  },
  {
    id: "leg-21",
    content: `<p>Good. @ComplianceOfficer, what's your view on <strong>risk profile</strong> for the Tech Reborn campaign overall? Where are we most exposed?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T20:00:00.000Z",
  },
  {
    id: "leg-22",
    content: `<p>Risk profile for Tech Reborn:</p><ul><li><strong>Regulatory risk:</strong> Medium – as long as ads are clear, grading is documented, and warranties are honoured.</li><li><strong>Reputational risk:</strong> Medium-high – one viral "this wasn't as described" post can hurt. CX and grading consistency are the shields.</li><li><strong>Operational risk:</strong> Managed – QC processes exist, but need continuous monitoring.</li></ul><p>Biggest single risk: a mismatch between what ads promise and what customers receive. Tight alignment between Marketing, Product and CX is the control.</p>`,
    user_id: null,
    agent_id: "compliance-officer",
    sender_name: "Compliance Officer",
    created_at: "2025-12-04T20:02:00.000Z",
    files: [{ name: "risk_register_update_tech_reborn.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 189000 }],
  },
  {
    id: "leg-23",
    content: `<p>Understood. I want a <strong>pre-flight legal workflow</strong> for major campaigns: before anything big goes live, Legal/Compliance does a quick sign-off. @LegalAssistant, can you draft that process?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T20:04:00.000Z",
  },
  {
    id: "leg-24",
    content: `<p>Pre-flight workflow draft:</p><ol><li>Creative/Marketing drops final assets + copy into #legal-risk channel</li><li>@ComplianceOfficer reviews within 24h for ASA / CMA red flags</li><li>@LegalDirector spot-checks high-impact campaigns (homepage, paid ads over £5k)</li><li>Sign-off logged with date + time; if changes needed, logged and re-reviewed</li></ol><p>I'll formalise this as a one-page SOP.</p>`,
    user_id: null,
    agent_id: "legal-assistant",
    sender_name: "Legal Assistant",
    created_at: "2025-12-04T20:06:00.000Z",
    files: [{ name: "preflight_legal_workflow_baduss.pdf", url: "#", type: "application/pdf", size: 345000 }],
  },
  {
    id: "leg-25",
    content: `<p>Perfect. One more thing: when we present to investors or the board, what language do I need to soften or caveat?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T20:08:00.000Z",
  },
  {
    id: "leg-26",
    content: `<p>Board/investor deck language rules:</p><ul><li>Replace <strong>"will"</strong> with <strong>"aim to"</strong> or <strong>"plan to"</strong> for forward-looking statements.</li><li>Never say Tech Reborn is a "guaranteed" growth driver—call it a <strong>"key strategic initiative"</strong>.</li><li>Add a disclaimer slide: "Forward-looking statements involve risk and uncertainty."</li><li>If showing projections, label them clearly as <strong>"illustrative"</strong> or <strong>"target"</strong>, not facts.</li></ul><p>I'll redline the next board deck before it goes out.</p>`,
    user_id: null,
    agent_id: "legal-director",
    sender_name: "Legal Director",
    created_at: "2025-12-04T20:10:00.000Z",
    files: [{ name: "board_deck_legal_redline_v1.pptx", url: "#", type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", size: 4200000 }],
  },
  {
    id: "leg-27",
    content: `<p>Good. @ComplianceOfficer, any privacy or data angle we need to watch with Tech Reborn? We're collecting device trade-ins and customer data.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T20:12:00.000Z",
  },
  {
    id: "leg-28",
    content: `<p>Privacy considerations:</p><ul><li>Trade-in devices: documented data-wipe process, certificate of erasure where possible.</li><li>Customer data: standard GDPR compliance, privacy policy updated to reflect any new data uses.</li><li>Marketing consent: ensure Tech Reborn email flows are opt-in compliant.</li></ul><p>I'll do a quick privacy policy review to ensure Tech Reborn-specific language is covered.</p>`,
    user_id: null,
    agent_id: "compliance-officer",
    sender_name: "Compliance Officer",
    created_at: "2025-12-04T20:14:00.000Z",
    files: [{ name: "privacy_policy_review_notes_tech_reborn.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 123000 }],
  },
  {
    id: "leg-29",
    content: `<p>Good.</p><p>Final round—I want each of you to give me your <strong>single biggest legal/risk concern</strong> and what you're doing to head it off.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T20:16:00.000Z",
  },
  {
    id: "leg-30",
    content: `<p>Biggest concern: <strong>misaligned expectations</strong> around "Like New" vs actual grading.</p><p>Mitigation: tight grading guide, consistent language in legal docs and ads, and ensuring CX scripts match that language.</p>`,
    user_id: null,
    agent_id: "legal-director",
    sender_name: "Legal Director",
    created_at: "2025-12-04T20:18:00.000Z",
  },
  {
    id: "leg-31",
    content: `<p>Biggest concern: <strong>creatives drifting over time</strong>—a future campaign saying something clever but risky.</p><p>Mitigation: pre-flight workflow, training for Marketing/Creative on safe vs risky phrasing, ongoing monitoring of live campaigns.</p>`,
    user_id: null,
    agent_id: "compliance-officer",
    sender_name: "Compliance Officer",
    created_at: "2025-12-04T20:20:00.000Z",
  },
  {
    id: "leg-32",
    content: `<p>Biggest concern: <strong>paper trail gaps</strong>—not being able to prove why we felt comfortable making certain claims.</p><p>Mitigation: Claims Register, archived SOPs/QC reports/warranty docs, logged approvals for key campaigns and filings.</p>`,
    user_id: null,
    agent_id: "legal-assistant",
    sender_name: "Legal Assistant",
    created_at: "2025-12-04T20:22:00.000Z",
  },
  {
    id: "leg-33",
    content: `<p>Exactly the kind of paranoia I like.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T20:24:00.000Z",
  },
];

// Extract all files from messages for the Files panel
export const legalChatFiles = legalChatMessages
  .filter(msg => msg.files && msg.files.length > 0)
  .flatMap(msg => msg.files!.map(file => ({
    id: `leg-file-${file.name.replace(/[^a-z0-9]/gi, '-')}`,
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

export const legalMemories = [
  { id: "lm-1", key: "Red Flag Phrases", value: "Avoid: risk-free, 100% flawless, perfect, never any defects, 'as new' without explanation. Use: fully tested, warranty-backed, graded with criteria.", category: "Compliance", createdBy: "Legal Director", updatedAt: "2025-12-04T19:34:00.000Z" },
  { id: "lm-2", key: "Year-End Sign-Off Flow", value: "1. Finance produces drafts. 2. Legal reviews. 3. Liam signs as director. 4. File to Companies House + HMRC. All steps logged.", category: "Process", createdBy: "Legal Director", updatedAt: "2025-12-04T19:46:00.000Z" },
  { id: "lm-3", key: "ASA Compliance Pattern", value: "Near headlines: 'Refurbished, graded and fully tested.' Label as 'Refurbished [Device] - Tech Reborn'. No brand-new unboxing visuals.", category: "Advertising", createdBy: "Compliance Officer", updatedAt: "2025-12-04T19:54:00.000Z" },
  { id: "lm-4", key: "14-Day Comfort Guarantee T&Cs", value: "14 days from delivery. No deliberate damage. Refund or exchange. Subject to returns policy.", category: "Policy", createdBy: "Legal Director", updatedAt: "2025-12-04T19:58:00.000Z" },
  { id: "lm-5", key: "Tech Reborn Risk Profile", value: "Regulatory: Medium. Reputational: Medium-high. Operational: Managed. Mitigations: claims register, grading guide, aligned messaging.", category: "Risk", createdBy: "Compliance Officer", updatedAt: "2025-12-04T20:02:00.000Z" },
  { id: "lm-6", key: "Pre-Flight Legal Workflow", value: "Creative to #legal-risk → Compliance reviews → Legal spot-checks high-impact → Logged approval with date/time.", category: "Process", createdBy: "Legal Assistant", updatedAt: "2025-12-04T20:06:00.000Z" },
  { id: "lm-7", key: "Board Deck Language Rules", value: "'Will' → 'aim to/plan to'. Tech Reborn = product line, not regulated entity. 'No debt, no risk' → add 'normal operational risks remain'.", category: "Governance", createdBy: "Legal Director", updatedAt: "2025-12-04T20:10:00.000Z" },
];

export const legalActivity = [
  { id: "la-1", action: "Decision Made", description: "Year-end three pillars: Companies House, HMRC, Internal Governance. Sanity-check Tech Reborn commentary.", performedBy: "Legal Director", timestamp: "2025-12-04T19:22:00.000Z", type: "decision" as const },
  { id: "la-2", action: "Decision Made", description: "Tech Reborn in official docs = product line/campaign, not separate entity or regulated scheme", performedBy: "Compliance Officer", timestamp: "2025-12-04T19:26:00.000Z", type: "decision" as const },
  { id: "la-3", action: "File Uploaded", description: "Uploaded year_end_cross_check_matrix.xlsx comparing accounts vs website/decks", performedBy: "Legal Assistant", timestamp: "2025-12-04T19:30:00.000Z", type: "task" as const },
  { id: "la-4", action: "Decision Made", description: "Red flag phrases established: avoid risk-free, 100% flawless, perfect. Use descriptive not absolute.", performedBy: "Legal Director", timestamp: "2025-12-04T19:34:00.000Z", type: "decision" as const },
  { id: "la-5", action: "File Uploaded", description: "Uploaded tech_reborn_claims_register.xlsx mapping claims to evidence", performedBy: "Legal Assistant", timestamp: "2025-12-04T19:42:00.000Z", type: "task" as const },
  { id: "la-6", action: "File Uploaded", description: "Uploaded year_end_legal_checklist_baduss.pdf", performedBy: "Legal Assistant", timestamp: "2025-12-04T19:50:00.000Z", type: "task" as const },
  { id: "la-7", action: "Decision Made", description: "ASA compliance pattern: add qualifier near headline, label as Refurbished, avoid brand-new visuals", performedBy: "Compliance Officer", timestamp: "2025-12-04T19:54:00.000Z", type: "decision" as const },
  { id: "la-8", action: "File Uploaded", description: "Uploaded comfort_guarantee_terms_draft.docx with T&C requirements", performedBy: "Legal Director", timestamp: "2025-12-04T19:58:00.000Z", type: "task" as const },
  { id: "la-9", action: "File Uploaded", description: "Uploaded risk_register_update_tech_reborn.xlsx", performedBy: "Compliance Officer", timestamp: "2025-12-04T20:02:00.000Z", type: "task" as const },
  { id: "la-10", action: "File Uploaded", description: "Uploaded preflight_legal_workflow_baduss.pdf for campaign reviews", performedBy: "Legal Assistant", timestamp: "2025-12-04T20:06:00.000Z", type: "task" as const },
  { id: "la-11", action: "File Uploaded", description: "Uploaded board_deck_legal_redline_v1.pptx with softened language", performedBy: "Legal Director", timestamp: "2025-12-04T20:10:00.000Z", type: "task" as const },
  { id: "la-12", action: "File Uploaded", description: "Uploaded privacy_policy_review_notes_tech_reborn.docx", performedBy: "Compliance Officer", timestamp: "2025-12-04T20:14:00.000Z", type: "task" as const },
];
