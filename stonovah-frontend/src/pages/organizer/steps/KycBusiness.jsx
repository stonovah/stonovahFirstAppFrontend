import React from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiUser, FiMail, FiMapPin, FiFileText, FiCheck, FiLock, FiHash, FiShield } from 'react-icons/fi';
import { Card, Field, UploadZone, ProgressRing, Badge, NIGERIAN_STATES } from './shared';

export const cacValid = (v) => /^(RC|BN)\s?-?\d{4,8}$/i.test(v.trim());

export const bizChecks = (b) => [
  { label: 'Legal entity name', ok: b.legalName.trim().length > 1 },
  { label: 'CAC number format', ok: cacValid(b.cac) },
  { label: 'Registered office address', ok: b.address.trim().length > 4 },
  { label: 'Authorized director', ok: b.director.trim().length > 1 },
  { label: 'Representative email', ok: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(b.repEmail) },
  { label: 'Certificate of incorporation', ok: !!b.certificate },
  { label: 'Proof of business address', ok: !!b.addressProof },
];

export function BusinessForm({ biz, set }) {
  return (
    <div className="space-y-6">
      <Card
        index={1}
        title="Official Corporate Registration Data"
        subtitle="REGISTRY: CAC NIGERIA"
        icon={FiHome}
        badge={<Badge>Must match CAC exact</Badge>}
      >
        <Field label="Registered Legal Entity Name" required icon={FiHome}
          placeholder="e.g. Stonovah Live Entertainment Ltd"
          value={biz.legalName} onChange={(e) => set('legalName', e.target.value)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field as="select" label="Entity Structure / Classification" required
            value={biz.entityType} onChange={(e) => set('entityType', e.target.value)}>
            <option>Private Limited Company (Ltd / LLC)</option>
            <option>Public Limited Company (PLC)</option>
            <option>Business Name (Registered Enterprise)</option>
            <option>Incorporated Trustees (NGO / Trust)</option>
          </Field>
          <Field label="CAC Registration Number" required icon={FiHash}
            placeholder="RC-1849204"
            value={biz.cac} onChange={(e) => set('cac', e.target.value.toUpperCase())}
            hint="Prefix with RC for Limited Entities or BN for Registered Enterprises."
            error={biz.cac && !cacValid(biz.cac) ? 'Use RC or BN followed by 4–8 digits' : ''}
            right={cacValid(biz.cac) && <span className="text-emerald-400 font-bold">• FORMAT VALID</span>} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tax Identification Number (TIN)" icon={FiFileText}
            placeholder="23940291-0001"
            right={<span className="text-neutral-500">OPTIONAL / WHT RELIEF</span>}
            value={biz.tin} onChange={(e) => set('tin', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Field as="select" label="Jurisdiction" required
              value={biz.country} onChange={(e) => set('country', e.target.value)}>
              <option>Nigeria (NG)</option>
              <option>Ghana (GH)</option>
              <option>United Kingdom (UK)</option>
            </Field>
            <Field as="select" label="State" required
              value={biz.state} onChange={(e) => set('state', e.target.value)}>
              {NIGERIAN_STATES.map((s) => <option key={s}>{s} State</option>)}
            </Field>
          </div>
        </div>

        <Field label="Registered Office Address" required icon={FiMapPin}
          placeholder="Plot 14 Victoria Island Creative Quarter, Lagos"
          value={biz.address} onChange={(e) => set('address', e.target.value)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Authorized Director Full Name" required icon={FiUser}
            placeholder="Full legal name"
            value={biz.director} onChange={(e) => set('director', e.target.value)} />
          <Field label="Representative Work Email" required icon={FiMail} type="email"
            placeholder="name@company.com"
            value={biz.repEmail} onChange={(e) => set('repEmail', e.target.value)} />
        </div>
      </Card>

      <Card
        index={2}
        title="Upload Certificate of Incorporation / CAC Status Report"
        subtitle="Official CAC Certificate (Form CAC 1.1 / Status Report / MEMART). Must be clear and legible. PDF, PNG, JPG up to 15MB."
        icon={FiFileText}
        badge={<Badge tone="grey">Max file: 15MB</Badge>}
      >
        <div>
          <label className="block text-[10px] text-neutral-400 mb-1">Primary Registration Certificate *</label>
          <UploadZone
            file={biz.certificate}
            onFile={(f) => set('certificate', f)}
            title="Drag & Drop Certificate of Incorporation"
            hint="PDF, PNG or JPG, clearly showing company name and RC number."
          />
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
            <label>Proof of Business Address *</label>
            <span>UTILITY BILL OR CORPORATE BANK STATEMENT (&lt; 3 MONTHS)</span>
          </div>
          <UploadZone
            file={biz.addressProof}
            onFile={(f) => set('addressProof', f)}
            title="Drag & Drop Business Utility Document"
            hint="Electric bill, water board notice, or official bank statement showing company name and address."
          />
        </div>
      </Card>
    </div>
  );
}

export function BusinessSidebar({ biz }) {
  const checks = bizChecks(biz);
  const percent = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  const initials = (biz.legalName || 'ST').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const telemetry = [
    ['Legal Entity Name', biz.legalName ? 'PROVIDED' : 'AWAITING', !!biz.legalName],
    ['CAC Number Format', cacValid(biz.cac) ? 'VALID' : 'AWAITING', cacValid(biz.cac)],
    ['Registration Certificate', biz.certificate ? 'UPLOADED' : 'AWAITING', !!biz.certificate],
    ['Address Document', biz.addressProof ? 'UPLOADED' : 'AWAITING', !!biz.addressProof],
  ];

  return (
    <div className="space-y-6">
      <Card index={1} className="text-center">
        <div className="flex justify-between text-[9px] font-bold tracking-widest text-neutral-400">
          <span>REAL-TIME TELEMETRY</span>
          <span className="text-red-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE LINK</span>
        </div>
        <ProgressRing percent={percent} />
        <h3 className="text-lg font-black font-sans">
          {percent === 100 ? 'Ready for Submission' : 'Registry Verification Pending'}
        </h3>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Complete every field and upload both documents. The Compliance Council verifies your CAC record after you submit.
        </p>
        <div className="bg-neutral-900 rounded-xl p-3 space-y-2 text-left text-[11px]">
          {telemetry.map(([label, status, ok]) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ scale: ok ? [1, 1.3, 1] : 1 }}
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${ok ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-neutral-600'}`}
                >
                  {ok && <FiCheck />}
                </motion.span>
                {label}
              </span>
              <span className={`text-[9px] font-bold ${ok ? 'text-emerald-400' : 'text-neutral-500'}`}>{status}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card index={2}>
        <span className="text-[9px] font-bold tracking-widest text-neutral-400">PREVIEW CREDENTIAL</span>
        <div className="bg-gradient-to-br from-neutral-900 to-red-950/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center font-black font-sans">{initials}</div>
            <div className="min-w-0">
              <span className="font-black font-sans block truncate">{biz.legalName || 'Your Legal Entity'}</span>
              <span className="text-[10px] text-neutral-400 block truncate">
                {biz.cac || 'RC-XXXXXXX'} • {biz.state.toUpperCase()}, {biz.country.slice(0, 7).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Verified corporate entities gain priority settlement access and direct integration with multi-currency banking rails.
        </p>
      </Card>

      <Card index={3} icon={FiLock} title="Bank-Grade Encryption">
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          All corporate entity records and CAC filings are encrypted and securely transmitted to verifying
          regulatory registries. Data is strictly processed for identity compliance under SEC/NDPR guidelines.
        </p>
        <div className="flex gap-4 text-[9px] font-bold text-neutral-300">
          <span className="flex items-center gap-1"><FiShield /> NDPR VALIDATED</span>
          <span className="flex items-center gap-1"><FiLock /> ENCRYPTED VAULT</span>
        </div>
      </Card>
    </div>
  );
}