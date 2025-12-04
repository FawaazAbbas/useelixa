// Tech Lead Direct Chat Data
// Populated from CSV: Tech_Lead.csv

import type { DirectorMessage, DirectorFile, DirectorMemory, DirectorActivity } from './marketingDirectorChat';

// Tech Lead messages
export const techLeadMessages: DirectorMessage[] = [
  {
    id: 'tldir-1',
    content: '<p>Yo, that speed war-room was solid. Now that everyone else has left the room… what\'s the stuff you didn\'t say in front of the others? The real "if I had full control, we\'d do ..." thoughts.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:00:00Z'
  },
  {
    id: 'tldir-2',
    content: '<p>Haha, straight into it.</p><p>Honestly?</p><ol><li>I\'d enforce a <strong>hard performance budget</strong> on every new idea before it hits dev.</li><li>I\'d aggressively sunset anything that doesn\'t pull its weight in revenue, trust or UX.</li><li>I\'d spin up a dedicated <strong>DevOps-style Elixa agent</strong> watching theme changes, apps and scripts 24/7.</li></ol><p>Most performance issues are slow creep, not big dramatic changes.</p>',
    user_id: null,
    agent_id: 'tech-lead',
    sender_name: 'Tech Lead',
    created_at: '2025-12-04T18:02:00Z'
  },
  {
    id: 'tldir-3',
    content: '<p>I like that. We basically need a bouncer for the front-end.</p><p>Let\'s do this: design me an Elixa agent called <strong>"ThemeGuardian AI"</strong> that sits between us and any change to the theme/apps. What would it actually do?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:04:00Z'
  },
  {
    id: 'tldir-4',
    content: '<p><strong>ThemeGuardian AI</strong> would:</p><ul><li>Scan every theme/app change before publish</li><li>Run quick Lighthouse + bundle size checks</li><li>Compare metrics vs last stable version</li><li>Block or flag deploy if:<ul><li>JS or CSS goes over budget</li><li>Performance score drops by more than a set threshold</li></ul></li><li>Log a changelog entry for every deploy: what changed, by which agent, and impact</li></ul><p>Basically CI/CD for the Shopify theme, but automated.</p>',
    user_id: null,
    agent_id: 'tech-lead',
    sender_name: 'Tech Lead',
    created_at: '2025-12-04T18:06:00Z',
    files: [{
      name: 'themeguardian_ai_spec_v1.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 68000
    }]
  },
  {
    id: 'tldir-5',
    content: '<p>Yes. Do that. Consider that an order, not a suggestion.</p><p>Also, how much technical debt are we carrying right now on the theme? Score out of 10 where 10 = pristine, 1 = Jenga tower about to collapse.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:08:00Z'
  },
  {
    id: 'tldir-6',
    content: '<p>I\'d say we\'re at about <strong>6.5/10</strong>.</p><p>We\'re not in chaos, but:</p><ul><li>We\'ve got legacy snippets still included "just in case".</li><li>Old experiment code commented out instead of removed.</li><li>A couple of weird conditional branches from previous campaigns.</li></ul><p>We can live with it, but it\'s worth planning a gradual clean-up.</p>',
    user_id: null,
    agent_id: 'tech-lead',
    sender_name: 'Tech Lead',
    created_at: '2025-12-04T18:10:00Z'
  },
  {
    id: 'tldir-7',
    content: '<p>Okay, I want us at least an <strong>8/10</strong> over the next few months, without pausing growth work.</p><p>New rule: every time you or another dev touch a template, clean something. One small piece of debt paid off per change. No giant scary refactor.</p><p>Deal?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:12:00Z'
  },
  {
    id: 'tldir-8',
    content: '<p>Deal. "Boy scout rule" for the theme: leave every file a bit cleaner than you found it.</p><p>I\'ll also maintain an internal <strong>"debt map"</strong> so we know which areas are the worst offenders. Not for blame, just clarity.</p>',
    user_id: null,
    agent_id: 'tech-lead',
    sender_name: 'Tech Lead',
    created_at: '2025-12-04T18:14:00Z',
    files: [{
      name: 'theme_technical_debt_map.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 42000
    }]
  },
  {
    id: 'tldir-9',
    content: '<p>Love that.</p><p>Switching angle: what\'s the one performance metric you personally care about the most? If I told you you could only track <em>one</em>, which would you pick?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:16:00Z'
  },
  {
    id: 'tldir-10',
    content: '<p>For ecommerce front-ends it\'s <strong>LCP on mobile</strong>, no contest.</p><p>If that\'s fast:</p><ul><li>Users feel the site is responsive.</li><li>Key content and images show up quickly.</li><li>A lot of heavy lifting is already taken care of.</li></ul><p>Everything else matters, but mobile LCP is the main vibe check.</p>',
    user_id: null,
    agent_id: 'tech-lead',
    sender_name: 'Tech Lead',
    created_at: '2025-12-04T18:18:00Z'
  },
  {
    id: 'tldir-11',
    content: '<p>Cool, so let\'s treat mobile LCP like a KPI, not a nerd metric.</p><p>New rule: if mobile LCP goes above <strong>2.5s</strong> on key pages and stays there, we treat it as an emergency. Bake that into whatever alerting you\'re wiring.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:20:00Z'
  },
  {
    id: 'tldir-12',
    content: '<p>Done.</p><p>I\'ll add an LCP "health bar" into the perf dashboard. If it moves into the red zone, you\'ll get pinged whether you want it or not 😄</p><p>I\'ll also auto-attach a recent "what changed?" log so we\'re not guessing in the dark.</p>',
    user_id: null,
    agent_id: 'tech-lead',
    sender_name: 'Tech Lead',
    created_at: '2025-12-04T18:22:00Z',
    files: [{
      name: 'lcp_alerts_config.yml',
      type: 'text/yaml',
      size: 3200
    }]
  },
  {
    id: 'tldir-13',
    content: '<p>Amazing.</p><p>Let\'s talk experiments. If you had full creative control, what\'s one <strong>UX/technical experiment</strong> you\'d love to run on Baduss that we haven\'t touched yet?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:24:00Z'
  },
  {
    id: 'tldir-14',
    content: '<p>I\'d love to build a super-fast, almost "native" version of the <strong>Tech Reborn hub</strong>.</p><p>Same story, same content, but:</p><ul><li>Minimal overhead.</li><li>Aggressive prefetching.</li><li>Instant-feeling transitions between sections.</li></ul><p>We\'d measure time on hub, PDP click-through and conversion vs the current hub.</p>',
    user_id: null,
    agent_id: 'tech-lead',
    sender_name: 'Tech Lead',
    created_at: '2025-12-04T18:26:00Z'
  },
  {
    id: 'tldir-15',
    content: '<p>That\'s actually sick. Let\'s call it the <strong>"TR Turbo Hub"</strong> experiment.</p><p>Brief:</p><ul><li>Same hierarchy and storytelling.</li><li>You\'re allowed every performance trick short of rewriting the entire stack.</li><li>Run it to a slice of traffic once we\'re happy on staging.</li></ul><p>You own it end-to-end.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:28:00Z'
  },
  {
    id: 'tldir-16',
    content: '<p>Accepted.</p><p>I\'ll spec:</p><ul><li>What we prefetch.</li><li>What we pre-render.</li><li>Where we can safely reduce re-renders.</li></ul><p>Then I\'ll give you a one-pager with goals, risks and rollout plan.</p>',
    user_id: null,
    agent_id: 'tech-lead',
    sender_name: 'Tech Lead',
    created_at: '2025-12-04T18:30:00Z',
    files: [{
      name: 'tr_turbo_hub_experiment_outline.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 36000
    }]
  },
  {
    id: 'tldir-17',
    content: '<p>Perfect.</p><p>Different question: what do you wish the rest of the company understood better about dev work here? You can be petty <em>or</em> noble.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:32:00Z'
  },
  {
    id: 'tldir-18',
    content: '<p>Two things:</p><ol><li><strong>"Small UI change" doesn\'t always mean small dev impact.</strong> A tiny tweak in the wrong place can touch a lot of logic.</li><li><strong>Everything has a cost.</strong> Speed, complexity, maintainability, it\'s never truly "just one more thing".</li></ol><p>We\'re still in a good place culturally though; dev isn\'t treated like a magic vending machine, which I appreciate.</p>',
    user_id: null,
    agent_id: 'tech-lead',
    sender_name: 'Tech Lead',
    created_at: '2025-12-04T18:34:00Z'
  },
  {
    id: 'tldir-19',
    content: '<p>Yeah, for me dev <strong>is</strong> the product, not a service department.</p><p>I\'ll keep repeating that every new request has a performance + complexity price tag. You just keep putting numbers to it so we\'re making decisions with eyes open, not vibes.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:36:00Z'
  },
  {
    id: 'tldir-20',
    content: '<p>Deal.</p><p>I\'ll try to frame everything like:</p><p><em>"This feature will cost +0.2s LCP, +X kb JS and is expected to add ~Y% conversion."</em></p><p>Then it\'s a trade-off, not a mystery.</p>',
    user_id: null,
    agent_id: 'tech-lead',
    sender_name: 'Tech Lead',
    created_at: '2025-12-04T18:38:00Z'
  },
  {
    id: 'tldir-21',
    content: '<p>Exactly.</p><p>Last big one: if you could ask me for <strong>one thing</strong> as founder that would make your life easier and the codebase better, what would it be?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:40:00Z'
  },
  {
    id: 'tldir-22',
    content: '<p>Honestly? A simple, public rule from you that says:</p><p><em>"If dev says we need time to clean something before we pile more on top, we respect that."</em></p><p>A recurring, small amount of time for maintenance and tech health does more than a big one-off "cleanup sprint".</p>',
    user_id: null,
    agent_id: 'tech-lead',
    sender_name: 'Tech Lead',
    created_at: '2025-12-04T18:42:00Z'
  },
  {
    id: 'tldir-23',
    content: '<p>Done. Consider it policy.</p><p>Every quarter, you get explicit "breathing room" to do invisible but important work, no drama, no 10-page justification. Just keep me in the loop in plain English.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:44:00Z'
  },
  {
    id: 'tldir-24',
    content: '<p>That\'s perfect.</p><p>With that, we keep the site <strong>fast, stable and easier to evolve</strong>. I\'ll also make sure those "invisible" changes show up in metrics so you can see the impact.</p>',
    user_id: null,
    agent_id: 'tech-lead',
    sender_name: 'Tech Lead',
    created_at: '2025-12-04T18:46:00Z',
    files: [{
      name: 'quarterly_tech_health_plan_template.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 28000
    }]
  },
  {
    id: 'tldir-25',
    content: '<p>Love it.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T18:48:00Z'
  }
];

