// src/pages/RequestService.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiChevronRight } from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Field, Step, Chip, AttachmentPicker, RequestSuccess, useRequestSubmit, emailOk, today, inputCls } from '../components/forms/RequestForm';

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
  const err = (k) => show(k) && <p className="text-xs text-red-400 mt-2">{show(k)}</p>;

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
    <main className="min-h-screen bg-[#FFBF00] text-black font-sans selection:bg-black selection:text-[#FFBF00]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="text-[10px] font-mono font-bold text-black/70 mb-4 flex items-center gap-2 uppercase tracking-widest">
          <span>PORTAL</span><FiChevronRight /><span>EVENTS DIVISION</span><FiChevronRight /><span className="text-black font-extrabold">COMMISSION FORM</span>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none mb-3">COMMISSION STONOVAH <br /><span className="bg-black text-[#FFBF00] px-3 py-0.5 inline-block my-1 rounded">EVENT COORDINATION</span></h1>
          <p className="text-xs md:text-sm text-black/80 font-semibold max-w-3xl">Describe your event and the support you need. We review every request and reply by email.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={onSubmit} noValidate className="lg:col-span-2 space-y-8 relative">
            <input {...trapProps} />

            <Step n="01" title="What do you need?">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TIERS.map(([t, d]) => (
                  <Chip key={t} on={f.tier === t} onClick={() => pick('tier', t)}>
                    <b className="text-sm uppercase block mb-2">{t}</b><p className="text-xs leading-relaxed opacity-90">{d}</p>
                  </Chip>
                ))}
              </div>
            </Step>

            <Step n="02" title="Contact & organization">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Contact person *" error={show('name')}><input autoComplete="name" maxLength={120} value={f.name} onChange={set('name')} className={inputCls} /></Field>
                <Field label="Organization / brand *" error={show('org')}><input autoComplete="organization" maxLength={160} value={f.org} onChange={set('org')} className={inputCls} /></Field>
                <Field label="Email *" error={show('email')}><input type="email" autoComplete="email" value={f.email} onChange={set('email')} className={inputCls} /></Field>
                <Field label="Phone *" error={show('phone')}><input type="tel" autoComplete="tel" maxLength={25} value={f.phone} onChange={set('phone')} placeholder="+234 …" className={inputCls} /></Field>
                <Field label="Based in (optional)"><input maxLength={120} value={f.region} onChange={set('region')} placeholder="City or region" className={inputCls} /></Field>
              </div>
            </Step>

            <Step n="03" title="Event details">
              <Field label="Event title *" error={show('title')}><input maxLength={160} value={f.title} onChange={set('title')} className={`${inputCls} font-bold text-[#FFBF00]`} /></Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Event date *" error={show('date')}><input type="date" min={today()} value={f.date} onChange={set('date')} className={inputCls} /></Field>
                <Field label="Production duration (optional)"><input maxLength={80} value={f.duration} onChange={set('duration')} placeholder="e.g. 14 hours, 10:00 – 24:00" className={inputCls} /></Field>
              </div>
            </Step>

            <Step n="04" title="What should we handle?" sub="Select all that apply.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODULES.map(([t, d]) => {
                  const on = f.modules.includes(t);
                  return (
                    <Chip key={t} on={on} onClick={() => toggle(t)} className="flex items-start gap-3 !p-4">
                      <span className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border text-xs shrink-0 ${on ? 'bg-black text-[#FFBF00] border-black' : 'border-neutral-600 bg-neutral-800'}`}>{on && <FiCheck />}</span>
                      <span><b className="text-xs uppercase block mb-0.5">{t}</b><span className="text-[11px] opacity-80 leading-tight block">{d}</span></span>
                    </Chip>
                  );
                })}
              </div>
              {err('modules')}
            </Step>

            <Step n="05" title="Venue">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {VENUES.map((v) => <Chip key={v} on={f.venueType === v} onClick={() => pick('venueType', v)} className="!p-3 text-center text-xs font-bold uppercase">{v}</Chip>)}
              </div>
              {err('venueType')}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Venue name *" error={show('venueName')}><input maxLength={120} value={f.venueName} onChange={set('venueName')} className={inputCls} /></Field>
                <Field label="City *" error={show('city')}><input maxLength={80} value={f.city} onChange={set('city')} className={inputCls} /></Field>
              </div>
            </Step>

            <Step n="06" title="Audience & budget">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {AUDIENCE.map((a) => <Chip key={a} on={f.audience === a} onClick={() => pick('audience', a)} className="!p-4 text-center font-black text-sm uppercase">{a}</Chip>)}
              </div>
              {err('audience')}
              <Field label="Exact expected attendance (optional)" error={show('exact')}><input inputMode="numeric" value={f.exact} onChange={(e) => pick('exact', e.target.value.replace(/\D/g, ''))} className={inputCls} /></Field>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {BUDGETS.map((b) => <Chip key={b} on={f.budget === b} onClick={() => pick('budget', b)} className="!p-3 text-center text-[11px] font-black uppercase">{b} {b.startsWith('$') && 'USD'}</Chip>)}
              </div>
              {err('budget')}
              <Field label="Anything else we should know?"><textarea rows={3} maxLength={4000} value={f.notes} onChange={set('notes')} className={inputCls} /></Field>
              <AttachmentPicker files={files} onChange={setFiles} />
            </Step>

            {error && <p className="text-xs font-bold text-red-100 bg-red-900 rounded-xl p-3">{error}</p>}
            {touched && !valid && <p className="text-xs font-bold text-black bg-black/10 rounded-xl p-3">Please fix the highlighted fields.</p>}
            <button type="submit" disabled={busy} className="w-full bg-black text-[#FFBF00] hover:bg-neutral-900 font-black text-sm md:text-base py-5 rounded-2xl uppercase tracking-widest transition shadow-2xl flex items-center justify-center gap-3 border-2 border-black disabled:opacity-60 cursor-pointer">
              {busy ? 'Sending your request…' : <>Submit commission request <FiArrowRight className="text-lg" /></>}
            </button>
          </form>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-black text-white p-6 rounded-2xl shadow-2xl text-xs font-mono space-y-3">
                <h3 className="font-black text-[#FFBF00] uppercase tracking-widest border-b border-neutral-800 pb-3">Your request so far</h3>
                {[['Service', f.tier], ['Venue', [f.venueType, f.venueName, f.city].filter(Boolean).join(' • ')], ['Audience', f.exact ? `${Number(f.exact).toLocaleString()} people` : f.audience], ['Budget', f.budget]].map(([k, v]) => (
                  <div key={k}><span className="text-neutral-400 text-[10px] uppercase block">{k}</span><span className="font-bold block mt-0.5">{v || '—'}</span></div>
                ))}
                <div className="border-t border-neutral-800 pt-3"><span className="text-neutral-400 text-[10px] uppercase block mb-2">We will handle</span>
                  <div className="flex flex-wrap gap-1.5">{f.modules.length ? f.modules.map((m) => <span key={m} className="bg-neutral-800 text-[#FFBF00] text-[9px] px-2 py-1 rounded border border-neutral-700 uppercase font-bold">{m}</span>) : <span className="text-neutral-500">Nothing selected yet</span>}</div></div>
                <p className="text-[10px] text-neutral-500 pt-2">Nothing is sent until you submit.</p>
              </div>
              <div className="bg-black text-white p-6 rounded-2xl shadow-xl text-xs space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">PREFER TO WRITE?</span>
                <a href="mailto:contact@stonovah.com" className="text-[#FFBF00] font-bold hover:underline">contact@stonovah.com</a>
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