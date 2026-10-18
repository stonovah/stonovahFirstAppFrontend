import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiUser, FiArrowLeft } from 'react-icons/fi';
import { Card, ActionBar, fadeUp } from './shared';
import { BusinessForm, BusinessSidebar, bizChecks } from './KycBusiness';
import { IndividualForm, IndividualSidebar, indChecks } from './KycIndividual';

const options = [
  {
    id: 'business',
    icon: FiHome,
    title: 'Registered Business / Corporate Entity',
    desc: 'Companies, entertainment agencies, legal partnerships, and registered cultural trusts.',
    tag: 'RECOMMENDED FOR COMPANIES & COLLECTIVES',
  },
  {
    id: 'individual',
    icon: FiUser,
    title: 'Individual Organizer / Sole Proprietor',
    desc: 'Solo event hosts, independent curators, and creators operating under legal personal identity.',
    tag: 'PERSONAL NIN / BVN REQUIRED',
  },
];

const slide = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2 } },
};

export default function KycCompliance({
  form, update, updateNested, onBack, onSubmit, onSave, savedAt,
  busy = false, error = '', notice = '',
}) {
  const isBiz = form.kycType === 'business';
  const checks = isBiz ? bizChecks(form.biz) : indChecks(form.ind);
  const missing = checks.filter((c) => !c.ok);

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/70">
          PROTOCOL STEP 02 OF 03 • SEC & NDPR SOVEREIGN STANDARDS
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight font-sans">
          Organizer Verification & KYC Compliance
        </h1>
        <p className="text-xs md:text-sm font-mono text-black/80 max-w-2xl leading-relaxed">
          To facilitate automated multi-currency ticket payouts, anti-fraud compliance, and high-capacity gate
          access on Stonovah, regulatory identity verification is mandatory under SEC/NDPR guidelines.
        </p>
        {notice && (
          <p className="text-xs font-mono font-bold bg-black text-[#FFBF00] rounded-lg p-3 max-w-2xl">{notice}</p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* CLASSIFICATION */}
          <Card index={1} title="Are you registering as a business or an individual?" subtitle="CLASSIFICATION PROTOCOL • SELECT 1 OF 2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((o) => {
                const on = form.kycType === o.id;
                return (
                  <motion.button
                    key={o.id}
                    type="button"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => update('kycType', o.id)}
                    className={`relative text-left p-5 rounded-xl border transition cursor-pointer ${
                      on ? 'bg-neutral-900 border-red-600 ring-1 ring-red-600' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600 opacity-80'
                    }`}
                  >
                    <span className={`absolute top-4 right-4 w-3 h-3 rounded-full ${on ? 'bg-red-500' : 'bg-neutral-700'}`} />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${on ? 'bg-red-950 text-red-400' : 'bg-neutral-900 text-neutral-400'}`}>
                      <o.icon />
                    </div>
                    <span className="font-black font-sans block leading-tight">{o.title}</span>
                    <span className="text-[10px] text-neutral-400 block mt-1 leading-snug">{o.desc}</span>
                    <span className="inline-block mt-3 text-[9px] font-bold bg-neutral-800 px-2 py-1 rounded">{o.tag}</span>
                  </motion.button>
                );
              })}
            </div>
          </Card>

          <AnimatePresence mode="wait">
            <motion.div key={form.kycType} initial="hidden" animate="visible" exit="exit" variants={slide}>
              {isBiz ? (
                <BusinessForm biz={form.biz} set={(k, v) => updateNested('biz', k, v)} />
              ) : (
                <IndividualForm ind={form.ind} set={(k, v) => updateNested('ind', k, v)} />
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="text-xs font-mono font-bold text-red-400 bg-black rounded-lg p-3">{error}</p>
          )}

          <ActionBar
            left={
              <button type="button" onClick={onBack} className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition">
                <FiArrowLeft /> Back to Account Details
              </button>
            }
            note={missing.length ? `${missing.length} item${missing.length > 1 ? 's' : ''} remaining` : savedAt ? `Draft saved ${savedAt}` : 'Ready to submit'}
            onSave={onSave}
            onNext={onSubmit}
            nextLabel={busy ? 'Submitting…' : isBiz ? 'Submit Business KYC & Continue' : 'Submit KYC & Continue'}
            disabled={missing.length > 0 || busy}
          />
          {missing.length > 0 && (
            <p className="text-[10px] font-mono text-black/70 -mt-3">
              Still needed: {missing.map((m) => m.label.toLowerCase()).join(', ')}.
            </p>
          )}
        </div>

        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            <motion.div key={form.kycType} initial="hidden" animate="visible" exit="exit" variants={slide}>
              {isBiz ? <BusinessSidebar biz={form.biz} /> : <IndividualSidebar ind={form.ind} account={form} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}