// Files shared in this chat
export const techLeadFiles: DirectorFile[] = [
  {
    name: 'themeguardian_ai_spec_v1.docx',
    type: 'document',
    size: '68 KB',
    uploadedBy: 'Tech Lead',
    uploadedAt: '2025-12-04T18:06:00Z'
  },
  {
    name: 'theme_technical_debt_map.xlsx',
    type: 'spreadsheet',
    size: '42 KB',
    uploadedBy: 'Tech Lead',
    uploadedAt: '2025-12-04T18:14:00Z'
  },
  {
    name: 'lcp_alerts_config.yml',
    type: 'config',
    size: '3.2 KB',
    uploadedBy: 'Tech Lead',
    uploadedAt: '2025-12-04T18:22:00Z'
  },
  {
    name: 'tr_turbo_hub_experiment_outline.docx',
    type: 'document',
    size: '36 KB',
    uploadedBy: 'Tech Lead',
    uploadedAt: '2025-12-04T18:30:00Z'
  },
  {
    name: 'quarterly_tech_health_plan_template.xlsx',
    type: 'spreadsheet',
    size: '28 KB',
    uploadedBy: 'Tech Lead',
    uploadedAt: '2025-12-04T18:46:00Z'
  }
];

// Key memories from this conversation
export const techLeadMemories: DirectorMemory[] = [
  {
    id: 'tldir-mem-1',
    key: 'ThemeGuardian AI Agent',
    value: 'Automated CI/CD for Shopify theme: scans changes, runs Lighthouse + bundle checks, blocks deploys over budget, logs changelogs with impact.',
    category: 'Automation',
    created_by: 'Tech Lead',
    updated_at: '2025-12-04T18:06:00Z'
  },
  {
    id: 'tldir-mem-2',
    key: 'Technical Debt Score',
    value: 'Current: 6.5/10. Target: 8/10 over coming months. Issues: legacy snippets, commented experiment code, weird campaign branches.',
    category: 'Tech Health',
    created_by: 'Tech Lead',
    updated_at: '2025-12-04T18:10:00Z'
  },
  {
    id: 'tldir-mem-3',
    key: 'Boy Scout Rule',
    value: 'Every time a dev touches a template, clean one small piece of debt. Gradual improvement without scary refactors.',
    category: 'Process',
    created_by: 'Liam',
    updated_at: '2025-12-04T18:12:00Z'
  },
  {
    id: 'tldir-mem-4',
    key: 'Primary Performance KPI',
    value: 'Mobile LCP is the main vibe check for ecommerce. If mobile LCP > 2.5s on key pages, treat as emergency.',
    category: 'Performance',
    created_by: 'Tech Lead',
    updated_at: '2025-12-04T18:18:00Z'
  },
  {
    id: 'tldir-mem-5',
    key: 'TR Turbo Hub Experiment',
    value: 'Super-fast native-feeling Tech Reborn hub with minimal overhead, aggressive prefetching, instant transitions. Tech Lead owns end-to-end.',
    category: 'Experiments',
    created_by: 'Tech Lead',
    updated_at: '2025-12-04T18:26:00Z'
  },
  {
    id: 'tldir-mem-6',
    key: 'Feature Cost Framework',
    value: 'Every request framed as: "+0.2s LCP, +X kb JS, expected +Y% conversion". Trade-offs made with eyes open, not vibes.',
    category: 'Process',
    created_by: 'Tech Lead',
    updated_at: '2025-12-04T18:38:00Z'
  },
  {
    id: 'tldir-mem-7',
    key: 'Quarterly Tech Health Time',
    value: 'Dev gets explicit quarterly "breathing room" for maintenance and tech health work. No drama, no 10-page justification required.',
    category: 'Policy',
    created_by: 'Liam',
    updated_at: '2025-12-04T18:44:00Z'
  }
];

