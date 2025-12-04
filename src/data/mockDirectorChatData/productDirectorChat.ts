// Product Director Direct Chat Data
// Populated from CSV: Product_Director.csv

import type { DirectorMessage, DirectorFile, DirectorMemory, DirectorActivity } from './marketingDirectorChat';

// Product Director messages
export const productDirectorMessages: DirectorMessage[] = [
  {
    id: 'pdir-1',
    content: '<p>Yo, just catching a breather after that war room, you free for 10 mins to go deeper on <strong>Tech Reborn</strong> from the product side?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:00:00Z'
  },
  {
    id: 'pdir-2',
    content: '<p>Always. That chat was good, but it was very "tactical today". We need to zoom out on what Tech Reborn actually means for the catalogue over the next 6–12 months.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:01:00Z'
  },
  {
    id: 'pdir-3',
    content: '<p>Exactly. Right now, it\'s a campaign skin on top of old logic. I want Tech Reborn to basically decide:</p><ul><li>What we stock</li><li>What we don\'t stock</li><li>How we present everything</li></ul><p>Like a standard for the whole site, not just a banner.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:02:00Z'
  },
  {
    id: 'pdir-4',
    content: '<p>So we treat Tech Reborn as the <strong>quality + story layer</strong> across the catalogue, not just a marketing theme. That means:</p><ul><li>Certain SKUs are simply not "Tech Reborn compatible"</li><li>Certain grades/specs get elevated</li><li>PDP structure defaults to the Tech Reborn layout, not legacy</li></ul><p>We can codify that.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:03:00Z'
  },
  {
    id: 'pdir-5',
    content: '<p>Yep. And I want you owning the definition of a <strong>"Tech Reborn Compliant SKU"</strong>. What passes, what fails. I don\'t care if that means we kill 15% of the catalogue over time, I\'d rather be tight and premium than wide and chaotic.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:04:00Z'
  },
  {
    id: 'pdir-6',
    content: '<p>Love that. My instinct:</p><p><strong>Tech Reborn SKUs must be:</strong></p><ul><li>Reasonably modern (Apple Silicon and up, iPhone 11 and up, etc.)</li><li>Not absurdly low storage</li><li>Above a minimum battery health threshold</li><li>Refund rate under an agreed %</li><li>Margins that allow us to honour warranty without pain</li></ul><p>Everything else goes to Outlet / Clearance or we just don\'t stock it.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:05:00Z',
    files: [{
      name: 'tech_reborn_compliant_sku_criteria.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 34000
    }]
  },
  {
    id: 'pdir-7',
    content: '<p>Good. Put that into a one-pager and then quietly start applying it. I don\'t want a big noisy "we\'re deleting SKUs" project, just gradual pruning and promoting what fits.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:06:00Z'
  },
  {
    id: 'pdir-8',
    content: '<p>Got it. Also, can we talk about <strong>accessories</strong>? Because if Tech Reborn is "premium second life", we can\'t ship things in barebones fashion forever.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:07:00Z'
  },
  {
    id: 'pdir-9',
    content: '<p>Yeah, the current experience of "nice refurb laptop, random brown box" is not the dream. I want:</p><ul><li>Standardised, clean packaging</li><li>Proper Tech Reborn insert</li><li>Clear explanation of testing + warranty</li></ul><p>Even with refurb partners, the end feel needs to be consistent.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:08:00Z'
  },
  {
    id: 'pdir-10',
    content: '<p>Agree. We can start with the <strong>unboxing narrative</strong>:</p><ul><li>Tech Reborn external sticker</li><li>Inner card that explains: "This device had a past. Here\'s what we did before giving it to you."</li><li>Simple checklist: tested, cleaned, data wiped, etc.</li></ul><p>Doesn\'t have to be fancy at first, just consistent.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:09:00Z',
    files: [{
      name: 'tech_reborn_unboxing_insert_v1.pdf',
      type: 'application/pdf',
      size: 890000
    }]
  },
  {
    id: 'pdir-11',
    content: '<p>Do it. Design a v1 Tech Reborn insert + packaging spec and roll it out first on MacBook M1 and iPhone 13. Once we like it, we push partners to adopt it.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:10:00Z'
  },
  {
    id: 'pdir-12',
    content: '<p>Cool. I\'ll also sync with Ops on what\'s practical in the next 4–6 weeks so we don\'t design something nobody can actually ship.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:11:00Z'
  },
  {
    id: 'pdir-13',
    content: '<p>One more thing: <strong>Founders\' Picks</strong>. I really want your face and voice attached to specific recommendations, not just generic "Our Best Sellers".</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:12:00Z'
  },
  {
    id: 'pdir-14',
    content: '<p>Same. I don\'t want to be the invisible brain behind a logo. Draft 3–5 products that you think represent the brand perfectly right now, add a short note on each ("this is the one I\'d buy if…"), and I\'ll tweak the language.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:13:00Z'
  },
  {
    id: 'pdir-15',
    content: '<p>Off the top of my head, short list:</p><ul><li>iPhone 13 128GB – Very Good</li><li>iPhone 13 Pro 256GB – Like New</li><li>MacBook Air M1 512GB – Very Good</li><li>iPad 9th Gen 64GB – Very Good</li></ul><p>These cover everyday, power user, main laptop, and family tablet use cases.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:14:00Z',
    files: [{
      name: 'founders_picks_initial_list.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 28000
    }]
  },
  {
    id: 'pdir-16',
    content: '<p>Exactly. Add one <strong>"Budget Hero"</strong> that still feels on-brand. Not trash, just smart value.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:15:00Z'
  },
  {
    id: 'pdir-17',
    content: '<p>That\'s probably iPhone 11 128GB – Very Good. Still modern, still supported, and under Tech Reborn positioning it looks like ridiculous value.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:16:00Z'
  },
  {
    id: 'pdir-18',
    content: '<p>Cool, slot that in as the budget option. Make the copy honest, not salesy, "If you don\'t care about the latest design, this is stupidly good value."</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:17:00Z'
  },
  {
    id: 'pdir-19',
    content: '<p>Done. Now, can we talk about <strong>data feedback loops</strong> from Tech Reborn? I want the catalogue to get smarter automatically, not just manually in our heads.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:18:00Z'
  },
  {
    id: 'pdir-20',
    content: '<p>Go on.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:19:00Z'
  },
  {
    id: 'pdir-21',
    content: '<p>If Tech Reborn is the "curated second-life" layer, we should:</p><ul><li>Automatically downgrade SKUs out of Tech Reborn if refund rate or complaints spike</li><li>Automatically promote SKUs into hero positions if NPS, reviews and low refund rate hold strong</li><li>Feed that back into pricing, bundle visibility and hero placement</li></ul><p>Right now we do this intuitively. I want it rule-based.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:20:00Z',
    files: [{
      name: 'tech_reborn_feedback_loops_notes.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 42000
    }]
  },
  {
    id: 'pdir-22',
    content: '<p>Agree. Build a simple set of rules:</p><ul><li>If refund rate > X% over 60 days → loses hero status / moves to Outlet candidate</li><li>If review average > Y and sales > Z with low returns → candidate for Founders\' Picks or "Recommended" Smart Filter</li></ul><p>We don\'t need AI for this, just sane rules and a monthly sweep.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:21:00Z'
  },
  {
    id: 'pdir-23',
    content: '<p>I\'ll spec that out as a <strong>Health Score</strong> for each Tech Reborn SKU. Score will drive:</p><ul><li>Placement</li><li>Tagging (Hero / Safe / Watchlist / Outlet)</li><li>Which SKUs we push in future campaigns</li></ul><p>This also gives us a framework if we expand into other brands later.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:22:00Z'
  },
  {
    id: 'pdir-24',
    content: '<p>Love it. Do that. One more thing I want you to own: future product lines under Tech Reborn, consoles, wearables, maybe monitors. But we only move when we can hit the same standard.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:23:00Z'
  },
  {
    id: 'pdir-25',
    content: '<p>Right now, consoles are the lowest-hanging fruit:</p><ul><li>Huge refurb demand</li><li>Good margins</li><li>People don\'t care if the box has a small scratch, as long as the device is solid</li></ul><p>But we\'ll need tight testing standards for controllers, fans, drives, etc.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:24:00Z',
    files: [{
      name: 'tech_reborn_consoles_exploration.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 56000
    }]
  },
  {
    id: 'pdir-26',
    content: '<p>Yeah, I don\'t want Joy-Con drift or dodgy controllers becoming "the Baduss story". Draft a short memo: "If we launch Tech Reborn Consoles, here\'s the standard." We can decide timing later, but I want the bar defined now.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:25:00Z'
  },
  {
    id: 'pdir-27',
    content: '<p>On it. Last question, are you okay with us being aggressive about cutting weird low-storage SKUs even if they\'re technically profitable?</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:26:00Z'
  },
  {
    id: 'pdir-28',
    content: '<p>100%. If a SKU technically makes money but ruins the experience or makes us look cheap, it\'s a net negative. Think like a brand, not a clearance warehouse. If it doesn\'t fit Tech Reborn, it lives in Outlet or doesn\'t live at all.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:27:00Z'
  },
  {
    id: 'pdir-29',
    content: '<p>Cool. I\'ll treat Tech Reborn as the standard and Outlet as the exception, not the other way round.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:28:00Z'
  },
  {
    id: 'pdir-30',
    content: '<p>Exactly. You\'re basically the guardian of "Does this feel like Baduss or not?". Structure what we talked about into three docs for me:</p><ol><li>Tech Reborn Compliant SKU criteria</li><li>Packaging + unboxing standard v1</li><li>Future categories (starting with consoles) + bar to enter</li></ol><p>No slides, just clean docs. I\'ll read and then we bake them into the operating system of the company.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:29:00Z',
    files: [{
      name: 'tech_reborn_structural_docs_outline.txt',
      type: 'text/plain',
      size: 4500
    }]
  },
  {
    id: 'pdir-31',
    content: '<p>Got it. I\'ll ping you drafts over the next couple of days. This is the fun part of the job, so I\'m all in.</p>',
    user_id: null,
    agent_id: 'product-director',
    sender_name: 'Product Director',
    created_at: '2025-12-04T17:30:00Z'
  },
  {
    id: 'pdir-32',
    content: '<p>You\'ve earned it. If we nail this, Tech Reborn becomes the thing people remember us for, not just a Q4 campaign. Go build the product version of that and I\'ll keep the marketing side loud.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T17:31:00Z'
  }
];

