import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiCalendar, FiFlag, FiMapPin, FiHash, FiFileText, FiCamera, FiCheck,
  FiShield, FiTruck, FiCreditCard, FiAward, FiZap, FiGrid, FiLock,
} from 'react-icons/fi';
import { Card, Field, UploadZone, ProgressRing, Badge, NIGERIAN_STATES } from './shared';

export const ninValid = (v) => /^\d{11}$/.test(v);

export const indChecks = (i) => [
  { label: 'Legal full name', ok: i.legalName.trim().length > 2 },
  { label: 'Date of birth (18+)', ok: !!i.dob && Date.now() - new Date(i.dob).getTime() > 18 * 365.25 * 864e5 },
  { label: 'Residential address', ok: i.address.trim().length > 4 && i.city.trim() && i.state },
  { label: 'NIN (11 digits)', ok: ninValid(i.nin) },
  { label: 'Identity document upload', ok: !!i.idDoc },
  { label: 'Facial liveness check', ok: i.liveness },
];

const idTypes = [
  { id: 'NIN Digital Slip', icon: FiFileText },
  { id: "Int'l Passport", icon: FiFlag },
  { id: "Driver's License", icon: FiTruck },
  { id: "Voter's Card", icon: FiUser },
];

export function IndividualForm({ ind, set }) {
  const [scan, setScan] = useState('idle'); // idle | scanning | done

  // PLACEHOLDER: replace with your KYC/liveness provider SDK. This only simulates a 3s scan.
  useEffect(() => {
    if (scan !== 'scanning') return;
    const t = setTimeout(() => { setScan('done'); set('liveness', true); }, 3000);
    return () => clearTimeout(t);
  }, [scan]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <Card
        index={1}
        icon={FiUser}
        title="Legal Representative Particulars"
        subtitle="CIVIL REGISTRATION DATA"
        badge={<Badge><FiLock className="inline mr-1" />SEC strict disclosure</Badge>}
      >
        <Field label="Legal Full Name" required icon={FiUser} placeholder="As shown on your NIN record"
          right={<span className="text-neutral-500">MUST EXACTLY MATCH NIMC RECORDS</span>}
          value={ind.legalName} onChange={(e) => set('legalName', e.target.value)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Date of Birth" required icon={FiCalendar} type="date"
            value={ind.dob} onChange={(e) => set('dob', e.target.value)} />
          <Field as="select" label="Nationality / Sovereign Jurisdiction" required icon={FiFlag}
            value={ind.nationality} onChange={(e) => set('nationality', e.target.value)}>
            <option>Nigeria (NG - Federal Republic)</option>
            <option>Ghana (GH)</option>
            <option>United Kingdom (UK)</option>
          </Field>
        </div>

        <Field label="Residential Street Address" required icon={FiMapPin}
          placeholder="Plot 18A, Admirals Way, Lekki Phase 1, Lagos"
          value={ind.address} onChange={(e) => set('address', e.target.value)} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="City" placeholder="Lekki / Victoria Island"
            value={ind.city} onChange={(e) => set('city', e.target.value)} />
          <Field as="select" label="State / Territory"
            value={ind.state} onChange={(e) => set('state', e.target.value)}>
            <option value="">Select state</option>
            {NIGERIAN_STATES.map((s) => <option key={s}>{s} State</option>)}
          </Field>
          <Field label="Postal / Zip Code" placeholder="105102"
            value={ind.postal} onChange={(e) => set('postal', e.target.value)} />
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <Field
            label="National Identification Number (NIN)" required icon={FiHash}
            inputMode="numeric" maxLength={11} placeholder="11-digit NIN"
            value={ind.nin} onChange={(e) => set('nin', e.target.value.replace(/\D/g, ''))}
            error={ind.nin && !ninValid(ind.nin) ? `${ind.nin.length}/11 digits` : ''}
            right={ninValid(ind.nin) && <span className="text-emerald-400 font-bold">FORMAT VALID</span>}
            hint="Format check only. The NIN is matched against NIMC records by the Compliance Council after submission."
          />
        </div>

        <div>
          <label className="block text-[10px] text-neutral-400 mb-2">Supporting Government ID Document Type *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {idTypes.map(({ id, icon: Icon }) => {
              const on = ind.idType === id;
              return (
                <motion.button
                  key={id} type="button" whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }}
                  onClick={() => set('idType', id)}
                  className={`p-3 rounded-xl border text-[10px] font-bold uppercase flex flex-col items-center gap-1.5 cursor-pointer transition ${
                    on ? 'bg-neutral-800 border-red-600' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  <Icon className={on ? 'text-red-400' : 'text-neutral-400'} /> {id}
                </motion.button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card
        index={2}
        icon={FiFileText}
        title="Upload Government-Issued Identity Document"
        subtitle="Upload a crisp color scan or photograph of your NIN slip, passport data page, or driver's license. Ensure all four corners are visible without glare. PDF, JPG, PNG up to 10MB."
        badge={<Badge tone="grey">Max file: 10MB</Badge>}
      >
        <UploadZone
          file={ind.idDoc}
          onFile={(f) => set('idDoc', f)}
          maxMB={10}
          title="Drag & Drop or Browse Device Storage"
          hint="Documents are encrypted in transit and reviewed by compliance officers."
        />

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-950 flex items-center justify-center text-red-400 shrink-0">
            <FiCamera />
          </div>
          <div className="flex-1">
            <span className="font-bold font-sans block">Quick Facial Liveness Biometric Check</span>
            <span className="text-[10px] text-neutral-400 block mt-0.5">
              A short real-time anti-spoof check against your submitted ID photo.
            </span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {scan === 'done' ? (
              <motion.span key="d" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="text-emerald-400 font-bold text-xs flex items-center gap-2">
                <FiCheck /> LIVENESS CAPTURED
              </motion.span>
            ) : scan === 'scanning' ? (
              <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-44">
                <span className="text-[10px] font-bold text-[#FFBF00] block mb-1">SCANNING…</span>
                <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-red-600" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3, ease: 'linear' }} />
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="b" type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setScan('scanning')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <FiCamera /> LAUNCH CAMERA SCANNER
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <Card index={3} icon={FiShield} title="NDPR Sovereign & Central Bank Regulatory Identity Safeguards">
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Stonovah Creative House Limited operates in compliance with the Nigeria Data Protection Regulation
          (NDPR) and SEC event-ticketing guidelines. Your identity data is used exclusively for high-capacity
          venue ticketing compliance and automated statutory settlement reconciliation.
        </p>
      </Card>
    </div>
  );
}

export function IndividualSidebar({ ind, account }) {
  const checks = indChecks(ind);
  const percent = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  const name = ind.legalName || `${account.firstName} ${account.lastName}`.trim() || 'Your Name';
  const capacity = { A: 'Up to 5,000 Pax', B: '5,000 – 25,000 Pax', C: '25,000+ Pax' }[account.tier];

  return (
    <div className="space-y-6">
      <Card index={1}>
        <div className="flex justify-between text-[9px] font-bold tracking-widest text-neutral-400">
          <span>ORGANIZER DOSSIER</span>
          <Badge>Individual</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-neutral-800 flex items-center justify-center text-xl font-black font-sans">
            {name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="font-black font-sans block truncate">{name}</span>
            <span className="text-[10px] text-neutral-400 block truncate">{account.email}</span>
          </div>
        </div>
        <div className="space-y-1.5 text-[11px]">
          {[
            ['Intended Venue Capacity', capacity],
            ['Curated Event Category', account.disciplines[0] || '—'],
            ['Target Payout Currencies', 'NGN, USD, GBP, EUR'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <span className="text-neutral-400">{k}</span>
              <span className="font-bold text-right">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card index={2} title="Unlocks Instant Stonovah Capabilities">
        <span className="text-[9px] font-bold tracking-widest text-neutral-400 -mt-3 block">TIER 1 SOLE PROPRIETOR PERKS</span>
        {[
          { icon: FiCreditCard, t: 'Automated T+0 Payouts', d: 'Daily batch ticket reconciliations wired to your local or foreign accounts.' },
          { icon: FiGrid, t: 'High-Throughput Gate App', d: 'Equip up to 25 staff members with laser RFID / QR scanners on event night.' },
          { icon: FiAward, t: 'Zero Chargeback Exposure', d: '3DS 2.0 biometric fraud insurance backed by Stonovah Creative House.' },
        ].map((p, i) => (
          <motion.div key={p.t} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="flex gap-3">
            <p.icon className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold font-sans block text-sm">{p.t}</span>
              <span className="text-[10px] text-neutral-400 leading-snug block">{p.d}</span>
            </div>
          </motion.div>
        ))}
      </Card>

      <Card index={3}>
        <div className="flex justify-between text-[9px] font-bold tracking-widest text-neutral-400">
          <span>AUDIT TELEMETRY</span>
          <span className="text-red-400 flex items-center gap-1"><FiZap /> LIVE</span>
        </div>
        <ProgressRing percent={percent} label="READINESS" />
        <div className="space-y-1.5 text-[10px]">
          {checks.map((c) => (
            <div key={c.label} className="flex justify-between">
              <span className="text-neutral-400">{c.label}</span>
              <span className={c.ok ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>{c.ok ? 'DONE' : 'PENDING'}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}