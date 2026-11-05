import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiDownload, FiSend, FiCopy, FiLock, FiUnlock, FiPlus, FiTrash2, FiEdit2, FiSave, FiCheckCircle, FiLink2 } from 'react-icons/fi';
import { Card, Pill, Btn, Modal } from '../ui';
import { FormField, inputCls } from '../ui2';
import { useLoad, ErrorLine, ConfirmModal } from '../adminBits';
import { fmtDate, ago } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A } from '../../../api/adminProduction';
import { useProdAccess } from './useProdAccess';
import { ngn, mono, PROPOSAL_STATUS, STAGE_LABEL, REQ_STATUS, budgetText } from './prodAdmin';

const STAGES = ['DEVELOP', 'PREPARE', 'SHOOT', 'FINISH', 'RELEASE', 'CROSS'];
const naira = (kobo) => (kobo == null ? '' : String(Number(kobo) / 100));
const d10 = (v) => (v ? String(v).slice(0, 10) : '');

function ItemModal({ id, item, stage, onClose, onDone }) {
  const [f, setF] = useState({
    stage: item?.stage ?? stage ?? 'DEVELOP', title: item?.title ?? '', description: item?.description ?? '',
    value: item ? naira(item.valueKobo) : '', timelineLabel: item?.timelineLabel ?? '', high: item?.priority === 'HIGH',
  });
  const [busy, setBusy] = useState(false);
  const val = Number(f.value);
  const valid = f.title.trim() && f.value !== '' && val >= 0;
  const submit = async () => {
    setBusy(true);
    try {
      if (item) {
        await A.updateProposalItem(id, item.id, {
          stage: f.stage, title: f.title.trim(), description: f.description.trim() || null, value: val,
          timelineLabel: f.timelineLabel.trim() || null, priority: f.high ? 'HIGH' : null,
        });
      } else {
        await A.addProposalItem(id, {
          stage: f.stage, title: f.title.trim(), description: f.description.trim() || undefined, value: val,
          timelineLabel: f.timelineLabel.trim() || undefined, priority: f.high ? 'HIGH' : undefined,
        });
      }
      toast.success(item ? 'Line item updated' : 'Line item added');
      onDone();
    } catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };
  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-xl">
      <div className="space-y-4 p-6">
        <h2 className="pr-10 text-xl font-black">{item ? 'Edit line item' : 'Add line item'}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Phase" required><select value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })} className={inputCls}>{STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}</select></FormField>
          <FormField label="Value (₦)" required><input type="number" min="0" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} className={inputCls} /></FormField>
        </div>
        <FormField label="Title" required><input value={f.title} maxLength={160} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} /></FormField>
        <FormField label="Description"><textarea rows={4} maxLength={1500} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={inputCls} /></FormField>
        <FormField label="Timeline label" hint="For example: 3 Weeks (Sep 15 – Oct 05, 2026)"><input value={f.timelineLabel} maxLength={80} onChange={(e) => setF({ ...f, timelineLabel: e.target.value })} className={inputCls} /></FormField>
        <label className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={f.high} onChange={(e) => setF({ ...f, high: e.target.checked })} className="accent-red-600" /> Mark as high priority</label>
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!valid || busy} onClick={submit}>{busy ? 'Saving…' : item ? 'Save changes' : 'Add item'}</Btn></div>
      </div>
    </Modal>
  );
}

function SentModal({ res, onClose }) {
  const copy = async () => { try { await navigator.clipboard.writeText(res.link); toast.success('Link copied'); } catch { toast.error('Could not copy'); } };
  return (
    <Modal open onClose={onClose} width="max-w-lg">
      <div className="space-y-4 p-6">
        <h2 className="pr-10 text-xl font-black">{res.emailSent ? 'Proposal sent' : 'Proposal ready, email not sent'}</h2>
        <p className="text-xs leading-relaxed text-white/65">{res.emailSent ? 'The client has been emailed the PDF and a private link to review and respond.' : 'The email could not be delivered. The proposal is marked Sent, so copy the link below and send it to the client yourself.'}</p>
        <div className="break-all rounded-lg bg-neutral-900 p-3 font-mono text-[11px]">{res.link}</div>
        <p className="text-[10px] text-white/40">This link is shown once. Sending again creates a new one and the old link stops working.</p>
        <div className="flex gap-2"><Btn variant="soft" onClick={onClose}>Close</Btn><Btn onClick={copy}><FiCopy /> Copy link</Btn></div>
      </div>
    </Modal>
  );
}

