// src/pages/NRequestService.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { AttachmentPicker, RequestSuccess, useRequestSubmit, emailOk, today } from '../components/forms/RequestForm';

const SERVICES = [
  ['coordination', 'Event Coordination', 'Stage logistics, show directors, stage management and crew.'],
  ['livestream', 'Livestream Coordination', 'Multi-camera broadcast and live distribution to your audience.'],
  ['media', 'Media Handling', 'Fast photography and video, press syndication and cloud delivery.'],
  ['ticketing', 'Ticketing Infrastructure', 'Ticket sales, QR gate scanning and live attendance numbers.'],
];
const CATEGORIES = ['Live concert / festival', 'Corporate keynote / summit', 'Cultural awards & gala', 'Virtual stream / studio', 'Other'];
const BUDGETS = ['$25,000 – $50,000 USD', '$50,000 – $150,000 USD', '$150,000 – $500,000 USD', '$500,000+ USD', 'Not sure yet'];
const empty = { services: [], name: '', email: '', phone: '', org: '', title: '', category: '', date: '', location: '', audience: '', budget: '', brief: '' };

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

const Chip = ({ on, onClick, children }) => (
  <div
    role="checkbox"
    aria-checked={on}
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onClick(); } }}
    className={`cursor-pointer rounded-xl border p-4 transition-colors ${
      on ? 'border-red-500/60 bg-[linear-gradient(135deg,#240607,#161616_60%)]' : 'border-white/10 bg-white/[0.02] hover:border-white/25'
    }`}
  >
    {children}
  </div>
);

