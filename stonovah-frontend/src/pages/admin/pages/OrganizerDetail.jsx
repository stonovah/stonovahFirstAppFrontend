// src/pages/admin/pages/OrganizerDetail.jsx
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSlash, FiCheckCircle, FiXCircle, FiFileText, FiEye, FiEyeOff } from 'react-icons/fi';
import { Card, Pill, Btn } from '../ui';
import { FormField, inputCls } from '../ui2';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';
import { useLoad, ErrorLine, KV, humanize, ConfirmModal } from '../adminBits';
import { ORG_STATUS, KYC, EVENT_STATUS, fmtDate, ago } from '../adminLive';
import OrganizerStatusModal from './OrganizerStatusModal';

const mask = (v) => (v ? `${'•'.repeat(Math.max(0, v.length - 4))}${v.slice(-4)}` : '—');
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const SKIP = ['organizationName', 'cacNumber', 'nin'];

export default function OrganizerDetail() {
  const { id } = useParams();
  const org = useLoad(() => adminApi.organizers.get(id), [id]);
  const log = useLoad(() => adminApi.organizers.audit(id), [id]);
  const [dlg, setDlg] = useState(null); // 'verify' | 'rejectKyc' | 'approveBank' | 'rejectBank'
  const [statusOpen, setStatusOpen] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [note, setNote] = useState('');

  const o = org.data;
  if (!o) return org.error ? <Card className="p-10 text-center">{org.error} <Link to="/admin/organizers" className="text-[#FFBF00] underline">Back to directory</Link></Card> : <p className="font-mono text-xs font-bold">LOADING…</p>;

  const p = o.organizerProfile;
  const biz = p?.organizerType === 'BUSINESS';
  const st = ORG_STATUS[p?.status] || { label: '—', tone: 'grey' };
  const kyc = KYC[p?.kycStatus];
  const submitted = !!p?.organizerType;
  const docs = Object.entries(p?.kycDocuments || {});
  const meta = Object.entries(p?.kycMeta || {}).filter(([k, v]) => !SKIP.includes(k) && v !== null && v !== '');
  const br = o.pendingBankChange;
  const legal = p?.organizationName || p?.kycMeta?.fullName;
  const nameMatch = br && norm(br.accountName) && norm(legal) && (norm(br.accountName).includes(norm(legal)) || norm(legal).includes(norm(br.accountName)));
  const refresh = () => { org.reload(); log.reload(); };
  const close = () => setDlg(null);

  const run = (fn, msg) => async (n) => {
    try { await fn(n); toast.success(msg); close(); refresh(); } catch (e) { toast.error(apiErrorMessage(e)); }
  };
  const addNote = async () => {
    try { await adminApi.organizers.addNote(id, note.trim()); setNote(''); toast.success('Note added'); log.reload(); }
    catch (e) { toast.error(apiErrorMessage(e)); }
  };

  return (
    <>
      <Card className="p-3 flex flex-wrap items-center gap-3 text-[11px]">
        <Link to="/admin/organizers" className="flex items-center gap-2 font-bold hover:text-[#FFBF00]"><FiArrowLeft /> Back to Organizers Directory</Link>
        <span className="text-neutral-500">/ ENTITY RECORD:</span><span className="bg-neutral-900 px-2 py-1 rounded font-bold">{o.name}</span>
      </Card>

      <Card index={1} className="p-6 md:p-8 space-y-6 bg-gradient-to-br from-black via-black to-red-950/30">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="space-y-3 min-w-0">
            <h1 className="text-3xl md:text-5xl font-black font-sans tracking-tight break-words">{o.name}</h1>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <Pill>{biz ? 'Corporate (CAC)' : p?.organizerType === 'INDIVIDUAL' ? 'Individual (NIN)' : 'KYC not submitted'}</Pill>
              {p?.cacNumber && <Pill>{p.cacNumber}</Pill>}
              {kyc && <Pill tone={kyc.tone}>{kyc.label}</Pill>}
              <Pill tone={st.tone}>● {st.label}</Pill>
            </div>
            <p className="text-xs text-neutral-300">{o.email} • {o.phone || 'No phone'} • Joined {fmtDate(o.createdAt, false)}</p>
            {p?.statusReason && <p className="text-[11px] text-amber-300">Status reason: {p.statusReason}</p>}
          </div>
          <div className="shrink-0"><Btn onClick={() => setStatusOpen(true)}><FiSlash /> Change Account Status</Btn></div>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[['EVENTS', o.events.length], ['LIVE NOW', o.events.filter((e) => e.status === 'LIVE').length], ['IN REVIEW', o.events.filter((e) => e.status === 'PENDING').length], ['CAN SIGN IN', o.isActive ? 'Yes' : 'No']].map(([k, v]) => (
            <div key={k} className="bg-neutral-900 rounded-xl p-4"><span className="text-[9px] font-bold text-neutral-400 tracking-wider block">{k}</span><b className="text-2xl font-black font-sans">{v}</b></div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-6">
          <Card index={2} className="p-5 space-y-4">
            <div className="flex justify-between items-start gap-3"><div><h2 className="text-xl font-black font-sans">KYC Dossier</h2><p className="text-[11px] text-neutral-400">Everything the organizer submitted. Compare it with the uploaded documents.</p></div>
              <button type="button" onClick={() => setReveal((r) => !r)} className="text-[10px] font-bold text-[#FFBF00] hover:text-white flex items-center gap-1 cursor-pointer">{reveal ? <><FiEyeOff /> Hide numbers</> : <><FiEye /> Show full numbers</>}</button></div>
            {!submitted && <p className="text-xs text-neutral-400 bg-neutral-900 rounded-lg p-3">This organizer has not submitted KYC yet.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <KV k="LEGAL NAME" v={legal} />
              {p?.cacNumber && <KV k="CAC NUMBER" v={p.cacNumber} mono />}
              {p?.nin && <KV k="NIN" v={reveal ? p.nin : mask(p.nin)} mono />}
              {meta.map(([k, v]) => <KV key={k} k={humanize(k).toUpperCase()} v={String(v)} />)}
            </div>
            {docs.map(([k, url]) => (
              <div key={k} className="bg-neutral-900 rounded-xl p-3 flex items-center gap-3"><div className="w-9 h-9 rounded bg-red-950 text-red-400 flex items-center justify-center"><FiFileText /></div><div className="flex-1 min-w-0"><b className="text-xs block truncate">{humanize(k)}</b><span className="text-[10px] text-neutral-400">Uploaded document</span></div><a href={url} target="_blank" rel="noreferrer"><Btn variant="soft">Open</Btn></a></div>
            ))}
            {submitted && !docs.length && <p className="text-[11px] text-amber-300">No documents were uploaded.</p>}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800">
              <Btn disabled={!submitted || p.kycStatus === 'VERIFIED'} onClick={() => setDlg('verify')}><FiCheckCircle /> Verify KYC</Btn>
              <Btn variant="soft" disabled={!submitted || p.kycStatus === 'REJECTED'} onClick={() => setDlg('rejectKyc')}><FiXCircle /> Reject KYC…</Btn>
            </div>
            <p className="text-[10px] text-neutral-500">Registry and sanctions checks are not automated here. Verify against the CAC or NIMC record yourself before you decide. Every decision is written to the audit log.</p>
          </Card>

          <Card index={3} className="p-5 space-y-3">
            <h2 className="text-xl font-black font-sans">Events ({o.events.length})</h2>
            {!o.events.length && <p className="text-xs text-neutral-400">No events yet.</p>}
            {o.events.slice(0, 8).map((e) => (
              <Link key={e.id} to={e.status === 'PENDING' ? `/admin/events/pending/${e.id}` : `/admin/events/${e.id}`} className="block bg-neutral-900 hover:bg-neutral-800 rounded-xl p-3 transition">
                <div className="flex justify-between gap-2"><b className="text-sm font-sans">{e.title}</b><Pill tone={EVENT_STATUS[e.status].tone}>{EVENT_STATUS[e.status].label}</Pill></div>
                <span className="text-[10px] text-neutral-400">{fmtDate(e.startAt, false)}</span>
              </Link>
            ))}
          </Card>
        </div>

        <div className="xl:col-span-5 space-y-6">
          <Card index={2} className="p-5 space-y-3">
            <div className="flex justify-between items-start"><h2 className="text-xl font-black font-sans">Settlement Account</h2><Pill tone={p?.bankVerifiedAt ? 'green' : p?.bankAccountNumber ? 'amber' : 'grey'}>{p?.bankVerifiedAt ? 'Verified' : p?.bankAccountNumber ? 'Not verified' : 'Not set'}</Pill></div>
            {p?.bankAccountNumber ? (
              <div className="bg-neutral-900 rounded-xl p-3 space-y-1 text-xs"><b className="block text-sm font-sans">{p.bankName}</b><span className="font-mono block">{reveal ? p.bankAccountNumber : mask(p.bankAccountNumber)}</span><span className="text-neutral-400">{p.bankAccountName}</span>{p.bankVerifiedAt && <span className="text-[10px] text-neutral-500 block">Verified {fmtDate(p.bankVerifiedAt, false)}</span>}</div>
            ) : <p className="text-xs text-neutral-400">No settlement account on file.</p>}

            {br && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-2 text-xs">
                <b className="block">Change requested {ago(br.createdAt)}</b>
                <KV k="BANK" v={br.bankName} /><KV k="ACCOUNT NAME" v={br.accountName} /><KV k="ACCOUNT NUMBER" v={br.accountNumber} mono />
                <Pill tone={nameMatch ? 'green' : 'amber'}>{nameMatch ? 'Name matches the legal name' : 'Name does not obviously match the legal name'}</Pill>
                <p className="text-[10px] text-neutral-400">Legal name on file: {legal || '—'}. Confirm the account name with the bank before approving.</p>
                <div className="flex gap-2"><Btn onClick={() => setDlg('approveBank')}>Approve</Btn><Btn variant="soft" onClick={() => setDlg('rejectBank')}>Decline…</Btn></div>
              </div>
            )}
          </Card>

          <Card index={3} className="p-5 space-y-3">
            <h2 className="text-xl font-black font-sans">Audit Log</h2>
            <FormField label="Add an internal note" hint="Only admins see this"><textarea rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} /></FormField>
            <Btn disabled={note.trim().length < 5} onClick={addNote}>Add Audit Entry</Btn>
            <ErrorLine>{log.error}</ErrorLine>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(log.data || []).map((n) => (
                <div key={n.id} className="border-l-2 border-red-600 bg-neutral-900 rounded-r-lg px-3 py-2">
                  <div className="flex justify-between gap-2 text-[10px]"><b className="break-all">{n.authorEmail}</b><span className="text-neutral-500 shrink-0">{ago(n.createdAt)}</span></div>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{n.note}</p>
                </div>
              ))}
              {log.data && !log.data.length && <p className="text-xs text-neutral-500">No audit entries yet.</p>}
            </div>
          </Card>
        </div>
      </div>

      {dlg === 'verify' && <ConfirmModal open title="Verify this organizer’s KYC?" confirmLabel="Verify KYC" onClose={close} onConfirm={run(() => adminApi.organizers.verifyKyc(id, { verified: true }), 'KYC verified')}><p>They will be able to submit events for review. The organizer is notified.</p></ConfirmModal>}
      {dlg === 'rejectKyc' && <ConfirmModal open title="Reject this KYC?" confirmLabel="Reject KYC" noteLabel="Reason (shown to the organizer)" noteMin={10} onClose={close} onConfirm={run((n) => adminApi.organizers.verifyKyc(id, { verified: false, reason: n }), 'KYC rejected')}><p>The organizer is asked to review and resubmit. Tell them exactly what is wrong.</p></ConfirmModal>}
      {dlg === 'approveBank' && <ConfirmModal open title="Approve this settlement account?" confirmLabel="Approve account" noteLabel="Internal note (optional)" onClose={close} onConfirm={run((n) => adminApi.organizers.approveBank(br.id, n || undefined), 'Settlement account approved')} checkLabel="I have checked that the account name belongs to this organizer."><p>Payouts will be sent to {br?.bankName} {br?.accountNumber}.</p></ConfirmModal>}
      {dlg === 'rejectBank' && <ConfirmModal open title="Decline this account change?" confirmLabel="Decline" noteLabel="Reason (shown to the organizer)" noteMin={5} onClose={close} onConfirm={run((n) => adminApi.organizers.rejectBank(br.id, n), 'Request declined')}><p>The organizer keeps their current account.</p></ConfirmModal>}

      <OrganizerStatusModal org={o} open={statusOpen} onClose={() => setStatusOpen(false)} onDone={refresh} />
    </>
  );
}