function Editor({ r, producers, onChange }) {
  const navigate = useNavigate();
  const { can } = useProdAccess();
  const [dlg, setDlg] = useState(null);
  const [sent, setSent] = useState(null);
  const [busy, setBusy] = useState(false);
  const editable = r.editable && can.finance;
  const pay0 = r.paymentPlan.map((t) => ({ label: t.label, pct: t.pct }));
  const [h, setH] = useState({
    title: r.title, clientName: r.client.name, clientEmail: r.client.email, clientCompany: r.client.company ?? '',
    formatLabel: r.formatLabel ?? '', scopeLabel: r.scopeLabel ?? '', producerId: r.producer?.id ?? '', validUntil: d10(r.validUntil),
    revisionRounds: r.revisionRounds, contingencyPct: r.ledger.contingencyPct, tax: naira(r.ledger.taxKobo), taxNote: r.ledger.taxNote ?? '',
    producerNotes: r.producerNotes ?? '', pay: pay0,
  });
  const set = (k, v) => setH((p) => ({ ...p, [k]: v }));
  const paySum = h.pay.reduce((n, t) => n + (Number(t.pct) || 0), 0);
  const payOk = Math.round(paySum * 100) === 10000 && h.pay.every((t) => t.label.trim() && Number(t.pct) >= 1);

  const body = () => {
    const b = {};
    const diff = (k, v, cur) => { if (v !== cur) b[k] = v; };
    diff('title', h.title.trim(), r.title);
    diff('clientName', h.clientName.trim(), r.client.name);
    diff('clientEmail', h.clientEmail.trim(), r.client.email);
    diff('clientCompany', h.clientCompany.trim() || null, r.client.company ?? null);
    diff('formatLabel', h.formatLabel.trim() || null, r.formatLabel ?? null);
    diff('scopeLabel', h.scopeLabel.trim() || null, r.scopeLabel ?? null);
    diff('producerId', h.producerId || null, r.producer?.id ?? null);
    if (h.validUntil && h.validUntil !== d10(r.validUntil)) b.validUntil = h.validUntil;
    diff('revisionRounds', Number(h.revisionRounds), r.revisionRounds);
    diff('contingencyPct', Number(h.contingencyPct), r.ledger.contingencyPct);
    if (Number(h.tax || 0) !== Number(naira(r.ledger.taxKobo) || 0)) b.tax = Number(h.tax || 0);
    diff('taxNote', h.taxNote.trim() || null, r.ledger.taxNote ?? null);
    diff('producerNotes', h.producerNotes.trim() || null, r.producerNotes ?? null);
    if (JSON.stringify(h.pay.map((t) => [t.label.trim(), Number(t.pct)])) !== JSON.stringify(pay0.map((t) => [t.label, t.pct]))) b.paymentStructure = h.pay.map((t) => ({ label: t.label.trim(), pct: Number(t.pct) }));
    return b;
  };
  const dirty = Object.keys(body()).length > 0;

  const run = async (fn, ok) => { setBusy(true); try { const res = await fn(); if (ok) toast.success(ok); onChange(); return res; } catch (e) { toast.error(apiErrorMessage(e)); } finally { setBusy(false); } };
  const save = () => run(() => A.patchProposal(r.id, body()), 'Details saved');
  const send = async () => {
    if (dirty && !window.confirm('You have unsaved changes that will not be in the sent proposal. Send anyway?')) return;
    const res = await run(() => A.sendProposal(r.id));
    if (res) setSent(res);
  };
  const duplicate = async () => { const p = await run(() => A.duplicateProposal(r.id), 'New version created'); if (p) navigate(`/admin/production/proposals/${p.id}`); };
  const convert = async () => { const p = await run(() => A.convertProposal(r.id), 'Project mobilized'); if (p) navigate(`/admin/production/projects/${p.id}`); };
  const toggleLock = (i) => run(() => A.updateProposalItem(r.id, i.id, { locked: !i.locked }));

  const st = PROPOSAL_STATUS[r.status];
  const L = r.ledger;
  const lk = r.clientLink;

  return (
    <>
      <Card className="flex flex-wrap items-center gap-3 p-3 text-[11px]">
        <Link to="/admin/production/proposals" className="flex items-center gap-2 font-bold hover:text-[#FFBF00]"><FiArrowLeft /> Back to proposals</Link>
        <span className="text-white/40">/</span><b className="rounded bg-neutral-900 px-2 py-1 font-mono">{r.reference}</b>
        {r.request && <Link to={`/admin/production/requests/${r.request.id}`} className="text-white/55 hover:text-white">Linked: {r.request.reference}</Link>}
      </Card>

      <Card index={1} className="flex flex-wrap items-start justify-between gap-4 border-l-4 border-l-red-600 p-6">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2"><Pill tone={st.tone}>{st.label}</Pill><Pill>V{r.version}</Pill>{r.status !== 'DRAFT' && <Pill tone="amber">Locked: duplicate to change</Pill>}</div>
          <h1 className="text-2xl font-black md:text-4xl">Production Agreement & Commercial Quote: {r.title}</h1>
          <p className="text-xs text-white/50">Prepared by {r.createdByEmail} • {fmtDate(r.createdAt, false)}</p>
        </div>
        <div className="flex gap-3 text-right">
          <div className="rounded-xl bg-neutral-900 p-4"><span className={`${mono} block text-[9px] text-white/40`}>Contract valuation</span><b className="text-2xl font-black">{ngn(L.totalKobo, true)}</b></div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          {/* line items */}
          <Card index={2} className="space-y-5 p-6">
            <div><h2 className="text-xl font-black">Itemized scope of services & deliverables</h2><p className="text-[11px] text-white/45">Script-to-screen modular cost architecture across pre-production and filming.</p></div>
            {!r.phases.length && <p className="rounded-lg bg-neutral-900 p-4 text-sm text-white/45">No line items yet. {editable ? 'Add the first one below.' : ''}</p>}
            {r.phases.map((ph, n) => (
              <div key={ph.stage} className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-4 py-2"><span className={`${mono} text-red-400`}>Phase 0{n + 1} • {ph.label}</span><b className="text-xs">{ngn(ph.subtotalKobo, true)}</b></div>
                {ph.items.map((i) => (
                  <div key={i.id} className="rounded-xl border border-white/[0.07] bg-neutral-950 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <b className="text-sm">{i.title}</b>
                        {i.priority === 'HIGH' && <Pill tone="red" className="ml-2">High priority</Pill>}
                        {i.locked && <Pill tone="amber" className="ml-2"><FiLock /> Locked</Pill>}
                        {i.description && <p className="mt-1 text-xs leading-relaxed text-white/55">{i.description}</p>}
                        {i.timelineLabel && <p className="mt-2 text-[11px] text-white/40">{i.timelineLabel}</p>}
                      </div>
                      <div className="shrink-0 text-right"><b className="block text-base">{ngn(i.valueKobo, true)}</b>
                        {editable && (
                          <span className="mt-2 flex justify-end gap-1">
                            <Btn variant="soft" className="px-2.5 py-1.5" disabled={busy} onClick={() => toggleLock(i)} title={i.locked ? 'Unlock' : 'Lock'}>{i.locked ? <FiUnlock /> : <FiLock />}</Btn>
                            <Btn variant="soft" className="px-2.5 py-1.5" disabled={i.locked || busy} onClick={() => setDlg({ t: 'item', item: i })}><FiEdit2 /></Btn>
                            <Btn variant="soft" className="px-2.5 py-1.5" disabled={i.locked || busy} onClick={() => setDlg({ t: 'remove', item: i })}><FiTrash2 /></Btn>
                          </span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {editable && <Btn variant="soft" onClick={() => setDlg({ t: 'item' })}><FiPlus /> Add custom line item</Btn>}
          </Card>

          {/* details */}
          <Card index={3} className="space-y-4 p-6">
            <h2 className="text-xl font-black">Proposal details</h2>
            <fieldset disabled={!editable} className="space-y-4 disabled:opacity-70">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Project title" required><input value={h.title} maxLength={160} onChange={(e) => set('title', e.target.value)} className={inputCls} /></FormField>
                <FormField label="Format label"><input value={h.formatLabel} maxLength={60} onChange={(e) => set('formatLabel', e.target.value)} className={inputCls} /></FormField>
                <FormField label="Client name" required><input value={h.clientName} maxLength={120} onChange={(e) => set('clientName', e.target.value)} className={inputCls} /></FormField>
                <FormField label="Client email" required><input type="email" value={h.clientEmail} onChange={(e) => set('clientEmail', e.target.value)} className={inputCls} /></FormField>
                <FormField label="Company"><input value={h.clientCompany} maxLength={160} onChange={(e) => set('clientCompany', e.target.value)} className={inputCls} /></FormField>
                <FormField label="Scope label"><input value={h.scopeLabel} maxLength={80} onChange={(e) => set('scopeLabel', e.target.value)} className={inputCls} /></FormField>
                <FormField label="Proposal valid until" hint="Must be a future date to send."><input type="date" value={h.validUntil} onChange={(e) => set('validUntil', e.target.value)} className={inputCls} /></FormField>
                <FormField label="Included revision rounds"><input type="number" min="0" max="10" value={h.revisionRounds} onChange={(e) => set('revisionRounds', e.target.value)} className={inputCls} /></FormField>
                <FormField label="Supervising producer"><select value={h.producerId} onChange={(e) => set('producerId', e.target.value)} className={inputCls}><option value="">Unassigned</option>{producers.map((p) => <option key={p.id} value={p.id}>{p.email}</option>)}</select></FormField>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <FormField label="Studio management & contingency (%)"><input type="number" min="0" max="50" step="0.5" value={h.contingencyPct} onChange={(e) => set('contingencyPct', e.target.value)} className={inputCls} /></FormField>
                <FormField label="Taxes & levies (₦)"><input type="number" min="0" value={h.tax} onChange={(e) => set('tax', e.target.value)} className={inputCls} /></FormField>
                <FormField label="Tax note"><input value={h.taxNote} maxLength={120} onChange={(e) => set('taxNote', e.target.value)} className={inputCls} /></FormField>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between"><span className={`${mono} text-white/45`}>Payment milestones</span><span className={`text-[11px] font-bold ${payOk ? 'text-emerald-400' : 'text-red-400'}`}>{paySum}% of 100%</span></div>
                {h.pay.map((t, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={t.label} maxLength={60} placeholder="Label" onChange={(e) => set('pay', h.pay.map((x, n) => (n === i ? { ...x, label: e.target.value } : x)))} className={inputCls} />
                    <input type="number" min="1" max="100" value={t.pct} onChange={(e) => set('pay', h.pay.map((x, n) => (n === i ? { ...x, pct: e.target.value } : x)))} className={`${inputCls} w-24`} />
                    <Btn variant="soft" className="px-3" disabled={h.pay.length <= 1} onClick={() => set('pay', h.pay.filter((_, n) => n !== i))}><FiTrash2 /></Btn>
                  </div>
                ))}
                {h.pay.length < 6 && <Btn variant="soft" onClick={() => set('pay', [...h.pay, { label: '', pct: 0 }])}><FiPlus /> Add milestone</Btn>}
              </div>

              <FormField label="Special conditions (shown to the client)"><textarea rows={4} maxLength={3000} value={h.producerNotes} onChange={(e) => set('producerNotes', e.target.value)} className={inputCls} /></FormField>
            </fieldset>
            {editable && <Btn disabled={!dirty || !payOk || busy} onClick={save}><FiSave /> {busy ? 'Saving…' : 'Save details'}</Btn>}
            {editable && dirty && !payOk && <p className="text-[11px] text-red-400">Payment milestones must add up to exactly 100%.</p>}
          </Card>

          {/* ledger */}
          <Card index={4} className="space-y-3 p-6">
            <h2 className="text-xl font-black">Consolidated commercial ledger</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-white/55">Subtotal ({r.phases.reduce((n, p) => n + p.items.length, 0)} line items)</dt><dd>{ngn(L.subtotalKobo, true)}</dd></div>
              <div className="flex justify-between"><dt className="text-white/55">Studio management & contingency ({L.contingencyPct}%)</dt><dd>{ngn(L.contingencyKobo, true)}</dd></div>
              <div className="flex justify-between"><dt className="text-white/55">Taxes & levies{L.taxNote ? ` (${L.taxNote})` : ''}</dt><dd>{ngn(L.taxKobo, true)}</dd></div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-xl font-black"><dt>Grand total</dt><dd className="text-[#e10613]">{ngn(L.totalKobo, true)}</dd></div>
            </dl>
            <div className="border-t border-white/10 pt-3">
              <span className={`${mono} text-white/45`}>Payment milestones (from saved structure)</span>
              {r.paymentPlan.map((t) => <div key={t.sequence} className="mt-2 flex justify-between text-xs"><span className="text-white/60">{t.label} ({t.pct}%)</span><b>{ngn(t.amountKobo, true)}</b></div>)}
            </div>
          </Card>

          {r.request && (
            <Card index={5} className="space-y-2 p-6">
              <h2 className="text-xl font-black">Original client brief</h2>
              <p className="text-xs text-white/55">{r.request.projectTitle} • {r.request.mode === 'FULL' ? 'Full turnkey' : 'À la carte'} • budget {budgetText(r.request)}</p>
              <div className="flex flex-wrap gap-2">{r.request.services.map((s) => <Pill key={s}>{s}</Pill>)}</div>
              <Pill tone={REQ_STATUS[r.request.status].tone}>Request: {REQ_STATUS[r.request.status].label}</Pill>
            </Card>
          )}
        </div>

        {/* sidebar */}
        <div className="space-y-6 xl:col-span-4">
          <Card index={2} className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Workflow & delivery</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-neutral-900 p-3"><span className="block text-[9px] text-white/40">STATE</span><Pill tone={st.tone}>{st.label}</Pill></div>
              <div className="rounded-lg bg-neutral-900 p-3"><span className="block text-[9px] text-white/40">VALID UNTIL</span><b>{r.validUntil ? fmtDate(r.validUntil, false) : '—'}</b></div>
            </div>
            {r.producer && <p className="text-xs text-white/55">Producer: <b className="text-white">{r.producer.email}</b></p>}
            <div className="space-y-2 pt-1">
              <Btn variant="soft" className="w-full" onClick={() => A.proposalPdf(r.id).catch((e) => toast.error(apiErrorMessage(e)))}><FiDownload /> Preview / download PDF</Btn>
              {['DRAFT', 'SENT'].includes(r.status) && <Btn className="w-full" disabled={!can.finance || busy} onClick={send}><FiSend /> {r.status === 'DRAFT' ? 'Send to client' : 'Re-send with a new link'}</Btn>}
              <Btn variant="soft" className="w-full" disabled={!can.finance || busy} onClick={duplicate}><FiCopy /> Duplicate as new version</Btn>
            </div>
            {!can.finance && <p className="text-[10px] text-white/35">Only Lead or Finance roles can change proposals.</p>}
          </Card>

          <Card index={3} className="space-y-3 p-5">
            <span className={`${mono} flex items-center gap-2 text-white/45`}><FiLink2 /> Client link</span>
            {!lk.sentAt ? <p className="text-xs text-white/40">Not sent yet.</p> : (
              <div className="space-y-1 text-xs text-white/65">
                <p>Sent {fmtDate(lk.sentAt)}</p>
                <p>{lk.firstOpenedAt ? `First opened ${ago(lk.firstOpenedAt)}` : 'Not opened yet'}</p>
                {lk.respondedAt && <p>Responded {fmtDate(lk.respondedAt)}</p>}
                {lk.declineReason && <p className="rounded-lg bg-neutral-900 p-3"><b>Decline reason:</b> {lk.declineReason}</p>}
                <Pill tone={lk.active ? 'green' : 'grey'}>{lk.active ? 'Link active' : 'Link inactive'}</Pill>
              </div>
            )}
            {lk.active && <Btn variant="soft" className="w-full" disabled={!can.finance} onClick={() => setDlg({ t: 'revoke' })}>Revoke client link</Btn>}
          </Card>

          <Card index={4} className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Execution milestone</span>
            {r.status === 'SENT' && (
              <div className="space-y-2">
                <p className="text-[11px] text-white/45">Record the client’s answer if it came outside the link.</p>
                <Btn variant="soft" className="w-full" disabled={!can.finance} onClick={() => setDlg({ t: 'status', status: 'ACCEPTED' })}><FiCheckCircle /> Mark as client accepted</Btn>
                <div className="grid grid-cols-2 gap-2"><Btn variant="soft" disabled={!can.finance} onClick={() => setDlg({ t: 'status', status: 'DECLINED' })}>Mark declined</Btn><Btn variant="soft" disabled={!can.finance} onClick={() => setDlg({ t: 'status', status: 'EXPIRED' })}>Mark expired</Btn></div>
              </div>
            )}
            {r.status === 'ACCEPTED' && !r.project && (
              <div className="space-y-2"><p className="text-xs text-white/60">Accepted. Convert it into an active project with SOW items and payment tranches.</p><Btn className="w-full" disabled={!can.write || busy} onClick={convert}>Convert to active project</Btn></div>
            )}
            {r.project && <Link to={`/admin/production/projects/${r.project.id}`} className="block rounded-lg bg-neutral-900 p-3 text-xs hover:bg-neutral-800">Converted to project <b className="font-mono">{r.project.reference}</b></Link>}
            {['DRAFT', 'DECLINED', 'EXPIRED'].includes(r.status) && !r.project && <p className="text-xs text-white/40">{r.status === 'DRAFT' ? 'Send the proposal to move it forward.' : 'This proposal is closed. Duplicate it to send a revised version.'}</p>}
          </Card>

          <Card index={5} className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Audit log</span>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {r.activity.map((a) => <div key={a.id} className="border-l-2 border-red-600 bg-neutral-900 px-3 py-2"><div className="flex justify-between gap-2 text-[10px]"><b className="break-all">{a.actor}</b><span className="shrink-0 text-white/40">{ago(a.createdAt)}</span></div><p className="mt-1 text-xs text-white/70">{a.message}</p></div>)}
            </div>
          </Card>
        </div>
      </div>

      {dlg?.t === 'item' && <ItemModal id={r.id} item={dlg.item} stage={dlg.item?.stage} onClose={() => setDlg(null)} onDone={() => { setDlg(null); onChange(); }} />}
      {dlg?.t === 'remove' && (
        <ConfirmModal open title="Remove this line item?" confirmLabel="Remove" onClose={() => setDlg(null)}
          onConfirm={async () => { try { await A.removeProposalItem(r.id, dlg.item.id); toast.success('Line item removed'); setDlg(null); onChange(); } catch (e) { toast.error(apiErrorMessage(e)); } }}>
          <p>“{dlg.item.title}” ({ngn(dlg.item.valueKobo, true)}) is removed and the totals are recalculated.</p>
        </ConfirmModal>
      )}
      {dlg?.t === 'revoke' && (
        <ConfirmModal open title="Revoke the client link?" confirmLabel="Revoke link" onClose={() => setDlg(null)}
          onConfirm={async () => { try { await A.revokeProposalLink(r.id); toast.success('Link revoked'); setDlg(null); onChange(); } catch (e) { toast.error(apiErrorMessage(e)); } }}>
          <p>The client will no longer be able to open or answer this proposal from the emailed link. You can re-send to issue a new one.</p>
        </ConfirmModal>
      )}
      {dlg?.t === 'status' && (
        <ConfirmModal open title={`Mark this proposal ${dlg.status.toLowerCase()}?`} confirmLabel="Confirm" noteLabel={dlg.status === 'DECLINED' ? 'Reason' : undefined} noteMin={dlg.status === 'DECLINED' ? 3 : 0} onClose={() => setDlg(null)}
          onConfirm={async (n) => { try { await A.setProposalStatus(r.id, { status: dlg.status, note: n || undefined }); toast.success('Status recorded'); setDlg(null); onChange(); } catch (e) { toast.error(apiErrorMessage(e)); } }}>
          <p>{dlg.status === 'ACCEPTED' ? 'The linked request moves to Accepted and you can convert this to a project.' : dlg.status === 'EXPIRED' ? 'The client link is switched off.' : 'This is recorded in the audit log.'}</p>
        </ConfirmModal>
      )}
      {sent && <SentModal res={sent} onClose={() => setSent(null)} />}
    </>
  );
}

export default function ProdProposalDetail() {
  const { id } = useParams();
  const d = useLoad(() => A.proposal(id), [id]);
  const prod = useLoad(() => A.producers());
  const r = d.data;
  if (!r) return d.error ? <Card className="p-10 text-center">{d.error} <Link to="/admin/production/proposals" className="text-[#FFBF00] underline">Back to proposals</Link></Card> : <p className="font-mono text-xs font-bold">LOADING…</p>;
  // Every change writes an audit entry, so its id re-initialises the form from fresh server data.
  return <Editor key={`${r.id}:${r.activity[0]?.id}`} r={r} producers={prod.data ?? []} onChange={d.reload} />;
}