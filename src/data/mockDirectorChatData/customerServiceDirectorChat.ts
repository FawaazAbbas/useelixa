// Customer Service Director Direct Chat Data
// Populated from CSV: Customer_Service_Director.csv

import type { DirectorMessage, DirectorFile, DirectorMemory, DirectorActivity } from './marketingDirectorChat';

// Customer Service Director messages
export const customerServiceDirectorMessages: DirectorMessage[] = [
  {
    id: 'csdir-1',
    content: '<p>Yo, got a minute? Want to talk CX properly without the whole squad watching 😄</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:00:00Z'
  },
  {
    id: 'csdir-2',
    content: '<p>Always. What\'s on your mind, boss?</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:02:00Z'
  },
  {
    id: 'csdir-3',
    content: '<p>Couple of things:</p><ol><li>Tech Reborn is about to go from "big campaign" to "this <em>is</em> the company now".</li><li>That means CX needs to be bulletproof and scalable.</li></ol><p>I want to make sure you\'ve got what you need and also pressure test a few things.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:04:00Z'
  },
  {
    id: 'csdir-4',
    content: '<p>Good timing. I was going to ping you anyway.</p><p>We\'re fine <em>today</em>, but if we keep growing at this rate and don\'t change anything, we\'ll start feeling it in 4–6 weeks.</p><p>Nothing scary yet, but we\'re definitely in "plan now, don\'t panic later" territory.</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:06:00Z'
  },
  {
    id: 'csdir-5',
    content: '<p>Exactly why I\'m DM\'ing you.</p><p>Honest answer:</p><p>If I said, "We\'re not hiring anyone for 2 months," what do you absolutely need to put in place so you don\'t burn the team out and our CSAT doesn\'t drop?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:08:00Z'
  },
  {
    id: 'csdir-6',
    content: '<p>Alright, no fluff then. I\'d need:</p><ul><li>Automation flows live for our top 5 questions (we already scoped them in the groupchat).</li><li>The Tech Reborn CX Playbook fully rolled out, not just written.</li><li>Two things from you:<ul><li>Clear approval for us to say "no" in edge cases without feeling guilty.</li><li>Your support if we push for stronger expectation-setting on the site and in emails, even if it\'s slightly less "sexy" for Marketing.</li></ul></li></ul><p>We can handle volume if expectations are clear and agents don\'t have to fight every ticket from scratch.</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:10:00Z'
  },
  {
    id: 'csdir-7',
    content: '<p>You have that backing, 100%.</p><p>On "no", if someone is clearly gaming the system or outside policy, I want the team to feel comfortable saying no <em>politely but firmly</em>.</p><p>On copy, I\'d rather be brutally clear and lose a few sales than be vague and pay for it in refunds and bad reviews.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:12:00Z'
  },
  {
    id: 'csdir-8',
    content: '<p>Good. I\'ll make that explicit in training:</p><p><em>"Baduss is friendly, not a doormat."</em></p><p>Also: I want to push something slightly more aggressive, a short "CX + Returns weekly alert" that flags patterns to Product, Ops and Marketing automatically, not just in monthly decks.</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:14:00Z'
  },
  {
    id: 'csdir-9',
    content: '<p>Yes, do it.</p><p>Think of CX as the early warning radar for the whole business.</p><p>I want a simple format:</p><ul><li>What spiked</li><li>Why we think it\'s happening</li><li>What you recommend the other teams change</li></ul><p>Not just "here\'s data", but "here\'s what to do".</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:16:00Z'
  },
  {
    id: 'csdir-10',
    content: '<p>That\'s easy. I\'ll build a template and we\'ll start with Tech Reborn-specific alerts first.</p><p>By the way, small thing but important: the team absolutely loves that "14-Day Comfort Guarantee" has a name now. It gives them a confident line when talking to customers.</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:18:00Z',
    files: [{
      name: 'cx_weekly_alert_template.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 32000
    }]
  },
  {
    id: 'csdir-11',
    content: '<p>Good. Names matter.</p><p>It also tells customers, "We built this for you on purpose," not "we grudgingly accept returns."</p><p>Next question: if you had a magic wand for one CX tooling improvement, what would you pick? Not headcount, actual system or feature.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:20:00Z'
  },
  {
    id: 'csdir-12',
    content: '<p>Easy: a proper <strong>customer timeline</strong> inside the helpdesk that shows:</p><ul><li>Orders</li><li>Past tickets</li><li>Refunds and warranty events</li><li>NPS and CSAT history</li></ul><p>…in one view.</p><p>Right now we have that info, but it\'s fragmented. I want my team to see in 3 seconds whether this is a nervous first-time buyer or a serial returner trying it on.</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:22:00Z',
    files: [{
      name: 'customer_timeline_requirements.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 48000
    }]
  },
  {
    id: 'csdir-13',
    content: '<p>Yeah, that\'s worth doing.</p><p>Alright, consider it a priority.</p><p>Scope what you need for that view, fields, integrations, workflows, and send it to me. I\'ll either find budget or harass whoever I need to in Product to make it happen.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:24:00Z'
  },
  {
    id: 'csdir-14',
    content: '<p>Noted. You might regret offering that, I\'m going to be obnoxiously specific 😄</p><p>Another thing: the team really responds when they hear <em>why</em> we\'re pushing Tech Reborn, not just "here\'s the new campaign".</p><p>If you\'re up for it, I\'d like a short Loom from you in founder voice for the next CX meeting.</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:26:00Z'
  },
  {
    id: 'csdir-15',
    content: '<p>Done. I\'ll record a 5–7 minute one covering:</p><ul><li>Why Tech Reborn exists</li><li>Why we\'re obsessing over expectations and honesty</li><li>Why CX is basically the make-or-break layer</li></ul><p>I\'ll send it to you tomorrow and you can chop it down if it\'s too long.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:28:00Z',
    files: [{
      name: 'loom_cx_townhall_talking_points.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 18000
    }]
  },
  {
    id: 'csdir-16',
    content: '<p>Perfect. That\'ll go a long way.</p><p>You know they\'re already loyal, but hearing it from you directly always gives them that extra "okay, this actually matters" push.</p><p>On my side, I\'ll double down on coaching the newer reps around tone. They get the scripts, they just need to grow into the confidence.</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:30:00Z'
  },
  {
    id: 'csdir-17',
    content: '<p>Good. And for the record: if any rep <em>politely</em> tells a customer "no" within the Comfort Guarantee and policy guardrails and the customer escalates, I\'ll back the rep.</p><p>I don\'t want people thinking "if this escalates, I\'ll get thrown under the bus", that kills initiative.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:32:00Z'
  },
  {
    id: 'csdir-18',
    content: '<p>I\'ll share that with them. Carefully, but clearly.</p><p>One more thing I want from you:</p><p>Can we agree that if CX flags something as a serious pattern, it doesn\'t take 4 weeks for other teams to respond? I don\'t need miracles, just acknowledgement and timelines.</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:34:00Z'
  },
  {
    id: 'csdir-19',
    content: '<p>Yes.</p><p>Here\'s the rule:</p><ul><li>If you label something as <strong>"Critical CX pattern"</strong>, I will personally show up in whatever thread or meeting needs to change it.</li><li>You don\'t get to use that label lightly, but when you do, it means "this is not optional".</li></ul><p>We\'re not building a company where Customer Service is just a reporting line. You\'re part of the steering wheel.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:36:00Z',
    files: [{
      name: 'cx_critical_pattern_flagging_guide.pdf',
      type: 'application/pdf',
      size: 245000
    }]
  },
  {
    id: 'csdir-20',
    content: '<p>That\'s all I wanted to hear.</p><p>In return, I\'ll keep the noise low and the signal high.</p><p>If I escalate, it\'s because it actually matters, not because someone shouted a bit loudly in chat.</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:38:00Z'
  },
  {
    id: 'csdir-21',
    content: '<p>Deal.</p><p>Last thing: selfishly, what do <em>you</em> need from me personally? Not as "CEO Liam", but as the guy you\'ve worked with for 3 years.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:40:00Z'
  },
  {
    id: 'csdir-22',
    content: '<p>Honestly? Three things:</p><ol><li>Keep being available on DM like this. When I can reality-check with you, I move faster.</li><li>Be visible to the CX team now and then, even if it\'s just dropping into a meeting or shouting out good work.</li><li>If you\'re unhappy about something in CX, tell me bluntly and early. I\'d rather fix it than guess.</li></ol><p>That\'s it. I don\'t need hand-holding, just clarity and access.</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:42:00Z'
  },
  {
    id: 'csdir-23',
    content: '<p>Done on all three.</p><p>You already know this, but I\'ll say it plainly: CX is non-negotiable for me. If Tech Reborn works, it\'ll be because people felt looked after, not just because ads were good.</p><p>You\'ve got my trust. Just keep the feedback loop tight and don\'t sugarcoat bad news.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:44:00Z'
  },
  {
    id: 'csdir-24',
    content: '<p>Crystal clear.</p><p>I\'ll finalise the CX Playbook, push the macros live, kick off the QA dashboard and start running those weekly "CX alert" snapshots.</p><p>You\'ll have the first one on your desk next week, with recommendations, not just charts.</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:46:00Z',
    files: [{
      name: 'cx_playbook_outline_v1.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 67000
    }]
  },
  {
    id: 'csdir-25',
    content: '<p>Perfect.</p><p>And seriously, you\'re doing a great job.</p><p>We\'re building something that can actually change how people feel about refurbished tech. That only works if your side of the house is strong.</p><p>Let me know the second you feel we\'re under-resourced or you\'re stretched too thin. I want us pushing hard, not burning out.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T13:48:00Z'
  },
  {
    id: 'csdir-26',
    content: '<p>Appreciate it.</p><p>I\'ll shout early if it looks like we\'re crossing that line. For now, we\'re good, just busy in the right ways.</p><p>Now go annoy Marketing and Product and tell them CX has higher standards than they do 😂</p>',
    user_id: null,
    agent_id: 'customer-service-director',
    sender_name: 'Customer Service Director',
    created_at: '2025-12-04T13:50:00Z'
  }
];

