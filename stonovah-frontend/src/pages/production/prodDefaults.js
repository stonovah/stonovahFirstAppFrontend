// Built-in catalogue, so every service and project-type page works before the database is seeded.
// Live data from the API always takes over when it exists. Keep this in step with prisma/seed-production.ts.

const ALL = ['FEATURE_FILM', 'DOCUMENTARY', 'TV_SERIES', 'COMMERCIAL'];
const c = (title, body) => ({ title, body });
const spec = (...rows) => ({ rows: rows.map(([label, value]) => ({ label, value })) });
const opt = (slug, key, label, summary, durationLabel, primaryDeliverable) => ({
  id: `default-${slug}-${key}`, key, label, summary: summary ?? null, durationLabel: durationLabel ?? null, primaryDeliverable: primaryDeliverable ?? null, details: null,
});

const RAW = [
  {
    slug: 'full-production', code: 'SRV-PROD-001', name: 'Full Production Packaging', badge: 'Flagship Turnkey Solution', kind: 'TURNKEY',
    stage: 'CROSS', stageLabel: 'All Stages • End-to-End', iconKey: 'layers',
    shortDescription: 'Turnkey execution from script to screen. One team, one plan and one schedule, with every phase managed under executive producer supervision.',
    mandate: 'Designed for independent producers, international streaming studios and global creative agencies that need end-to-end studio infrastructure, Nigerian and West African compliance, and executive producer oversight.',
    leadTimeLabel: 'Proposal in 5 business days',
    relatedSlugs: ['script-development', 'pre-production-planning', 'production-management', 'post-production'],
    tiers: [
      { name: 'Turnkey Co-Production Package', tag: 'Full suite', description: 'Full lead cast sourcing, Tier-1 soundstages, a dedicated line producer and a complete finishing suite.' },
      { name: 'Executive Production & Oversight Only', tag: 'Advisory', description: 'Supervising line producer, regulatory compliance, guild clearances and legal governance.' },
      { name: 'Technical Execution Unit', tag: 'Gear & floor', description: 'Soundstage lock, ARRI Alexa Mini LF packages, gaffer and grip trucks, and an on-set DIT technician.' },
    ],
    content: {
      specSheet: spec(['Delivery model', 'Turnkey: one team, one budget, one master schedule'], ['Proposal turnaround', 'Itemized proposal within 5 business days'], ['Payments', 'Milestone-staged tranches set out in your proposal'], ['Oversight', 'Named executive producer and regular progress updates']),
      audiences: [
        c('First-Time Producers & Creators', 'You have a compelling script, treatment or original IP but lack an established network of crew, gear access or production infrastructure to bring it to screen.'),
        c('Production Companies & Co-Producers', 'International and regional studios needing an authoritative on-ground co-production partner in Nigeria and West Africa.'),
        c('Brands & Commercial Agencies', 'Enterprises and agencies commissioning high-impact commercials, brand manifestos or episodic content and managing disconnected vendors.'),
      ],
      deliverables: [
        c('Named Executive Producer & Project Lead', 'No junior account managers. You are assigned a named executive producer who oversees every stage from day one.'),
        c('One Timeline, One Budget', 'A single master schedule and budget. Capital is released against milestones you approve.'),
        c('Every Single Stage Handled', 'Development, preparation, shoot, finishing and release handled by one coordinated team.'),
        c('Regular Updates & Clear Sign-Offs', 'Progress updates at every milestone, with clear approval points before each tranche.'),
      ],
      steps: [
        c('Tell Us About Your Project', 'Submit your brief, script, treatment or concept, with budget range and timeline.'),
        c('Executive Discovery Call', 'A 45-minute video call with a senior producer to align on vision, risks and resources.'),
        c('Comprehensive Proposal', 'An itemized proposal with budget breakdown, schedule and milestone structure.'),
        c('Kickoff & Team Attachment', 'Your team is assembled and mobilized once the agreement is signed.'),
        c('Regular Updates & Milestones', 'Progress reported at every milestone, with your sign-off at each gate.'),
        c('Final Delivery & Master Handover', 'Delivery of your masters and deliverables, including archive copies.'),
      ],
      requirements: [
        c('Idea, Treatment or Script', 'Anything from a one-page concept to a locked screenplay. PDF, FDX or Word.'),
        c('Target Budget Range', 'An indicative range so we can architect the right production tier.'),
        c('Preferred Timeline Window', 'Target shoot dates and delivery window, so we can plan backwards.'),
      ],
      cta: { heading: 'Ready to bring your vision to screen?', body: 'Submit your brief and a senior producer will review it and respond with next steps.' },
    },
  },
  {
    slug: 'script-development', code: 'SRV-PROD-002', name: 'Script Development', kind: 'MODULE', stage: 'DEVELOP', stageLabel: 'Stage 1: Develop', iconKey: 'file-text',
    shortDescription: 'Screenplay coverage, treatment polishing, story bible creation, and production-ready script locks.',
    leadTimeLabel: '14–28 business days', relatedSlugs: ['pre-production-planning', 'funding-pitch-materials'],
    scopeOptions: [
      ['write-from-idea', 'Write screenplay from my idea', 'End-to-end full feature or pilot draft.', '21–30 days', '90–120 page script (.FDX & PDF)'],
      ['treatment', 'Develop idea into a treatment', '10–25 page executive story bible.'],
      ['rewrite', 'Rewrite or polish my script', 'Dialogue, pacing and act elevation.'],
      ['review', 'Script review with feedback', 'Studio coverage and market scorecard.'],
      ['adapt', 'Adapt a book or true story', 'Biographical and literary narrative.'],
      ['commercial-concept', 'Commercial concept for a brand', 'Brand manifesto, 30s and 60s commercials.'],
    ],
    content: {
      specSheet: spec(['Default formats', 'FDX, PDF, Fountain'], ['Standard turnaround', '14–28 business days'], ['Included revisions', '2 editorial passes'], ['IP protection', '100% client owned']),
      audiences: [
        c('People with an Idea but No Script', 'Turn rough premises, loglines or sketches into a fully structured, character-driven screenplay.'),
        c('Writers Wanting a Stronger Draft', 'Coverage, dialogue sharpening, scene doctoring and developmental notes to elevate your existing draft.'),
        c('Brands Needing a Commercial Concept', 'High-impact narrative treatments, 30s/60s advert scripts and emotional visual manifestos.'),
      ],
      deliverables: [
        c('Screenplay in Industry Format', 'Clean final draft (.fdx), Fountain and broadcast-ready PDF with correct typography and pagination.'),
        c('Comprehensive Story Treatment', 'Detailed beat sheet, character profiles, world-building notes and series roadmaps where relevant.'),
        c('Guaranteed Revision Rounds', 'Two structural and dialogue revision passes with consolidated notes.'),
      ],
      steps: [
        c('Brief & Discovery', 'Submit your core concept, pitch deck, logline or preliminary materials through our intake portal.'),
        c('Writer Matched', 'You are paired with an experienced genre writer whose voice and background fit your project.'),
        c('Outline Approval', 'Review and greenlight the scene-by-scene outline before full drafting begins.'),
        c('First Draft Delivery', 'Receive the complete first draft for stakeholder reading and notes compilation.'),
        c('Collaborative Revisions', 'A feedback session followed by two cycles of structural, comedic or dramatic and line polish.'),
        c('Final Locked Script', 'A proofed screenplay with chain-of-title documentation, ready for budgeting and casting.'),
      ],
      requirements: [
        c('Your Idea or Material', 'Rough premise, character outlines, synopsis or a rough draft. A two-paragraph logline is enough.'),
        c('Genre & Tone', 'Drama, thriller, comedy, sci-fi, documentary or branded. Tone guides writer selection.'),
        c('Format & Length', 'Feature, short, pilot episode, or commercial spot, so we scope the work correctly.'),
        c('Tone References', 'Two or three existing films, series or directorial styles to anchor the aesthetic.'),
      ],
      assurance: { title: 'Your script stays confidential and you own 100% of it', body: 'All submissions, treatments and dialogue drafts are protected under mutual NDA from day one. You retain full ownership of your intellectual property and chain of title.' },
      cta: { heading: 'Ready to start your script?' },
    },
  },
  {
    slug: 'pre-production-planning', code: 'SRV-PROD-003', name: 'Pre-Production Planning', kind: 'MODULE', stage: 'PREPARE', stageLabel: 'Stage 2: Prepare', iconKey: 'calendar',
    shortDescription: 'Comprehensive scene breakdowns, shooting schedules, location scouting logistics, and department budgets.',
    leadTimeLabel: '10–21 business days', relatedSlugs: ['script-development', 'crew-cast-sourcing', 'equipment-locations-studio'],
    scopeOptions: [
      ['turnkey-pre-production', 'Full turnkey pre-production package', 'Scene breakdown, line-item budget, optimized schedule, shot list coordination, production calendar and safety documentation.', '14–21 business days', 'Master budget, schedule and full department packet'],
      ['breakdown', 'Script breakdown & scene stripboard'],
      ['budget', 'Comprehensive line-item budget (Movie Magic)'],
      ['dood', 'Day-out-of-days (DOOD) & shooting schedule'],
      ['shot-list', 'Technical shot list & storyboard coordination'],
      ['permits-safety', 'Permits, safety & location logistics dossier'],
    ],
    content: {
      specSheet: spec(['Standard deliverables', 'Budget and schedule, scene breakdown, call sheet templates'], ['Typical turnaround', '10–21 business days'], ['Revisions', 'One full round of budget and schedule adjustments'], ['Production alignment', 'Vetted line producers, guild-compliant standards']),
      audiences: [
        c('Filmmakers with a Finished Script', 'Creators needing an investor-ready budget, shooting schedule and department day-out-of-days before taking meetings with financiers.'),
        c('Production Companies Needing Bandwidth', 'Established outfits wanting veteran line producer oversight, location logistics or complex multi-unit scheduling.'),
        c('Brands & Commercial Producers', 'Commercial teams needing strict shoot-hour breakdowns, talent booking timelines and permit checklists.'),
      ],
      deliverables: [
        c('Script Breakdown', 'Scene-by-scene element tagging (cast, extras, props, vehicles, VFX, locations) organized into breakdown sheets.'),
        c('Budget & Shooting Schedule', 'Full line-item production budget with an optimized shooting schedule that limits actor days and location moves.'),
        c('Shot List or Storyboards', 'Scene-by-scene visual framing blueprint, camera angle inventory and director/DP alignment.'),
        c('Production Calendar & Call Sheets', 'Master prep, tech scout, shoot and wrap timeline with call sheet templates and crew contact manifest.'),
        c('Health, Safety & Risk Plan', 'Safety protocols, medical contingency, insurance clearance requirements and municipal permits.'),
        c('Guaranteed Adjustments Round', 'A dedicated session to adjust shoot days, re-allocate line items or optimize to financing ceilings.'),
      ],
      steps: [
        c('Share Script', 'Submit your locked screenplay, synopsis and target vision under mutual NDA.'),
        c('Scope Confirmed', 'A 30-minute call with an executive line producer to set budget targets, shoot locations and crew scale.'),
        c('Plan Delivered', 'Receive the complete breakdown, budget, shooting schedule and department dossiers in editable and export formats.'),
        c('One Round of Adjustments', 'A review session to fine-tune the schedule and line-item allocations to match financing.'),
      ],
      requirements: [
        c('Locked Script', 'Formatted PDF or .fdx screenplay, teleplay, or commercial treatment ready for scene breakdown tagging.'),
        c('Target Budget Range', 'An approximate capital ceiling to guide realistic scheduling and cost allocations.'),
        c('Preferred Shoot Dates', 'Target production window, rainy or dry season constraints and festival deadlines.'),
        c('Location Ideas', 'Desired cities, interior or exterior concepts, or regional requirements.'),
      ],
      assurance: { title: 'Strict intellectual property protection', body: 'Your intellectual property is protected under mutual NDA. Budgets, schedules and breakdown documents remain client proprietary.' },
      cta: { heading: 'Ready to plan your production?' },
    },
  },
  {
    slug: 'crew-cast-sourcing', code: 'SRV-PROD-004', name: 'Crew & Cast Sourcing', kind: 'MODULE', stage: 'PREPARE', stageLabel: 'Stage 2: Prepare', iconKey: 'users',
    shortDescription: 'Guild casting calls, director of photography attachment, key department heads, and vetted local production fixers.',
    leadTimeLabel: '5–14 business days', relatedSlugs: ['pre-production-planning', 'equipment-locations-studio', 'legal-clearances-insurance'],
    scopeOptions: [
      ['crew', 'Crew members (director, DP, sound, editor, PAs)', 'Targeted sourcing of directors of photography, ADs, gaffers, key grips, sound recordists, wardrobe stylists and production assistants.', '5–10 business days', 'Shortlist dossiers with showreels, day rates and verified availability'],
      ['cast', 'Cast members (lead & supporting roles)'],
      ['background', 'Background actors & atmosphere extras'],
      ['full-turnkey', 'Full turnkey crew & cast packaging'],
      ['replacements', 'Emergency drop-in replacements'],
    ],
    content: {
      specSheet: spec(['Standard deliverables', 'Curated shortlists, vetted portfolios and showreels, negotiated rate cards, deal memos'], ['Typical turnaround', '5–14 business days'], ['Replacements', 'Replacement mobilization targeted within 24 hours of an emergency cancellation']),
      audiences: [
        c('Indie & Feature Directors', 'Directors seeking cinematographers, gaffers and designers who synchronize with their aesthetic and narrative ambition.'),
        c('Commercial & Agency Producers', 'Production houses needing rapid, vetted crew assemblies, set PAs, wardrobe and makeup staffing.'),
        c('International Co-Productions', 'Overseas studios filming in Nigeria and West Africa that need trusted local fixers, experienced line producers and authentic regional casting.'),
      ],
      deliverables: [
        c('Shortlist with Profiles & Showreels', 'Detailed portfolios, verified CVs, credits, recent filmography breakdowns and showreel links for every proposed candidate.'),
        c('Availability & Transparent Rates', 'Pre-negotiated guild and standard day rates with no hidden agency markups, plus calendar holds for shoot windows.'),
        c('Booking & Contract Administration', 'Complete deal memo drafting, mutual NDA execution and guild clearances handled under Stonovah legal workflows.'),
        c('Guaranteed Drop-out Replacements', 'Immediate replacement action if an attached crew member or cast talent faces an emergency cancellation during production.'),
      ],
      steps: [
        c('Send Role List', 'Submit required positions, character briefs, seniority tiers and target shoot dates.'),
        c('Shortlist Sent', 'Receive a curated deck of 2–3 vetted candidates per position with verified showreels, within 5–7 days.'),
        c('You Choose', 'Conduct chemistry reads or director interviews, then approve primary selections and standby backups.'),
        c('Bookings Confirmed', 'Contracts executed, deal memos locked and insurance waivers finalized, with call sheets synced.'),
      ],
      requirements: [
        c('Roles Required', 'Specific department positions or character breakdown profiles needed for screen.'),
        c('Number of People', 'Exact headcount, for example 1 lead actress, 2 camera operators, 4 PAs, 20 background.'),
        c('Shoot Schedule', 'Principal photography dates, rehearsal days, wardrobe fittings and technical scouts.'),
        c('Location', 'Primary shooting city, soundstage or remote field location, and travel logistics scope.'),
        c('Budget per Role', 'Day-rate target or total departmental budget ceiling per attached professional.'),
      ],
      sampleManifest: {
        title: 'Roles sourcing manifest preview', subtitle: 'Illustrative breakdown of a typical crew and cast package.', illustrative: true,
        columns: ['Role / Department', 'Tier / Seniority', 'Headcount', 'Sourcing channel'],
        rows: [['Cinematographer (DoP)', 'Head of Dept', '1', 'Vetted roster'], ['Production Sound Mixer', 'Key Crew', '1', 'Talent pool'], ['Lead Female Protagonist', 'Principal Cast', '1', 'Open call and roster'], ['Atmosphere & Extras', 'Background', '25', 'Community casting']],
      },
      assurance: { title: 'Confidentiality & NDA guarantee', body: 'All script breakdowns, audition recordings and rates are protected by mutual NDA and NDPR-compliant data protection protocols.' },
      cta: { heading: 'Ready to crew up your production?' },
    },
  },
  {
    slug: 'funding-pitch-materials', code: 'SRV-PROD-005', name: 'Funding & Pitch Materials', kind: 'MODULE', stage: 'CROSS', stageLabel: 'Stages 1 & 2: Capital', iconKey: 'dollar-sign',
    shortDescription: 'Investor-ready pitch decks, financial waterfall projections, co-production tax incentives, and grant filings.',
    leadTimeLabel: '10–14 day sprint', relatedSlugs: ['script-development', 'legal-clearances-insurance'],
    scopeOptions: [],
    content: {
      tagline: 'Documents that help you raise money or win a commission.',
      specSheet: spec(['Standard deliverables', 'Logline and synopsis suite, pitch deck and lookbook, budget top sheet, investor pack'], ['Sprint turnaround', '10–14 days'], ['Revisions', 'Collaborative feedback rounds before final files']),
      audiences: [
        c('Independent Filmmakers', 'Directors and screenwriters seeking equity investors, grant subsidies or commissioning editors across regional and global networks.'),
        c('Production Agencies', 'Creative studios competing for high-value commercial retainers, multinational brand campaigns or prestige docuseries commissions.'),
        c('Showrunners & Producers', 'Executive teams mounting market presence at festival markets and co-production forums.'),
      ],
      deliverables: [
        c('Logline & Synopsis Suite', 'Festival, grant and buyer-ready narrative hooks, with one-line logline variations, a one-paragraph synopsis and a two-page treatment.'),
        c('Pitch Deck & Lookbook', "A bespoke 20–30 slide cinematic master deck with custom typography, colour palettes, moodboards and the director's statement."),
        c('Budget Top Sheet & Financing Plan', 'Executive-calibrated numbers that withstand financier scrutiny: production tier allocations, co-production waterfalls and rebate optimizations.'),
        c('Investor & Funder Pack', 'The full institutional dossier with one-page executive teasers, ROI sensitivity tables and distribution plans.'),
      ],
      steps: [
        c('Share Project', "Submit your screenplay, outline, director's notes or commercial brief under mutual NDA."),
        c('Agree Scope', 'An executive consultation to specify required deck components, target buyer profiles and grant metrics.'),
        c('Drafting', 'Our strategists and line producers engineer the deck, lookbook and budget top sheets.'),
        c('Revisions', 'Collaborative feedback rounds to hone positioning, tone, comps and financial projections.'),
        c('Final Files', 'Handover of presentations, print-ready PDF lookbooks and formula-intact financial spreadsheets.'),
      ],
      requirements: [
        c('Script or Concept', 'A completed screenplay, polished pilot, story outline or a two-page creative treatment.'),
        c('Budget Range', 'Estimated production scale and target initial funding thresholds.'),
        c('Target Pitch Audience', 'Whom you are pitching: private equity angels, regional film commissions, streaming buyers or brand sponsors.'),
      ],
      cta: { heading: 'Ready to package your project for market?' },
    },
  },
  {
    slug: 'equipment-locations-studio', code: 'SRV-PROD-006', name: 'Equipment, Locations & Studio', kind: 'MODULE', stage: 'SHOOT', stageLabel: 'Stage 3: Shoot', iconKey: 'video',
    shortDescription: 'High-spec Arri/RED camera kits, certified acoustic soundstages, private location clearances, and grip trucks.',
    leadTimeLabel: '3–7 business days', relatedSlugs: ['pre-production-planning', 'production-management'],
    scopeOptions: [
      ['camera-lighting-sound', 'Camera, lighting & sound equipment', 'Cinema camera systems, lighting packages, wireless audio kits and grip trucks calibrated for high-velocity productions.', null, 'Itemized manifest and technician assignment'],
      ['locations-permits', 'Location scouting & permits'],
      ['studio-hire', 'Studio hire'],
      ['props-wardrobe-set', 'Props, wardrobe & set design'],
    ],
    content: {
      specSheet: spec(['Standard deliverables', 'Itemized gear manifest, tech specs, scouting dossier, municipal permits, soundstage schedule'], ['Typical turnaround', '3–7 business days'], ['Logistics coverage', 'Insured transit, equipment prep bay access and on-call technical support']),
      audiences: [
        c('Productions with a Team Ready', 'Directors and cinematographers who already have key department heads locked but require high-calibre gear, soundstages and locations.'),
        c('Visiting & International Shoots', 'Foreign or regional productions travelling to Lagos or West Africa that need verified gear, fixer clearance and municipal permits on arrival.'),
        c('Commercials & Content Studios', 'Brand agencies and content networks needing fully equipped acoustic soundstages, set fabrication and specialty production rentals.'),
      ],
      deliverables: [
        c('Quote and Booking for What You Choose', 'Transparent itemized daily and weekly rental rates with no hidden surcharges. Locked reservations on booking.'),
        c('Delivery or Access Arrangements', 'Full logistics coordination: secure transport of gear, set-in insured flight racks and confirmed studio or location access.'),
        c('Returns and De-rig Plan', 'Pre-scheduled wrap returns, gear check-in manifests and on-set team assistance with de-rigging.'),
        c('On-set Backup & Swap Guarantee', 'Technical replacement targeted within 3 hours for damaged or malfunctioning equipment during principal photography.'),
      ],
      steps: [
        c('Tell Us What You Need', 'Submit your gear list, shooting dates, location requirements or soundstage specs.'),
        c('We Send Options & Prices', 'Receive an itemized quote within 24 hours, with alternatives and availability.'),
        c('You Approve', 'Confirm the manifest and lock the reservation with the agreed deposit.'),
        c('We Book & Dispatch', 'Contracts executed, equipment prepped and calibrated, locations and permits secured.'),
      ],
      requirements: [
        c('Shoot Dates & Duration', 'Principal photography days, camera checkout slots and scheduled wrap or return windows.'),
        c('Locations or Space Needed', 'Acoustic soundstage, green screen, white cyc, industrial or exterior, or a specific architectural era for scouting.'),
        c('Manifest or Spec Level', 'A detailed gear list, or desired resolution, sensor size and lighting style if you want our producer to architect the gear list.'),
        c('Power & Transport Needs', 'On-location silent soundproof generators, grip van logistics, or remote off-grid site transport support.'),
      ],
      cta: { heading: 'Ready to secure your gear and stages?' },
    },
  },
  {
    slug: 'production-management', code: 'SRV-PROD-007', name: 'Production Management', kind: 'MODULE', stage: 'SHOOT', stageLabel: 'Stage 3: Shoot', iconKey: 'clipboard',
    shortDescription: 'On-set line production oversight, daily call sheets, union compliance, guild catering, and real-time contingency logs.',
    leadTimeLabel: '48–72 hour mobilization', relatedSlugs: ['equipment-locations-studio', 'post-production'],
    scopeOptions: [
      ['full-turnkey-management', 'Full turnkey management (UPM + ADs + base)', 'A frontline production unit: Unit Production Manager, 1st and 2nd ADs, key production assistants and a unit base manager.', '48-hour deployment', 'Call sheets, DPRs and logs'],
      ['ad-floor', '1st AD & floor direction'],
      ['logistics-transport', 'Logistics, transport & hospitality'],
      ['base-security-medics', 'Unit base, security & medics'],
      ['reporting-wrap', 'Daily reporting & wrap reconciliation'],
    ],
    content: {
      specSheet: spec(['Standard deliverables', 'Daily call sheets, DPRs, cost variance tracking, transit and unit base logs'], ['Mobilization', '48–72 hours'], ['Coverage', 'Lagos • Abuja • Accra']),
      audiences: [
        c('Production Companies Needing Ground Execution', 'Established domestic or international studios that need production managers to run day-to-day operations in Nigeria and West Africa.'),
        c('First-Time & Indie Producers', 'Independent creators with financing and a script but no battle-tested unit production managers, to avoid budget bleed and chaotic call sheets.'),
        c('Commercial & High-Velocity Shoots', 'Brand campaigns, music videos and multi-location episodic runs needing tight turnaround, curfew management and vendor reconciliation.'),
      ],
      deliverables: [
        c('Set Leadership', 'A dedicated executive line team on the floor, maintaining pace, enforcing guild turnarounds and directing background talent.'),
        c('Daily Schedule, Logistics & Budget Tracking', 'Daily call sheets, fleet dispatch, artisan catering, hotel blocks and real-time variance cost reporting.'),
        c('Safety, Compliance & Unit Base Control', 'Set security, trauma medics, local municipal police escorts where required, and curfew clearances.'),
        c('Daily Reports (DPR) & Final Wrap Reconciliation', 'Wrap sheets, footage counts, equipment return sign-offs and the final expenditure breakdown.'),
      ],
      steps: [
        c('Share Your Plan', 'Submit your approved budget, shooting schedule, script and department heads roster.'),
        c('Team Confirmed', 'Assignment of your dedicated UPM, 1st AD and logistics coordinator calibrated to your genre and scale.'),
        c('We Run the Shoot', 'On-set execution from unit call to camera roll and stage curfew.'),
        c('Daily Reports', 'Itemized DPRs every night with scene counts, footage tallies, meal breaks and petty cash logs.'),
        c('Wrap Report', 'Post-production handoff package with vendor clearance receipts, talent releases and final budget reconciliation.'),
      ],
      requirements: [
        c('Shooting Schedule & Calendar', 'Principal photography dates, prep days, travel windows and contingency days.'),
        c('Approved Budget & Expense Limits', 'Overall production cap, daily department petty cash ceilings, overtime limits and emergency release signers.'),
        c('Call Sheets or Stripboard', 'Draft call sheets, scene orders or script breakdown if already generated.'),
        c('Key People & Department Leads', 'Attached director, 1st AD, DP, sound mixer and lead contact details for comms and booking.'),
      ],
      cta: { heading: 'Ready to run an airtight shoot?' },
    },
  },
  {
    slug: 'post-production', code: 'SRV-PROD-008', name: 'Post-Production', kind: 'MODULE', stage: 'FINISH', stageLabel: 'Stage 4: Finish', iconKey: 'sliders',
    shortDescription: 'Offline editorial assemblies, Dolby Atmos theatrical audio mixing, 4K HDR color mastering, and visual effects finishing.',
    leadTimeLabel: '10–28 business days', relatedSlugs: ['production-management', 'release-readiness'],
    scopeOptions: [
      ['editing', 'Offline & online picture editing', 'Assembly and rough cut to locked edit, with senior editors working alongside directors on pacing and rhythm.', '7–18 business days', 'Assembly cut, director’s cut, locked picture and EDL/XML handoff'],
      ['colour-grading', 'Colour grading'],
      ['sound-design-mixing', 'Sound design & mixing'],
      ['music-licensing', 'Music & licensing support'],
      ['vfx-graphics-titles', 'Visual effects, graphics & titles'],
      ['subtitles-localization', 'Subtitles & localization'],
    ],
    content: {
      specSheet: spec(['Standard deliverables', 'ProRes 4444 XQ and 422 HQ masters, Dolby Atmos and 5.1 print masters, DCI-compliant DCP, clean M&E tracks'], ['Typical turnaround', '10–28 business days'], ['Revisions', '2 full rounds included']),
      audiences: [
        c('Filmmakers & Indie Directors', 'Directors and producers with raw footage needing narrative assembly, rhythm polish, colour science and evocative soundscapes for festival and cinema standards.'),
        c('Commercial Agencies & Brands', 'High-velocity campaigns requiring tight turnaround, dynamic motion graphics, sound design punch and social aspect ratio adaptations.'),
        c('Streamers & International Co-Productions', 'Episodic and feature projects needing rigorous streaming platform QC, HDR Dolby Vision grading, M&E stems and multilingual subtitle packages.'),
      ],
      deliverables: [
        c('Edit Reviews with Revision Rounds', 'Structured collaborative review with timecoded markup and 2 guaranteed revision rounds.'),
        c('Colour Grading & Look Design', 'Colour grading for HDR and SDR on calibrated reference displays, with custom show LUTs and shot-to-shot balancing.'),
        c('Spatial Sound Design & Licensing', 'Sound effects design, foley, dialogue cleaning and ADR, music score synchronization and Dolby Atmos 7.1.4 immersive mix.'),
        c('Final Master Files in All Formats', 'Complete delivery bundle: ProRes masters, clean M&E, audio stems, VFX plates, motion graphics archives and timed SRT/VTT subtitle files.'),
      ],
      steps: [
        c('Send Footage', 'Ship physical high-speed drives or upload to our high-bandwidth portal.'),
        c('Agree Scope', 'A discovery session to confirm deliverables, creative references, sound design ambition and exhibition platforms.'),
        c('First Cut', 'Our editors build the first assembly and deliver it for director feedback.'),
        c('Revisions', 'Two structured revision rounds to fine-tune scene rhythm, dialogue cuts and transitions, then lock picture and hand off to sound and grade.'),
        c('Final Delivery', 'Full conform, colour master, sound mixdown and delivery of uncompressed masters with a certified QC report.'),
      ],
      requirements: [
        c('Footage & Sound Rolls', 'Camera RAW or proxy files, organized by shoot day and camera card, with dual-system sound and sound report logs.'),
        c('Script or Notes', 'Final shooting script, script supervisor daily notes, director preferred takes and scene breakdown memos.'),
        c('Creative References', 'Lookbook references, moodboards, benchmark film clips for colour grade and rhythm pacing benchmarks.'),
        c('Where Film Will Be Shown', 'Exhibition targets: theatrical cinema, streaming, broadcast, festival DCP or social mobile 9:16 specs.'),
      ],
      cta: { heading: 'Ready to finish your film or campaign?' },
    },
  },
  {
    slug: 'legal-clearances-insurance', code: 'SRV-PROD-009', name: 'Legal, Clearances & Insurance', kind: 'MODULE', stage: 'CROSS', stageLabel: 'All Stages: Governance', iconKey: 'shield',
    shortDescription: 'Chain of title verification, music synchronization licensing, production insurance policies, and actor waivers.',
    leadTimeLabel: '3–10 business days', relatedSlugs: ['funding-pitch-materials', 'release-readiness'],
    scopeOptions: [
      ['turnkey-legal-insurance', 'Turnkey legal & insurance', 'Agreement, release, clearance and insurance binding for principal photography through post-production and delivery.', '5–10 business days'],
      ['deal-memos', 'Cast & crew deal memos'],
      ['location-releases', 'Location releases & permits'],
      ['music-sync-archival', 'Music sync & archival'],
      ['insurance-brokerage', 'Insurance brokerage (COI)'],
      ['chain-of-title', 'Chain of title & rights'],
    ],
    content: {
      specSheet: spec(['Standard deliverables', 'Deal memos and standard agreements, chain of title dossier, synchronization licensing, production insurance package'], ['Typical turnaround', '3–10 business days; 48-hour fast-track for emergency clearances'], ['Jurisdictions', 'Nigeria, ECOWAS, UK, US and international streaming co-productions']),
      audiences: [
        c('Filmmakers & Independent Creators', 'Directors and producers needing water-tight cast and crew releases, location permits and clean chain of title for streamers, festivals and sales agents.'),
        c('Production Companies & Co-Productions', 'Studio units handling multi-party co-production treaties, cross-border tax incentives and union or guild compliance.'),
        c('Commercial Brands & Agencies', 'Ad agencies and brands running campaigns that need music sync rights, archival footage clearance and talent buyout agreements.'),
      ],
      deliverables: [
        c('Cast, Crew and Location Agreements', 'Vetted deal memos, non-disclosure agreements, standard cast day contracts, minor performer protections and location property releases.'),
        c('Music and Footage Licences', 'Master and synchronization licences for commercial tracks, public domain verifications, archival newsreel clearances and fair-use legal evaluations.'),
        c('Rights and Copyright Support', 'Chain of title assembly, script option agreements, copyright registration and trademark clearance for on-set props and wardrobe.'),
        c('Production Insurance', 'Comprehensive general liability, equipment floater and transit coverage, key-person cast insurance, and Errors & Omissions (E&O) policies.'),
      ],
      steps: [
        c('Tell Us What You Need', 'Submit your production brief, shoot timeline, script and list of required agreements or insurance policies.'),
        c('We Prepare or Arrange Documents', 'Our coordinators and broker partners draft agreements, negotiate licensing rates and structure insurance binders.'),
        c('You Review and Sign', 'Review documents, sign through a secure e-signature process, and receive your locked, distribution-ready legal binder.'),
      ],
      requirements: [
        c('Project Details', 'Synopsis, production type, total budget, shooting calendar, locations and planned distribution territories.'),
        c('Names of People Involved', 'Attached key cast, heads of department, crew headcount, composers, stunt performers and location owners.'),
        c('Existing Agreements', 'Any signed writer agreements, underlying literary option contracts, existing insurance policies or draft deal memos.'),
      ],
      assurance: { title: 'Legal notice & regulatory advisory', body: 'This service supports your production and is not a substitute for independent legal advice. Stonovah provides production management workflows, standardized industry documentation and clearance administration in coordination with accredited insurance brokers and licensed legal practitioners in each operative jurisdiction.' },
      cta: { heading: 'Protect your production before cameras roll' },
    },
  },
  {
    slug: 'release-readiness', code: 'SRV-PROD-010', name: 'Release Readiness', kind: 'MODULE', stage: 'RELEASE', stageLabel: 'Stage 5: Release', iconKey: 'award',
    shortDescription: 'DCI-compliant DCP cinema masters, festival screener packages, broadcast network QC, and delivery deliverables.',
    leadTimeLabel: '7–21 business days', relatedSlugs: ['post-production', 'legal-clearances-insurance'],
    scopeOptions: [
      ['key-art-trailer', 'Key art, posters & trailer', 'Theatrical key art, campaign posters and an official trailer built to commercially position your project.', '10–14 business days', 'Theatrical one-sheet, 1080p/4K trailer, social bundles'],
      ['epk', 'Electronic press kit (EPK)'],
      ['festival-submission', 'Festival submission suite'],
      ['cinema-platform-delivery', 'Cinema & platform delivery (DCP/ProRes)'],
      ['full-turnkey-release', 'Full turnkey release package'],
    ],
    content: {
      specSheet: spec(['Standard deliverables', 'Theatrical posters, 4K official trailer and teasers, production stills archive, electronic press kit, festival master DCP, platform delivery manifest'], ['Typical turnaround', '7–21 business days; rush festival submission turnaround available'], ['Revisions', '2 full creative passes']),
      audiences: [
        c('Independent Filmmakers & Festival Hopefuls', 'Creators with a completed picture lock who need a magnetic promotional campaign, high-energy festival cutdowns and an airtight EPK.'),
        c('Commercial Studios & Producers', 'Feature and episodic productions requiring complete theatrical distribution deliverables, title graphics and press-ready media kits.'),
        c('Streaming & Broadcast Licensees', 'Content producers holding distribution deals that require strict delivery compliance: DCI-compliant DCPs, ProRes masters, M&E audio alignment and platform-spec localized key art.'),
      ],
      deliverables: [
        c('Poster, Stills & Trailer', 'Official theatrical one-sheets, character banners, motion posters, on-set production stills, and a 4K official trailer designed to convert viewers.'),
        c('Press Kit (EPK) & Media Dossier', 'A digital Electronic Press Kit with cast and director bios, synopsis variations, production notes and downloadable press photography.'),
        c('Festival Submission Support', 'Strategy, curation and submission packaging for international film festivals, with screener watermarking.'),
        c('Platform & Cinema Delivery', 'Fully verified exhibition packages meeting strict technical guidelines for theatrical DCI-compliant DCPs, SMPTE IMF packages and uncompressed broadcast archives.'),
      ],
      steps: [
        c('Share Finished Project', 'Provide your locked picture, final cut, sound stems and production notes via an encrypted high-speed drive or portal.'),
        c('Agree Materials', 'Strategy briefing on target release channels (theatrical, streaming, festival circuits) and deliverable specs.'),
        c('Drafts & Creative Rounds', 'Review initial key art concepts, poster directions, trailer rough cuts and EPK drafts with frame-accurate review links.'),
        c('Final Files & Technical QC', 'Conforming visuals to uncompressed masters, authoring theatrical DCPs and running broadcast compliance checks.'),
        c('Handover & Archive', 'Delivery of your complete distribution-ready vault, with certified delivery logs for immediate festival dispatch or buyer delivery.'),
      ],
      requirements: [
        c('Final Cut & Audio Stems', 'Locked picture (ProRes 422 HQ or 4444 XQ), clean dialogue, music and effects stems, and subtitle timed files.'),
        c('Existing Artwork & Press Material', 'High-resolution unit still photography, on-set production notes, cast list, credits roll and any previous festival screening laurels.'),
      ],
      cta: { heading: 'Ready to take your project to global screens?', body: 'Once your release assets are locked, bridge into theatrical, streaming and worldwide content sales through Stonovah Distribution.' },
    },
  },
];

