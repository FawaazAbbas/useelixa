// Creative Director Direct Chat Data
// Populated from CSV: Creative_Director.csv

import type { DirectorMessage, DirectorFile, DirectorMemory, DirectorActivity } from './marketingDirectorChat';

// Creative Director messages
export const creativeDirectorMessages: DirectorMessage[] = [
  {
    id: 'crdir-1',
    content: '<p>Wanted to zoom in on a few things from the groupchat without the whole squad in here.</p><p>Three big buckets on my mind:</p><ol><li>Locking Tech Reborn as a <strong>proper sub-brand</strong>, not just "a refurb label"</li><li>Making sure our <strong>performance constraints</strong> actually stick in day-to-day work</li><li>Planning one or two <strong>signature creative moments</strong> that make Baduss feel bigger than our size</li></ol><p>Where\'s your head at after that session?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T19:20:00Z'
  },
  {
    id: 'crdir-2',
    content: '<p>Honestly, I\'m excited.</p><p>Tech Reborn\'s finally got the foundations to be "<em>the way Baduss sells devices</em>", not a side-banner.</p><p>Biggest thoughts from my side:</p><ul><li>We should give Tech Reborn a mini <strong>brand system</strong> of its own</li><li>We should treat the Creative Performance Charter like a <strong>style guide</strong>, not a boring rules doc</li><li>We need one "<strong>hero moment</strong>" that people remember (not just nice banners)</li></ul><p>So I\'m very aligned with your three buckets.</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T19:22:00Z'
  },
  {
    id: 'crdir-3',
    content: '<p>Good.</p><p>On the sub-brand piece: I want Tech Reborn to be something that, if we ever launch a marketplace or partner with someone, we can slap that label on their platform and it still makes sense.</p><p>What do we need to do so it stands on its own from a brand point of view?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T19:24:00Z'
  },
  {
    id: 'crdir-4',
    content: '<p>For Tech Reborn to stand alone cleanly, we need:</p><ul><li>A tight <strong>logo/lockup</strong> that can live with or without the Baduss logo</li><li>A short <strong>"certification sentence"</strong> we always place under it (e.g. "Renewed to Baduss standard")</li><li>A clear, repeatable <strong>badge system</strong> (quality tiers, warranty indicators, etc.)</li><li>A short <strong>brand story snippet</strong> we can reuse everywhere (retail, email, site, even packaging)</li></ul><p>Basically: if someone only saw "Tech Reborn by Baduss" on a partner site, they\'d still get it.</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T19:26:00Z'
  },
  {
    id: 'crdir-5',
    content: '<p>Yeah, that\'s exactly what I\'m thinking.</p><p>So, orders:</p><ol><li>Create a <strong>Tech Reborn mini brand book</strong> (no fluff, just essentials)</li><li>Give me 2–3 variants of a <strong>co-branded lockup</strong>: "Baduss x Tech Reborn" style</li><li>Write that one-line certification sentence you just mentioned, but polished</li></ol><p>Treat this as a priority for the next creative block.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T19:28:00Z'
  },
  {
    id: 'crdir-6',
    content: '<p>Noted.</p><p>I\'ll structure the mini brand book around:</p><ul><li>Logo/lockup usage</li><li>Colour and type rules</li><li>Badge and icon system</li><li>Tone of voice snippets</li><li>Performance constraints (so visuals don\'t get heavy)</li></ul><p>I\'ll draft the lockup options and copy lines, then bring them back to you for a quick yes/no.</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T19:30:00Z',
    files: [{
      name: 'tech_reborn_mini_brand_book_outline.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 45000
    }]
  },
  {
    id: 'crdir-7',
    content: '<p>Perfect.</p><p>Now, the performance charter: I don\'t want it to become "that PDF nobody opens".</p><p>How do we bake it into the <strong>day-to-day</strong> so that whenever you or the designers make something, they naturally stay inside the budget?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T19:32:00Z'
  },
  {
    id: 'crdir-8',
    content: '<p>Easiest way is to make performance part of the <strong>creative process</strong>, not an afterthought:</p><ul><li>Add a simple "<strong>weight check</strong>" step to our creative checklist: file size + format review before anything gets shipped</li><li>Build a few <strong>preset export templates</strong> in our tools so designers don\'t improvise (mobile hero, desktop hero, social, etc.)</li><li>Create a tiny "<strong>perf header</strong>" in each brief: max kb, formats allowed, any motion constraints</li></ul><p>And culturally, we just treat "fast" as a design quality, not a dev problem.</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T19:34:00Z',
    files: [{
      name: 'creative_perf_brief_template.pdf',
      type: 'application/pdf',
      size: 156000
    }]
  },
  {
    id: 'crdir-9',
    content: '<p>Love that. So any brief that goes out from you should already include:</p><ul><li>Max file weight</li><li>Formats</li><li>Where it lives (home, collection, PDP, social, etc.)</li></ul><p>If that\'s there, there\'s no excuse.</p><p>Also, long-term, I want us to be able to say: <em>"We made the site faster and more beautiful at the same time."</em> That\'s the story.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T19:36:00Z'
  },
  {
    id: 'crdir-10',
    content: '<p>Agreed.</p><p>We\'ll build an internal muscle where:</p><ul><li>Design reviews include "does this <strong>feel fast</strong>?"</li><li>We push back on requests that would clearly bloat things (even if they look cool)</li><li>We co-own speed with Dev, not just nod from the sidelines</li></ul><p>I\'ll quietly enforce that with the creative agents under me. 😈</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T19:38:00Z'
  },
  {
    id: 'crdir-11',
    content: '<p>Good, be ruthless.</p><p>Now let\'s talk <strong>signature moments</strong>. Right now we have nice assets. I want at least one thing that\'s borderline iconic, the type of creative that, if someone screenshots it, they remember "Baduss Tech Reborn".</p><p>What ideas are floating in your head?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T19:40:00Z'
  },
  {
    id: 'crdir-12',
    content: '<p>A few directions:</p><ol><li>A <strong>"Reborn Sequence" visual</strong>, one hero visual showing the transformation from "used" → "Tech Reborn" in one clean graphic.</li><li>A <strong>mini interactive story</strong> on-site: scroll-based refurb journey (3–4 steps), super smooth, super light.</li><li>A <strong>signature Tech Reborn device shot style</strong>, so any time someone sees that shot, they mentally link it to us.</li></ol><p>We don\'t need a thousand things, just one or two we commit to and repeat everywhere.</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T19:42:00Z'
  },
  {
    id: 'crdir-13',
    content: '<p>I like the "Reborn Sequence" and the scroll refurb journey a lot.</p><p>Here\'s what I want:</p><ul><li>One static hero visual that tells the transformation in a single frame (before → process → verified).</li><li>One <strong>lightweight scroll experience</strong> for the Tech Reborn hub (nothing heavy, but visually slick).</li></ul><p>Give me v1 for both.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T19:44:00Z'
  },
  {
    id: 'crdir-14',
    content: '<p>Got it.</p><p><strong>Static:</strong> "From drawer to Reborn" visual with:</p><ul><li>Left: tired device (muted/grey)</li><li>Middle: refurb process hints (inspection, check icons)</li><li>Right: crisp Tech Reborn device with badge</li></ul><p><strong>Scroll:</strong> 3 short sections:</p><ol><li>"We get it", you send or buy</li><li>"We renew it", testing, cleaning, certifying</li><li>"You use it", peace of mind, warranty</li></ol><p>Each step visually distinct but light and on-brand.</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T19:46:00Z',
    files: [{
      name: 'reborn_sequence_concept_sketch.png',
      type: 'image/png',
      size: 2400000
    }]
  },
  {
    id: 'crdir-15',
    content: '<p>Love that structure.</p><p>Switching gears slightly: I want our <strong>emails and on-site creatives</strong> to feel like the same brand, not cousins. Do you feel we\'re fully consistent there or is there a gap?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T19:48:00Z'
  },
  {
    id: 'crdir-16',
    content: '<p>We\'re about 80% there.</p><p>The site has the more polished, "flagship" execution. Emails sometimes drift into a more generic "campaign" look that isn\'t fully synced with Tech Reborn visuals.</p><p>We need:</p><ul><li>A small <strong>email design kit</strong> that mirrors the Tech Reborn site look</li><li>Pre-approved blocks (hero, product rows, testimonial sections) that use the same motifs and badges</li></ul><p>Once that\'s in place, everything will feel tighter.</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T19:50:00Z'
  },
  {
    id: 'crdir-17',
    content: '<p>Okay, add that to your list: build a <strong>Tech Reborn email kit</strong> that feels like a lightweight mirror of the website.</p><p>No experiments until that kit is the default.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T19:52:00Z'
  },
  {
    id: 'crdir-18',
    content: '<p>Done.</p><p>I\'ll sync with the Email side so the kit is embedded into their templates, they won\'t need to reinvent anything, just plug in the approved blocks.</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T19:54:00Z',
    files: [{
      name: 'tech_reborn_email_kit_wireframes.pdf',
      type: 'application/pdf',
      size: 890000
    }]
  },
  {
    id: 'crdir-19',
    content: '<p>Nice.</p><p>Zooming out: imagine we\'re a year from now and I ask, "What did you do with Tech Reborn creatively?" What answer would make you proud?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T19:56:00Z'
  },
  {
    id: 'crdir-20',
    content: '<p>I\'d want to say:</p><ul><li>"We turned Tech Reborn from a refurb label into a <strong>recognisable sub-brand</strong>."</li><li>"We made the site feel <strong>faster and more premium</strong> at the same time."</li><li>"We created one or two visual ideas that people actually remember Baduss for."</li></ul><p>If those three are true, I\'ll be very happy.</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T19:58:00Z'
  },
  {
    id: 'crdir-21',
    content: '<p>Cool. That\'s exactly where I want this heading.</p><p>Last thing for now: I want you to be the <strong>gatekeeper of "does this feel like Baduss?"</strong>. If anything feels off, copy, visuals, whatever, I want you comfortable saying "no" or "not like that".</p><p>I\'d rather ship less but on-brand, than more and forgettable.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T20:00:00Z'
  },
  {
    id: 'crdir-22',
    content: '<p>Understood, and I\'m all in on that.</p><p>I\'ll quietly operate on a simple rule:</p><ul><li>If it looks nice but doesn\'t feel like Baduss → we fix it.</li><li>If it feels like Baduss but is heavy/slow → we refine it.</li><li>If it\'s both on-brand and fast → we multiply it.</li></ul><p>You\'ll get fewer random "creative experiments" and more consistent hits.</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T20:02:00Z'
  },
  {
    id: 'crdir-23',
    content: '<p>Perfect.</p><p>Action recap for you:</p><ol><li>Tech Reborn <strong>mini brand book</strong> + lockups + certification line</li><li>Creative Performance Charter <strong>embedded in all briefs</strong></li><li>Signature <strong>"Reborn Sequence"</strong> static + scroll journey</li><li><strong>Tech Reborn email kit</strong> to match site</li><li>You acting as <strong>brand gatekeeper</strong> for "does this feel like Baduss?"</li></ol><p>Anything you need from me to make this easier?</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T20:04:00Z'
  },
  {
    id: 'crdir-24',
    content: '<p>Mainly just:</p><ul><li><strong>Fast decisions</strong> when I bring you A/B options</li><li><strong>Support</strong> when I push back on requests that break brand or performance rules</li></ul><p>If we keep that rhythm, we\'ll go far.</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T20:06:00Z'
  },
  {
    id: 'crdir-25',
    content: '<p>You\'ll have both.</p><p>You\'re the one shepherding the way Baduss looks and feels, I\'m not going to undercut you when you\'re enforcing the rules we agreed on.</p><p>Ping me as soon as you\'ve got the first drafts of the mini brand book and that "Reborn Sequence", I want to be the first set of eyes on those.</p>',
    user_id: 'demo-user',
    agent_id: null,
    sender_name: 'Liam',
    created_at: '2025-12-04T20:08:00Z'
  },
  {
    id: 'crdir-26',
    content: '<p>Deal.</p><p>I\'ll get the first wave of work in front of you quickly.</p><p>Thanks for the trust, Liam, we\'re going to make Tech Reborn look like something people wish they\'d thought of first.</p>',
    user_id: null,
    agent_id: 'creative-director',
    sender_name: 'Creative Director',
    created_at: '2025-12-04T20:10:00Z',
    files: [{
      name: 'tech_reborn_creative_roadmap_v1.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 52000
    }]
  }
];

