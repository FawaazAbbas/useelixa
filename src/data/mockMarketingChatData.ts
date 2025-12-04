// Marketing Team Chat Messages from Tech Reborn Campaign - April 12, 2025

export interface ChatFileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface MarketingMessage {
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
  "MarketingDirector": { agent_id: "marketing-director", user_id: null, display_name: "Marketing Director" },
  "PPCSpecialist": { agent_id: "ppc-specialist", user_id: null, display_name: "PPC Specialist" },
  "SocialMediaManager": { agent_id: "social-media-manager", user_id: null, display_name: "Social Media Manager" },
  "ContentWriter": { agent_id: "content-writer", user_id: null, display_name: "Content Writer" },
  "EmailMarketingSpecialist": { agent_id: "email-marketing-specialist", user_id: null, display_name: "Email Marketing Specialist" },
  "SEOSpecialist": { agent_id: "seo-specialist", user_id: null, display_name: "SEO Specialist" },
};

// File type mapping
const getFileType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    'csv': 'text/csv',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'pdf': 'application/pdf',
    'mp4': 'video/mp4',
    'zip': 'application/zip',
    'html': 'text/html',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return typeMap[ext] || 'application/octet-stream';
};

// Random file sizes for mock data
const getFileSize = (filename: string): number => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const sizeRanges: Record<string, [number, number]> = {
    'csv': [50000, 500000],
    'docx': [100000, 2000000],
    'pdf': [200000, 5000000],
    'mp4': [5000000, 50000000],
    'zip': [10000000, 100000000],
    'html': [10000, 100000],
    'pptx': [1000000, 10000000],
    'png': [100000, 2000000],
    'xlsx': [50000, 1000000],
  };
  const range = sizeRanges[ext] || [10000, 100000];
  return Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
};

// Parse date from DD/MM/YYYY HH:MM:SS format
const parseDate = (dateStr: string): string => {
  const [datePart, timePart] = dateStr.split(' ');
  const [day, month, year] = datePart.split('/');
  return `${year}-${month}-${day}T${timePart}.000Z`;
};

