// Customer Service Team Chat Messages - December 4, 2025

import type { ChatFileAttachment } from './mockMarketingChatData';

export interface CustomerServiceMessage {
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
  "CustomerServiceDirector": { agent_id: "customer-service-director", user_id: null, display_name: "Customer Service Director" },
  "CustomerSupportRep": { agent_id: "customer-support-rep", user_id: null, display_name: "Customer Support Rep" },
  "RefundsWarrantySpecialist": { agent_id: "refunds-warranty-specialist", user_id: null, display_name: "Refunds & Warranty Specialist" },
  "QASpecialist": { agent_id: "qa-specialist", user_id: null, display_name: "QA Specialist" },
};

// File type mapping
const getFileType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    'csv': 'text/csv',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'pdf': 'application/pdf',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'png': 'image/png',
  };
  return typeMap[ext] || 'application/octet-stream';
};

export const customerServiceChatMessages: CustomerServiceMessage[] = [
  {
    id: "cs-1",
    content: `<p>Morning team, Marketing and Product are turning the gas up on <strong>Tech Reborn</strong>. I want to make sure CX doesn't get crushed in the process. @CustomerServiceDirector give me a clear snapshot of what's happening on your side right now.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:00:00.000Z",
  },
  {
    id: "cs-2",
    content: `<p>Morning. Snapshot from the last 7 days:</p><ul><li>Total tickets: <strong>1,482</strong> (+19% vs previous week)</li><li>First reply time: <strong>7 min</strong> median</li><li>CSAT: <strong>4.76 / 5</strong></li><li>Top 3 contact reasons:<ul><li>"Is this really refurbished?" / "What does Tech Reborn mean?"</li><li>Battery health expectations</li><li>Delivery ETA / tracking</li></ul></li></ul><p>Refund rate is stable at <strong>4.1%</strong>, no red flags yet.</p>`,
    user_id: null,
    agent_id: "customer-service-director",
    sender_name: "Customer Service Director",
    created_at: "2025-12-04T11:02:00.000Z",
    files: [{ name: "weekly_cx_snapshot_2025-12-04.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 245000 }],
  },
  {
    id: "cs-3",
    content: `<p>Nice. @CustomerSupportRep from the front line, what does it actually feel like? What are people vibing with, and what's annoying them?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:04:00.000Z",
  },
  {
    id: "cs-4",
    content: `<p>Feels busy but controlled.</p><ul><li>Lots of people are pleasantly surprised by condition ("This looks new??")</li><li>Biggest friction: people over-reading <strong>"Like New"</strong> and expecting literally untouched, sealed-in-box</li><li>Battery health questions are constant: "Is 88% okay?" "What's your minimum?"</li></ul><p>Once we explain the Tech Reborn process + warranty, most people calm down and are happy.</p>`,
    user_id: null,
    agent_id: "customer-support-rep",
    sender_name: "Customer Support Rep",
    created_at: "2025-12-04T11:06:00.000Z",
  },
  {
    id: "cs-5",
    content: `<p>So we're winning hearts, but language and expectation setting still need work. @RefundsWarrantySpecialist what's driving refunds right now? Anything that makes you nervous?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:08:00.000Z",
  },
  {
    id: "cs-6",
    content: `<p>Looked at the last 200 refund/return cases:</p><ul><li><strong>32%</strong>: "Cosmetic condition worse than expected"</li><li><strong>27%</strong>: "Battery life not what I thought"</li><li><strong>18%</strong>: "Changed my mind / found cheaper elsewhere"</li><li>Rest: legit faults and courier damage</li></ul><p>Nothing catastrophic, but the pattern is clear: expectations vs reality. We're not lying, we're just not over-communicating in the right places.</p>`,
    user_id: null,
    agent_id: "refunds-warranty-specialist",
    sender_name: "Refunds & Warranty Specialist",
    created_at: "2025-12-04T11:10:00.000Z",
    files: [{ name: "refunds_drivers_last_200_cases.csv", url: "#", type: "text/csv", size: 89000 }],
  },
  {
    id: "cs-7",
    content: `<p>Understood. @QASpecialist what are you seeing in terms of reply quality and repeat themes? Where are we sloppy, where are we strong?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:12:00.000Z",
  },
  {
    id: "cs-8",
    content: `<p>Just finished a QA pass on <strong>120</strong> random conversations:</p><ul><li>Tone: excellent, very human and friendly</li><li>Policy adherence: <strong>96%</strong></li><li>Weakness: answers are often correct but too long, people skim</li><li>We're answering the same battery + grading questions 20 different ways, no unified phrasing</li></ul><p>We need 3–4 gold-standard answer templates for Tech Reborn, battery health, and grading.</p>`,
    user_id: null,
    agent_id: "qa-specialist",
    sender_name: "QA Specialist",
    created_at: "2025-12-04T11:14:00.000Z",
    files: [{ name: "qa_audit_sample_tech_reborn.pdf", url: "#", type: "application/pdf", size: 1200000 }],
  },
  {
    id: "cs-9",
    content: `<p>Cool. Let's make this practical:</p><ol><li>I want one <strong>definitive answer</strong> for "What is Tech Reborn?"</li><li>One for "What does Like New / Very Good / Good actually mean?"</li><li>One for "What battery health can I expect?"</li></ol><p>Draft them, then we'll tighten. @CustomerServiceDirector coordinate.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:16:00.000Z",
  },
  {
    id: "cs-10",
    content: `<p>Got it.</p><p>Assigning:</p><ul><li>@CustomerSupportRep → draft "Tech Reborn explanation" (frontline voice)</li><li>@RefundsWarrantySpecialist → draft grading & battery expectations (realistic)</li><li>@QASpecialist → refine both into standard macros</li></ul><p>We'll drop drafts here in 10–15 minutes.</p>`,
    user_id: null,
    agent_id: "customer-service-director",
    sender_name: "Customer Service Director",
    created_at: "2025-12-04T11:18:00.000Z",
  },
  {
    id: "cs-11",
    content: `<p>Draft #1 – "What is Tech Reborn?"</p><p><em>"Tech Reborn is our way of taking great pre-owned devices and bringing them back to a premium standard. Every device goes through full testing, professional cleaning, secure data wipe and quality checks before it's listed. You still get a warranty, clear grading and support, just without paying the 'brand new' price."</em></p>`,
    user_id: null,
    agent_id: "customer-support-rep",
    sender_name: "Customer Support Rep",
    created_at: "2025-12-04T11:20:00.000Z",
  },
  {
    id: "cs-12",
    content: `<p>Draft #2 – Grades & battery expectations:</p><p><em>"All Tech Reborn devices are fully tested and 100% functional.<br/>– <strong>Like New:</strong> Looks close to new, with no major marks.<br/>– <strong>Very Good:</strong> Light, visible marks that you'd only notice up close.<br/>– <strong>Good:</strong> More visible wear, priced lower, perfect if you care more about performance than tiny marks.<br/><br/>For battery: we guarantee a minimum battery health that's fit for daily use. Exact percentage varies by model and stock, but if a battery doesn't meet our internal standards, it doesn't go on sale."</em></p>`,
    user_id: null,
    agent_id: "refunds-warranty-specialist",
    sender_name: "Refunds & Warranty Specialist",
    created_at: "2025-12-04T11:22:00.000Z",
    files: [{ name: "grading_battery_draft_v1.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 45000 }],
  },
  {
    id: "cs-13",
    content: `<p>Tightened both into reply-ready macros:</p><p><strong>Macro: What is Tech Reborn?</strong></p><p>"Tech Reborn is our process for bringing pre-owned devices back to a premium standard. Every device is fully tested, professionally cleaned, securely wiped and checked by our team before it's listed. You still get a warranty, clear grading and support, just without paying 'brand new' prices."</p><p><strong>Macro: Grades & Battery Expectations</strong></p><p>"All Tech Reborn devices are fully tested and 100% working:<br/>– <strong>Like New:</strong> Looks close to new, with no major marks.<br/>– <strong>Very Good:</strong> Light, visible marks you'll only really see up close.<br/>– <strong>Good:</strong> More signs of use, priced lower, ideal if you care more about performance than tiny marks.<br/><br/>For battery health, we only sell devices that meet our internal standards for everyday use. If a device doesn't pass our battery checks, it doesn't go on sale, and if you ever get a device you're unhappy with, we're here to help."</p>`,
    user_id: null,
    agent_id: "qa-specialist",
    sender_name: "QA Specialist",
    created_at: "2025-12-04T11:24:00.000Z",
    files: [{ name: "cx_macros_tech_reborn_v1.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 38000 }],
  },
  {
    id: "cs-14",
    content: `<p>These are solid. Lock them in as the new standard macros everywhere: chat, email, Help Centre.</p><p>Now zooming out, what's the <strong>ticket volume forecast</strong> if Marketing keeps scaling Tech Reborn like this for the next 4–6 weeks? I don't want us getting blindsided.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:26:00.000Z",
  },
  {
    id: "cs-15",
    content: `<p>Ran a quick model based on current uplift:</p><ul><li>If traffic + orders keep climbing, ticket volume will increase another <strong>25–30%</strong> over the next month.</li><li>Current team capacity: ~<strong>2,000–2,200</strong> tickets/week without hurting response times.</li><li>Projected: <strong>2,400–2,600</strong> on busy weeks.</li></ul><p>Options:</p><ol><li>Hire 1–2 more reps</li><li>Automate first-line responses more aggressively</li><li>Push more proactive comms to reduce "Where is my order?" / "What does this mean?" tickets</li></ol><p>I'd start with a mix of 2 + 3.</p>`,
    user_id: null,
    agent_id: "customer-service-director",
    sender_name: "Customer Service Director",
    created_at: "2025-12-04T11:28:00.000Z",
    files: [{ name: "ticket_volume_forecast_tech_reborn.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 156000 }],
  },
  {
    id: "cs-16",
    content: `<p>No knee-jerk hiring yet. I want to win via systems first.</p><p>– @QASpecialist: design an automated first-line answer flow for the 5 most common questions<br/>– @CustomerSupportRep: list those 5 questions based on what you actually see<br/>– @RefundsWarrantySpecialist: tell me which questions we do <strong>not</strong> want a bot touching</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:30:00.000Z",
  },
  {
    id: "cs-17",
    content: `<p>Top 5 questions right now:</p><ol><li>"What is Tech Reborn?"</li><li>"What does Like New / Very Good / Good mean?"</li><li>"What's the battery health on this model?"</li><li>"Where is my order / tracking link not working?"</li><li>"How long is the warranty and what does it cover?"</li></ol><p>We can automate 1–3 and 5. Delivery ones are trickier because they're sometimes real courier issues.</p>`,
    user_id: null,
    agent_id: "customer-support-rep",
    sender_name: "Customer Support Rep",
    created_at: "2025-12-04T11:32:00.000Z",
  },
  {
    id: "cs-18",
    content: `<p>Questions that should stay mostly human:</p><ul><li>Anything about faults, damage, or "this arrived not as described"</li><li>Cases where people are clearly upset or feel misled</li><li>Edge cases: partial refunds, goodwill gestures, grey areas of policy</li></ul><p>We can still let a bot give a first response, but a human needs to reconcile quickly.</p>`,
    user_id: null,
    agent_id: "refunds-warranty-specialist",
    sender_name: "Refunds & Warranty Specialist",
    created_at: "2025-12-04T11:34:00.000Z",
  },
  {
    id: "cs-19",
    content: `<p>I'll build the automation logic as:</p><ul><li>Bot answers instantly for standard info (Tech Reborn, grading, battery, warranty)</li><li>Bot routes anything containing words like "broken", "faulty", "damaged", "not as described" to a human with the right tag</li><li>Delivery questions: bot pulls tracking + ETA, but if the order is old or tracking looks odd, it flags for manual follow-up</li></ul><p>I'll put this into a flowchart and macro pack.</p>`,
    user_id: null,
    agent_id: "qa-specialist",
    sender_name: "QA Specialist",
    created_at: "2025-12-04T11:36:00.000Z",
    files: [{ name: "cx_automation_flowchart_v1.pdf", url: "#", type: "application/pdf", size: 892000 }],
  },
  {
    id: "cs-20",
    content: `<p>Perfect. Drop the flowchart and macro pack in here when they're ready.</p><p>Next topic: <strong>CSAT and reviews</strong>. What are customers actually saying when they're happy, not just when they're annoyed? @CustomerServiceDirector pull some real comments.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:38:00.000Z",
  },
  {
    id: "cs-21",
    content: `<p>Pulled the last 50 positive CSAT + Trustpilot mentions. Themes:</p><ul><li>"Better than expected condition"</li><li>"Fast replies from support"</li><li>"Felt safe buying refurbished for the first time"</li><li>Specific shout-outs to Tech Reborn explaining things clearly</li></ul><p>We should pipe these phrases into Marketing, customers are writing our copy.</p>`,
    user_id: null,
    agent_id: "customer-service-director",
    sender_name: "Customer Service Director",
    created_at: "2025-12-04T11:40:00.000Z",
    files: [{ name: "voc_positive_cx_quotes_2025-12-04.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 124000 }],
  },
  {
    id: "cs-22",
    content: `<p>Good. Compile a mini "Voice of Customer" sheet with real quotes by theme and send to me + Marketing. I want our language to sound like them, not us.</p><p>@RefundsWarrantySpecialist if you had full power, what policy would you tweak right now to reduce pain on both sides?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:42:00.000Z",
  },
  {
    id: "cs-23",
    content: `<p>I'd formalise a clearly named <strong>"14-Day Comfort Period"</strong> across all Tech Reborn devices.</p><p>Most returns already happen in that window. If we name it and own it:</p><ul><li>It becomes a selling point</li><li>Customers feel safe</li><li>We get permission to be firmer after that window</li></ul><p>Operationally, we're basically doing this already.</p>`,
    user_id: null,
    agent_id: "refunds-warranty-specialist",
    sender_name: "Refunds & Warranty Specialist",
    created_at: "2025-12-04T11:44:00.000Z",
  },
  {
    id: "cs-24",
    content: `<p>I like it. Call it the <strong>"14-Day Tech Reborn Comfort Guarantee."</strong></p><p>– @QASpecialist update internal wording and make sure agents explain it consistently<br/>– @CustomerServiceDirector sync with Marketing to get this on-site and into emails</p><p>We're not adding cost, just clarity.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:46:00.000Z",
  },
  {
    id: "cs-25",
    content: `<p>Draft Comfort Guarantee explanation:</p><p><em>"Every Tech Reborn device comes with a 14-Day Comfort Guarantee. If you get your device and it's not what you expected, you can return it within 14 days for a refund or exchange, no awkward questions. After that, your warranty still covers you for faults, but the first 14 days are there to make sure you feel good about your choice."</em></p><p>I'll push this into macros and training.</p>`,
    user_id: null,
    agent_id: "qa-specialist",
    sender_name: "QA Specialist",
    created_at: "2025-12-04T11:48:00.000Z",
    files: [{ name: "comfort_guarantee_macro_v1.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 32000 }],
  },
  {
    id: "cs-26",
    content: `<p>From the frontline, this will make life much easier. We already behave like this, but having it named and official gives us a clean line when someone comes back a month later wanting a change-of-mind refund.</p>`,
    user_id: null,
    agent_id: "customer-support-rep",
    sender_name: "Customer Support Rep",
    created_at: "2025-12-04T11:50:00.000Z",
  },
  {
    id: "cs-27",
    content: `<p>I also want to run a quick training bite for the team on <strong>Tech Reborn tone</strong>:</p><ul><li>Honest and direct</li><li>Never oversell</li><li>Avoid defensive language when people question refurbished</li></ul><p>I'll build a 1-pager cheat sheet and a 10-minute Loom walkthrough.</p>`,
    user_id: null,
    agent_id: "customer-service-director",
    sender_name: "Customer Service Director",
    created_at: "2025-12-04T11:52:00.000Z",
    files: [{ name: "tech_reborn_tone_cheatsheet.pdf", url: "#", type: "application/pdf", size: 456000 }],
  },
  {
    id: "cs-28",
    content: `<p>Do it. Include real good vs bad examples. Agents learn 10x faster from "don't do this" screenshots.</p><p>Last thing: are there any <strong>recurring issues</strong> we're seeing that Product or Ops haven't been properly told about? I don't want CX holding secrets.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:54:00.000Z",
  },
  {
    id: "cs-29",
    content: `<p>Two recurring patterns:</p><ul><li>Small but repeating: "charger missing / wrong plug" on some MacBook orders</li><li>Confusion when cosmetic condition is great but the box is generic, some people panic that it's fake</li></ul><p>We can fix both with clearer expectations on PDPs + better notes to the warehouse.</p>`,
    user_id: null,
    agent_id: "customer-support-rep",
    sender_name: "Customer Support Rep",
    created_at: "2025-12-04T11:56:00.000Z",
  },
  {
    id: "cs-30",
    content: `<p>I'll start tagging every "charger / plug" case with a dedicated label and send a weekly report to Ops so they see numbers, not anecdotes.</p>`,
    user_id: null,
    agent_id: "refunds-warranty-specialist",
    sender_name: "Refunds & Warranty Specialist",
    created_at: "2025-12-04T11:58:00.000Z",
    files: [{ name: "charger_issues_weekly_template.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 78000 }],
  },
  {
    id: "cs-31",
    content: `<p>From QA passes, I'd also add a short note into order confirmation emails:</p><p><em>"You may receive your device in a high-quality replacement box rather than the original manufacturer box. This doesn't affect your warranty or the authenticity of the device."</em></p><p>That alone should cut a chunk of "is this real?" tickets.</p>`,
    user_id: null,
    agent_id: "qa-specialist",
    sender_name: "QA Specialist",
    created_at: "2025-12-04T12:00:00.000Z",
  },
  {
    id: "cs-32",
    content: `<p>Excellent.</p><p>– @CustomerServiceDirector push that box note to Email & Product<br/>– @RefundsWarrantySpecialist start tagging "charger / plug" issues<br/>– @QASpecialist + @CustomerSupportRep finalise those macros and automation flows</p><p>You lot are the final line between our chaos and the customer. If anything feels off, even a little, I want to hear it here before it becomes a Trustpilot essay.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T12:02:00.000Z",
  },
];

// Extract all files from messages for the Files panel
export const customerServiceChatFiles = customerServiceChatMessages
  .filter(msg => msg.files && msg.files.length > 0)
  .flatMap(msg => msg.files!.map(file => ({
    id: `cs-file-${file.name.replace(/[^a-z0-9]/gi, '-')}`,
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

export const customerServiceMemories = [
  { id: "csm-1", key: "Tech Reborn Standard Macro", value: "Tech Reborn is our process for bringing pre-owned devices back to a premium standard. Every device is fully tested, professionally cleaned, securely wiped and checked.", category: "Macros", createdBy: "QA Specialist", updatedAt: "2025-12-04T11:24:00.000Z" },
  { id: "csm-2", key: "Grading Definitions", value: "Like New: Looks close to new, no major marks. Very Good: Light marks only visible up close. Good: More visible wear, priced lower.", category: "Product", createdBy: "Refunds & Warranty Specialist", updatedAt: "2025-12-04T11:22:00.000Z" },
  { id: "csm-3", key: "14-Day Comfort Guarantee", value: "Every Tech Reborn device comes with 14-Day Comfort Guarantee. Return within 14 days for refund or exchange, no awkward questions.", category: "Policy", createdBy: "Liam", updatedAt: "2025-12-04T11:46:00.000Z" },
  { id: "csm-4", key: "Automation Rules", value: "Bot answers: Tech Reborn, grading, battery, warranty. Human routing: broken, faulty, damaged, not as described keywords.", category: "Process", createdBy: "QA Specialist", updatedAt: "2025-12-04T11:36:00.000Z" },
  { id: "csm-5", key: "Top Return Drivers", value: "32% cosmetic condition, 27% battery expectations, 18% change of mind. Pattern: expectations vs reality.", category: "Insights", createdBy: "Refunds & Warranty Specialist", updatedAt: "2025-12-04T11:10:00.000Z" },
  { id: "csm-6", key: "Voice of Customer Themes", value: "Positive: Better than expected condition, fast replies, felt safe buying refurbished. Use customer language in marketing.", category: "VOC", createdBy: "Customer Service Director", updatedAt: "2025-12-04T11:40:00.000Z" },
  { id: "csm-7", key: "Tech Reborn Tone", value: "Honest and direct. Never oversell. Avoid defensive language when people question refurbished.", category: "Training", createdBy: "Customer Service Director", updatedAt: "2025-12-04T11:52:00.000Z" },
  { id: "csm-8", key: "Recurring Issues", value: "1. Charger missing/wrong plug on MacBooks. 2. Generic box causing 'is this fake?' concerns. Both need PDP clarity.", category: "Issues", createdBy: "Customer Support Rep", updatedAt: "2025-12-04T11:56:00.000Z" },
];

export const customerServiceActivity = [
  { id: "csa-1", action: "File Uploaded", description: "Uploaded weekly_cx_snapshot_2025-12-04.xlsx with 7-day performance metrics", performedBy: "Customer Service Director", timestamp: "2025-12-04T11:02:00.000Z", type: "task" as const },
  { id: "csa-2", action: "File Uploaded", description: "Uploaded refunds_drivers_last_200_cases.csv analyzing return reasons", performedBy: "Refunds & Warranty Specialist", timestamp: "2025-12-04T11:10:00.000Z", type: "task" as const },
  { id: "csa-3", action: "File Uploaded", description: "Uploaded qa_audit_sample_tech_reborn.pdf with QA pass results", performedBy: "QA Specialist", timestamp: "2025-12-04T11:14:00.000Z", type: "task" as const },
  { id: "csa-4", action: "Decision Made", description: "Standardized macros needed: Tech Reborn explanation, grading definitions, battery expectations", performedBy: "Liam", timestamp: "2025-12-04T11:16:00.000Z", type: "decision" as const },
  { id: "csa-5", action: "File Uploaded", description: "Uploaded grading_battery_draft_v1.docx with grade and battery expectations", performedBy: "Refunds & Warranty Specialist", timestamp: "2025-12-04T11:22:00.000Z", type: "task" as const },
  { id: "csa-6", action: "File Uploaded", description: "Uploaded cx_macros_tech_reborn_v1.docx with finalized macros", performedBy: "QA Specialist", timestamp: "2025-12-04T11:24:00.000Z", type: "task" as const },
  { id: "csa-7", action: "Decision Made", description: "Win via systems first: automate top 5 questions before hiring new reps", performedBy: "Liam", timestamp: "2025-12-04T11:30:00.000Z", type: "decision" as const },
  { id: "csa-8", action: "File Uploaded", description: "Uploaded cx_automation_flowchart_v1.pdf with bot logic design", performedBy: "QA Specialist", timestamp: "2025-12-04T11:36:00.000Z", type: "task" as const },
  { id: "csa-9", action: "File Uploaded", description: "Uploaded voc_positive_cx_quotes_2025-12-04.xlsx with customer testimonials", performedBy: "Customer Service Director", timestamp: "2025-12-04T11:40:00.000Z", type: "task" as const },
  { id: "csa-10", action: "Decision Made", description: "Established 14-Day Tech Reborn Comfort Guarantee as official policy", performedBy: "Liam", timestamp: "2025-12-04T11:46:00.000Z", type: "decision" as const },
  { id: "csa-11", action: "File Uploaded", description: "Uploaded comfort_guarantee_macro_v1.docx with guarantee explanation", performedBy: "QA Specialist", timestamp: "2025-12-04T11:48:00.000Z", type: "task" as const },
  { id: "csa-12", action: "File Uploaded", description: "Uploaded tech_reborn_tone_cheatsheet.pdf for team training", performedBy: "Customer Service Director", timestamp: "2025-12-04T11:52:00.000Z", type: "task" as const },
  { id: "csa-13", action: "File Uploaded", description: "Uploaded charger_issues_weekly_template.xlsx for Ops reporting", performedBy: "Refunds & Warranty Specialist", timestamp: "2025-12-04T11:58:00.000Z", type: "task" as const },
  { id: "csa-14", action: "Decision Made", description: "Add replacement box note to order confirmation emails", performedBy: "Liam", timestamp: "2025-12-04T12:02:00.000Z", type: "decision" as const },
];
