import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiMail, FiUser, FiBriefcase, FiEye, FiEyeOff, FiKey, FiLock, FiShield, FiGrid,
  FiCheck, FiInfo, FiArrowLeft, FiBarChart2, FiCheckSquare, FiSquare, FiClipboard,
} from 'react-icons/fi';
import { Card, Badge, Field, ActionBar, fadeUp } from './shared';

const tiers = [
  { id: 'A', label: 'TIER A', range: 'Up to 5,000', desc: 'Intimate auditoriums, clubs & boutique showcases' },
  { id: 'B', label: 'TIER B • PREFERRED', range: '5,000 – 25,000', desc: 'Major amphitheaters, conventions & festivals' },
  { id: 'C', label: 'TIER C • STADIUM', range: '25,000+ Patrons', desc: 'National stadium tours, multi-day sovereign expos' },
];

const disciplines = [
  'Live Concerts & Stadium Tours',
  'Galas & Industry Award Ceremonies',
  'Cultural Summits & Conferences',
  'Theater & Performing Arts Atelier',
  'Private Sovereign Showcases',
];

const dialCodes = [
  { code: '+234', flag: '🇳🇬' },
  { code: '+233', flag: '🇬🇭' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+27', flag: '🇿🇦' },
];

export const passwordRules = (pw) => [
  { label: '12+ Characters', ok: pw.length >= 12 },
  { label: 'Upper & Lowercase', ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
  { label: 'Numeric Digit', ok: /\d/.test(pw) },
  { label: 'Special Symbol (!, #, $)', ok: /[^A-Za-z0-9]/.test(pw) },
];

const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

export default function AccountCredentials({ form, update, onNext, onSave, savedAt, busy = false, error = '', fieldErrors = {} }) {
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({});
  const touch = (k) => setTouched((t) => ({ ...t, [k]: true }));

  const rules = passwordRules(form.password);
  const score = rules.filter((r) => r.ok).length;
  const strength = ['—', 'WEAK', 'FAIR', 'STRONG', 'VERY STRONG'][score];
  const strengthPct = Math.min(100, Math.round((score / 4) * 80 + Math.min(form.password.length, 20)));
  const barColor = score <= 1 ? 'bg-red-600' : score === 2 ? 'bg-orange-500' : score === 3 ? 'bg-[#FFBF00]' : 'bg-emerald-400';
  const mismatch = form.confirmPassword && form.password !== form.confirmPassword;

  const checks = [
    { label: 'valid work email', ok: emailOk(form.email) },
    { label: 'first and last name', ok: form.firstName.trim() && form.lastName.trim() },
    { label: 'phone number', ok: form.phone.replace(/\D/g, '').length >= 7 },
    { label: 'organization name', ok: form.orgName.trim() },
    { label: 'strong password', ok: score === 4 },
    { label: 'matching passwords', ok: form.password && form.password === form.confirmPassword },
    { label: 'at least one event discipline', ok: form.disciplines.length > 0 },
    { label: 'both agreements', ok: form.agreeTerms && form.agreeConsent },
  ];
  const remaining = checks.filter((c) => !c.ok);

  const toggleDiscipline = (d) =>
    update(
      'disciplines',
      form.disciplines.includes(d) ? form.disciplines.filter((x) => x !== d) : [...form.disciplines, d]
    );

  return (
    <div className="space-y-6">
      {/* TITLE */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest">
          <span className="bg-black text-red-400 px-2 py-1 rounded">REGULATORY GATE V4.2</span>
          <span className="text-black/60">//</span>
          <span className="text-black/80">ORGANIZER SYNDICATE ONBOARDING</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight font-sans">
          Create Organizer Master Account
        </h1>
        <p className="text-xs md:text-sm font-mono text-black/80 max-w-2xl leading-relaxed">
          Establish your enterprise credentials and security profile to access Stonovah's event
          management, multi-currency ticketing engine, and instant turnstile networks.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-6">
          {/* CREDENTIALS */}
          <Card
            index={1}
            icon={FiClipboard}
            title="Syndicate Authentication Credentials"
            subtitle="Primary organizational authority contact records"
            badge={<Badge>Required</Badge>}
          >
            <Field
              label="Work / Executive Email Address"
              required
              icon={FiMail}
              type="email"
              placeholder="e.g. executive@stonovah-media.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              onBlur={() => touch('email')}
              error={fieldErrors.email || (touched.email && form.email && !emailOk(form.email) ? 'Enter a valid email address' : '')}
              hint="Supported: corporate domain handles & authenticated custom enterprise mailboxes."
              right={
                emailOk(form.email) && (
                  <span className="text-emerald-400 font-bold">FORMAT VALID</span>
                )
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="First Name (Legal Entity Lead)" required icon={FiUser} placeholder="Adebayo"
                value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
              <Field label="Last Name (Legal Entity Lead)" required icon={FiUser} placeholder="Ogunlesi"
                value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Direct Contact Phone *</label>
                <div className="flex gap-2">
                  <select
                    value={form.dialCode}
                    onChange={(e) => update('dialCode', e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFBF00]"
                  >
                    {dialCodes.map((d) => (
                      <option key={d.code} value={d.code}>{d.flag} {d.code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="803 000 0000"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value.replace(/[^\d\s]/g, ''))}
                    className="flex-1 min-w-0 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFBF00] placeholder:text-neutral-600"
                  />
                </div>
              </div>
              <Field label="Public Syndicate / Organization Name" required icon={FiBriefcase}
                placeholder="e.g. Zenith Soundstage Live"
                value={form.orgName} onChange={(e) => update('orgName', e.target.value)} />
            </div>
          </Card>

          {/* PASSWORD */}
          <Card
            index={2}
            icon={FiShield}
            title="Security & Access Passphrase"
            subtitle="Cryptographic multi-tier master key formulation"
            badge={<Badge><FiLock className="inline mr-1" />Hardened</Badge>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Field label="Password" required icon={FiKey}
                  type={showPw ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="••••••••••••"
                  value={form.password} onChange={(e) => update('password', e.target.value)} />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-[26px] text-neutral-400 hover:text-white cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <Field label="Verify Password" required icon={FiLock}
                type={showPw ? 'text' : 'password'} autoComplete="new-password"
                placeholder="••••••••••••"
                value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}
                error={mismatch ? 'Passwords do not match' : ''} />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-neutral-400 uppercase tracking-wider">Strength Index</span>
                <span className="text-[#FFBF00]">
                  {form.password ? `${strength} • ${strengthPct}/100` : 'ENTER A PASSWORD'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-1 rounded-full bg-neutral-800 overflow-hidden">
                    <motion.div
                      className={`h-full ${barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: i < score ? '100%' : '0%' }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                {rules.map((r) => (
                  <span key={r.label} className={`flex items-center gap-1.5 ${r.ok ? 'text-white' : 'text-neutral-500'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] shrink-0 ${r.ok ? 'bg-emerald-500 text-black' : 'bg-neutral-800'}`}>
                      {r.ok && <FiCheck />}
                    </span>
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* SCALE PROFILING */}
          <Card
            index={3}
            icon={FiBarChart2}
            title="Account Role & Scale Profiling"
            subtitle="Calibrates turnstile bandwidth and multi-currency payout limits"
          >
            <div>
              <label className="block text-[10px] text-neutral-400 mb-2">Expected Annual Event Ticket Volume *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {tiers.map((t) => {
                  const active = form.tier === t.id;
                  return (
                    <motion.button
                      key={t.id}
                      type="button"
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => update('tier', t.id)}
                      className={`text-left p-4 rounded-xl border transition cursor-pointer ${
                        active ? 'bg-neutral-900 border-red-600 ring-1 ring-red-600' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] font-bold text-red-400 tracking-wider">
                        <span>{t.label}</span>
                        <span className={`w-2 h-2 rounded-full ${active ? 'bg-red-500' : 'bg-neutral-700'}`} />
                      </div>
                      <span className="text-lg font-black font-sans block mt-1">{t.range}</span>
                      <span className="text-[10px] text-neutral-400 block mt-1 leading-snug">{t.desc}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 mb-2">Primary Event Disciplines (Select all applicable)</label>
              <div className="flex flex-wrap gap-2">
                {disciplines.map((d) => {
                  const on = form.disciplines.includes(d);
                  return (
                    <motion.button
                      key={d}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleDiscipline(d)}
                      className={`flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg border transition cursor-pointer ${
                        on ? 'bg-neutral-900 border-red-600' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      {on ? <FiCheckSquare className="text-red-500" /> : <FiSquare className="text-neutral-500" />}
                      {d}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* AGREEMENTS */}
          <Card index={4} className="space-y-4">
            {[
              {
                key: 'agreeTerms',
                text: (
                  <>
                    I agree to the{' '}
                    <a href="/legal/organizer-agreement" className="underline text-[#FFBF00]">
                      Stonovah Creative House Organizer Master Service Agreement
                    </a>
                    , Ticketing Escrow Charter, and Acceptable Use Policy.
                  </>
                ),
              },
              {
                key: 'agreeConsent',
                text: (
                  <>
                    I consent to identity validation, cross-border anti-money laundering screening, and
                    anti-scalp regulatory telemetry under NDPR and SEC statutory directives.
                  </>
                ),
              },
            ].map((a) => (
              <label key={a.key} className="flex items-start gap-3 text-xs leading-relaxed cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[a.key]}
                  onChange={(e) => update(a.key, e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-red-600 shrink-0"
                />
                <span className="text-neutral-300">{a.text}</span>
              </label>
            ))}
          </Card>

          {error && <p className="text-xs font-mono font-bold text-red-400 bg-black rounded-lg p-3">{error}</p>}
          <ActionBar
            left={
              <span className="flex items-center gap-2 text-neutral-400">
                <FiArrowLeft /> Already have an Organizer Account?{' '}
                <Link to="/login" className="text-[#FFBF00] font-bold hover:underline">Sign In</Link>
              </span>
            }
            note={remaining.length ? `${remaining.length} item${remaining.length > 1 ? 's' : ''} remaining` : savedAt ? `Draft saved ${savedAt}` : 'Ready'}
            onSave={onSave}
            onNext={onNext}
            nextLabel={busy ? 'Creating account…' : 'Continue to Step 2: KYC & Compliance'}
            disabled={remaining.length > 0 || busy}
          />
          {remaining.length > 0 && (
            <p className="text-[10px] font-mono text-black/70 -mt-3">
              Still needed: {remaining.map((r) => r.label).join(', ')}.
            </p>
          )}
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-4 space-y-6">
          <Card index={2} icon={FiShield} title="Tier-1 Authorization">
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Stonovah operates an institutional-grade ticketing and broadcast infrastructure. Master
              account integrity enforces:
            </p>
            {[
              { icon: FiLock, t: 'Escrow Vault Protection', d: 'Ticket earnings are isolated in sovereign custodial accounts until event delivery.' },
              { icon: FiGrid, t: 'Dynamic QR Issuance', d: 'Rotating asymmetric cryptography prevents counterfeit turnstile access.' },
              { icon: FiShield, t: 'Zero Chargeback Defense', d: 'Real-time biometric & 3D Secure 2.2 verification mitigates secondary scalping.' },
            ].map((p, i) => (
              <motion.div
                key={p.t}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12 }}
                className="bg-neutral-900 rounded-xl p-3 flex gap-3"
              >
                <p.icon className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm font-bold font-sans block">{p.t}</span>
                  <span className="text-[10px] text-neutral-400 leading-snug block">{p.d}</span>
                </div>
              </motion.div>
            ))}
          </Card>

          <Card index={3} title="Security Protocol" badge={<span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />}>
            {[
              ['HANDSHAKE STANDARD', 'TLS 1.3 / ChaCha20'],
              ['COMPLIANCE STATUS', 'ISO-27001 Certified'],
              ['PRIVACY CHARTER', 'NDPR Sovereign Vault'],
            ].map(([k, v]) => (
              <div key={k} className="bg-neutral-900 rounded-lg px-3 py-2 flex justify-between gap-2 text-[10px]">
                <span className="text-neutral-400 font-bold">{k}</span>
                <span className="font-bold text-right">{v}</span>
              </div>
            ))}
            <div className="border-l-2 border-red-600 bg-neutral-900 rounded-r-lg px-3 py-2 text-[10px]">
              <span className="text-neutral-400 font-bold block">SESSION AUTH TOKEN</span>
              <span className="text-neutral-200">INITIALIZED (NG-LOS-GAT-09-0021A)</span>
            </div>
          </Card>

          <Card index={4} icon={FiInfo} title="Fast-Track KYC Preview">
            <p className="text-[11px] text-neutral-400">
              Prepare these verification credentials to clear Step 02 without manual hold-backs:
            </p>
            {[
              'CAC Certificate of Incorporation (Corporate)',
              'Valid NIN / International Passport (Director)',
              'Settlement Bank Account Verification Letter',
            ].map((t) => (
              <span key={t} className="flex items-start gap-2 text-[11px]">
                <FiCheck className="text-emerald-400 mt-0.5 shrink-0" /> {t}
              </span>
            ))}
          </Card>

          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={5}
            className="relative h-44 rounded-2xl overflow-hidden border border-black shadow-2xl"
          >
            <motion.img
              src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80"
              alt="Control room"
              className="w-full h-full object-cover opacity-60"
              initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.4 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-3 left-4 text-white font-mono">
              <span className="text-[9px] font-bold text-red-400 tracking-widest block">GLOBAL ECOSYSTEM</span>
              <span className="text-base font-black font-sans">Operating in 14 Sovereign Jurisdictions</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}