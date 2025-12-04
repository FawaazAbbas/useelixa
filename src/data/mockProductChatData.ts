// Product & Merchandising Team Chat Messages - December 4, 2025

import type { ChatFileAttachment } from './mockMarketingChatData';

export interface ProductMessage {
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
  "ProductDirector": { agent_id: "product-director", user_id: null, display_name: "Product Director" },
  "ListingMerchandisingSpecialist": { agent_id: "listing-merchandising-specialist", user_id: null, display_name: "Listing & Merchandising Specialist" },
  "CompetitivePricingAnalyst": { agent_id: "competitive-pricing-analyst", user_id: null, display_name: "Competitive Pricing Analyst" },
};

export const productChatMessages: ProductMessage[] = [
  {
    id: "prod-1",
    content: `<p>Morning team, Marketing is pushing <strong>Tech Reborn</strong> hard, MacBooks and iPhones are flying. I want Product and Pricing completely in sync. @ProductDirector give me a top level view: what's working in the catalogue and what looks messy?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:00:00.000Z",
  },
  {
    id: "prod-2",
    content: `<p>Morning. Quick snapshot:</p><ul><li>iPhone 13 / 13 Pro range is clean and converting well</li><li>MacBook Air M1 page is pulling traffic but our variants are messy</li><li>Grading language isn't consistent across laptops vs phones</li><li>Accessories attach rate is only <strong>7%</strong> – low for this volume</li></ul><p>We can tighten this in a single focused pass today.</p>`,
    user_id: null,
    agent_id: "product-director",
    sender_name: "Product Director",
    created_at: "2025-12-04T11:02:00.000Z",
  },
  {
    id: "prod-3",
    content: `<p>Perfect. @CompetitivePricingAnalyst I want the real picture on MacBook M1 pricing vs Apple Refurb, BackMarket, CeX, Amazon Renewed. Who are we under, who are we over, and where are we just being stupid?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:04:00.000Z",
  },
  {
    id: "prod-4",
    content: `<p>Just pulled a live comparison for <strong>MacBook Air M1, 256GB, Very Good / equivalent</strong>:</p><ul><li>Apple Refurb: ~<strong>£849</strong></li><li>Amazon Renewed: <strong>£699–£749</strong></li><li>BackMarket: <strong>£639–£689</strong></li><li>CeX: <strong>£650</strong> cash / <strong>£760</strong> voucher</li><li><strong>Baduss Tech:</strong> <strong>£629</strong> (Very Good), <strong>£679</strong> (Like New)</li></ul><p>We're slightly under most serious refurb competitors on Very Good and competitive on Like New. The problem isn't price, it's that the story and savings aren't obvious.</p>`,
    user_id: null,
    agent_id: "competitive-pricing-analyst",
    sender_name: "Competitive Pricing Analyst",
    created_at: "2025-12-04T11:06:00.000Z",
    files: [{ name: "macbook_m1_competitor_pricing_2025-12-04.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 234000 }],
  },
  {
    id: "prod-5",
    content: `<p>So pricing is fine. Story is weak. @ListingMerchandisingSpecialist show me how the MacBook M1 grid actually looks right now, titles, badges, grades. I want to see what a normal user sees.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:08:00.000Z",
  },
  {
    id: "prod-6",
    content: `<p>Here's the current grid view:</p><ul><li>Titles are inconsistent: "Apple MacBook Air 13" vs "MacBook Air M1 – 13-inch"</li><li>Grade badges are plain text only</li><li>"Save vs RRP" is only present on some SKUs</li><li>No <strong>Tech Reborn</strong> badge anywhere on the collection page yet</li></ul><p>It works, but it doesn't feel premium or intentional.</p>`,
    user_id: null,
    agent_id: "listing-merchandising-specialist",
    sender_name: "Listing & Merchandising Specialist",
    created_at: "2025-12-04T11:10:00.000Z",
    files: [{ name: "macbook_air_m1_collection_screenshot.png", url: "#", type: "image/png", size: 1800000 }],
  },
  {
    id: "prod-7",
    content: `<p>Yeah, not good enough. I want:</p><ol><li>Standardised titles</li><li>Clear "Save £X vs New" on every Tech Reborn SKU</li><li>A Tech Reborn badge on every relevant listing</li><li>Grade shown visually, not just as text</li></ol><p>@ListingMerchandisingSpecialist own this for MacBooks and iPhones as priority.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:12:00.000Z",
  },
  {
    id: "prod-8",
    content: `<p>Plan:</p><ul><li>Title template: <strong>"Apple MacBook Air 13.3"" M1 (2020) – [Storage] – [Grade]"</strong></li><li>Add a <strong>"Tech Reborn"</strong> pill badge top-left on each refurb SKU in the campaign</li><li>Add subtext under price: <strong>"Save £X vs New"</strong> (auto-calculated)</li><li>Grade badge colour coding: Like New → green, Very Good → blue, Good → grey</li></ul><p>I'll roll this out to MacBooks first, then iPhones.</p>`,
    user_id: null,
    agent_id: "listing-merchandising-specialist",
    sender_name: "Listing & Merchandising Specialist",
    created_at: "2025-12-04T11:14:00.000Z",
    files: [{ name: "baduss_title_grade_style_guide.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 456000 }],
  },
  {
    id: "prod-9",
    content: `<p>I like that. I also want a small <strong>"Best for…"</strong> line on key MacBooks:</p><ul><li>"Best for students"</li><li>"Best for creators"</li><li>"Best for everyday use"</li></ul><p>Let's make the grid feel like guidance, not just a list.</p>`,
    user_id: null,
    agent_id: "product-director",
    sender_name: "Product Director",
    created_at: "2025-12-04T11:16:00.000Z",
  },
  {
    id: "prod-10",
    content: `<p>Agree. Add it. @CompetitivePricingAnalyst aside from MacBooks, which SKUs are we leaving money on the table with? Where are we underpriced vs demand and grade?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:18:00.000Z",
  },
  {
    id: "prod-11",
    content: `<p>Ran a margin vs market scan:</p><ul><li><strong>iPhone 11 64GB – Good:</strong> We're at <strong>£219</strong>, market average <strong>£249–£269</strong>. High volume, high demand. We can safely go up £20–£30.</li><li><strong>iPhone 13 Pro 256GB – Like New:</strong> We're £10–£15 under the main refurb players but margin is already tight. Either raise price slightly or stop discounting it.</li><li><strong>Entry-level iPads:</strong> We're underpriced by ~£15 across the board, plus low accessory attach rate.</li></ul><p>Recommendation: raise older / entry SKUs, keep Tech Reborn heroes sharp and competitive.</p>`,
    user_id: null,
    agent_id: "competitive-pricing-analyst",
    sender_name: "Competitive Pricing Analyst",
    created_at: "2025-12-04T11:20:00.000Z",
    files: [{ name: "margin_vs_market_core_skus.csv", url: "#", type: "text/csv", size: 89000 }],
  },
  {
    id: "prod-12",
    content: `<p>Do it. I don't want us looking like a bargain bin for everything. Push up:</p><ul><li>iPhone 11 (Good) +£20</li><li>Entry-level iPads +£15</li></ul><p>Lock in sensible but strong pricing on iPhone 13 and MacBook M1. Tech Reborn = smart value, not "everything must be cheap".</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:22:00.000Z",
  },
  {
    id: "prod-13",
    content: `<p>I'll also re-order collections so Tech Reborn heroes sit at the top:</p><ul><li>iPhone 13 / 13 Pro</li><li>MacBook Air M1</li><li>iPad 9th Gen</li></ul><p>Legacy devices get pushed further down or into a softer "Value Picks" section.</p>`,
    user_id: null,
    agent_id: "listing-merchandising-specialist",
    sender_name: "Listing & Merchandising Specialist",
    created_at: "2025-12-04T11:24:00.000Z",
  },
  {
    id: "prod-14",
    content: `<p>Good. The site should reflect what the company is about today, not two years ago.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:26:00.000Z",
  },
  {
    id: "prod-15",
    content: `<p>Grading copy is also too vague right now. Current:</p><ul><li>Like New: "Almost like a new device."</li><li>Very Good: "Light signs of use."</li></ul><p>Proposed:</p><ul><li><strong>Like New:</strong> "Looks close to new. No major marks. Fully tested."</li><li><strong>Very Good:</strong> "Visible light marks. 100% functional. Premium performance."</li><li><strong>Good:</strong> "More signs of use, priced to save. Perfect for everyday use."</li></ul><p>Should reduce returns and align with Tech Reborn's honest story.</p>`,
    user_id: null,
    agent_id: "product-director",
    sender_name: "Product Director",
    created_at: "2025-12-04T11:28:00.000Z",
    files: [{ name: "grading_copy_revision_tech_reborn.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 123000 }],
  },
  {
    id: "prod-16",
    content: `<p>I like it. Honest, clear, still positive. Integrate this everywhere: PDP, checkout, FAQ, Tech Reborn hub.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:30:00.000Z",
  },
  {
    id: "prod-17",
    content: `<p>Ran a quick what-if on the price changes and collection re-ordering:</p><ul><li>Raising legacy SKUs adds ~<strong>£12–15k/month</strong> in extra margin at current volumes</li><li>Focusing top rows on Tech Reborn heroes likely lifts collection conversion by <strong>0.4–0.7%</strong> based on previous tests</li><li>"Save £X vs New" everywhere increases perceived value with zero cost</li></ul><p>I'll share the spreadsheet for you to review.</p>`,
    user_id: null,
    agent_id: "competitive-pricing-analyst",
    sender_name: "Competitive Pricing Analyst",
    created_at: "2025-12-04T11:32:00.000Z",
    files: [{ name: "pricing_what_if_tech_reborn.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 345000 }],
  },
  {
    id: "prod-18",
    content: `<p>Nice. Upload it, I'll skim later. As long as we're not training customers to expect blanket discounts, I'm happy.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:34:00.000Z",
  },
  {
    id: "prod-19",
    content: `<p>Another thing: our MacBook thumbnails currently show laptops <em>closed</em> on a dull background.</p><p>For Tech Reborn I propose:</p><ul><li>Slightly open lid</li><li>Screen on with a clean desktop</li><li>Bright, minimal background</li><li>Subtle "Tech Reborn" watermark in the corner</li></ul><p>This will visually separate campaign SKUs from everything else.</p>`,
    user_id: null,
    agent_id: "listing-merchandising-specialist",
    sender_name: "Listing & Merchandising Specialist",
    created_at: "2025-12-04T11:36:00.000Z",
    files: [{ name: "macbook_thumbnail_concepts.pdf", url: "#", type: "application/pdf", size: 2400000 }],
  },
  {
    id: "prod-20",
    content: `<p>Agree. "Closed laptop on grey" doesn't scream premium or reborn. Make the imagery feel like modern Apple, but with our own voice.</p>`,
    user_id: null,
    agent_id: "product-director",
    sender_name: "Product Director",
    created_at: "2025-12-04T11:38:00.000Z",
  },
  {
    id: "prod-21",
    content: `<p>Do it. This is where we stop looking like a generic refurb site.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:40:00.000Z",
  },
  {
    id: "prod-22",
    content: `<p>I also want to introduce <strong>Smart Bundles</strong> for Tech Reborn SKUs:</p><ul><li>MacBook + charger + sleeve → small bundle discount</li><li>iPhone + case + screen protector</li></ul><p>Even a <strong>5–7% uptake</strong> materially increases AOV and accessory sell-through.</p>`,
    user_id: null,
    agent_id: "competitive-pricing-analyst",
    sender_name: "Competitive Pricing Analyst",
    created_at: "2025-12-04T11:42:00.000Z",
    files: [{ name: "smart_bundles_pricing_model.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 189000 }],
  },
  {
    id: "prod-23",
    content: `<p>Yes. @ProductDirector design the bundles conceptually. @ListingMerchandisingSpecialist implement on PDPs and cart.</p><p>I want bundles live on the top 10 SKUs by end of the week.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:44:00.000Z",
  },
  {
    id: "prod-24",
    content: `<p>Bundle concepts:</p><ul><li><strong>MacBook Creator Pack:</strong> MacBook M1 + USB-C hub + sleeve</li><li><strong>Student Pack:</strong> MacBook M1 + sleeve + extended warranty</li><li><strong>iPhone Everyday Pack:</strong> iPhone 13 + case + glass</li><li><strong>iPhone Essentials:</strong> iPhone 13 + fast charger</li></ul><p>We'll frame these as <strong>Smart Packs</strong> under Tech Reborn with clear reasons for each.</p>`,
    user_id: null,
    agent_id: "product-director",
    sender_name: "Product Director",
    created_at: "2025-12-04T11:46:00.000Z",
    files: [{ name: "smart_pack_copy_tech_reborn.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 156000 }],
  },
  {
    id: "prod-25",
    content: `<p>I'll add a <strong>"Smart Pack Available"</strong> badge on relevant listings and a bundle callout on PDP just above the Add to Cart button:</p><p><em>"Build your Smart Pack and save on essentials."</em></p><p>Click opens a simple modal with bundle options, no hard detour.</p>`,
    user_id: null,
    agent_id: "listing-merchandising-specialist",
    sender_name: "Listing & Merchandising Specialist",
    created_at: "2025-12-04T11:48:00.000Z",
  },
  {
    id: "prod-26",
    content: `<p>Perfect. I want every Tech Reborn hero SKU to answer four things instantly:</p><ul><li>Why this device</li><li>What it's best for</li><li>How much they're saving</li><li>Why they can trust it</li></ul><p>If we nail that, Marketing's job becomes 10x easier. You're clear on actions, execute and update me here as things go live.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T11:50:00.000Z",
  },
];

// Extract all files from messages for the Files panel
export const productChatFiles = productChatMessages
  .filter(msg => msg.files && msg.files.length > 0)
  .flatMap(msg => msg.files!.map(file => ({
    id: `prod-file-${file.name.replace(/[^a-z0-9]/gi, '-')}`,
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

export const productMemories = [
  { id: "pm-1", key: "Title Template", value: "Apple [Device] [Screen Size] [Chip] ([Year]) – [Storage] – [Grade]. Example: Apple MacBook Air 13.3\" M1 (2020) – 256GB – Like New", category: "Merchandising", createdBy: "Listing & Merchandising Specialist", updatedAt: "2025-12-04T11:14:00.000Z" },
  { id: "pm-2", key: "Grade Badge Colors", value: "Like New → green, Very Good → blue, Good → grey. Visual distinction for quick scanning.", category: "Design", createdBy: "Listing & Merchandising Specialist", updatedAt: "2025-12-04T11:14:00.000Z" },
  { id: "pm-3", key: "Pricing Strategy", value: "Raise legacy/entry SKUs (iPhone 11 +£20, iPads +£15). Keep Tech Reborn heroes sharp and competitive. Smart value, not 'everything cheap'.", category: "Pricing", createdBy: "Liam", updatedAt: "2025-12-04T11:22:00.000Z" },
  { id: "pm-4", key: "Grading Copy", value: "Like New: Close to new, no major marks, fully tested. Very Good: Light marks, 100% functional. Good: More wear, priced to save.", category: "Copy", createdBy: "Product Director", updatedAt: "2025-12-04T11:28:00.000Z" },
  { id: "pm-5", key: "Smart Packs", value: "Creator Pack: MacBook + hub + sleeve. Student Pack: MacBook + sleeve + warranty. Everyday Pack: iPhone + case + glass. Essentials: iPhone + charger.", category: "Bundles", createdBy: "Product Director", updatedAt: "2025-12-04T11:46:00.000Z" },
  { id: "pm-6", key: "Hero SKU Requirements", value: "Every Tech Reborn SKU must answer: 1. Why this device 2. Best for what 3. How much saving 4. Why trust it.", category: "Standards", createdBy: "Liam", updatedAt: "2025-12-04T11:50:00.000Z" },
  { id: "pm-7", key: "Collection Order", value: "Tech Reborn heroes at top: iPhone 13/13 Pro, MacBook Air M1, iPad 9th Gen. Legacy devices in 'Value Picks' section.", category: "Merchandising", createdBy: "Listing & Merchandising Specialist", updatedAt: "2025-12-04T11:24:00.000Z" },
];

export const productActivity = [
  { id: "pa-1", action: "File Uploaded", description: "Uploaded macbook_m1_competitor_pricing_2025-12-04.xlsx with market comparison", performedBy: "Competitive Pricing Analyst", timestamp: "2025-12-04T11:06:00.000Z", type: "task" as const },
  { id: "pa-2", action: "File Uploaded", description: "Uploaded macbook_air_m1_collection_screenshot.png showing current state", performedBy: "Listing & Merchandising Specialist", timestamp: "2025-12-04T11:10:00.000Z", type: "task" as const },
  { id: "pa-3", action: "Decision Made", description: "Standardise titles, add Save £X, Tech Reborn badge, visual grade badges", performedBy: "Liam", timestamp: "2025-12-04T11:12:00.000Z", type: "decision" as const },
  { id: "pa-4", action: "File Uploaded", description: "Uploaded baduss_title_grade_style_guide.docx", performedBy: "Listing & Merchandising Specialist", timestamp: "2025-12-04T11:14:00.000Z", type: "task" as const },
  { id: "pa-5", action: "File Uploaded", description: "Uploaded margin_vs_market_core_skus.csv with pricing analysis", performedBy: "Competitive Pricing Analyst", timestamp: "2025-12-04T11:20:00.000Z", type: "task" as const },
  { id: "pa-6", action: "Decision Made", description: "Raise iPhone 11 (Good) +£20, Entry iPads +£15. Tech Reborn = smart value.", performedBy: "Liam", timestamp: "2025-12-04T11:22:00.000Z", type: "decision" as const },
  { id: "pa-7", action: "Decision Made", description: "Re-order collections: Tech Reborn heroes at top, legacy to Value Picks", performedBy: "Listing & Merchandising Specialist", timestamp: "2025-12-04T11:24:00.000Z", type: "decision" as const },
  { id: "pa-8", action: "File Uploaded", description: "Uploaded grading_copy_revision_tech_reborn.docx with honest, clear copy", performedBy: "Product Director", timestamp: "2025-12-04T11:28:00.000Z", type: "task" as const },
  { id: "pa-9", action: "File Uploaded", description: "Uploaded pricing_what_if_tech_reborn.xlsx with impact projections", performedBy: "Competitive Pricing Analyst", timestamp: "2025-12-04T11:32:00.000Z", type: "task" as const },
  { id: "pa-10", action: "File Uploaded", description: "Uploaded macbook_thumbnail_concepts.pdf with new imagery direction", performedBy: "Listing & Merchandising Specialist", timestamp: "2025-12-04T11:36:00.000Z", type: "task" as const },
  { id: "pa-11", action: "Decision Made", description: "New MacBook thumbnails: open lid, screen on, bright background, Tech Reborn watermark", performedBy: "Liam", timestamp: "2025-12-04T11:40:00.000Z", type: "decision" as const },
  { id: "pa-12", action: "File Uploaded", description: "Uploaded smart_bundles_pricing_model.xlsx", performedBy: "Competitive Pricing Analyst", timestamp: "2025-12-04T11:42:00.000Z", type: "task" as const },
  { id: "pa-13", action: "Decision Made", description: "Smart Packs to launch on top 10 SKUs by end of week", performedBy: "Liam", timestamp: "2025-12-04T11:44:00.000Z", type: "decision" as const },
  { id: "pa-14", action: "File Uploaded", description: "Uploaded smart_pack_copy_tech_reborn.docx with bundle concepts", performedBy: "Product Director", timestamp: "2025-12-04T11:46:00.000Z", type: "task" as const },
];