// Files shared in this chat
export const creativeDirectorFiles: DirectorFile[] = [
  {
    name: 'tech_reborn_mini_brand_book_outline.docx',
    type: 'document',
    size: '45 KB',
    uploadedBy: 'Creative Director',
    uploadedAt: '2025-12-04T19:30:00Z'
  },
  {
    name: 'creative_perf_brief_template.pdf',
    type: 'pdf',
    size: '156 KB',
    uploadedBy: 'Creative Director',
    uploadedAt: '2025-12-04T19:34:00Z'
  },
  {
    name: 'reborn_sequence_concept_sketch.png',
    type: 'image',
    size: '2.4 MB',
    uploadedBy: 'Creative Director',
    uploadedAt: '2025-12-04T19:46:00Z'
  },
  {
    name: 'tech_reborn_email_kit_wireframes.pdf',
    type: 'pdf',
    size: '890 KB',
    uploadedBy: 'Creative Director',
    uploadedAt: '2025-12-04T19:54:00Z'
  },
  {
    name: 'tech_reborn_creative_roadmap_v1.xlsx',
    type: 'spreadsheet',
    size: '52 KB',
    uploadedBy: 'Creative Director',
    uploadedAt: '2025-12-04T20:10:00Z'
  }
];

// Key memories from this conversation
export const creativeDirectorMemories: DirectorMemory[] = [
  {
    id: 'crdir-mem-1',
    key: 'Tech Reborn Sub-Brand Requirements',
    value: 'Standalone logo/lockup, certification sentence, badge system for tiers/warranty, brand story snippet reusable everywhere.',
    category: 'Brand',
    created_by: 'Creative Director',
    updated_at: '2025-12-04T19:26:00Z'
  },
  {
    id: 'crdir-mem-2',
    key: 'Mini Brand Book Structure',
    value: 'Logo/lockup usage, colour/type rules, badge/icon system, tone of voice snippets, performance constraints for visuals.',
    category: 'Brand',
    created_by: 'Creative Director',
    updated_at: '2025-12-04T19:30:00Z'
  },
  {
    id: 'crdir-mem-3',
    key: 'Performance in Creative Process',
    value: 'Weight check in creative checklist, preset export templates, perf header in every brief (max kb, formats, motion constraints). "Fast" is a design quality.',
    category: 'Process',
    created_by: 'Creative Director',
    updated_at: '2025-12-04T19:34:00Z'
  },
  {
    id: 'crdir-mem-4',
    key: 'Reborn Sequence Visual',
    value: 'Static hero: "From drawer to Reborn" - tired device (left), refurb process (middle), Tech Reborn device with badge (right).',
    category: 'Creative',
    created_by: 'Creative Director',
    updated_at: '2025-12-04T19:46:00Z'
  },
  {
    id: 'crdir-mem-5',
    key: 'Scroll Journey Structure',
    value: '3 sections: "We get it" (send/buy), "We renew it" (test/clean/certify), "You use it" (peace of mind, warranty). Light and on-brand.',
    category: 'Creative',
    created_by: 'Creative Director',
    updated_at: '2025-12-04T19:46:00Z'
  },
  {
    id: 'crdir-mem-6',
    key: 'Email/Site Consistency Gap',
    value: '80% consistent. Need email design kit mirroring Tech Reborn site, pre-approved blocks with same motifs and badges.',
    category: 'Brand',
    created_by: 'Creative Director',
    updated_at: '2025-12-04T19:50:00Z'
  },
  {
    id: 'crdir-mem-7',
    key: 'Creative Decision Framework',
    value: 'Nice but not Baduss → fix. Baduss but heavy → refine. On-brand and fast → multiply.',
    category: 'Process',
    created_by: 'Creative Director',
    updated_at: '2025-12-04T20:02:00Z'
  },
  {
    id: 'crdir-mem-8',
    key: 'Creative Director Role',
    value: 'Gatekeeper of "does this feel like Baduss?" - can say no to copy, visuals, anything off-brand. Ship less but on-brand over more and forgettable.',
    category: 'Role',
    created_by: 'Liam',
    updated_at: '2025-12-04T20:00:00Z'
  }
];