const STAGE_RANK = { DEVELOP: 1, PREPARE: 2, SHOOT: 3, FINISH: 4, RELEASE: 5, CROSS: 6 };

const BASE = RAW.map((r) => ({
  id: `default-${r.slug}`, badge: null, heroUrl: null, leadTimeDays: null, formats: ALL, inPackageBuilder: true, media: [], tiers: [],
  ...r,
  tiers: (r.tiers ?? []).map((t, i) => ({ id: `default-${r.slug}-tier-${i}`, fromPriceKobo: null, ...t })),
  scopeOptions: (r.scopeOptions ?? []).map((o) => (Array.isArray(o) ? opt(r.slug, ...o) : o)),
  isDefault: true,
}));

const card = (s) => ({ id: s.id, slug: s.slug, name: s.name, stage: s.stage, stageLabel: s.stageLabel, shortDescription: s.shortDescription, iconKey: s.iconKey });
const MODULES = BASE.filter((s) => s.kind === 'MODULE').sort((a, b) => STAGE_RANK[a.stage] - STAGE_RANK[b.stage]); // stable: keeps list order inside a stage

export const DEFAULT_SERVICE_CARDS = MODULES.map(card);

export function getDefaultService(slug) {
  const s = BASE.find((x) => x.slug === slug);
  if (!s) return null;
  const related = (s.relatedSlugs ?? []).map((x) => BASE.find((b) => b.slug === x)).filter(Boolean).map(card);
  if (s.kind !== 'MODULE') return { ...s, related, prev: null, next: null };
  const i = MODULES.findIndex((x) => x.slug === slug);
  return { ...s, related, prev: i > 0 ? card(MODULES[i - 1]) : null, next: i < MODULES.length - 1 ? card(MODULES[i + 1]) : null };
}