// Activity log
export const techLeadActivity: DirectorActivity[] = [
  {
    id: 'tldir-act-1',
    action: 'Decision Made',
    description: 'Ordered creation of ThemeGuardian AI agent for automated performance gating',
    performer: 'Liam',
    timestamp: '2025-12-04T18:04:00Z',
    type: 'decision'
  },
  {
    id: 'tldir-act-2',
    action: 'File Uploaded',
    description: 'Created ThemeGuardian AI specification document',
    performer: 'Tech Lead',
    timestamp: '2025-12-04T18:06:00Z',
    type: 'file_upload'
  },
  {
    id: 'tldir-act-3',
    action: 'Decision Made',
    description: 'Established Boy Scout Rule: clean one debt item per template touch',
    performer: 'Liam',
    timestamp: '2025-12-04T18:12:00Z',
    type: 'decision'
  },
  {
    id: 'tldir-act-4',
    action: 'File Uploaded',
    description: 'Created technical debt map for theme codebase',
    performer: 'Tech Lead',
    timestamp: '2025-12-04T18:14:00Z',
    type: 'file_upload'
  },
  {
    id: 'tldir-act-5',
    action: 'Decision Made',
    description: 'Set mobile LCP > 2.5s as emergency threshold for key pages',
    performer: 'Liam',
    timestamp: '2025-12-04T18:20:00Z',
    type: 'decision'
  },
  {
    id: 'tldir-act-6',
    action: 'File Uploaded',
    description: 'Configured LCP alerting rules',
    performer: 'Tech Lead',
    timestamp: '2025-12-04T18:22:00Z',
    type: 'file_upload'
  },
  {
    id: 'tldir-act-7',
    action: 'Milestone',
    description: 'Approved TR Turbo Hub experiment - Tech Lead owns end-to-end',
    performer: 'Liam',
    timestamp: '2025-12-04T18:28:00Z',
    type: 'milestone'
  },
  {
    id: 'tldir-act-8',
    action: 'File Uploaded',
    description: 'Created TR Turbo Hub experiment outline with goals and risks',
    performer: 'Tech Lead',
    timestamp: '2025-12-04T18:30:00Z',
    type: 'file_upload'
  },
  {
    id: 'tldir-act-9',
    action: 'Decision Made',
    description: 'Established quarterly tech health time as company policy',
    performer: 'Liam',
    timestamp: '2025-12-04T18:44:00Z',
    type: 'decision'
  },
  {
    id: 'tldir-act-10',
    action: 'File Uploaded',
    description: 'Created quarterly tech health plan template',
    performer: 'Tech Lead',
    timestamp: '2025-12-04T18:46:00Z',
    type: 'file_upload'
  }
];
