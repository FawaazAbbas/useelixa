// Development Team Chat Messages - December 4, 2025

import type { ChatFileAttachment } from './mockMarketingChatData';

export interface DevelopmentMessage {
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
  "TechLead": { agent_id: "tech-lead", user_id: null, display_name: "Tech Lead" },
  "ShopifyDeveloper": { agent_id: "shopify-developer", user_id: null, display_name: "Shopify Developer" },
  "UXUIDesigner": { agent_id: "ux-ui-designer", user_id: null, display_name: "UX/UI Designer" },
};

export const developmentChatMessages: DevelopmentMessage[] = [
  {
    id: "dev-1",
    content: `<p>Dev team, Marketing is going all-in on <strong>Tech Reborn</strong> and traffic is surging. I want to make sure the site doesn't buckle and actually feels <strong>fast</strong>. Not "okay", <strong>fast</strong>. @TechLead give me the current state of Core Web Vitals and any obvious blockers.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:00:00.000Z",
  },
  {
    id: "dev-2",
    content: `<p>Latest Lighthouse scores (mobile):</p><ul><li>Home: Performance <strong>62</strong>, LCP <strong>3.8s</strong></li><li>Tech Reborn collection: Performance <strong>58</strong>, LCP <strong>4.2s</strong></li><li>MacBook M1 PDP: Performance <strong>65</strong>, LCP <strong>3.5s</strong></li></ul><p>Root causes: heavy hero images, too many render-blocking scripts, app bloat from unused Shopify apps. All fixable.</p>`,
    user_id: null,
    agent_id: "tech-lead",
    sender_name: "Tech Lead",
    created_at: "2025-12-04T16:02:00.000Z",
    files: [{ name: "core_web_vitals_snapshot_2025-12-04.csv", url: "#", type: "text/csv", size: 45000 }],
  },
  {
    id: "dev-3",
    content: `<p>That's not where I want it. @ShopifyDeveloper run me through which apps are killing us and what we actually need vs what's legacy junk.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:04:00.000Z",
  },
  {
    id: "dev-4",
    content: `<p>App audit:</p><ul><li><strong>Currently installed:</strong> 18 apps</li><li><strong>Actively used:</strong> 9</li><li><strong>Dead weight:</strong> 5 apps still injecting scripts but doing nothing useful</li><li><strong>Heavy hitters:</strong> 2 apps (exit-intent popup, live chat widget) adding ~400kb combined JS</li></ul><p>If we prune dead apps and defer or async the heavy ones, we save ~600kb and cut LCP by 1s+ easily.</p>`,
    user_id: null,
    agent_id: "shopify-developer",
    sender_name: "Shopify Developer",
    created_at: "2025-12-04T16:06:00.000Z",
    files: [{ name: "shopify_app_audit_baduss_FY3.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 234000 }],
  },
  {
    id: "dev-5",
    content: `<p>Great. Prune the dead apps today. For heavy ones, defer them. If anyone complains, we'll deal with it, speed wins.</p><p>@UXUIDesigner what can we do on the design/assets side without changing how the site looks?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:08:00.000Z",
  },
  {
    id: "dev-6",
    content: `<p>Design optimisations (no visual change):</p><ul><li><strong>Hero images:</strong> re-export at optimised dimensions + modern formats (WebP/AVIF fallback)</li><li><strong>Font loading:</strong> subset fonts to only characters we use, swap to font-display: swap</li><li><strong>Lazy-load:</strong> all below-fold images + carousels</li><li><strong>Inline critical CSS</strong> for above-the-fold content</li></ul><p>Net effect: same look, cheaper to render.</p>`,
    user_id: null,
    agent_id: "ux-ui-designer",
    sender_name: "UX/UI Designer",
    created_at: "2025-12-04T16:10:00.000Z",
  },
  {
    id: "dev-7",
    content: `<p>Perfect. Do all of that. I don't want the site to "feel" different, I want it to <strong>feel fast</strong>.</p><p>@TechLead, give me a prioritised punch list: what gives us the biggest speed gains in the next 48 hours?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:12:00.000Z",
  },
  {
    id: "dev-8",
    content: `<p>48-hour quick wins:</p><ol><li><strong>Image optimisation</strong> (hero + collection thumbnails)</li><li><strong>Defer non-critical JS</strong> (chat widget, exit-intent, analytics scripts)</li><li><strong>Lazy-load below-fold images</strong></li><li><strong>Reduce fonts</strong> (drop unused weights)</li><li><strong>Remove dead apps</strong></li></ol><p>Estimated improvement: LCP from ~4s → <strong>2.5–2.8s</strong> on mobile.</p>`,
    user_id: null,
    agent_id: "tech-lead",
    sender_name: "Tech Lead",
    created_at: "2025-12-04T16:14:00.000Z",
  },
  {
    id: "dev-9",
    content: `<p>Nice. @ShopifyDeveloper I want a live <strong>app graveyard list</strong>: what we delete, what we defer, what we keep.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:16:00.000Z",
  },
  {
    id: "dev-10",
    content: `<p>App triage:</p><p><strong>Remove:</strong></p><ul><li>Legacy exit-intent popup</li><li>Old announcement bar app</li></ul><p><strong>Defer/async:</strong></p><ul><li>Reviews widget</li><li>Live chat</li><li>Heatmapping/analytics script</li></ul><p><strong>Keep & optimise:</strong></p><ul><li>Tech Reborn badges logic</li><li>Smart Packs/bundle app</li></ul>`,
    user_id: null,
    agent_id: "shopify-developer",
    sender_name: "Shopify Developer",
    created_at: "2025-12-04T16:18:00.000Z",
    files: [{ name: "shopify_app_impact_matrix.csv", url: "#", type: "text/csv", size: 67000 }],
  },
  {
    id: "dev-11",
    content: `<p>Perfect. Anything that doesn't make us <strong>money or trust</strong> either moves async or dies. @UXUIDesigner give me the <strong>image plan</strong> for home, Tech Reborn collections and top PDPs.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:20:00.000Z",
  },
  {
    id: "dev-12",
    content: `<p>Image optimisation plan:</p><ul><li>Home + Tech Reborn heroes: export at 3 sizes (desktop/tablet/mobile), heavier compression, no visible quality hit</li><li>PDP galleries: primary image light + priority, secondary angles lazy-loaded</li><li>Collection thumbs: unify aspect ratio, compress batch to target kb size</li></ul><p>I'll deliver a zipped pack + mapping document.</p>`,
    user_id: null,
    agent_id: "ux-ui-designer",
    sender_name: "UX/UI Designer",
    created_at: "2025-12-04T16:22:00.000Z",
    files: [{ name: "image_optimisation_spec_baduss.pdf", url: "#", type: "application/pdf", size: 1800000 }],
  },
  {
    id: "dev-13",
    content: `<p>Love it. @TechLead, targets: I want mobile <strong>LCP < 2.5s</strong> on home and Tech Reborn collections, and Lighthouse Performance > <strong>80</strong> on key templates. Lock that in.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:24:00.000Z",
  },
  {
    id: "dev-14",
    content: `<p>Targets locked:</p><ul><li>Key templates: Home, Tech Reborn collection, iPhone collection, MacBook PDP</li><li>Mobile LCP target: <strong>< 2.5s</strong></li><li>Lighthouse Performance: <strong>> 80</strong> on mobile, <strong>> 90</strong> on desktop</li></ul><p>Baseline metrics captured for before/after comparison.</p>`,
    user_id: null,
    agent_id: "tech-lead",
    sender_name: "Tech Lead",
    created_at: "2025-12-04T16:26:00.000Z",
    files: [{ name: "core_web_vitals_baseline_2025-12-04.csv", url: "#", type: "text/csv", size: 56000 }],
  },
  {
    id: "dev-15",
    content: `<p>Good. Now, what are our <strong>medium-term</strong> changes that don't alter design but need more engineering?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:28:00.000Z",
  },
  {
    id: "dev-16",
    content: `<p>Medium-term performance projects:</p><ol><li><strong>Critical CSS extraction</strong>, inline above-the-fold, defer the rest.</li><li><strong>Script splitting</strong>, separate global vs template-specific bundles.</li><li><strong>Improved caching strategy</strong>, cache headers + CDN hints.</li><li><strong>Section/snippet hygiene</strong>, strip unused legacy code paths.</li></ol>`,
    user_id: null,
    agent_id: "tech-lead",
    sender_name: "Tech Lead",
    created_at: "2025-12-04T16:30:00.000Z",
  },
  {
    id: "dev-17",
    content: `<p>I'll also:</p><ul><li>Refactor Tech Reborn badges so they don't cause reflow on load.</li><li>Ensure full <strong>native lazy-loading</strong> + IntersectionObserver for below-fold images and carousels.</li></ul><p>It's mostly plumbing, zero visual change.</p>`,
    user_id: null,
    agent_id: "shopify-developer",
    sender_name: "Shopify Developer",
    created_at: "2025-12-04T16:32:00.000Z",
  },
  {
    id: "dev-18",
    content: `<p>Nice. I want <strong>perceived speed</strong> to jump too, not just metrics. @UXUIDesigner can we add skeletons/loading placeholders that feel on-brand but don't change layout?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:34:00.000Z",
  },
  {
    id: "dev-19",
    content: `<p>Yes. Skeleton plan:</p><ul><li>Product card placeholders in collection grids while images load</li><li>Simple grey blocks for PDP gallery, fade into real images</li><li>Maintain same layout + spacing, just show "loading states" instead of blank gaps</li></ul><p>Transitions will be subtle so it still feels premium.</p>`,
    user_id: null,
    agent_id: "ux-ui-designer",
    sender_name: "UX/UI Designer",
    created_at: "2025-12-04T16:36:00.000Z",
    files: [{ name: "skeleton_states_mockups_baduss.png", url: "#", type: "image/png", size: 2400000 }],
  },
  {
    id: "dev-20",
    content: `<p>Perfect. @TechLead, I want a <strong>deployment sequence</strong> that doesn't mess with conversion: phased rollout with checks between steps.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:38:00.000Z",
  },
  {
    id: "dev-21",
    content: `<p>Deployment plan:</p><p><strong>Phase 1, Quick Wins:</strong> images, lazy-load, font trim.<br/><strong>Phase 2, App Tidy:</strong> remove dead apps, defer non-critical scripts.<br/><strong>Phase 3, Structural:</strong> critical CSS, script splitting, caching.</p><p>Each phase gated by: "no drop" in conversion and improvement/stability in CWV.</p>`,
    user_id: null,
    agent_id: "tech-lead",
    sender_name: "Tech Lead",
    created_at: "2025-12-04T16:40:00.000Z",
    files: [{ name: "perf_rollout_plan_baduss_v1.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 156000 }],
  },
  {
    id: "dev-22",
    content: `<p>Great. For monitoring, I want a tiny <strong>Perf Dashboard</strong> just for me: LCP, INP, conversion, bounce, average page load. @ShopifyDeveloper can you wire that into our analytics and push a weekly summary?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:42:00.000Z",
  },
  {
    id: "dev-23",
    content: `<p>Yep. I'll pull from Lighthouse CI/PageSpeed + analytics stack and create a weekly summary:</p><ul><li>Speed vs last week</li><li>Conversion vs last week</li><li>Any anomalies or regressions</li></ul><p>Delivered as a short visual report.</p>`,
    user_id: null,
    agent_id: "shopify-developer",
    sender_name: "Shopify Developer",
    created_at: "2025-12-04T16:44:00.000Z",
    files: [{ name: "perf_reporting_mockup_baduss.pdf", url: "#", type: "application/pdf", size: 892000 }],
  },
  {
    id: "dev-24",
    content: `<p>Love it. Now, <strong>no-go zones</strong>, anything we absolutely don't touch right now?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:46:00.000Z",
  },
  {
    id: "dev-25",
    content: `<p>Design no-go:</p><ul><li>Don't change the <strong>Tech Reborn hub layout</strong> structure yet.</li><li>Don't move or hide trust elements (Tech Reborn explainer, warranty icons) above the fold.</li></ul><p>We can optimise them technically, but not reposition them yet.</p>`,
    user_id: null,
    agent_id: "ux-ui-designer",
    sender_name: "UX/UI Designer",
    created_at: "2025-12-04T16:48:00.000Z",
  },
  {
    id: "dev-26",
    content: `<p>Tech no-go:</p><ul><li>Don't rip out tracking or attribution scripts without syncing with Marketing.</li><li>Don't hack Shopify checkout, we only touch pre-checkout experiences and keep them light.</li></ul>`,
    user_id: null,
    agent_id: "tech-lead",
    sender_name: "Tech Lead",
    created_at: "2025-12-04T16:50:00.000Z",
  },
  {
    id: "dev-27",
    content: `<p>Cool. Future-looking question: if we went full <strong>cracked mode</strong> on speed next year, what's the big structural move?</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:52:00.000Z",
  },
  {
    id: "dev-28",
    content: `<p>Big move would be:</p><ul><li>Going more <strong>headless</strong> with a high-performance front-end, Shopify as backend.</li><li>Heavy use of edge caching/CDN for product and collection content.</li><li>Route-level code splitting and more aggressive static generation.</li></ul><p>Serious project, huge upside.</p>`,
    user_id: null,
    agent_id: "tech-lead",
    sender_name: "Tech Lead",
    created_at: "2025-12-04T16:54:00.000Z",
  },
  {
    id: "dev-29",
    content: `<p>Park that in the "later" folder. For now, we max out Shopify + good engineering. Before we wrap, I want each of you to drop your <strong>top priority action</strong> for this week.</p>`,
    user_id: "demo-user",
    agent_id: null,
    sender_name: "Liam",
    created_at: "2025-12-04T16:56:00.000Z",
  },
  {
    id: "dev-30",
    content: `<p>Priority: deliver optimised image pack + skeleton state designs for:</p><ul><li>Home</li><li>Tech Reborn collections</li><li>MacBook and iPhone PDPs</li></ul>`,
    user_id: null,
    agent_id: "ux-ui-designer",
    sender_name: "UX/UI Designer",
    created_at: "2025-12-04T16:58:00.000Z",
    files: [{ name: "image_pack_v2_export_list.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 89000 }],
  },
  {
    id: "dev-31",
    content: `<p>Priority: implement:</p><ul><li>Lazy-loading for below-fold components</li><li>Deferred loading for non-essential scripts</li><li>Swap in the new optimised images on key templates</li></ul><p>Then re-run Lighthouse and record before/after diffs.</p>`,
    user_id: null,
    agent_id: "shopify-developer",
    sender_name: "Shopify Developer",
    created_at: "2025-12-04T17:00:00.000Z",
  },
  {
    id: "dev-32",
    content: `<p>Priority: set up:</p><ul><li>Performance monitoring baseline</li><li>Lighthouse CI</li><li>Perf rollout checklist + sign-off rules</li></ul><p>So every change going forward has a "speed lens" by default.</p>`,
    user_id: null,
    agent_id: "tech-lead",
    sender_name: "Tech Lead",
    created_at: "2025-12-04T17:02:00.000Z",
    files: [{ name: "lighthouse_ci_initial_config.yml", url: "#", type: "text/yaml", size: 12000 }],
  },
];

// Extract all files from messages for the Files panel
export const developmentChatFiles = developmentChatMessages
  .filter(msg => msg.files && msg.files.length > 0)
  .flatMap(msg => msg.files!.map(file => ({
    id: `dev-file-${file.name.replace(/[^a-z0-9]/gi, '-')}`,
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

export const developmentMemories = [
  { id: "dm-1", key: "Performance Targets", value: "Mobile LCP < 2.5s on Home and Tech Reborn. Lighthouse Performance > 80 mobile, > 90 desktop.", category: "Performance", createdBy: "Tech Lead", updatedAt: "2025-12-04T16:26:00.000Z" },
  { id: "dm-2", key: "Quick Wins", value: "1. Image optimisation. 2. Defer non-critical JS. 3. Lazy-load below fold. 4. Reduce fonts. 5. Kill dead apps.", category: "Tasks", createdBy: "Tech Lead", updatedAt: "2025-12-04T16:14:00.000Z" },
  { id: "dm-3", key: "App Triage", value: "Remove: legacy popup, old announcement bar. Defer: reviews, chat, heatmapping. Keep: Tech Reborn badges, Smart Packs.", category: "Optimisation", createdBy: "Shopify Developer", updatedAt: "2025-12-04T16:18:00.000Z" },
  { id: "dm-4", key: "Design No-Go Zones", value: "Don't change Tech Reborn hub layout structure. Don't move trust elements above the fold.", category: "Constraints", createdBy: "UX/UI Designer", updatedAt: "2025-12-04T16:48:00.000Z" },
  { id: "dm-5", key: "Tech No-Go Zones", value: "Don't remove tracking without Marketing sync. Don't hack Shopify checkout.", category: "Constraints", createdBy: "Tech Lead", updatedAt: "2025-12-04T16:50:00.000Z" },
  { id: "dm-6", key: "Deployment Phases", value: "Phase 1: Quick wins. Phase 2: App tidy. Phase 3: Structural. Each gated by conversion + CWV.", category: "Process", createdBy: "Tech Lead", updatedAt: "2025-12-04T16:40:00.000Z" },
  { id: "dm-7", key: "Future Architecture", value: "Consider headless front-end with Shopify backend, edge caching, route-level code splitting.", category: "Strategy", createdBy: "Tech Lead", updatedAt: "2025-12-04T16:54:00.000Z" },
];

export const developmentActivity = [
  { id: "da-1", action: "File Uploaded", description: "Uploaded core_web_vitals_snapshot_2025-12-04.csv with Lighthouse scores", performedBy: "Tech Lead", timestamp: "2025-12-04T16:02:00.000Z", type: "task" as const },
  { id: "da-2", action: "File Uploaded", description: "Uploaded shopify_app_audit_baduss_FY3.xlsx with app analysis", performedBy: "Shopify Developer", timestamp: "2025-12-04T16:06:00.000Z", type: "task" as const },
  { id: "da-3", action: "Decision Made", description: "Visual-equivalent optimisations approved: same look, cheaper to render", performedBy: "UX/UI Designer", timestamp: "2025-12-04T16:10:00.000Z", type: "decision" as const },
  { id: "da-4", action: "File Uploaded", description: "Uploaded shopify_app_impact_matrix.csv with triage decisions", performedBy: "Shopify Developer", timestamp: "2025-12-04T16:18:00.000Z", type: "task" as const },
  { id: "da-5", action: "File Uploaded", description: "Uploaded image_optimisation_spec_baduss.pdf", performedBy: "UX/UI Designer", timestamp: "2025-12-04T16:22:00.000Z", type: "task" as const },
  { id: "da-6", action: "Decision Made", description: "Performance targets locked: LCP < 2.5s, Lighthouse > 80 mobile", performedBy: "Liam", timestamp: "2025-12-04T16:24:00.000Z", type: "decision" as const },
  { id: "da-7", action: "File Uploaded", description: "Uploaded skeleton_states_mockups_baduss.png", performedBy: "UX/UI Designer", timestamp: "2025-12-04T16:36:00.000Z", type: "task" as const },
  { id: "da-8", action: "File Uploaded", description: "Uploaded perf_rollout_plan_baduss_v1.xlsx with phased deployment", performedBy: "Tech Lead", timestamp: "2025-12-04T16:40:00.000Z", type: "task" as const },
  { id: "da-9", action: "File Uploaded", description: "Uploaded perf_reporting_mockup_baduss.pdf for weekly dashboard", performedBy: "Shopify Developer", timestamp: "2025-12-04T16:44:00.000Z", type: "task" as const },
  { id: "da-10", action: "Decision Made", description: "No-go zones established: don't touch Tech Reborn layout, don't remove tracking without sync", performedBy: "Liam", timestamp: "2025-12-04T16:50:00.000Z", type: "decision" as const },
  { id: "da-11", action: "File Uploaded", description: "Uploaded lighthouse_ci_initial_config.yml for CI setup", performedBy: "Tech Lead", timestamp: "2025-12-04T17:02:00.000Z", type: "task" as const },
];
