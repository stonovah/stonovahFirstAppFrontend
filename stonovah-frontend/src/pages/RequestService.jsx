// src/pages/RequestService.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiChevronRight } from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { AttachmentPicker, RequestSuccess, useRequestSubmit, emailOk, today } from '../components/forms/RequestForm';

const TIERS = [
  ['Full Event Coordination', 'End-to-end stage direction, rigging, vendor procurement, VIP logistics and ground operations.'],
  ['Broadcast & Media Only', 'Multi-camera capture, live streaming and cloud delivery for your event.'],
  ['Ticketing & Gate Management', 'Ticket sales, QR gate scanning and live attendance numbers.'],
  ['Press & Media Syndication', 'Press accreditation, live asset distribution and PR syndication.'],
];
const MODULES = [
  ['Audio & acoustics rigging', 'Line arrays, monitoring and venue sound tuning.'],
  ['Live broadcast & streaming', 'Multi-camera switching and live distribution.'],
  ['Stage & scenography', 'LED walls, trusses and lighting design.'],
  ['VIP security & crowd logistics', 'Escorts, barriers and perimeter control.'],
  ['Artist hospitality & catering', 'Green rooms, travel and catering.'],
  ['Ticketing & gate entry', 'QR ticket scanning and attendance reporting.'],
  ['Press desk & media ingest', 'Photo ingest and press-room distribution.'],
  ['Permits & municipal filings', 'Sound clearance, safety permits and emergency services.'],
];
const VENUES = ['Convention centre', 'Stadium / arena', 'Outdoor site', 'Other'];
const AUDIENCE = ['Under 1,000', '1,000 – 5,000', '5,000 – 15,000', '15,000+'];
const BUDGETS = ['$20K – $50K', '$50K – $150K', '$150K – $350K', '$350K+', 'Not sure yet'];
const empty = { tier: TIERS[0][0], name: '', org: '', email: '', phone: '', region: '', title: '', date: '', duration: '', modules: [], venueType: '', venueName: '', city: '', audience: '', exact: '', budget: '', notes: '' };

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';

// Local dark-styled form pieces (the shared ones in RequestForm are styled for the old yellow theme).
const inputCls =
  'w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-white placeholder:text-white/30 [color-scheme:dark] focus:border-red-500/60 focus:outline-none focus:ring-1 focus:ring-red-500/40';

const Field = ({ label, error, children }) => (
  <label className="block space-y-2">
    <span className={`${mono} block text-[9px] text-white/50`}>{label}</span>
    {children}
    {error && <span className="block text-xs font-semibold text-red-400">{error}</span>}
  </label>
);

const Step = ({ n, title, sub, children }) => (
  <section className="space-y-5 rounded-xl border border-white/[0.07] bg-[#161616] p-6 md:p-8">
    <div className="flex items-start gap-4 border-b border-white/5 pb-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] font-mono text-sm font-bold text-red-500">{n}</span>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-white/50">{sub}</p>}
      </div>
    </div>
    {children}
  </section>
);

// className controls padding and layout (defaults to p-4).
const Chip = ({ on, onClick, className = 'p-4', children }) => (
  <div
    role="checkbox"
    aria-checked={on}
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onClick(); } }}
    className={`cursor-pointer rounded-xl border transition-colors ${
      on ? 'border-red-500/60 bg-[linear-gradient(135deg,#240607,#161616_60%)]' : 'border-white/10 bg-white/[0.02] hover:border-white/25'
    } ${className}`}
  >
    {children}
  </div>
);