export const marketingChatMessages: MarketingMessage[] = [
  {
    id: "mkt-tr-1",
    content: `<p>Morning team, I want a major push on <strong>Tech Reborn</strong> today. We're scaling aggressively, and I want this campaign everywhere. @MarketingDirector give me a quick 30-second pulse check, then we execute.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 10:00:00"),
  },
  {
    id: "mkt-tr-2",
    content: `<p>30-second update:<ul><li>CPMs down 11%</li><li>CPAs stable except MacBooks (weak)</li><li>iPhone 13 converting like a dream</li><li>Organic is spiking</li><li>We need fresh creatives TODAY</li></ul>Let's attack MacBooks first.</p>`,
    user_id: null,
    agent_id: "marketing-director",
    sender_name: "Marketing Director",
    created_at: parseDate("04/12/2025 10:02:00"),
    files: [{ name: "daily_overview_tech_reborn_1000.csv", url: "#", type: "text/csv", size: 245000 }],
  },
  {
    id: "mkt-tr-3",
    content: `<p>Good. @PPCSpecialist adjust bids and duplicate the top 3 ad sets, new creative slots ready in 20 mins. I want a complete MacBook angle refresh.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 10:04:00"),
  },
  {
    id: "mkt-tr-4",
    content: `<p>On it. Quick insight, a competitor price drop is killing our MacBook CTR. We need:<ul><li>Stronger pricing callouts</li><li>Faster visual hooks</li><li>More aggressive value headlines</li></ul>I'll show variations in five minutes.</p>`,
    user_id: null,
    agent_id: "ppc-specialist",
    sender_name: "PPC Specialist",
    created_at: parseDate("04/12/2025 10:06:00"),
  },
  {
    id: "mkt-tr-5",
    content: `<p>Liam, creators are asking what angle they should hit next. Do we go <strong>trust</strong>, <strong>savings</strong> or <strong>performance</strong> for MacBooks? Need direction before I brief them.</p>`,
    user_id: null,
    agent_id: "social-media-manager",
    sender_name: "Social Media Manager",
    created_at: parseDate("04/12/2025 10:08:00"),
  },
  {
    id: "mkt-tr-6",
    content: `<p>We go <strong>performance + savings</strong>. People don't realise M1 is still a monster. Push this hook:<strong>"You don't need the new one, the M1 is a monster."</strong></p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 10:10:00"),
  },
  {
    id: "mkt-tr-7",
    content: `<p>Writing 3 script variants now using that hook. Draft V1:<br/><br/><em>"The M1 MacBook Air is STILL the fastest laptop most people ever touch. So why buy new? Tech Reborn, premium performance, reborn."</em></p>`,
    user_id: null,
    agent_id: "content-writer",
    sender_name: "Content Writer",
    created_at: parseDate("04/12/2025 10:12:00"),
    files: [{ name: "tech_reborn_macbook_scripts_v1.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 156000 }],
  },
  {
    id: "mkt-tr-8",
    content: `<p>I'm crafting a MacBook-specific <strong>Tech Reborn</strong> email. Liam, do you want a <strong>price-drop</strong> angle or a <strong>quality guarantee</strong> angle as the hero?</p>`,
    user_id: null,
    agent_id: "email-marketing-specialist",
    sender_name: "Email Marketing Specialist",
    created_at: parseDate("04/12/2025 10:14:00"),
  },
  {
    id: "mkt-tr-9",
    content: `<p>Quality first, price second.<br/>Hero line:<br/><strong>"Your Next MacBook, Reborn to Perform."</strong><br/>Put the savings further down, not up front.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 10:16:00"),
  },
  {
    id: "mkt-tr-10",
    content: `<p>Liam, I'm updating the MacBook M1 page with a performance comparison chart: M1 vs M2 vs M3 → real-world benchmarks.<br/>Okay to highlight:<br/><strong>"Minimal difference for most users."</strong><br/>It boosts trust but is slightly anti-Apple.</p>`,
    user_id: null,
    agent_id: "seo-specialist",
    sender_name: "SEO Specialist",
    created_at: parseDate("04/12/2025 10:18:00"),
  },
  {
    id: "mkt-tr-11",
    content: `<p>Do it.<br/>We're selling <strong>truth</strong>. We are the <strong>anti-inflation tech brand</strong>.<br/>Push that narrative everywhere.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 10:20:00"),
  },
  {
    id: "mkt-tr-12",
    content: `<p>Here are 3 revised headline options for MacBook ads:<ol><li><strong>"The M1 Didn't Get Slower, Only Cheaper."</strong></li><li><strong>"Why Pay New for Performance You Already Have?"</strong></li><li><strong>"MacBook Air M1: Peak Value. Reborn."</strong></li></ol>Pick one so I can scale.</p>`,
    user_id: null,
    agent_id: "ppc-specialist",
    sender_name: "PPC Specialist",
    created_at: parseDate("04/12/2025 10:22:00"),
    files: [{ name: "macbook_headlines_options.pdf", url: "#", type: "application/pdf", size: 892000 }],
  },
  {
    id: "mkt-tr-13",
    content: `<p>#1 and #3. Rotate both. Kill #2.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 10:24:00"),
  },
  {
    id: "mkt-tr-14",
    content: `<p>Team, let's tighten cohesion.<br/>Messaging today must align under:<br/><strong>Truth. Performance. Reborn.</strong><br/>Drop any lines that feel too discount-y. We're <strong>premium refurb</strong>.</p>`,
    user_id: null,
    agent_id: "marketing-director",
    sender_name: "Marketing Director",
    created_at: parseDate("04/12/2025 10:26:00"),
  },
  {
    id: "mkt-tr-15",
    content: `<p>Uploading a new Reel draft now.<br/>Thumbnail text: <strong>"Refurbished… or brand new?"</strong><br/>Video ends with: <strong>"Tech Reborn. Only from Baduss."</strong><br/>Liam, want a punchier CTA?</p>`,
    user_id: null,
    agent_id: "social-media-manager",
    sender_name: "Social Media Manager",
    created_at: parseDate("04/12/2025 10:28:00"),
    files: [{ name: "tech_reborn_reel_draft_v2.mp4", url: "#", type: "video/mp4", size: 24500000 }],
  },
  {
    id: "mkt-tr-16",
    content: `<p>Yes. Add this line at the end:<br/><strong>"Stop overpaying for the same performance."</strong></p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 10:30:00"),
  },
  {
    id: "mkt-tr-17",
    content: `<p>Here are 2 more script variants:<br/><br/><strong>V2:</strong><br/><em>"Apple didn't reinvent the wheel, they just changed the name. The M1 is STILL a beast. Tech Reborn brings it back at a price that makes sense."</em><br/><br/><strong>V3:</strong><br/><em>"Before you spend over £1,000 on a laptop… watch this."</em> → performance chart → <strong>"Tech Reborn."</strong><br/>Approving?</p>`,
    user_id: null,
    agent_id: "content-writer",
    sender_name: "Content Writer",
    created_at: parseDate("04/12/2025 10:32:00"),
    files: [{ name: "tech_reborn_macbook_scripts_v2_v3.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 178000 }],
  },
  {
    id: "mkt-tr-18",
    content: `<p>Take V3 and make it hyper-punchy. Strip any fluff.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 10:34:00"),
  },
  {
    id: "mkt-tr-19",
    content: `<p>Draft email hero section:<br/><strong>"Your Next MacBook, Reborn to Perform."</strong><br/>Image: M1 floating over a clean white background.<br/>CTA: <strong>"See Why It's Still Elite."</strong><br/>Sending full preview in 3 minutes.</p>`,
    user_id: null,
    agent_id: "email-marketing-specialist",
    sender_name: "Email Marketing Specialist",
    created_at: parseDate("04/12/2025 10:36:00"),
    files: [{ name: "tech_reborn_macbook_email_preview.html", url: "#", type: "text/html", size: 45000 }],
  },
  {
    id: "mkt-tr-20",
    content: `<p>Adding FAQs to the MacBook page:<ul><li>"Is M1 still good in 2025?"</li><li>"Why choose refurbished over new?"</li><li>"What testing does Baduss Tech perform?"</li></ul>This should help us grab more featured snippets.</p>`,
    user_id: null,
    agent_id: "seo-specialist",
    sender_name: "SEO Specialist",
    created_at: parseDate("04/12/2025 10:38:00"),
  },
  {
    id: "mkt-tr-21",
    content: `<p>Good. Also add one on <strong>Battery Health Guarantee</strong>. People obsess over that line item.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 10:40:00"),
  },
  {
    id: "mkt-tr-22",
    content: `<p>Previewing new ad variations:<br/>- Animation of refurb process<br/>- Before/after cleaning shots<br/>- Comparison charts<br/>CTR forecast: +30%.<br/>Ready to launch.</p>`,
    user_id: null,
    agent_id: "ppc-specialist",
    sender_name: "PPC Specialist",
    created_at: parseDate("04/12/2025 10:42:00"),
    files: [{ name: "tech_reborn_macbook_creatives_batch1.zip", url: "#", type: "application/zip", size: 48500000 }],
  },
  {
    id: "mkt-tr-23",
    content: `<p>I want a MacBook <strong>"Truth Carousel"</strong> for Meta ads:<ol><li>"Apple Silicon didn't slow down."</li><li>"Most upgrades barely change real-life performance."</li><li>"Tech Reborn gives devices a second life."</li><li>"Why pay £1,199 when £589 performs the same?"</li></ol>@GraphicDesigner is on assets.</p>`,
    user_id: null,
    agent_id: "marketing-director",
    sender_name: "Marketing Director",
    created_at: parseDate("04/12/2025 10:44:00"),
  },
  {
    id: "mkt-tr-24",
    content: `<p>Influencer brief going out now:<br/>- 10 creators<br/>- Hook: <strong>"I tested a refurbished MacBook so you don't have to."</strong><br/>- CTA: <strong>"Tech Reborn by Baduss"</strong><br/>First rough cut coming soon.</p>`,
    user_id: null,
    agent_id: "social-media-manager",
    sender_name: "Social Media Manager",
    created_at: parseDate("04/12/2025 10:46:00"),
    files: [{ name: "influencer_brief_tech_reborn_macbook.pdf", url: "#", type: "application/pdf", size: 1245000 }],
  },
  {
    id: "mkt-tr-25",
    content: `<p>Liam, rewritten V3 into final form:<br/><br/><em>"Before you spend over £1,000 on a laptop… remember this. The M1 is still one of the fastest chips Apple ever made. Tech Reborn brings it back to life, at a price that finally makes sense."</em><br/>Approve?</p>`,
    user_id: null,
    agent_id: "content-writer",
    sender_name: "Content Writer",
    created_at: parseDate("04/12/2025 10:48:00"),
  },
  {
    id: "mkt-tr-26",
    content: `<p>Approved. Push that line everywhere.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 10:50:00"),
  },
  {
    id: "mkt-tr-27",
    content: `<p>Email is ready. Segmenting into:<ul><li>Laptop intenders</li><li>High-value visitors</li><li>Viewed MacBook but didn't buy</li><li>Existing customers with older MacBooks</li></ul>Sending tests now.</p>`,
    user_id: null,
    agent_id: "email-marketing-specialist",
    sender_name: "Email Marketing Specialist",
    created_at: parseDate("04/12/2025 10:52:00"),
  },
  {
    id: "mkt-tr-28",
    content: `<p>MacBook page updates will be live in 60 seconds. Added performance chart, FAQ and links back to the <strong>Tech Reborn</strong> hub.<br/>Expect +12–18% organic clicks this week.</p>`,
    user_id: null,
    agent_id: "seo-specialist",
    sender_name: "SEO Specialist",
    created_at: parseDate("04/12/2025 10:54:00"),
  },
  {
    id: "mkt-tr-29",
    content: `<p>Time check:<br/>- Ads refreshed<br/>- Page updated<br/>- Email prepped<br/>- Content locked<br/>- Creators briefed<br/>Next step: track performance at <strong>3PM</strong> and re-optimise.</p>`,
    user_id: null,
    agent_id: "marketing-director",
    sender_name: "Marketing Director",
    created_at: parseDate("04/12/2025 10:56:00"),
    files: [{ name: "midday_checklist_tech_reborn.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 89000 }],
  },
  {
    id: "mkt-tr-30",
    content: `<p>Amazing work. <strong>Tech Reborn</strong> isn't just a campaign, it's the new identity of this company.<br/>Push hard today. I want record numbers by midnight.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 10:58:00"),
  },
  // 3PM Session
  {
    id: "mkt-tr-31",
    content: `<p>Quick 3PM update:<ul><li>Revenue so far: <strong>£132,870</strong> (+24% vs last Tuesday)</li><li>MacBook sales up <strong>41%</strong> vs all of yesterday</li><li>New MacBook ads are crushing</li></ul>We're on track for a record day if we own the evening window.</p>`,
    user_id: null,
    agent_id: "marketing-director",
    sender_name: "Marketing Director",
    created_at: parseDate("04/12/2025 15:00:00"),
    files: [{ name: "tech_reborn_3pm_performance.csv", url: "#", type: "text/csv", size: 312000 }],
  },
  {
    id: "mkt-tr-32",
    content: `<p>Good. I want us to own the evening scroll.<br/>@PPCSpecialist what's working and what needs to be killed <strong>right now</strong>?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 15:02:00"),
  },
  {
    id: "mkt-tr-33",
    content: `<p>Pulled a 2-hour live comparison:<br/><strong>Winners:</strong><br/>- "The M1 Didn't Get Slower, Only Cheaper" → CTR 4.9%, CPA £11.80<br/>- "Before you spend £1,000…" → CTR 5.3%, CPA £10.90<br/><strong>Losers:</strong><br/>- Old "Save on MacBooks" creatives → CPA £26+<br/>I'm pausing all legacy MacBook creatives now and reallocating 70% more budget to winners.</p>`,
    user_id: null,
    agent_id: "ppc-specialist",
    sender_name: "PPC Specialist",
    created_at: parseDate("04/12/2025 15:04:00"),
    files: [{ name: "macbook_ads_performance_window_13-15.csv", url: "#", type: "text/csv", size: 178000 }],
  },
  {
    id: "mkt-tr-34",
    content: `<p>We've got 3 creators sending cuts now.<br/>The "I tested a refurbished MacBook so you don't have to" video? First edit is actually solid.<br/>Uploading for your reaction, Liam.</p>`,
    user_id: null,
    agent_id: "social-media-manager",
    sender_name: "Social Media Manager",
    created_at: parseDate("04/12/2025 15:06:00"),
    files: [{ name: "creator_ad_macbook_cut1.mp4", url: "#", type: "video/mp4", size: 32400000 }],
  },
  {
    id: "mkt-tr-35",
    content: `<p>Watched it.<br/>Hook is strong, but trim the intro by 2 seconds.<br/>Cut the rambling "I was sceptical" bit.<br/>End with:<br/><strong>"Tech Reborn by Baduss, this is what refurbished should feel like."</strong></p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 15:08:00"),
  },
  {
    id: "mkt-tr-36",
    content: `<p>Copying that line into captions now.<br/>Also changing on-screen text to:<br/><strong>"Refurbished? I didn't expect it to look like this."</strong><br/>This will hit hard on TikTok.</p>`,
    user_id: null,
    agent_id: "content-writer",
    sender_name: "Content Writer",
    created_at: parseDate("04/12/2025 15:10:00"),
  },
  {
    id: "mkt-tr-37",
    content: `<p>MacBook email just went out to the segmented list.<br/>First 15 minutes:<ul><li>Open rate: 22%</li><li>Click rate: 3.8%</li><li>17 active checkouts</li></ul>Do you want an SMS follow-up in 2 hours or save that for tomorrow?</p>`,
    user_id: null,
    agent_id: "email-marketing-specialist",
    sender_name: "Email Marketing Specialist",
    created_at: parseDate("04/12/2025 15:12:00"),
  },
  {
    id: "mkt-tr-38",
    content: `<p>Send a soft SMS in 2 hours:<br/><em>"Still thinking about a MacBook? The M1 is still elite. See why."</em><br/>No discount, just the story.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 15:14:00"),
  },
  {
    id: "mkt-tr-39",
    content: `<p>Organic is reacting already.<br/>Clicks on the MacBook Air M1 page are up <strong>19%</strong> vs same time yesterday.<br/>Average time on page: +34 seconds.<br/>Next: I'll add a block on the iPhone Tech Reborn page that points into MacBooks. Agreed?</p>`,
    user_id: null,
    agent_id: "seo-specialist",
    sender_name: "SEO Specialist",
    created_at: parseDate("04/12/2025 15:16:00"),
  },
  {
    id: "mkt-tr-40",
    content: `<p>Yes, cross-pollinate.<br/>If they care about iPhones, they probably own a laptop.<br/>Make it feel like: "By the way, we do this for MacBooks too."</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 15:18:00"),
  },
  {
    id: "mkt-tr-41",
    content: `<p>Let's lock in tonight's <strong>Tech Reborn Stack</strong>:<ul><li>7PM: MacBook remarketing burst (Meta + TikTok)</li><li>7:30PM: Organic posts across IG/TikTok</li><li>8PM: SMS reminder</li><li>9PM: UGC "Before you spend £1,000…" drop</li></ul>Everyone needs to be ready to tweak live based on response.</p>`,
    user_id: null,
    agent_id: "marketing-director",
    sender_name: "Marketing Director",
    created_at: parseDate("04/12/2025 15:20:00"),
    files: [{ name: "evening_plan_tech_reborn_stack.pptx", url: "#", type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", size: 4500000 }],
  },
  {
    id: "mkt-tr-42",
    content: `<p>I'll schedule the organic posts but keep them editable.<br/>Story plan:<br/>1) Poll: "Would you buy refurbished?"<br/>2) Reveal: "This is refurbished."<br/>3) Swipe-up to /tech-reborn<br/>4) Final slide: "Stop overpaying for performance."</p>`,
    user_id: null,
    agent_id: "social-media-manager",
    sender_name: "Social Media Manager",
    created_at: parseDate("04/12/2025 15:22:00"),
  },
  {
    id: "mkt-tr-43",
    content: `<p>Just dropped 4 Story caption options into the assets folder.<br/>Also rewriting ad descriptions to lean into the truth narrative:<ul><li>"Apple didn't slow it down. Marketing just sped prices up."</li><li>"The chip is the same. The bill doesn't have to be."</li></ul>Use both?</p>`,
    user_id: null,
    agent_id: "content-writer",
    sender_name: "Content Writer",
    created_at: parseDate("04/12/2025 15:24:00"),
    files: [{ name: "story_captions_tech_reborn.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 67000 }],
  },
  {
    id: "mkt-tr-44",
    content: `<p>Use both. Alternate them across creatives.<br/>I want us to sound like the brand saying what everyone already feels.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 15:26:00"),
  },
  {
    id: "mkt-tr-45",
    content: `<p>Side note: iPhone 13 Pro ads are starting to fatigue, same creatives have run for 3 weeks.<br/>Metrics are dipping slightly.<br/>We'll need 2 fresh iPhone angles tomorrow. Not urgent, just flagging.</p>`,
    user_id: null,
    agent_id: "ppc-specialist",
    sender_name: "PPC Specialist",
    created_at: parseDate("04/12/2025 15:28:00"),
  },
  {
    id: "mkt-tr-46",
    content: `<p>Noted. Tomorrow morning we do an iPhone-only creative sprint.<br/>For today, MacBook stays front and centre.<br/>@EmailMarketingSpecialist line up a simple iPhone Tech Reborn email for tomorrow too.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 15:30:00"),
  },
  {
    id: "mkt-tr-47",
    content: `<p>Got it.<br/>Tomorrow's iPhone email will cover:<ul><li>"You don't need the 15."</li><li>Battery Health Guarantee</li><li>"Tech Reborn = Like-New iPhone, Not Like-New Price."</li></ul>Draft ready by 10AM.</p>`,
    user_id: null,
    agent_id: "email-marketing-specialist",
    sender_name: "Email Marketing Specialist",
    created_at: parseDate("04/12/2025 15:32:00"),
  },
  {
    id: "mkt-tr-48",
    content: `<p>Adding structured FAQ schema to both iPhone and MacBook Tech Reborn sections now.<br/>We'll start pulling more snippet real estate for queries like "is M1 still good" and "is refurbished safe".</p>`,
    user_id: null,
    agent_id: "seo-specialist",
    sender_name: "SEO Specialist",
    created_at: parseDate("04/12/2025 15:34:00"),
  },
  {
    id: "mkt-tr-49",
    content: `<p>Don't forget reviews.<br/>I want today's customers nudged hard for Trustpilot.<br/>@EmailMarketingSpecialist can you tighten the review request copy to feel like "help others make a smart choice" instead of generic "rate us"?</p>`,
    user_id: null,
    agent_id: "marketing-director",
    sender_name: "Marketing Director",
    created_at: parseDate("04/12/2025 15:36:00"),
  },
  {
    id: "mkt-tr-50",
    content: `<p>New review request line:<br/><em>"Your review can help someone stop overpaying for the same tech. Tell them what Tech Reborn felt like for you."</em><br/>Rolling this out to everyone who orders today.</p>`,
    user_id: null,
    agent_id: "email-marketing-specialist",
    sender_name: "Email Marketing Specialist",
    created_at: parseDate("04/12/2025 15:38:00"),
    files: [{ name: "review_request_template_tech_reborn.html", url: "#", type: "text/html", size: 34000 }],
  },
  {
    id: "mkt-tr-51",
    content: `<p>First revised creator ad with your changes is back, Liam.<br/>Intro is now 3 seconds shorter, and the ending hook is exactly your line.<br/>Setting it live as a Spark Ad on TikTok in the next 10 minutes.</p>`,
    user_id: null,
    agent_id: "social-media-manager",
    sender_name: "Social Media Manager",
    created_at: parseDate("04/12/2025 15:40:00"),
    files: [{ name: "creator_ad_macbook_final_cut.mp4", url: "#", type: "video/mp4", size: 28700000 }],
  },
  {
    id: "mkt-tr-52",
    content: `<p>I'll clone our best-performing MacBook ad set and inject that Spark Ad into it.<br/>Test budget: £300 over 4 hours.<br/>We'll know by tonight if this becomes an evergreen asset.</p>`,
    user_id: null,
    agent_id: "ppc-specialist",
    sender_name: "PPC Specialist",
    created_at: parseDate("04/12/2025 15:42:00"),
    files: [{ name: "macbook_spark_ad_test_setup.png", url: "#", type: "image/png", size: 456000 }],
  },
  {
    id: "mkt-tr-53",
    content: `<p>Perfect.<br/>I want a mini performance update at <strong>9PM</strong>.<br/>If things are flying, we scale into the night. If anything lags, we pivot instantly.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 15:44:00"),
  },
  {
    id: "mkt-tr-54",
    content: `<p>Understood.<br/>9PM checkpoint will include:<ul><li>Total revenue</li><li>MacBook share of revenue</li><li>iPhone performance check</li><li>CPA vs target</li></ul>We'll come with recommendations, not just numbers.</p>`,
    user_id: null,
    agent_id: "marketing-director",
    sender_name: "Marketing Director",
    created_at: parseDate("04/12/2025 15:46:00"),
  },
  {
    id: "mkt-tr-55",
    content: `<p>MacBook blog <strong>"Is a Refurbished MacBook Worth It in 2025?"</strong> is live and indexed.<br/>Linked from the Tech Reborn hub and the MacBook PDP.<br/>This will quietly compound organic traffic over the next few weeks.</p>`,
    user_id: null,
    agent_id: "seo-specialist",
    sender_name: "SEO Specialist",
    created_at: parseDate("04/12/2025 15:48:00"),
    files: [{ name: "blog_is_refurb_macbook_worth_it_2025.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 234000 }],
  },
  {
    id: "mkt-tr-56",
    content: `<p>I've drafted a Twitter thread in your founder voice, Liam:<br/>- Why I built Baduss Tech<br/>- Why new tech is often unnecessarily expensive<br/>- Why <strong>Tech Reborn</strong> exists<br/>Dropping the doc for your tweaks.</p>`,
    user_id: null,
    agent_id: "content-writer",
    sender_name: "Content Writer",
    created_at: parseDate("04/12/2025 15:50:00"),
    files: [{ name: "liam_baduss_tech_reborn_thread.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 89000 }],
  },
  {
    id: "mkt-tr-57",
    content: `<p>Nice. Send it over, I'll tweak the tone and post it tonight.<br/>Founder voice needs to match everything we're doing with Tech Reborn.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 15:52:00"),
  },
  {
    id: "mkt-tr-58",
    content: `<p>Cool. For now, focus on execution and monitoring.<br/>We've turned <strong>Tech Reborn</strong> from a static campaign into a living system today.<br/>We'll see what the numbers say tonight and then iterate again tomorrow.</p>`,
    user_id: null,
    agent_id: "marketing-director",
    sender_name: "Marketing Director",
    created_at: parseDate("04/12/2025 15:54:00"),
  },
  {
    id: "mkt-tr-59",
    content: `<p>You're all monsters in the best way.<br/>Let's make tonight stupidly good.<br/>If any key metric goes sideways, I'd rather overreact than miss the signal.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: parseDate("04/12/2025 15:56:00"),
  },
  {
    id: "mkt-tr-60",
    content: `<p>Copy that.<br/>Dashboards pinned, alerts set.<br/>If anything breaks, you'll know before the platform does.</p>`,
    user_id: null,
    agent_id: "ppc-specialist",
    sender_name: "PPC Specialist",
    created_at: parseDate("04/12/2025 15:58:00"),
  },
];

// Extract all files from messages for the Files panel
export const marketingChatFiles = marketingChatMessages
  .filter(msg => msg.files && msg.files.length > 0)
  .flatMap(msg => msg.files!.map(file => ({
    id: `mkt-file-${file.name.replace(/[^a-z0-9]/gi, '-')}`,
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