// Files shared in this chat
export const productDirectorFiles: DirectorFile[] = [
  {
    name: 'tech_reborn_compliant_sku_criteria.docx',
    type: 'document',
    size: '34 KB',
    uploadedBy: 'Product Director',
    uploadedAt: '2025-12-04T17:05:00Z'
  },
  {
    name: 'tech_reborn_unboxing_insert_v1.pdf',
    type: 'pdf',
    size: '890 KB',
    uploadedBy: 'Product Director',
    uploadedAt: '2025-12-04T17:09:00Z'
  },
  {
    name: 'founders_picks_initial_list.xlsx',
    type: 'spreadsheet',
    size: '28 KB',
    uploadedBy: 'Product Director',
    uploadedAt: '2025-12-04T17:14:00Z'
  },
  {
    name: 'tech_reborn_feedback_loops_notes.docx',
    type: 'document',
    size: '42 KB',
    uploadedBy: 'Product Director',
    uploadedAt: '2025-12-04T17:20:00Z'
  },
  {
    name: 'tech_reborn_consoles_exploration.docx',
    type: 'document',
    size: '56 KB',
    uploadedBy: 'Product Director',
    uploadedAt: '2025-12-04T17:24:00Z'
  },
  {
    name: 'tech_reborn_structural_docs_outline.txt',
    type: 'text',
    size: '4.5 KB',
    uploadedBy: 'Liam',
    uploadedAt: '2025-12-04T17:29:00Z'
  }
];

