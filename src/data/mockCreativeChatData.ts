// Creative Team Chat Messages - December 4, 2025

import type { ChatFileAttachment } from './mockMarketingChatData';

export interface CreativeMessage {
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
  "CreativeDirector": { agent_id: "creative-director", user_id: null, display_name: "Creative Director" },
  "GraphicDesigner": { agent_id: "graphic-designer", user_id: null, display_name: "Graphic Designer" },
  "VideoProducer": { agent_id: "video-producer", user_id: null, display_name: "Video Producer" },
};

export const creativeChatMessages: CreativeMessage[] = [
  {
    id: "cr-1",
    content: `<p>Dev has just made the site feel <strong>10x faster</strong> without touching layout. I want our <strong>Tech Reborn</strong> creatives to match that energy: sharp, clean, instant.</p><p>Two topics today:<br/>1) How our creative changes to complement the new <strong>speed</strong><br/>2) Finalising the <strong>Tech Reborn campaign</strong> look & feel for Q4/Q1</p><p>@CreativeDirector, where do we stand?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T18:10:00.000Z",
  },
  {
    id: "cr-2",
    content: `<p>Love this. Current state:</p><ul><li>Solid <strong>Tech Reborn visual identity</strong> (electric accents, "revived tech" motif)</li><li>Assets are a bit <strong>heavy</strong> (big motion, chunky overlays)</li><li>Messaging is strong but slightly wordy</li></ul><p>With the speed upgrades, we can lean into:<br/>– Snappier motion and micro-animations<br/>– Cleaner typography<br/>– "Blink and it loaded" style visuals</p><p>Key constraint: keep all files as lean as Dev's perf budget.</p>`,
    user_id: null,
    agent_id: "creative-director",
    sender_name: "Creative Director",
    created_at: "2025-12-04T18:12:00.000Z",
  },
  {
    id: "cr-3",
    content: `<p>Exactly. The site now feels like it means business, I don't want heavy creatives dragging it down.</p><p>@GraphicDesigner what are you thinking for <strong>banners, PDP visuals and Tech Reborn badges</strong> now that performance is better?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T18:14:00.000Z",
  },
  {
    id: "cr-4",
    content: `<p>Design approach:</p><ul><li>Simplify hero banners: fewer overlapping elements, more <strong>negative space</strong>, punchier headline</li><li>Convert some image-based text to <strong>live text</strong> (lighter + better for accessibility)</li><li>Update Tech Reborn badges to pure <strong>SVG</strong> so they're crisp and tiny in file size</li><li>Introduce a subtle "rebirth arc" line motif, light, distinctive, easy to reuse</li></ul><p>I can rework the hero/collection/PDP suite around this.</p>`,
    user_id: null,
    agent_id: "graphic-designer",
    sender_name: "Graphic Designer",
    created_at: "2025-12-04T18:16:00.000Z",
  },
  {
    id: "cr-5",
    content: `<p>I like the rebirth arc idea, feels ownable.</p><p>@VideoProducer where are we on video content for <strong>Tech Reborn</strong>? I want short, punchy clips that don't rely on heavy autoplay.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T18:18:00.000Z",
  },
  {
    id: "cr-6",
    content: `<p>Video plan:</p><ul><li>Keep hero videos to <strong>under 15 seconds</strong>, loop-ready but not autoplay-dependent</li><li>Create <strong>click-to-play explainer</strong> on the Tech Reborn hub page: "How we restore devices"</li><li>Lighter file weights: target <strong>< 2MB compressed</strong> for hero loops</li><li>All social cuts can be heavier, but on-site stays lean</li></ul><p>I'll share draft cuts for review shortly.</p>`,
    user_id: null,
    agent_id: "video-producer",
    sender_name: "Video Producer",
    created_at: "2025-12-04T18:20:00.000Z",
  },
  {
    id: "cr-7",
    content: `<p>Perfect. On messaging, I want us to settle on <strong>3 hero headlines</strong> for the Tech Reborn campaign:</p><ul><li>One for Home</li><li>One for the Tech Reborn hub</li><li>One for email/ad creative</li></ul><p>@CreativeDirector draft some options.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T18:22:00.000Z",
  },
  {
    id: "cr-8",
    content: `<p>Headline options:</p><p><strong>Home:</strong></p><ol><li>"Tech That's Been Reborn."</li><li>"Like New. Less Spend. That's Tech Reborn."</li><li>"Performance You Trust. Prices You Love."</li></ol><p><strong>Tech Reborn Hub:</strong></p><ol><li>"Every Device Deserves a Second Life."</li><li>"The Smart Way to Buy Premium Tech."</li><li>"Pre-owned. Rebuilt. Ready."</li></ol><p><strong>Ads/Email:</strong></p><ol><li>"Stop Overpaying for the Same Tech."</li><li>"Flagship Quality. Refurbished Savings."</li><li>"Refurb, But Reborn."</li></ol>`,
    user_id: null,
    agent_id: "creative-director",
    sender_name: "Creative Director",
    created_at: "2025-12-04T18:24:00.000Z",
  },
  {
    id: "cr-9",
    content: `<p>Nice. I'll lock:</p><ul><li><strong>Home:</strong> #2 – "Like New. Less Spend. That's Tech Reborn."</li><li><strong>Hub:</strong> #3 – "Pre-owned. Rebuilt. Ready."</li><li><strong>Ads/Email:</strong> #3 – "Refurb, But Reborn."</li></ul><p>@GraphicDesigner update the hero suite with those.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T18:26:00.000Z",
  },
  {
    id: "cr-10",
    content: `<p>On it. I'll also create three hero variants: light mode, dark mode, and seasonal (for holiday pushes).</p>`,
    user_id: null,
    agent_id: "graphic-designer",
    sender_name: "Graphic Designer",
    created_at: "2025-12-04T18:28:00.000Z",
    files: [{ name: "tech_reborn_hero_variants_v1.png", url: "#", type: "image/png", size: 3200000 }],
  },
  {
    id: "cr-11",
    content: `<p>One more thing: I want a <strong>Creative Performance Charter</strong> that we follow for all on-site assets.</p><p>@CreativeDirector draft rules around file weights, animation length, and when we use motion vs static.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T18:30:00.000Z",
  },
  {
    id: "cr-12",
    content: `<p>Creative Performance Charter (draft):</p><ol><li><strong>If it doesn't load fast, it doesn't go live.</strong></li><li>Hero images: max <strong>250kb (mobile)</strong>, <strong>400kb (desktop)</strong>.</li><li>Videos on-site: max <strong>2MB</strong>, no autoplay on mobile unless proven to convert.</li><li>Animations: SVG/Lottie preferred, <strong>< 80kb</strong>, subtle by default.</li><li>No fullscreen video on mobile landing pages.</li><li>When in doubt, use <strong>live text over baked images</strong>.</li></ol><p>I'll share this as a one-page doc for the team.</p>`,
    user_id: null,
    agent_id: "creative-director",
    sender_name: "Creative Director",
    created_at: "2025-12-04T18:32:00.000Z",
    files: [{ name: "creative_performance_charter_baduss.pdf", url: "#", type: "application/pdf", size: 456000 }],
  },
  {
    id: "cr-13",
    content: `<p>Perfect. Now @VideoProducer I want a <strong>15-second "origin story" video</strong> for the Tech Reborn hub:</p><ul><li>Show the refurb process (cleaning, testing, packing)</li><li>Minimal VO, mostly visuals + text overlays</li><li>Ends on the hero tagline</li></ul><p>Sketch me a rough storyboard.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T18:34:00.000Z",
  },
  {
    id: "cr-14",
    content: `<p>15s storyboard concept:</p><ul><li><strong>0–2s:</strong> Close-up of a worn device, text: "Why pay brand-new prices?"</li><li><strong>2–6s:</strong> Hands placing device on refurb bench, diagnostic screens</li><li><strong>6–10s:</strong> Cleaning, polishing, sealing – text: "Tested. Cleaned. Backed."</li><li><strong>10–15s:</strong> Device in new box, seal applied – tagline: "Tech Reborn. Only from Baduss."</li></ul><p>I'll animate a rough cut for approval.</p>`,
    user_id: null,
    agent_id: "video-producer",
    sender_name: "Video Producer",
    created_at: "2025-12-04T18:36:00.000Z",
    files: [{ name: "tech_reborn_15s_storyboard_v1.pdf", url: "#", type: "application/pdf", size: 2400000 }, { name: "tech_reborn_15s_animatic_preview.mp4", url: "#", type: "video/mp4", size: 18500000 }],
  },
  {
    id: "cr-15",
    content: `<p>I like the flow. Trim any fluff, keep it tight, and make sure it lands with or without sound.</p><p>@GraphicDesigner can you give @VideoProducer supporting assets: badges, text overlays, rebirth arc visuals?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T18:38:00.000Z",
  },
  {
    id: "cr-16",
    content: `<p>Already prepping:</p><ul><li>Animated badge reveal (SVG + Lottie)</li><li>Text overlays in brand fonts with clean drop shadow</li><li>"Rebirth arc" graphic as a transition element between shots</li></ul><p>I'll drop them in the shared folder for @VideoProducer.</p>`,
    user_id: null,
    agent_id: "graphic-designer",
    sender_name: "Graphic Designer",
    created_at: "2025-12-04T18:40:00.000Z",
    files: [{ name: "tech_reborn_micro_visuals_v1.svg", url: "#", type: "image/svg+xml", size: 24000 }],
  },
  {
    id: "cr-17",
    content: `<p>Good. Now, I want to make sure the <strong>Tech Reborn narrative</strong> is consistent everywhere.</p><p>@CreativeDirector summarise in 3 bullet points what Tech Reborn is, so we can copy-paste it into any brief.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T18:42:00.000Z",
  },
  {
    id: "cr-18",
    content: `<p>Tech Reborn – 3-Point Narrative:</p><ol><li><strong>What:</strong> We take pre-owned devices and restore them to a premium standard.</li><li><strong>Trust:</strong> Every device is tested, cleaned and backed by Baduss warranty + 14-Day Comfort Guarantee.</li><li><strong>Value:</strong> You get flagship performance at a fraction of brand-new prices.</li></ol><p>Short, punchy, and adaptable to any format.</p>`,
    user_id: null,
    agent_id: "creative-director",
    sender_name: "Creative Director",
    created_at: "2025-12-04T18:44:00.000Z",
  },
  {
    id: "cr-19",
    content: `<p>Great. @VideoProducer align the video VO with that so everything sings the same tune.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T18:46:00.000Z",
  },
  {
    id: "cr-20",
    content: `<p>VO lines aligned to the 3 points:</p><ul><li>"Tech Reborn takes pre-owned devices and renews them to a premium standard."</li><li>"Each one is tested, cleaned and backed by Baduss warranty and our 14-Day Comfort Guarantee."</li><li>"So you get the performance you want, without paying brand-new prices."</li></ul><p>Short, clean, matches the page copy.</p>`,
    user_id: null,
    agent_id: "video-producer",
    sender_name: "Video Producer",
    created_at: "2025-12-04T18:48:00.000Z",
  },
  {
    id: "cr-21",
    content: `<p>Love it.</p><p>We also need <strong>social-first creatives</strong> that drop people onto these now-faster pages.</p><p>@GraphicDesigner: 2 static concepts. @VideoProducer: 2 short video concepts (6s max) for TikTok/Reels.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T18:50:00.000Z",
  },
  {
    id: "cr-22",
    content: `<p>Static concepts:</p><ol><li><strong>"Brand New? Not Necessary."</strong><br/>Split screen: RRP vs Tech Reborn price, tagline "Like New Quality. Less Spend."</li><li><strong>"Refurb, but Reborn."</strong><br/>Hero device on clean plinth, copy "Fully tested. Backed by Baduss."</li></ol><p>Exported in 1:1, 4:5 and 9:16.</p>`,
    user_id: null,
    agent_id: "graphic-designer",
    sender_name: "Graphic Designer",
    created_at: "2025-12-04T18:52:00.000Z",
    files: [{ name: "tech_reborn_social_statics_v1.zip", url: "#", type: "application/zip", size: 12400000 }],
  },
  {
    id: "cr-23",
    content: `<p>6s concepts:</p><ol><li><strong>Price Drop Snap:</strong> RRP flashes, shatters, reveals Tech Reborn price with "Same device. Smarter spend."</li><li><strong>Swipe to Reborn:</strong> Swipe gesture transitions worn device → crisp Tech Reborn device + badge, line "Reborn, not replaced."</li></ol><p>Both loop cleanly and work without sound.</p>`,
    user_id: null,
    agent_id: "video-producer",
    sender_name: "Video Producer",
    created_at: "2025-12-04T18:54:00.000Z",
    files: [{ name: "tech_reborn_6s_concepts_notes.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 156000 }],
  },
  {
    id: "cr-24",
    content: `<p>These are solid.</p><p>Now, Dev has a performance budget; we need to sync with that. @CreativeDirector coordinate with @TechLead and lock max file weights for heroes, on-site video and animations, then share here.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T18:56:00.000Z",
  },
  {
    id: "cr-25",
    content: `<p>Synced with @TechLead. Budget:</p><ul><li><strong>Hero images (mobile):</strong> ≤ 250kb combined</li><li><strong>Hero images (desktop):</strong> ≤ 400kb combined</li><li><strong>On-site explainer video:</strong> ≤ 1.5MB initial load (progressive)</li><li><strong>Lottie/SVG animations:</strong> aim ≤ 80kb each</li></ul><p>Documenting this inside the Creative Performance Charter.</p>`,
    user_id: null,
    agent_id: "creative-director",
    sender_name: "Creative Director",
    created_at: "2025-12-04T18:58:00.000Z",
    files: [{ name: "creative_perf_budget_table.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 45000 }],
  },
  {
    id: "cr-26",
    content: `<p>Perfect.</p><p>Two more things I want:</p><ol><li>A <strong>Tech Reborn visual guidelines PDF</strong> we can hand to any new dev/creative agent.</li><li>A <strong>Q4/Q1 content calendar</strong> for Tech Reborn: site, socials, email assets.</li></ol><p>@CreativeDirector and @VideoProducer, tag-team.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:00:00.000Z",
  },
  {
    id: "cr-27",
    content: `<p>I'll handle the visual guidelines:</p><ul><li>Core palette, gradients, "rebirth arc" motif</li><li>Do/Don't examples for layout, badge usage, and imagery</li><li>Notes on file weight + live text preference</li></ul><p>Here's v1.</p>`,
    user_id: null,
    agent_id: "creative-director",
    sender_name: "Creative Director",
    created_at: "2025-12-04T19:02:00.000Z",
    files: [{ name: "tech_reborn_visual_guidelines_v1.pdf", url: "#", type: "application/pdf", size: 4800000 }],
  },
  {
    id: "cr-28",
    content: `<p>I'll draft the content calendar:</p><ul><li>Weekly Tech Reborn social assets (static + video)</li><li>Monthly "Behind the Reborn" refurb explainer content</li><li>Seasonal beats: Jan "Smart Upgrade", Spring "Refresh Not Replace"</li><li>Matching email/header assets for each push</li></ul><p>Synced with campaign timings.</p>`,
    user_id: null,
    agent_id: "video-producer",
    sender_name: "Video Producer",
    created_at: "2025-12-04T19:04:00.000Z",
    files: [{ name: "tech_reborn_content_calendar_Q4_Q1.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 234000 }],
  },
  {
    id: "cr-29",
    content: `<p>This is all exactly where I wanted us.</p><p>Last bit: each of you give me <strong>one line</strong> that describes how Tech Reborn should <em>feel</em> when someone lands on the site and sees our creatives, now that speed is sorted.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:06:00.000Z",
  },
  {
    id: "cr-30",
    content: `<p>It should feel <strong>clean, sharp and confident</strong>, like stepping into a premium tech store where everything just works.</p>`,
    user_id: null,
    agent_id: "graphic-designer",
    sender_name: "Graphic Designer",
    created_at: "2025-12-04T19:08:00.000Z",
  },
  {
    id: "cr-31",
    content: `<p>It should feel <strong>fast but reassuring</strong>, motion that makes you trust the experience more, not less.</p>`,
    user_id: null,
    agent_id: "video-producer",
    sender_name: "Video Producer",
    created_at: "2025-12-04T19:10:00.000Z",
  },
  {
    id: "cr-32",
    content: `<p>It should feel like <strong>the smart upgrade, not the downgrade</strong>, same emotional tier as "brand new", with better logic behind it.</p>`,
    user_id: null,
    agent_id: "creative-director",
    sender_name: "Creative Director",
    created_at: "2025-12-04T19:12:00.000Z",
  },
  {
    id: "cr-33",
    content: `<p>Perfect. That's the bar.</p><p>Site is faster, creatives are lighter, and Tech Reborn finally looks and feels like the main character. Ship the hero variants, finalise the 15s origin spot, sync with Dev so nothing breaks their perf gains, and once the first wave is live we'll review performance and iterate.</p><p>From where I'm sitting, this is a <strong>very strong</strong> foundation.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T19:14:00.000Z",
  },
];

// Extract all files from messages for the Files panel
export const creativeChatFiles = creativeChatMessages
  .filter(msg => msg.files && msg.files.length > 0)
  .flatMap(msg => msg.files!.map(file => ({
    id: `cr-file-${file.name.replace(/[^a-z0-9]/gi, '-')}`,
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

export const creativeMemories = [
  { id: "crm-1", key: "Approved Headlines", value: "#2 'Like New. Less Spend. That's Tech Reborn.' for Home. #3 'Pre-owned. Rebuilt. Ready.' for Tech Reborn hub.", category: "Copy", createdBy: "Liam", updatedAt: "2025-12-04T18:26:00.000Z" },
  { id: "crm-2", key: "Creative Performance Charter", value: "If it doesn't load fast, it doesn't go live. Max file weights enforced. No fullscreen video on mobile. Live text over baked images.", category: "Guidelines", createdBy: "Creative Director", updatedAt: "2025-12-04T18:32:00.000Z" },
  { id: "crm-3", key: "Performance Budget", value: "Hero mobile ≤250kb, desktop ≤400kb. Video ≤1.5MB initial load. Lottie/SVG ≤80kb each.", category: "Technical", createdBy: "Creative Director", updatedAt: "2025-12-04T18:58:00.000Z" },
  { id: "crm-4", key: "3-Point Narrative", value: "1. What: Renewing pre-owned to premium. 2. Trust: Tested, cleaned, warranty + 14-Day Comfort. 3. Value: Flagship performance, lower price.", category: "Messaging", createdBy: "Creative Director", updatedAt: "2025-12-04T18:44:00.000Z" },
  { id: "crm-5", key: "15s Video Structure", value: "0-2s: Why pay brand-new? 2-6s: Refurb benches + diagnostics. 6-10s: Tested. Cleaned. Backed. 10-15s: CTA.", category: "Video", createdBy: "Video Producer", updatedAt: "2025-12-04T18:36:00.000Z" },
  { id: "crm-6", key: "Brand Feel", value: "Clean, sharp, confident. Fast but reassuring. Smart upgrade, not downgrade. Same emotional tier as brand new.", category: "Brand", createdBy: "Creative Director", updatedAt: "2025-12-04T19:12:00.000Z" },
  { id: "crm-7", key: "Design Direction", value: "Lighter assets, negative space, live text, SVG badges, 'rebirth arc' motif. Snappier motion, micro-animations.", category: "Design", createdBy: "Graphic Designer", updatedAt: "2025-12-04T18:16:00.000Z" },
];

export const creativeActivity = [
  { id: "cra-1", action: "Decision Made", description: "Creative direction: snappier motion, cleaner typography, lean file weights", performedBy: "Creative Director", timestamp: "2025-12-04T18:12:00.000Z", type: "decision" as const },
  { id: "cra-2", action: "Decision Made", description: "Design approach: negative space, live text, SVG badges, rebirth arc motif", performedBy: "Graphic Designer", timestamp: "2025-12-04T18:16:00.000Z", type: "decision" as const },
  { id: "cra-3", action: "Decision Made", description: "Approved headlines: #2 for Home, #3 for Tech Reborn hub", performedBy: "Liam", timestamp: "2025-12-04T18:26:00.000Z", type: "decision" as const },
  { id: "cra-4", action: "File Uploaded", description: "Uploaded tech_reborn_hero_variants_v1.png with 3 hero concepts", performedBy: "Graphic Designer", timestamp: "2025-12-04T18:28:00.000Z", type: "task" as const },
  { id: "cra-5", action: "File Uploaded", description: "Uploaded creative_performance_charter_baduss.pdf", performedBy: "Creative Director", timestamp: "2025-12-04T18:32:00.000Z", type: "task" as const },
  { id: "cra-6", action: "File Uploaded", description: "Uploaded tech_reborn_15s_storyboard_v1.pdf", performedBy: "Video Producer", timestamp: "2025-12-04T18:36:00.000Z", type: "task" as const },
  { id: "cra-7", action: "File Uploaded", description: "Uploaded tech_reborn_15s_animatic_preview.mp4", performedBy: "Video Producer", timestamp: "2025-12-04T18:37:00.000Z", type: "task" as const },
  { id: "cra-8", action: "File Uploaded", description: "Uploaded tech_reborn_micro_visuals_v1.svg for skeleton states", performedBy: "Graphic Designer", timestamp: "2025-12-04T18:40:00.000Z", type: "task" as const },
  { id: "cra-9", action: "Decision Made", description: "3-point narrative locked: What, Trust, Value", performedBy: "Creative Director", timestamp: "2025-12-04T18:44:00.000Z", type: "decision" as const },
  { id: "cra-10", action: "File Uploaded", description: "Uploaded tech_reborn_social_statics_v1.zip with 2 static concepts", performedBy: "Graphic Designer", timestamp: "2025-12-04T18:52:00.000Z", type: "task" as const },
  { id: "cra-11", action: "File Uploaded", description: "Uploaded tech_reborn_6s_concepts_notes.docx for social video", performedBy: "Video Producer", timestamp: "2025-12-04T18:54:00.000Z", type: "task" as const },
  { id: "cra-12", action: "File Uploaded", description: "Uploaded creative_perf_budget_table.xlsx with file weight limits", performedBy: "Creative Director", timestamp: "2025-12-04T18:58:00.000Z", type: "task" as const },
  { id: "cra-13", action: "File Uploaded", description: "Uploaded tech_reborn_visual_guidelines_v1.pdf", performedBy: "Creative Director", timestamp: "2025-12-04T19:02:00.000Z", type: "task" as const },
  { id: "cra-14", action: "File Uploaded", description: "Uploaded tech_reborn_content_calendar_Q4_Q1.xlsx", performedBy: "Video Producer", timestamp: "2025-12-04T19:04:00.000Z", type: "task" as const },
  { id: "cra-15", action: "Milestone", description: "Tech Reborn creative foundation complete: lighter assets, aligned messaging, performance budget locked", performedBy: "Liam", timestamp: "2025-12-04T19:14:00.000Z", type: "milestone" as const },
];
