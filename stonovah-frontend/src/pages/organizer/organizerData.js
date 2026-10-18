const H = 3600000;
const D = 24 * H;
const NOW = Date.now();
const iso = (days, h = 19, m = 0) => {
  const d = new Date(NOW + days * D);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

// Read-only platform rules (set by admin in Payout & Service Fee Settings)
export const PLATFORM = { feeRate: 2, advancePct: 40, advanceCapacityPct: 50, advanceDaysBefore: 7, clearingTime: '23:00', allowFeeChoice: true };

export const ORG = { id: 'ORG-001', legalName: 'Monolith Studios Ltd', registry: 'RC-1849204', type: 'business', tier: 'Tier-1 Enterprise', verified: true };

// Same four designs the create-event wizard offers
export const BASE = {
  obsidian: { name: 'Obsidian Minimalist', code: 'OBS-01', brand: 'STONOVAH LIVE' },
  sovereign: { name: 'Sovereign Gala Foil', code: 'SOV-09', brand: 'SOVEREIGN ATELIER' },
  neon: { name: 'Neon Soundstage', code: 'SND-04', brand: 'ALL ACCESS ARENA' },
  classic: { name: 'Classic Orchestral Ticket', code: 'ORC-12', brand: 'ORCHESTRAL SYMPHONY HALL' },
};

export const ORDER_STATUS = {
  paid: { label: 'Paid', tone: 'green' },
  pending: { label: 'Pending', tone: 'amber' },
  failed: { label: 'Failed', tone: 'red' },
  refunded: { label: 'Refunded', tone: 'grey' },
  refund_requested: { label: 'Refund Requested', tone: 'amber' },
};

export const EVENT_STATUS = {
  live: { label: 'Live', tone: 'green' },
  pending: { label: 'Pending Approval', tone: 'amber' },
  ended: { label: 'Ended', tone: 'grey' },
  draft: { label: 'Draft', tone: 'grey' },
};

/* ---------------- events ---------------- */
export const seedEvents = [
  { id: 'EVT-OBS', title: 'Obsidian Gala & Sovereign Film Premiere', venue: 'Lumière Hall, London', status: 'live', date: new Date(NOW - 2 * H).toISOString(), currency: '£', feeModel: 'organizer', base: 'sovereign', advanceReleased: true,
    tiers: [{ name: 'Regular Admission', units: 420, price: 45 }, { name: 'VIP Sovereign Circle', units: 140, price: 120 }, { name: 'Royal Executive Suite', units: 30, price: 350 }, { name: 'Community Guest RSVP', units: 60, price: 0 }] },
  { id: 'EVT-AFRO', title: 'Echoes of Afrobeat: Live Orchestral Showcase', venue: 'Royal Albert Hall, London', status: 'pending', date: iso(30), currency: '£', feeModel: 'organizer', base: 'obsidian', advanceReleased: false,
    tiers: [{ name: 'Regular Standing (Stalls)', units: 1500, price: 45 }, { name: 'VIP Royal Circle', units: 250, price: 120 }, { name: 'Orchestral Box', units: 50, price: 280 }, { name: 'Community Free RSVP', units: 200, price: 0 }] },
  { id: 'EVT-STUDIO', title: 'Monolith Studio Sessions Live', venue: 'London Studio Residency', status: 'ended', date: iso(-9), currency: '£', feeModel: 'buyer', base: 'obsidian', advanceReleased: true,
    tiers: [{ name: 'General Admission', units: 250, price: 35 }] },
  { id: 'EVT-JAZZ', title: 'Harmattan Jazz Nights', venue: 'Landmark Centre, Lagos', status: 'live', date: iso(12, 20), currency: '£', feeModel: 'buyer', base: 'classic', advanceReleased: false,
    tiers: [{ name: 'Standard Seat', units: 180, price: 30 }, { name: 'Front Row', units: 60, price: 75 }] },
  { id: 'EVT-2024-SYM', title: 'Pan-African Classical Symphony 2024', venue: 'Barbican Hall, London', status: 'ended', date: iso(-300), currency: '£', feeModel: 'organizer', base: 'classic', legacyTickets: 4200, tiers: [] },
  { id: 'EVT-2023-NEON', title: 'Neon Soundstage Night', venue: 'The Atrium, Lagos', status: 'ended', date: iso(-520), currency: '£', feeModel: 'organizer', base: 'neon', legacyTickets: 1800, tiers: [] },
];

/* ---------------- deterministic demo orders ---------------- */
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const PEOPLE = ['Femi Adeleke', 'Elena Mensah', 'Marcus Vance', 'Sarah Beats', 'David Oladipo', 'Amara Okafor', 'Tunde Bakare', 'Zainab Balogun', 'Chidi Okonkwo', 'Seraphina Thorne', 'Archie Sterling-Vance', 'Kaelen Nnamdi', 'Margot Dubois', 'Ngozi Eze', 'Kojo Mensah', 'Ifeoma Nwosu', 'Segun Adebayo', 'Tariq James', 'Grace Eze', 'Yusuf Bello', 'Naomi Clarke', 'Oliver Hughes', 'Sade Williams'];
const specs = [
  { ev: 'EVT-OBS', n: 110, from: -14, to: -0.05, seed: 11, w: [0.65, 0.22, 0.05, 0.08], max: [6, 4, 2, 2] },
  { ev: 'EVT-STUDIO', n: 60, from: -30, to: -10, seed: 23, w: [1], max: [6] },
  { ev: 'EVT-JAZZ', n: 45, from: -10, to: -0.05, seed: 37, w: [0.75, 0.25], max: [6, 4] },
];

export function genOrders() {
  const raw = [];
  specs.forEach((s) => {
    const ev = seedEvents.find((e) => e.id === s.ev);
    const rand = rng(s.seed);
    const left = ev.tiers.map((t) => t.units);
    for (let i = 0; i < s.n; i++) {
      const r = rand();
      let ti = s.w.findIndex((_, k) => r <= s.w.slice(0, k + 1).reduce((a, b) => a + b, 0));
      if (ti < 0) ti = s.w.length - 1;
      const t = ev.tiers[ti];
      const qty = 1 + Math.floor(rand() * s.max[ti]);
      const at = NOW + (s.from + rand() * (s.to - s.from)) * D;
      const name = PEOPLE[Math.floor(rand() * PEOPLE.length)];
      const x = rand();
      let status = 'paid';
      if (x < 0.05) status = 'refunded';
      else if (x < 0.08 && NOW - at < 2 * D) status = 'pending';
      else if (x < 0.11) status = 'failed';
      if (status === 'paid') {
        if (left[ti] < qty) continue;
        left[ti] -= qty;
      }
      raw.push({ eventId: ev.id, tier: t.name, qty, unit: t.price, name, email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`, createdAt: at, status });
    }
  });
  raw.sort((a, b) => a.createdAt - b.createdAt);
  return raw.map((o, i) => ({ id: `#ORD-${90100 + i}`, ...o })).reverse();
}

export function genAttendees(orders) {
  const rate = { 'EVT-OBS': 0.62, 'EVT-STUDIO': 0.91, 'EVT-JAZZ': 0 };
  const rand = rng(77);
  const out = [];
  [...orders].reverse().filter((o) => o.status === 'paid').forEach((o) => {
    for (let i = 0; i < o.qty; i++) {
      out.push({ id: `${o.id}-${i + 1}`, orderId: o.id, eventId: o.eventId, tier: o.tier, name: i === 0 ? o.name : `${o.name.split(' ')[0]}'s guest ${i}`, email: o.email, checkedIn: rand() < (rate[o.eventId] || 0) });
    }
  });
  return out;
}

/* ---------------- money helpers ---------------- */
export const soldCount = (orders, eventId, tier) =>
  orders.filter((o) => o.eventId === eventId && o.status === 'paid' && (!tier || o.tier === tier)).reduce((s, o) => s + o.qty, 0);
export const capOf = (e) => e.tiers.reduce((s, t) => s + t.units, 0);

export const finance = (e, orders, p = PLATFORM) => {
  const mine = orders.filter((o) => o.eventId === e.id);
  const gross = mine.filter((o) => o.status === 'paid').reduce((s, o) => s + o.qty * o.unit, 0);
  const refunded = mine.filter((o) => o.status === 'refunded').reduce((s, o) => s + o.qty * o.unit, 0);
  const fee = (gross * p.feeRate) / 100;
  return { gross, refunded, fee, orgFee: e.feeModel === 'organizer' ? fee : 0, buyerFee: e.feeModel === 'buyer' ? fee : 0, net: e.feeModel === 'organizer' ? gross - fee : gross };
};

export function buildPayouts(events, orders) {
  const out = [];
  events.filter((e) => e.advanceReleased).forEach((e, i) => {
    const f = finance(e, orders);
    const adv = Math.round(((f.net * PLATFORM.advancePct) / 100) * 100) / 100;
    const evT = new Date(e.date).getTime();
    out.push({ id: `PAY-A${i + 1}`, eventId: e.id, kind: 'advance', amount: adv, status: 'paid', date: evT - 8 * D, ref: `TXN-BNK-ADV-${e.id.slice(4)}` });
    out.push(e.status === 'ended'
      ? { id: `PAY-F${i + 1}`, eventId: e.id, kind: 'final', amount: f.net - adv, status: 'paid', date: evT + D, ref: `TXN-BNK-FIN-${e.id.slice(4)}` }
      : { id: `PAY-F${i + 1}`, eventId: e.id, kind: 'final', amount: f.net - adv, status: 'pending', date: null, ref: null });
  });
  return out;
}

/* ---------------- template library, settings, team ---------------- */
export const seedTemplates = [
  { id: 'MT-001', base: 'sovereign', nickname: 'Gala Night Gold', favorite: true, archived: false, layers: { venueMap: true, barcodeLines: true, securityHash: true }, usage: ['EVT-OBS'] },
  { id: 'MT-002', base: 'obsidian', nickname: '', favorite: false, archived: false, layers: { venueMap: false, barcodeLines: true, securityHash: true }, usage: ['EVT-STUDIO', 'EVT-AFRO'] },
  { id: 'MT-003', base: 'classic', nickname: 'Symphony Stub', favorite: true, archived: false, layers: { venueMap: true, barcodeLines: false, securityHash: true }, usage: ['EVT-JAZZ', 'EVT-2024-SYM'] },
  { id: 'MT-004', base: 'neon', nickname: '', favorite: false, archived: false, layers: { venueMap: false, barcodeLines: true, securityHash: false }, usage: ['EVT-2023-NEON'] },
];

export const seedSettings = {
  profile: { displayName: 'Monolith Studios', publicEmail: 'hello@monolithstudios.example', phone: '+234 803 000 0000', website: 'https://monolithstudios.example', about: 'Live productions, film premieres and orchestral showcases across Lagos and London.', logo: null },
  prefs: { feeModel: 'organizer', currency: '£', timezone: 'Africa/Lagos', defaultTemplate: 'sovereign', lowStockPct: 90 },
  notifs: { newOrder: true, refundUpdates: true, payoutSent: true, eventDecision: true, dailySummary: false, lowInventory: true, sms: false },
};
export const seedTeam = [
  { id: 'M-1', name: 'Ayodeji Marcus Adeleke', email: 'executive@monolithstudios.example', role: 'Owner', status: 'active' },
  { id: 'M-2', name: 'Chioma Eze', email: 'finance@monolithstudios.example', role: 'Finance', status: 'active' },
  { id: 'M-3', name: 'Tobi Gate', email: 'gate@monolithstudios.example', role: 'Gate Staff', status: 'invited' },
];
export const seedSessions = [
  { id: 'S-1', device: 'Chrome on Windows', loc: 'Lagos, NG', last: 'Active now', current: true },
  { id: 'S-2', device: 'Safari on iPhone', loc: 'Lagos, NG', last: '2 hours ago' },
  { id: 'S-3', device: 'Edge on Windows', loc: 'London, UK', last: '3 days ago' },
];
export const seedBank = { name: 'Settlement bank on file', last4: '3749', accountName: 'Monolith Studios Escrow Account', status: 'verified', pending: null };