export default function NRequestService() {
  const [params] = useSearchParams();
  const [f, setF] = useState(() => ({ ...empty, services: SERVICES.some(([id]) => id === params.get('service')) ? [params.get('service')] : [] }));
  const [files, setFiles] = useState([]);
  const [touched, setTouched] = useState(false);
  const { submit, busy, error, done, reset, trapProps } = useRequestSubmit();
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const toggle = (id) => setF((x) => ({ ...x, services: x.services.includes(id) ? x.services.filter((s) => s !== id) : [...x.services, id] }));

  const errs = {
    services: !f.services.length && 'Choose at least one service',
    name: !f.name.trim() && 'Enter your name',
    email: !emailOk(f.email) && 'Enter a valid email address',
    phone: f.phone.trim().length < 7 && 'Enter a phone number (at least 7 characters)',
    title: !f.title.trim() && 'Give the project a working title',
    category: !f.category && 'Choose an event type',
    date: (!f.date || f.date < today()) && 'Choose today or a later date',
    location: !f.location.trim() && 'Tell us where it will take place',
    audience: f.audience && (Number(f.audience) < 1 || Number(f.audience) > 5000000) && 'Enter a number between 1 and 5,000,000',
  };
  const valid = !Object.values(errs).some(Boolean);
  const show = (k) => (touched ? errs[k] : '');

  useEffect(() => { if (done) { setF(empty); setFiles([]); setTouched(false); } }, [done]);

  const onSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || busy) return;
    const labels = f.services.map((id) => SERVICES.find(([i]) => i === id)[1]);
    submit({
      files,
      body: {
        contactName: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(),
        ...(f.org.trim() && { organization: f.org.trim() }),
        serviceNeeded: labels.join(', '), eventType: f.category, eventDate: f.date, location: f.location.trim(),
        ...(f.audience && { audienceSize: Number(f.audience) }),
        ...(f.budget && { budgetRange: f.budget }),
        ...(f.brief.trim() && { message: f.brief.trim() }),
        expandedBrief: { projectTitle: f.title.trim(), servicesRequested: labels },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased selection:bg-red-600 selection:text-white">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top_left,rgba(225,6,19,0.18),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-500" /> Request a service
            </span>
            <h1 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
              Commission <br /><span className="text-red-500">Stonovah</span> <br />production & services
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65">
              Tell us what you need and when. We review every request and reply to you by email.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <form onSubmit={onSubmit} noValidate className="relative space-y-6 lg:col-span-2">
            <input {...trapProps} />

            <Step n="01" title="Select services" sub="Choose everything you need.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {SERVICES.map(([id, title, desc]) => {
                  const on = f.services.includes(id);
                  return (
                    <Chip key={id} on={on} onClick={() => toggle(id)}>
                      <div className="mb-2 flex items-center justify-between">
                        <b className="text-sm uppercase tracking-wide">{title}</b>
                        <span className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${on ? 'border-red-500 bg-red-500 text-white' : 'border-white/20 bg-white/[0.04]'}`}>
                          {on && <FiCheck />}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-white/55">{desc}</p>
                    </Chip>
                  );
                })}
              </div>
              {show('services') && <p className="text-xs font-semibold text-red-400">{show('services')}</p>}
            </Step>

            <Step n="02" title="Contact details">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Full name *" error={show('name')}><input autoComplete="name" maxLength={120} value={f.name} onChange={set('name')} className={inputCls} /></Field>
                <Field label="Email *" error={show('email')}><input type="email" autoComplete="email" value={f.email} onChange={set('email')} className={inputCls} /></Field>
                <Field label="Phone *" error={show('phone')}><input type="tel" autoComplete="tel" maxLength={25} value={f.phone} onChange={set('phone')} placeholder="+234 …" className={inputCls} /></Field>
                <Field label="Organization (optional)"><input autoComplete="organization" maxLength={160} value={f.org} onChange={set('org')} className={inputCls} /></Field>
              </div>
            </Step>

            <Step n="03" title="Event details">
              <Field label="Event or project title *" error={show('title')}>
                <input maxLength={160} value={f.title} onChange={set('title')} className={`${inputCls} font-bold`} />
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Event type *" error={show('category')}>
                  <select value={f.category} onChange={set('category')} className={inputCls}>
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Target date *" error={show('date')}>
                  <input type="date" min={today()} value={f.date} onChange={set('date')} className={inputCls} />
                </Field>
                <Field label="Venue or city *" error={show('location')}>
                  <input list="cities" maxLength={200} value={f.location} onChange={set('location')} placeholder="e.g. Eko Convention Centre, Lagos" className={inputCls} />
                  <datalist id="cities">{['Lagos', 'Abuja', 'Port Harcourt', 'Accra', 'London'].map((c) => <option key={c} value={c} />)}</datalist>
                </Field>
                <Field label="Expected attendance (optional)" error={show('audience')}>
                  <input inputMode="numeric" value={f.audience} onChange={(e) => setF((x) => ({ ...x, audience: e.target.value.replace(/\D/g, '') }))} placeholder="e.g. 2500" className={inputCls} />
                </Field>
              </div>
              <Field label="Budget (optional)">
                <select value={f.budget} onChange={set('budget')} className={inputCls}>
                  <option value="">Select…</option>
                  {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Project brief">
                <textarea rows={4} maxLength={4000} value={f.brief} onChange={set('brief')} placeholder="Stage size, streaming needs, press restrictions, anything we should know…" className={inputCls} />
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
              {busy ? 'Sending your request…' : <>Submit service request <FiArrowRight className="text-sm" /></>}
            </button>
          </form>

          <aside className="space-y-6">
            <div className="space-y-4 rounded-xl border border-white/[0.07] bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,19,0.14),#161616_60%)] p-6 text-xs">
              <span className={`${mono} block border-b border-white/10 pb-3 text-red-400`}>What happens next</span>
              {[['We review it', 'Our team reads your request and checks availability.'], ['We reply by email', 'You hear from us at the address you give.'], ['You get a quote', 'We send a written quote you can accept or discuss.']].map(([t, d], i) => (
                <div key={t} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e10613] text-[11px] font-black text-white">{i + 1}</span>
                  <div>
                    <b className="block text-[11px] uppercase tracking-wide">{t}</b>
                    <span className="text-[11px] leading-relaxed text-white/50">{d}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1 rounded-xl border border-white/[0.07] bg-[#161616] p-6 text-xs">
              <span className={`${mono} block text-[9px] text-white/40`}>Prefer to write?</span>
              <a href="mailto:contact@stonovah.com" className="font-bold text-red-400 hover:text-red-300">contact@stonovah.com</a>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      <RequestSuccess done={done} onClose={reset} />
    </div>
  );
}