export default function RequestService() {
  const [f, setF] = useState(empty);
  const [files, setFiles] = useState([]);
  const [touched, setTouched] = useState(false);
  const { submit, busy, error, done, reset, trapProps } = useRequestSubmit();
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const pick = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const toggle = (m) => setF((x) => ({ ...x, modules: x.modules.includes(m) ? x.modules.filter((y) => y !== m) : [...x.modules, m] }));

  const errs = {
    name: !f.name.trim() && 'Enter a contact person',
    org: !f.org.trim() && 'Enter your organization or brand',
    email: !emailOk(f.email) && 'Enter a valid email address',
    phone: f.phone.trim().length < 7 && 'Enter a phone number (at least 7 characters)',
    title: !f.title.trim() && 'Enter the event title',
    date: (!f.date || f.date < today()) && 'Choose today or a later date',
    modules: !f.modules.length && 'Choose at least one thing you need',
    venueType: !f.venueType && 'Choose a venue type',
    venueName: !f.venueName.trim() && 'Enter the venue name',
    city: !f.city.trim() && 'Enter the city',
    audience: !f.audience && 'Choose the expected audience',
    exact: f.exact && (Number(f.exact) < 1 || Number(f.exact) > 5000000) && 'Enter a number between 1 and 5,000,000',
    budget: !f.budget && 'Choose a budget range',
  };
  const valid = !Object.values(errs).some(Boolean);
  const show = (k) => (touched ? errs[k] : '');
  const err = (k) => show(k) && <p className="text-xs font-semibold text-red-400">{show(k)}</p>;

  useEffect(() => { if (done) { setF(empty); setFiles([]); setTouched(false); } }, [done]);

  const onSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || busy) return;
    submit({
      files,
      body: {
        contactName: f.name.trim(), organization: f.org.trim(), email: f.email.trim(), phone: f.phone.trim(),
        serviceNeeded: 'Event Coordination', eventType: f.tier, eventDate: f.date,
        location: `${f.venueName.trim()}, ${f.city.trim()}`,
        ...(f.exact && { audienceSize: Number(f.exact) }),
        budgetRange: f.budget,
        ...(f.notes.trim() && { message: f.notes.trim() }),
        expandedBrief: {
          serviceTier: f.tier, projectTitle: f.title.trim(), productionDuration: f.duration.trim() || undefined,
          modulesRequested: f.modules, venueType: f.venueType, venueName: f.venueName.trim(), venueCity: f.city.trim(),
          audienceTier: f.audience, headquarters: f.region.trim() || undefined,
        },
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased selection:bg-red-600 selection:text-white">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top_left,rgba(225,6,19,0.18),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-8">
          <div className={`${mono} mb-8 flex items-center gap-2 text-white/40`}>
            <span>Portal</span><FiChevronRight /><span>Events division</span><FiChevronRight /><span className="text-white/70">Commission form</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black uppercase leading-[0.95] tracking-tight md:text-5xl lg:text-6xl">
              Commission Stonovah <br /><span className="text-red-500">event coordination</span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/65">
              Describe your event and the support you need. We review every request and reply by email.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <form onSubmit={onSubmit} noValidate className="relative space-y-6 lg:col-span-2">
            <input {...trapProps} />

            <Step n="01" title="What do you need?">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {TIERS.map(([t, d]) => (
                  <Chip key={t} on={f.tier === t} onClick={() => pick('tier', t)}>
                    <b className="mb-2 block text-sm uppercase tracking-wide">{t}</b>
                    <p className="text-xs leading-relaxed text-white/55">{d}</p>
                  </Chip>
                ))}
              </div>
            </Step>

            <Step n="02" title="Contact & organization">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Contact person *" error={show('name')}><input autoComplete="name" maxLength={120} value={f.name} onChange={set('name')} className={inputCls} /></Field>
                <Field label="Organization / brand *" error={show('org')}><input autoComplete="organization" maxLength={160} value={f.org} onChange={set('org')} className={inputCls} /></Field>
                <Field label="Email *" error={show('email')}><input type="email" autoComplete="email" value={f.email} onChange={set('email')} className={inputCls} /></Field>
                <Field label="Phone *" error={show('phone')}><input type="tel" autoComplete="tel" maxLength={25} value={f.phone} onChange={set('phone')} placeholder="+234 …" className={inputCls} /></Field>
                <Field label="Based in (optional)"><input maxLength={120} value={f.region} onChange={set('region')} placeholder="City or region" className={inputCls} /></Field>
              </div>
            </Step>

            <Step n="03" title="Event details">
              <Field label="Event title *" error={show('title')}>
                <input maxLength={160} value={f.title} onChange={set('title')} className={`${inputCls} font-bold`} />
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Event date *" error={show('date')}><input type="date" min={today()} value={f.date} onChange={set('date')} className={inputCls} /></Field>
                <Field label="Production duration (optional)"><input maxLength={80} value={f.duration} onChange={set('duration')} placeholder="e.g. 14 hours, 10:00 – 24:00" className={inputCls} /></Field>
              </div>
            </Step>

            <Step n="04" title="What should we handle?" sub="Select all that apply.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {MODULES.map(([t, d]) => {
                  const on = f.modules.includes(t);
                  return (
                    <Chip key={t} on={on} onClick={() => toggle(t)} className="flex items-start gap-3 p-4">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${on ? 'border-red-500 bg-red-500 text-white' : 'border-white/20 bg-white/[0.04]'}`}>
                        {on && <FiCheck />}
                      </span>
                      <span>
                        <b className="mb-0.5 block text-xs uppercase tracking-wide">{t}</b>
                        <span className="block text-[11px] leading-tight text-white/50">{d}</span>
                      </span>
                    </Chip>
                  );
                })}
              </div>
              {err('modules')}
            </Step>

            <Step n="05" title="Venue">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {VENUES.map((v) => (
                  <Chip key={v} on={f.venueType === v} onClick={() => pick('venueType', v)} className="p-3 text-center text-xs font-bold uppercase tracking-wide">{v}</Chip>
                ))}
              </div>
              {err('venueType')}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Venue name *" error={show('venueName')}><input maxLength={120} value={f.venueName} onChange={set('venueName')} className={inputCls} /></Field>
                <Field label="City *" error={show('city')}><input maxLength={80} value={f.city} onChange={set('city')} className={inputCls} /></Field>
              </div>
            </Step>

            <Step n="06" title="Audience & budget">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {AUDIENCE.map((a) => (
                  <Chip key={a} on={f.audience === a} onClick={() => pick('audience', a)} className="p-4 text-center text-sm font-black uppercase">{a}</Chip>
                ))}
              </div>
              {err('audience')}
              <Field label="Exact expected attendance (optional)" error={show('exact')}>
                <input inputMode="numeric" value={f.exact} onChange={(e) => pick('exact', e.target.value.replace(/\D/g, ''))} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {BUDGETS.map((b) => (
                  <Chip key={b} on={f.budget === b} onClick={() => pick('budget', b)} className="p-3 text-center text-[11px] font-black uppercase">
                    {b} {b.startsWith('$') && 'USD'}
                  </Chip>
                ))}
              </div>
              {err('budget')}
              <Field label="Anything else we should know?">
                <textarea rows={3} maxLength={4000} value={f.notes} onChange={set('notes')} className={inputCls} />
              </Field>
              <AttachmentPicker files={files} onChange={setFiles} />
            </Step>

            {error && <p className="rounded-lg border border-red-500/30 bg-red-500/[0.07] p-3 text-xs font-semibold text-red-200">{error}</p>}
            {touched && !valid && <p className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs font-semibold text-white/70">Please fix the highlighted fields.</p>}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#e10613] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c40510] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Sending your request…' : <>Submit commission request <FiArrowRight className="text-sm" /></>}
            </button>
          </form>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="space-y-3 rounded-xl border border-white/[0.07] bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,19,0.14),#161616_60%)] p-6 text-xs">
                <h3 className={`${mono} border-b border-white/10 pb-3 text-red-400`}>Your request so far</h3>
                {[['Service', f.tier], ['Venue', [f.venueType, f.venueName, f.city].filter(Boolean).join(' • ')], ['Audience', f.exact ? `${Number(f.exact).toLocaleString()} people` : f.audience], ['Budget', f.budget]].map(([k, v]) => (
                  <div key={k}>
                    <span className={`${mono} block text-[9px] text-white/40`}>{k}</span>
                    <span className="mt-0.5 block font-bold">{v || '—'}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3">
                  <span className={`${mono} mb-2 block text-[9px] text-white/40`}>We will handle</span>
                  <div className="flex flex-wrap gap-1.5">
                    {f.modules.length
                      ? f.modules.map((m) => (
                          <span key={m} className="rounded border border-white/10 bg-white/[0.05] px-2 py-1 font-mono text-[9px] font-bold uppercase text-white/80">{m}</span>
                        ))
                      : <span className="text-white/40">Nothing selected yet</span>}
                  </div>
                </div>
                <p className="pt-2 text-[10px] text-white/40">Nothing is sent until you submit.</p>
              </div>

              <div className="space-y-1 rounded-xl border border-white/[0.07] bg-[#161616] p-6 text-xs">
                <span className={`${mono} block text-[9px] text-white/40`}>Prefer to write?</span>
                <a href="mailto:contact@stonovah.com" className="font-bold text-red-400 hover:text-red-300">contact@stonovah.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <RequestSuccess done={done} onClose={reset} />
    </main>
  );
}