// ───── project types ─────

const TYPE_SERVICES = {
  film: ['script-development', 'crew-cast-sourcing', 'equipment-locations-studio', 'production-management', 'post-production', 'release-readiness'],
  tv: ['script-development', 'pre-production-planning', 'crew-cast-sourcing', 'production-management', 'post-production', 'release-readiness'],
  commercials: ['script-development', 'pre-production-planning', 'equipment-locations-studio', 'production-management', 'post-production', 'release-readiness'],
};

export const DEFAULT_TYPES = [
  {
    slug: 'film', name: 'Film', summary: 'Short & feature films, documentaries.', formats: ['FEATURE_FILM', 'DOCUMENTARY'],
    content: {
      code: '01', heroTitle: 'Film Production Packaging',
      heroSubtitle: 'From indie discovery to studio-level theatrical features. We structure physical execution, co-production slates, festival qualification and DCP theatrical mastering for directors and producers.',
      primaryFocus: { title: 'Short & Feature Films, Documentaries', description: 'Narrative arcs, feature cinema screenplays, micro-budget breakthrough slates and investigative long-form documentaries.', runtimeLabel: '15m – 180m' },
      lifecycle: { title: 'Indicative 24-week theatrical lifecycle', phases: [{ weeks: 'Weeks 1–6', label: 'Package & Crew' }, { weeks: 'Weeks 7–14', label: 'Principal Shoot' }, { weeks: 'Weeks 15–20', label: 'Post & Atmos Mix' }, { weeks: 'Weeks 21–24', label: 'DCP & Premiere' }] },
    },
  },
  {
    slug: 'tv', name: 'TV', summary: 'Web & television series, television shows.', formats: ['TV_SERIES'],
    content: {
      code: '02', heroTitle: 'TV Production Packaging',
      heroSubtitle: 'Scalable multi-camera studio setups, showrunner season bible packaging, episodic writer rooms and broadcast QC clearances for series and shows.',
      primaryFocus: { title: 'Web & Television Series, Television Shows', description: 'Scalable multi-cam studio setups, showrunner season bible packaging, episodic writer rooms and strict SVOD broadcast QC clearances.', runtimeLabel: 'Pilot to full season' },
    },
  },
  {
    slug: 'commercials', name: 'Commercials', summary: 'Adverts and brand films.', formats: ['COMMERCIAL', 'MUSIC_VIDEO'],
    content: {
      code: '03', heroTitle: 'Commercial Production Packaging',
      heroSubtitle: 'High-impact adverts, brand manifestos and social spec reels, delivered on accelerated sprint timelines with agency sign-off and multi-aspect masters.',
      primaryFocus: { title: 'Adverts & Brand Films', description: 'High-concept adverts, luxury brand manifestos and global social spec reels. Accelerated 3-week sprint delivery, agency storyboard sign-off, multi-aspect deliverables (16:9, 9:16, 1:1, 4:5) and media buy master packaging.', runtimeLabel: '15s – 3m' },
    },
  },
];

export function getDefaultType(slug) {
  const t = DEFAULT_TYPES.find((x) => x.slug === slug);
  if (!t) return null;
  const services = (TYPE_SERVICES[slug] ?? []).map((s) => BASE.find((b) => b.slug === s)).filter(Boolean).map(card);
  return { ...t, services, featured: [], isDefault: true };
}

// Stage cards for the "Unified production engine" section on the Full Package page.
export const DEFAULT_ENGINE_STAGES = [
  { stage: 'DEVELOP', label: 'Develop', blurb: 'Foundational IP • Script architecture' },
  { stage: 'PREPARE', label: 'Prepare', blurb: 'Crew rosters • Shoot logistics' },
  { stage: 'SHOOT', label: 'Shoot', blurb: 'Line management • Certified hardware' },
  { stage: 'FINISH', label: 'Finish', blurb: 'Colour suites • Dolby Atmos' },
  { stage: 'RELEASE', label: 'Release', blurb: 'Broadcast masters • Screener suites' },
];