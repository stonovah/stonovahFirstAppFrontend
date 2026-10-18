// src/pages/NRequestService.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Field, Step, Chip, AttachmentPicker, RequestSuccess, useRequestSubmit, emailOk, today, inputCls } from '../components/forms/RequestForm';

const SERVICES = [
  ['coordination', 'Event Coordination', 'Stage logistics, show directors, stage management and crew.'],
  ['livestream', 'Livestream Coordination', 'Multi-camera broadcast and live distribution to your audience.'],
  ['media', 'Media Handling', 'Fast photography and video, press syndication and cloud delivery.'],
  ['ticketing', 'Ticketing Infrastructure', 'Ticket sales, QR gate scanning and live attendance numbers.'],
];
const CATEGORIES = ['Live concert / festival', 'Corporate keynote / summit', 'Cultural awards & gala', 'Virtual stream / studio', 'Other'];
const BUDGETS = ['$25,000 – $50,000 USD', '$50,000 – $150,000 USD', '$150,000 – $500,000 USD', '$500,000+ USD', 'Not sure yet'];
const empty = { services: [], name: '', email: '', phone: '', org: '', title: '', category: '', date: '', location: '', audience: '', budget: '', brief: '' };

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
    <div className="min-h-screen bg-[#FFBF00] text-black font-sans selection:bg-black selection:text-[#FFBF00]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 bg-black text-[#FFBF00] text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-[#FFBF00] animate-ping" /> REQUEST A SERVICE
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-none mb-4">
            COMMISSION <br /><span className="bg-black text-[#FFBF00] px-3 py-0.5 inline-block my-1 rounded">STONOVAH</span> <br />PRODUCTION & SERVICES
          </h1>
          <p className="text-xs md:text-sm text-black/85 font-medium max-w-2xl leading-relaxed">Tell us what you need and when. We review every request and reply to you by email.</p>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={onSubmit} noValidate className="lg:col-span-2 space-y-8 relative">
            <input {...trapProps} />

            <Step n="01" title="Select services" sub="Choose everything you need.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SERVICES.map(([id, title, desc]) => {
                  const on = f.services.includes(id);
                  return (
                    <Chip key={id} on={on} onClick={() => toggle(id)}>
                      <div className="flex justify-between items-center mb-2"><b className="text-sm uppercase">{title}</b>
                        <span className={`w-5 h-5 rounded flex items-center justify-center border text-xs ${on ? 'bg-black text-[#FFBF00] border-black' : 'border-neutral-700 bg-neutral-800'}`}>{on && <FiCheck />}</span></div>
                      <p className="text-xs leading-relaxed opacity-90">{desc}</p>
                    </Chip>
                  );
                })}
              </div>
              {show('services') && <p className="text-xs text-red-400">{show('services')}</p>}
            </Step>

            <Step n="02" title="Contact details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full name *" error={show('name')}><input autoComplete="name" maxLength={120} value={f.name} onChange={set('name')} className={inputCls} /></Field>
                <Field label="Email *" error={show('email')}><input type="email" autoComplete="email" value={f.email} onChange={set('email')} className={inputCls} /></Field>
                <Field label="Phone *" error={show('phone')}><input type="tel" autoComplete="tel" maxLength={25} value={f.phone} onChange={set('phone')} placeholder="+234 …" className={inputCls} /></Field>
                <Field label="Organization (optional)"><input autoComplete="organization" maxLength={160} value={f.org} onChange={set('org')} className={inputCls} /></Field>
              </div>
            </Step>

            <Step n="03" title="Event details">
              <Field label="Event or project title *" error={show('title')}><input maxLength={160} value={f.title} onChange={set('title')} className={`${inputCls} font-bold text-[#FFBF00]`} /></Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Event type *" error={show('category')}>
                  <select value={f.category} onChange={set('category')} className={inputCls}><option value="">Select…</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
                </Field>
                <Field label="Target date *" error={show('date')}><input type="date" min={today()} value={f.date} onChange={set('date')} className={inputCls} /></Field>
                <Field label="Venue or city *" error={show('location')}>
                  <input list="cities" maxLength={200} value={f.location} onChange={set('location')} placeholder="e.g. Eko Convention Centre, Lagos" className={inputCls} />
                  <datalist id="cities">{['Lagos', 'Abuja', 'Port Harcourt', 'Accra', 'London'].map((c) => <option key={c} value={c} />)}</datalist>
                </Field>
                <Field label="Expected attendance (optional)" error={show('audience')}>
                  <input inputMode="numeric" value={f.audience} onChange={(e) => setF((x) => ({ ...x, audience: e.target.value.replace(/\D/g, '') }))} placeholder="e.g. 2500" className={inputCls} />
                </Field>
              </div>
              <Field label="Budget (optional)"><select value={f.budget} onChange={set('budget')} className={inputCls}><option value="">Select…</option>{BUDGETS.map((b) => <option key={b}>{b}</option>)}</select></Field>
              <Field label="Project brief"><textarea rows={4} maxLength={4000} value={f.brief} onChange={set('brief')} placeholder="Stage size, streaming needs, press restrictions, anything we should know…" className={inputCls} /></Field>
              <AttachmentPicker files={files} onChange={setFiles} />
            </Step>

            {error && <p className="text-xs font-bold text-red-100 bg-red-900 rounded-xl p-3">{error}</p>}
            {touched && !valid && <p className="text-xs font-bold text-black bg-black/10 rounded-xl p-3">Please fix the highlighted fields.</p>}
            <button type="submit" disabled={busy} className="w-full bg-black text-[#FFBF00] hover:bg-neutral-900 font-black text-xs md:text-sm py-4 px-6 rounded-xl uppercase tracking-widest transition shadow-2xl flex items-center justify-center gap-2 border-2 border-black disabled:opacity-60 cursor-pointer">
              {busy ? 'Sending your request…' : <>Submit service request <FiArrowRight className="text-lg" /></>}
            </button>
          </form>

          <aside className="space-y-6">
            <div className="bg-black text-white p-6 rounded-2xl shadow-2xl space-y-4 text-xs">
              <span className="text-xs font-mono font-bold text-[#FFBF00] uppercase block border-b border-neutral-800 pb-3">What happens next</span>
              {[['We review it', 'Our team reads your request and checks availability.'], ['We reply by email', 'You hear from us at the address you give.'], ['You get a quote', 'We send a written quote you can accept or discuss.']].map(([t, d], i) => (
                <div key={t} className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#FFBF00] text-black font-black flex items-center justify-center shrink-0">{i + 1}</span><div><b className="uppercase text-[11px] block">{t}</b><span className="text-neutral-400 text-[11px] leading-relaxed">{d}</span></div></div>
              ))}
            </div>
            <div className="bg-black text-white p-6 rounded-2xl shadow-2xl text-xs space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block">PREFER TO WRITE?</span>
              <a href="mailto:contact@stonovah.com" className="text-[#FFBF00] font-bold hover:underline">contact@stonovah.com</a>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
      <RequestSuccess done={done} onClose={reset} />
    </div>
  );
}