// Files shared in this chat
export const customerServiceDirectorFiles: DirectorFile[] = [
  {
    name: 'cx_weekly_alert_template.docx',
    type: 'document',
    size: '32 KB',
    uploadedBy: 'Customer Service Director',
    uploadedAt: '2025-12-04T13:18:00Z'
  },
  {
    name: 'customer_timeline_requirements.xlsx',
    type: 'spreadsheet',
    size: '48 KB',
    uploadedBy: 'Customer Service Director',
    uploadedAt: '2025-12-04T13:22:00Z'
  },
  {
    name: 'loom_cx_townhall_talking_points.docx',
    type: 'document',
    size: '18 KB',
    uploadedBy: 'Liam',
    uploadedAt: '2025-12-04T13:28:00Z'
  },
  {
    name: 'cx_critical_pattern_flagging_guide.pdf',
    type: 'pdf',
    size: '245 KB',
    uploadedBy: 'Liam',
    uploadedAt: '2025-12-04T13:36:00Z'
  },
  {
    name: 'cx_playbook_outline_v1.docx',
    type: 'document',
    size: '67 KB',
    uploadedBy: 'Customer Service Director',
    uploadedAt: '2025-12-04T13:46:00Z'
  }
];

// Key memories from this conversation
export const customerServiceDirectorMemories: DirectorMemory[] = [
  {
    id: 'csdir-mem-1',
    key: 'CX Scalability Requirements',
    value: 'Without hiring for 2 months: Need automation for top 5 FAQs, full CX Playbook rollout, approval to say "no" politely, and support for clearer site/email copy.',
    category: 'Operations',
    created_by: 'Customer Service Director',
    updated_at: '2025-12-04T13:10:00Z'
  },
  {
    id: 'csdir-mem-2',
    key: 'Baduss CX Philosophy',
    value: '"Baduss is friendly, not a doormat." Team can say no politely but firmly to customers gaming the system or outside policy.',
    category: 'Culture',
    created_by: 'Customer Service Director',
    updated_at: '2025-12-04T13:14:00Z'
  },
  {
    id: 'csdir-mem-3',
    key: 'CX Weekly Alert Format',
    value: 'What spiked, why we think it\'s happening, what other teams should change. Actionable recommendations, not just data.',
    category: 'Process',
    created_by: 'Liam',
    updated_at: '2025-12-04T13:16:00Z'
  },
  {
    id: 'csdir-mem-4',
    key: 'Customer Timeline Tool Priority',
    value: 'Single view showing orders, past tickets, refunds, warranty events, NPS/CSAT history. 3-second customer context check.',
    category: 'Tooling',
    created_by: 'Customer Service Director',
    updated_at: '2025-12-04T13:22:00Z'
  },
  {
    id: 'csdir-mem-5',
    key: 'Rep Backing Guarantee',
    value: 'If a rep politely says "no" within policy and customer escalates, Liam backs the rep. No fear of being thrown under the bus.',
    category: 'Culture',
    created_by: 'Liam',
    updated_at: '2025-12-04T13:32:00Z'
  },
  {
    id: 'csdir-mem-6',
    key: 'Critical CX Pattern Escalation',
    value: 'When CX labels something "Critical CX pattern", Liam personally intervenes. Use sparingly but it means "not optional".',
    category: 'Escalation',
    created_by: 'Liam',
    updated_at: '2025-12-04T13:36:00Z'
  },
  {
    id: 'csdir-mem-7',
    key: 'CX Director Needs from Founder',
    value: 'DM availability for reality-checks, visibility to CX team (meetings, shout-outs), blunt early feedback on issues.',
    category: 'Relationship',
    created_by: 'Customer Service Director',
    updated_at: '2025-12-04T13:42:00Z'
  }
];

