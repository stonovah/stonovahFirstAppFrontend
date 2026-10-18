// src/pages/organizer/SettlementAccount.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiShield } from 'react-icons/fi';
import { Card, Pill, Btn, Modal } from '../admin/ui';
import { FormField, inputCls } from '../admin/ui2';
import { financeApi } from '../../api/finance';
import { apiErrorMessage } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

const STATUS = {
  VERIFIED: { label: 'Verified', tone: 'green' },
  UNVERIFIED: { label: 'Awaiting verification', tone: 'amber' },
  NOT_SET: { label: 'Not set', tone: 'grey' },
};

export default function SettlementAccountCard({ bank, onChanged, canEdit = true }) {
  const { user } = useAuth();
  const kycOk = user?.organizerProfile?.kycStatus === 'VERIFIED';
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ bankName: '', accountNumber: '', accountName: '', ok: false });
  const [busy, setBusy] = useState(false);

  const numOk = /^\d{10}$/.test(f.accountNumber);
  const valid = f.bankName.trim().length >= 2 && numOk && f.accountName.trim().length >= 3 && f.ok;
  const st = STATUS[bank.status] || STATUS.NOT_SET;

  const submit = async () => {
    setBusy(true);
    try {
      await financeApi.requestBankChange({ bankName: f.bankName.trim(), accountNumber: f.accountNumber, accountName: f.accountName.trim() });
      toast.success('Sent to Stonovah compliance for verification');
      setF({ bankName: '', accountNumber: '', accountName: '', ok: false });
      setOpen(false);
      onChanged?.();
    } catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <>
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold text-neutral-500 flex items-center gap-1"><FiShield /> SETTLEMENT ACCOUNT</span>
          <Pill tone={st.tone}>{st.label}</Pill>
        </div>

        {bank.current ? (
          <div className="bg-neutral-900 rounded-xl p-3 text-xs space-y-1">
            <b className="block">{bank.current.bankName} •••• {bank.current.last4}</b>
            <span className="text-neutral-400">{bank.current.accountName}</span>
          </div>
        ) : (
          <p className="text-xs text-neutral-400">No settlement account yet. Payouts can only be sent to a verified account in your name.</p>
        )}

        {bank.status === 'UNVERIFIED' && (
          <p className="text-[11px] text-amber-300">This account has not been verified. Submit it for verification to receive payouts.</p>
        )}

        {bank.pending && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs">
            <b>Waiting for review:</b> {bank.pending.bankName} •••• {bank.pending.last4} ({bank.pending.accountName}). Compliance will check that the account name matches your KYC record.
          </div>
        )}
        {bank.lastRejection && (
          <div className="bg-red-950/40 border border-red-900 rounded-xl p-3 text-xs">
            <b>Your last request was declined.</b> {bank.lastRejection.note || 'Please check the details and try again.'}
          </div>
        )}

        {!kycOk && <p className="text-[11px] text-neutral-400">Your KYC must be verified before you can add a settlement account.</p>}

        <Btn variant="soft" className="w-full" disabled={!!bank.pending || !kycOk || !canEdit} onClick={() => setOpen(true)}>
          {bank.status === 'NOT_SET' ? 'Add settlement account' : bank.status === 'UNVERIFIED' ? 'Verify or replace account' : 'Request account change'}
        </Btn>
        {!canEdit && <p className="text-[10px] text-neutral-500">Your role can view the settlement account but not change it.</p>}
        <p className="text-[10px] text-neutral-500">Every change is reviewed by Stonovah before it takes effect, to protect your funds.</p>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} width="max-w-lg">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-black font-sans pr-10">{bank.status === 'NOT_SET' ? 'Add settlement account' : 'Request settlement account change'}</h2>
          <FormField label="Bank name" required><input value={f.bankName} onChange={(e) => setF({ ...f, bankName: e.target.value })} className={inputCls} /></FormField>
          <FormField label="Account number (10 digits)" required error={f.accountNumber && !numOk ? 'Enter exactly 10 digits' : ''}>
            <input inputMode="numeric" maxLength={10} value={f.accountNumber} onChange={(e) => setF({ ...f, accountNumber: e.target.value.replace(/\D/g, '') })} className={`${inputCls} font-mono`} />
          </FormField>
          <FormField label="Account name" required hint="Must match your verified legal name"><input value={f.accountName} onChange={(e) => setF({ ...f, accountName: e.target.value })} className={inputCls} /></FormField>
          <label className="flex gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={f.ok} onChange={(e) => setF({ ...f, ok: e.target.checked })} className="mt-0.5 accent-red-600" />
            I confirm I own this account and authorize payouts to it once verified.
          </label>
          <div className="flex gap-2">
            <Btn variant="soft" onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn disabled={!valid || busy} onClick={submit}>{busy ? 'Sending…' : 'Submit for Verification'}</Btn>
          </div>
        </div>
      </Modal>
    </>
  );
}