// Key memories from this conversation
export const productDirectorMemories: DirectorMemory[] = [
  {
    id: 'pdir-mem-1',
    key: 'Tech Reborn as Catalogue Standard',
    value: 'Tech Reborn decides what we stock, what we don\'t stock, and how we present everything. Quality + story layer across the entire catalogue.',
    category: 'Strategy',
    created_by: 'Liam',
    updated_at: '2025-12-04T17:02:00Z'
  },
  {
    id: 'pdir-mem-2',
    key: 'Tech Reborn Compliant SKU Criteria',
    value: 'Apple Silicon+, iPhone 11+, minimum storage, battery health threshold, refund rate under X%, sustainable margins. Non-compliant goes to Outlet or delisted.',
    category: 'Product Standards',
    created_by: 'Product Director',
    updated_at: '2025-12-04T17:05:00Z'
  },
  {
    id: 'pdir-mem-3',
    key: 'Unboxing Narrative',
    value: 'Tech Reborn sticker, inner card explaining device history and testing checklist (tested, cleaned, data wiped). Consistent experience across all shipments.',
    category: 'Customer Experience',
    created_by: 'Product Director',
    updated_at: '2025-12-04T17:09:00Z'
  },
  {
    id: 'pdir-mem-4',
    key: 'Founders\' Picks Selection',
    value: 'iPhone 13 128GB, iPhone 13 Pro 256GB, MacBook Air M1 512GB, iPad 9th Gen 64GB, plus iPhone 11 128GB as "Budget Hero"',
    category: 'Product Curation',
    created_by: 'Product Director',
    updated_at: '2025-12-04T17:16:00Z'
  },
  {
    id: 'pdir-mem-5',
    key: 'SKU Health Score System',
    value: 'Rule-based scoring: refund rate, reviews, sales volume. Drives placement, tagging (Hero/Safe/Watchlist/Outlet), and campaign inclusion.',
    category: 'Process',
    created_by: 'Product Director',
    updated_at: '2025-12-04T17:22:00Z'
  },
  {
    id: 'pdir-mem-6',
    key: 'Future Category Expansion',
    value: 'Consoles are next priority. Must define testing standards for controllers, fans, drives before launch. No compromise on Tech Reborn quality bar.',
    category: 'Expansion',
    created_by: 'Product Director',
    updated_at: '2025-12-04T17:24:00Z'
  },
  {
    id: 'pdir-mem-7',
    key: 'Brand Over Profit Philosophy',
    value: 'If a SKU makes money but ruins experience or looks cheap, it\'s a net negative. Think like a brand, not a clearance warehouse.',
    category: 'Philosophy',
    created_by: 'Liam',
    updated_at: '2025-12-04T17:27:00Z'
  }
];