// Activity log
export const customerServiceDirectorActivity: DirectorActivity[] = [
  {
    id: 'csdir-act-1',
    action: 'Decision Made',
    description: 'Approved CX to say "no" politely but firmly to customers outside policy',
    performer: 'Liam',
    timestamp: '2025-12-04T13:12:00Z',
    type: 'decision'
  },
  {
    id: 'csdir-act-2',
    action: 'Decision Made',
    description: 'Established "Baduss is friendly, not a doormat" as CX training principle',
    performer: 'Customer Service Director',
    timestamp: '2025-12-04T13:14:00Z',
    type: 'decision'
  },
  {
    id: 'csdir-act-3',
    action: 'File Uploaded',
    description: 'Created CX weekly alert template with actionable format',
    performer: 'Customer Service Director',
    timestamp: '2025-12-04T13:18:00Z',
    type: 'file_upload'
  },
  {
    id: 'csdir-act-4',
    action: 'File Uploaded',
    description: 'Documented customer timeline tool requirements',
    performer: 'Customer Service Director',
    timestamp: '2025-12-04T13:22:00Z',
    type: 'file_upload'
  },
  {
    id: 'csdir-act-5',
    action: 'Decision Made',
    description: 'Prioritized customer timeline view as CX tooling improvement',
    performer: 'Liam',
    timestamp: '2025-12-04T13:24:00Z',
    type: 'decision'
  },
  {
    id: 'csdir-act-6',
    action: 'File Uploaded',
    description: 'Prepared CX townhall Loom talking points',
    performer: 'Liam',
    timestamp: '2025-12-04T13:28:00Z',
    type: 'file_upload'
  },
  {
    id: 'csdir-act-7',
    action: 'Decision Made',
    description: 'Committed to backing reps who say "no" within policy guardrails',
    performer: 'Liam',
    timestamp: '2025-12-04T13:32:00Z',
    type: 'decision'
  },
  {
    id: 'csdir-act-8',
    action: 'File Uploaded',
    description: 'Created Critical CX Pattern flagging guide with escalation rules',
    performer: 'Liam',
    timestamp: '2025-12-04T13:36:00Z',
    type: 'file_upload'
  },
  {
    id: 'csdir-act-9',
    action: 'File Uploaded',
    description: 'Finalized CX Playbook outline v1',
    performer: 'Customer Service Director',
    timestamp: '2025-12-04T13:46:00Z',
    type: 'file_upload'
  }
];
