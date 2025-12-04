// Marketing Director Direct Chat Data
// Populated from CSV: Marketing_Director.csv

export interface DirectorMessage {
  id: string;
  content: string;
  user_id: string | null;
  agent_id: string | null;
  sender_name: string;
  created_at: string;
  files?: {
    name: string;
    type: string;
    size: number;
    url?: string;
  }[];
}

export interface DirectorFile {
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DirectorMemory {
  id: string;
  key: string;
  value: string;
  category: string;
  created_by: string;
  updated_at: string;
}

export interface DirectorActivity {
  id: string;
  action: string;
  description: string;
  performer: string;
  timestamp: string;
  type: 'decision' | 'file_upload' | 'milestone';
}

// Marketing Director messages
export const marketingDirectorMessages: DirectorMessage[] = [
  {
    id: 'mdir-1',
    content: '<p>How are you feeling about <strong>Tech Reborn</strong> right now? Just your gut.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:00:00Z'
  },
  {
    id: 'mdir-2',
    content: '<p>Gut read: strong momentum, slightly chaotic execution. MacBooks are finally moving like they should. iPhones are slipping into creative fatigue. Founder-brand angle (you) is underused. We\'re winning, but we\'re not yet cruising.</p>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:02:00Z'
  },
  {
    id: 'mdir-3',
    content: '<p>Yeah, that matches how it feels. For the next 7 days, what are the three big things Marketing absolutely has to nail? Not nice-to-haves, actual <strong>"if we don\'t do this, we\'re clowns"</strong> priorities.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:04:00Z'
  },
  {
    id: 'mdir-4',
    content: '<p>Three non-negotiables:</p><ol><li><strong>MacBook push</strong>, cement the "M1 is still a monster" narrative.</li><li><strong>iPhone creative refresh</strong>, new hooks, new angles, same Tech Reborn truth.</li><li><strong>You as the voice of the brand</strong>, founder content that says what everyone else is too scared to say about new tech pricing.</li></ol>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:06:00Z'
  },
  {
    id: 'mdir-5',
    content: '<p>Good. Now convert that into work. Who\'s owning what this week and what are the deliverables? Assume everyone, including you, is maxed out and has zero spare brain cells.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:08:00Z'
  },
  {
    id: 'mdir-6',
    content: '<p>Here\'s how I\'d break it:</p><p><strong>MacBook push</strong></p><ul><li>Owner: Me</li><li>Support: PPC Specialist, Content Writer, Social Media Manager</li><li>Deliverables: 2 new ad angles, 1 new landing hero variation, 1 UGC push</li></ul><p><strong>iPhone refresh</strong></p><ul><li>Owner: Content Writer</li><li>Support: PPC Specialist, Graphic Designer</li><li>Deliverables: 4 new hooks, 3 new visual concepts, 2 A/B tests</li></ul><p><strong>Founder voice</strong></p><ul><li>Owner: Me + You</li><li>Support: Content Writer</li><li>Deliverables: 1 founder thread, 1 email from "Liam", 1 short video talking straight to camera.</li></ul>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:10:00Z'
  },
  {
    id: 'mdir-7',
    content: '<p>That\'s better. I want these written down as actual tasks, not floating ideas. Throw me a live doc where I can see this in one glance.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:12:00Z'
  },
  {
    id: 'mdir-8',
    content: '<p>Done. Just dropped a planning sheet.</p>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:14:00Z',
    files: [{
      name: 'tech_reborn_weekly_marketing_plan.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 45000
    }]
  },
  {
    id: 'mdir-9',
    content: '<p>Looking at it now. I like that you\'ve got names on everything. I don\'t want any task where the owner is "team". That\'s code for "no one". Keep that rule.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:16:00Z'
  },
  {
    id: 'mdir-10',
    content: '<p>Agreed. No owner = task doesn\'t exist. I\'ll police that.</p><p>Also, I want to tighten our daily cadence. I\'d rather we come in each day with a simple script: "Here\'s what we\'re pushing, here\'s what we\'re watching, here\'s what we\'re ready to kill."</p>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:18:00Z'
  },
  {
    id: 'mdir-11',
    content: '<p>So build that. I want a one-pager daily. Not a deck, not a novel. A one-pager I can read in 60 seconds, what happened yesterday, what we\'re doing today, and what we\'re watching.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:20:00Z'
  },
  {
    id: 'mdir-12',
    content: '<p>Already halfway done, boss.</p>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:22:00Z',
    files: [{
      name: 'daily_marketing_checkin_template.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 28000
    }]
  },
  {
    id: 'mdir-13',
    content: '<p>Perfect. Let\'s talk iPhone. Today\'s creatives are good, but they\'re starting to feel like ads. I want them to feel like <strong>truth</strong>. "You don\'t need the 15" energy. How are you planning to attack that?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:24:00Z'
  },
  {
    id: 'mdir-14',
    content: '<p>I want to run three narrative lines:</p><ol><li><strong>"You\'re upgrading for the name, not the performance."</strong></li><li><strong>Battery reality</strong>, what Battery Health Guarantee actually means.</li><li><strong>Money honesty</strong>, "this is what another £400 actually buys you (spoiler: not much)."</li></ol><p>We turn those into short videos, carousels and email copy.</p>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:26:00Z'
  },
  {
    id: 'mdir-15',
    content: '<p>Good. Just make sure the tone doesn\'t come off bitter. We\'re not mad at Apple, we\'re mad at people being forced to overpay. We\'re on the customer\'s side, not ranting.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:28:00Z'
  },
  {
    id: 'mdir-16',
    content: '<p>Yeah, 100%. Tone is "smart mate who knows the game," not "tech conspiracy guy". I\'ll shape the copy like that and have Content Writer run everything through a "would Liam actually say this?" filter.</p>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:30:00Z'
  },
  {
    id: 'mdir-17',
    content: '<p>Speaking of, I do want more of me in the brand, but I don\'t want to live in Google Docs. How do we do this so I give raw input and you turn it into polished stuff without dragging me into every edit?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:32:00Z'
  },
  {
    id: 'mdir-18',
    content: '<p>Easy system:</p><ul><li>You drop raw voice notes / bullets in a private channel.</li><li>Content Writer turns them into drafts.</li><li>I sanity-check tone + strategy.</li><li>You only approve the big ones: founder thread, major emails, anything public under your name.</li></ul><p>You\'re source material, not copy monkey.</p>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:34:00Z'
  },
  {
    id: 'mdir-19',
    content: '<p>That works. Set that up. I\'ll start dropping thoughts from tonight.</p><p>Where are we with UGC creators? I saw some bangers in the group chat, but I don\'t have a single place where I can see who\'s live, who\'s pending, and who\'s worth rebooking.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:36:00Z'
  },
  {
    id: 'mdir-20',
    content: '<p>That\'s on me. Right now it\'s in my head and a few rogue sheets. I\'ll centralise it.</p><p>Plan:</p><ul><li>Build a "Creator Rolodex" with rating, niche, content style, cost, and performance.</li><li>Tag who\'s worked, who hasn\'t, and who we\'re testing.</li></ul>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:38:00Z'
  },
  {
    id: 'mdir-21',
    content: '<p>Good. Make it dumb-proof. If you vanished for a week, I should be able to open that sheet and instantly know who to throw money at and what to expect.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:40:00Z'
  },
  {
    id: 'mdir-22',
    content: '<p>Understood. Just shared v1 of the sheet.</p>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:42:00Z',
    files: [{
      name: 'creator_rolodex_baduss_v1.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 62000
    }]
  },
  {
    id: 'mdir-23',
    content: '<p>Love it. Alright, talk to me about capacity. Are you actually fine, or are you operating at "this is fine" meme level?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:44:00Z'
  },
  {
    id: 'mdir-24',
    content: '<p>I\'m fine, but the margin for error is thin. The stress hits when ads, emails, landing pages and creators all need direction at once and there\'s only one of me doing taste + strategy checks.</p>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:46:00Z'
  },
  {
    id: 'mdir-25',
    content: '<p>So where do you feel you personally add the most value? Because that\'s where I want your time, not in Figma nudging logos.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:48:00Z'
  },
  {
    id: 'mdir-26',
    content: '<p>My highest leverage is:</p><ul><li>Deciding which stories we tell.</li><li>Deciding where we put money.</li><li>Making sure everything feels like Baduss, not Generic Refurb Co.</li></ul><p>The more I sit there and less in "export asset v14_final_FINAL.png" land, the better.</p>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:50:00Z'
  },
  {
    id: 'mdir-27',
    content: '<p>Cool. So your job is story + money + taste. Everything else is support. For Tech Reborn to really hit, what\'s the next move you think we\'re not doing yet?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:52:00Z'
  },
  {
    id: 'mdir-28',
    content: '<p>We\'re strong on static and short-form, but we haven\'t built a proper <strong>video campaign series</strong> yet.</p><p>Not random TikToks, an actual arc:</p><ul><li>Journey of a device</li><li>Real people upgrading smarter</li><li>Behind the scenes of refurb</li></ul><p>So it feels like content people follow, not one-off ads.</p>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:54:00Z'
  },
  {
    id: 'mdir-29',
    content: '<p>Yeah, agreed. I\'ve had that in my head but not the headspace to brief it. If we do it, it has to be tight, no 3-minute "brand film" nobody finishes. Short, addictive, platform-native.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T11:56:00Z'
  },
  {
    id: 'mdir-30',
    content: '<p>Exactly. And that\'s where I think we bring in one more thing: a dedicated <strong>Video Producer</strong> from the Elixa Talent Pool.</p><p>Not just an editor, someone (agent) that:</p><ul><li>Builds the full campaign structure (episodes, arcs, hooks).</li><li>Scripts scenes tailored to TikTok, YouTube Shorts and Reels.</li><li>Generates shot lists and creator briefs so UGC talent knows exactly what to film.</li><li>Uses our existing performance data to double down on winning angles like M1 truth and "Why pay new?".</li></ul><p>You and I stay as taste + sign-off, and the Video Producer does the heavy lifting on planning the whole video-led push.</p>',
    user_id: null,
    agent_id: 'marketing-director',
    sender_name: 'Marketing Director',
    created_at: '2025-12-04T11:58:00Z'
  }
];

// Files shared in this chat
export const marketingDirectorFiles: DirectorFile[] = [
  {
    name: 'tech_reborn_weekly_marketing_plan.xlsx',
    type: 'spreadsheet',
    size: '45 KB',
    uploadedBy: 'Marketing Director',
    uploadedAt: '2025-12-04T11:14:00Z'
  },
  {
    name: 'daily_marketing_checkin_template.docx',
    type: 'document',
    size: '28 KB',
    uploadedBy: 'Marketing Director',
    uploadedAt: '2025-12-04T11:22:00Z'
  },
  {
    name: 'creator_rolodex_baduss_v1.xlsx',
    type: 'spreadsheet',
    size: '62 KB',
    uploadedBy: 'Marketing Director',
    uploadedAt: '2025-12-04T11:42:00Z'
  }
];

// Key memories from this conversation
export const marketingDirectorMemories: DirectorMemory[] = [
  {
    id: 'mdir-mem-1',
    key: 'Weekly Marketing Priorities',
    value: 'Three non-negotiables: MacBook "M1 monster" push, iPhone creative refresh with new hooks, and Founder voice content with Liam speaking directly',
    category: 'Strategy',
    created_by: 'Marketing Director',
    updated_at: '2025-12-04T11:06:00Z'
  },
  {
    id: 'mdir-mem-2',
    key: 'Task Ownership Rule',
    value: 'No owner = task doesn\'t exist. Every task must have a single named owner, not "team"',
    category: 'Process',
    created_by: 'Liam',
    updated_at: '2025-12-04T11:16:00Z'
  },
  {
    id: 'mdir-mem-3',
    key: 'iPhone Narrative Lines',
    value: 'Three truthful angles: "Upgrading for the name not performance", Battery Health Guarantee reality, Money honesty about what extra £400 buys',
    category: 'Campaign',
    created_by: 'Marketing Director',
    updated_at: '2025-12-04T11:26:00Z'
  },
  {
    id: 'mdir-mem-4',
    key: 'Brand Tone',
    value: 'Tone is "smart mate who knows the game," not "tech conspiracy guy" - on customer\'s side, not ranting against Apple',
    category: 'Brand',
    created_by: 'Marketing Director',
    updated_at: '2025-12-04T11:30:00Z'
  },
  {
    id: 'mdir-mem-5',
    key: 'Founder Content Workflow',
    value: 'Liam drops raw voice notes/bullets → Content Writer drafts → Marketing Director checks tone → Liam approves big pieces only',
    category: 'Process',
    created_by: 'Marketing Director',
    updated_at: '2025-12-04T11:34:00Z'
  },
  {
    id: 'mdir-mem-6',
    key: 'Marketing Director Role',
    value: 'Highest leverage activities: Deciding which stories to tell, deciding where money goes, ensuring everything feels like Baduss',
    category: 'Role Definition',
    created_by: 'Marketing Director',
    updated_at: '2025-12-04T11:50:00Z'
  },
  {
    id: 'mdir-mem-7',
    key: 'Video Campaign Series',
    value: 'Next big move: proper video campaign series with arc (device journey, real people upgrading, behind-the-scenes refurb). Short, addictive, platform-native content',
    category: 'Strategy',
    created_by: 'Marketing Director',
    updated_at: '2025-12-04T11:58:00Z'
  }
];

// Activity log
export const marketingDirectorActivity: DirectorActivity[] = [
  {
    id: 'mdir-act-1',
    action: 'File Uploaded',
    description: 'Shared Tech Reborn weekly marketing plan with task ownership assignments',
    performer: 'Marketing Director',
    timestamp: '2025-12-04T11:14:00Z',
    type: 'file_upload'
  },
  {
    id: 'mdir-act-2',
    action: 'Decision Made',
    description: 'Established "No owner = task doesn\'t exist" rule for all marketing tasks',
    performer: 'Liam',
    timestamp: '2025-12-04T11:16:00Z',
    type: 'decision'
  },
  {
    id: 'mdir-act-3',
    action: 'File Uploaded',
    description: 'Created daily marketing check-in template for 60-second status updates',
    performer: 'Marketing Director',
    timestamp: '2025-12-04T11:22:00Z',
    type: 'file_upload'
  },
  {
    id: 'mdir-act-4',
    action: 'Decision Made',
    description: 'Approved three iPhone narrative lines focused on truth over traditional ads',
    performer: 'Liam',
    timestamp: '2025-12-04T11:28:00Z',
    type: 'decision'
  },
  {
    id: 'mdir-act-5',
    action: 'Decision Made',
    description: 'Established founder content workflow: raw input → draft → tone check → approval',
    performer: 'Marketing Director',
    timestamp: '2025-12-04T11:34:00Z',
    type: 'decision'
  },
  {
    id: 'mdir-act-6',
    action: 'File Uploaded',
    description: 'Created UGC Creator Rolodex v1 with ratings, costs, and performance data',
    performer: 'Marketing Director',
    timestamp: '2025-12-04T11:42:00Z',
    type: 'file_upload'
  },
  {
    id: 'mdir-act-7',
    action: 'Milestone',
    description: 'Identified video campaign series as next strategic priority requiring Video Producer agent',
    performer: 'Marketing Director',
    timestamp: '2025-12-04T11:58:00Z',
    type: 'milestone'
  }
];