// Activity log
export const productDirectorActivity: DirectorActivity[] = [
  {
    id: 'pdir-act-1',
    action: 'Decision Made',
    description: 'Tech Reborn to become the quality standard for entire catalogue, not just a marketing theme',
    performer: 'Liam',
    timestamp: '2025-12-04T17:02:00Z',
    type: 'decision'
  },
  {
    id: 'pdir-act-2',
    action: 'File Uploaded',
    description: 'Created Tech Reborn Compliant SKU criteria document',
    performer: 'Product Director',
    timestamp: '2025-12-04T17:05:00Z',
    type: 'file_upload'
  },
  {
    id: 'pdir-act-3',
    action: 'File Uploaded',
    description: 'Designed Tech Reborn unboxing insert v1',
    performer: 'Product Director',
    timestamp: '2025-12-04T17:09:00Z',
    type: 'file_upload'
  },
  {
    id: 'pdir-act-4',
    action: 'Decision Made',
    description: 'Roll out packaging first on MacBook M1 and iPhone 13, then push to partners',
    performer: 'Liam',
    timestamp: '2025-12-04T17:10:00Z',
    type: 'decision'
  },
  {
    id: 'pdir-act-5',
    action: 'File Uploaded',
    description: 'Created Founders\' Picks initial product list',
    performer: 'Product Director',
    timestamp: '2025-12-04T17:14:00Z',
    type: 'file_upload'
  },
  {
    id: 'pdir-act-6',
    action: 'File Uploaded',
    description: 'Documented Tech Reborn feedback loops and auto-promotion rules',
    performer: 'Product Director',
    timestamp: '2025-12-04T17:20:00Z',
    type: 'file_upload'
  },
  {
    id: 'pdir-act-7',
    action: 'File Uploaded',
    description: 'Shared console category exploration and testing requirements',
    performer: 'Product Director',
    timestamp: '2025-12-04T17:24:00Z',
    type: 'file_upload'
  },
  {
    id: 'pdir-act-8',
    action: 'Decision Made',
    description: 'Brand over profit: unprofitable SKUs that damage experience will be cut',
    performer: 'Liam',
    timestamp: '2025-12-04T17:27:00Z',
    type: 'decision'
  },
  {
    id: 'pdir-act-9',
    action: 'Milestone',
    description: 'Outlined three structural docs: SKU criteria, packaging standard, future categories',
    performer: 'Liam',
    timestamp: '2025-12-04T17:29:00Z',
    type: 'milestone'
  }
];