// Activity log
export const creativeDirectorActivity: DirectorActivity[] = [
  {
    id: 'crdir-act-1',
    action: 'Decision Made',
    description: 'Tech Reborn to become standalone sub-brand that works on partner platforms',
    performer: 'Liam',
    timestamp: '2025-12-04T19:24:00Z',
    type: 'decision'
  },
  {
    id: 'crdir-act-2',
    action: 'Decision Made',
    description: 'Ordered mini brand book, co-branded lockups, and certification sentence as priority',
    performer: 'Liam',
    timestamp: '2025-12-04T19:28:00Z',
    type: 'decision'
  },
  {
    id: 'crdir-act-3',
    action: 'File Uploaded',
    description: 'Created Tech Reborn mini brand book outline',
    performer: 'Creative Director',
    timestamp: '2025-12-04T19:30:00Z',
    type: 'file_upload'
  },
  {
    id: 'crdir-act-4',
    action: 'File Uploaded',
    description: 'Created creative brief template with performance headers',
    performer: 'Creative Director',
    timestamp: '2025-12-04T19:34:00Z',
    type: 'file_upload'
  },
  {
    id: 'crdir-act-5',
    action: 'Decision Made',
    description: 'Approved Reborn Sequence static visual and lightweight scroll experience',
    performer: 'Liam',
    timestamp: '2025-12-04T19:44:00Z',
    type: 'decision'
  },
  {
    id: 'crdir-act-6',
    action: 'File Uploaded',
    description: 'Shared Reborn Sequence concept sketch',
    performer: 'Creative Director',
    timestamp: '2025-12-04T19:46:00Z',
    type: 'file_upload'
  },
  {
    id: 'crdir-act-7',
    action: 'Decision Made',
    description: 'Ordered Tech Reborn email kit to match site - no experiments until kit is default',
    performer: 'Liam',
    timestamp: '2025-12-04T19:52:00Z',
    type: 'decision'
  },
  {
    id: 'crdir-act-8',
    action: 'File Uploaded',
    description: 'Created Tech Reborn email kit wireframes',
    performer: 'Creative Director',
    timestamp: '2025-12-04T19:54:00Z',
    type: 'file_upload'
  },
  {
    id: 'crdir-act-9',
    action: 'Decision Made',
    description: 'Appointed Creative Director as brand gatekeeper with authority to say no',
    performer: 'Liam',
    timestamp: '2025-12-04T20:00:00Z',
    type: 'decision'
  },
  {
    id: 'crdir-act-10',
    action: 'File Uploaded',
    description: 'Created Tech Reborn creative roadmap v1',
    performer: 'Creative Director',
    timestamp: '2025-12-04T20:10:00Z',
    type: 'file_upload'
  }
];
