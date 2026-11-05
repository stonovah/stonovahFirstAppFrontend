import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiAlertTriangle, FiCheck, FiCopy, FiEdit2, FiExternalLink, FiPlus, FiSend, FiTrash2, FiUserPlus, FiUserX } from 'react-icons/fi';
import { Card, Pill, Btn, Modal, Bar, useNow } from '../ui';
import { FormField, inputCls } from '../ui2';
import { useLoad, ErrorLine, ConfirmModal } from '../adminBits';
import { fmtDate, ago } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A } from '../../../api/adminProduction';
import { Select } from '../ui2';
import { useProdAccess } from './useProdAccess';
import { ngn, mono, SOURCING_STATUS, ROLE_STATUS, CANDIDATE_STATUS, ROLE_CATEGORY, CATEGORY_OPTIONS, nairaStr, d10 } from './prodAdmin';

const CAND_OPTS = ['PROPOSED', 'SHORTLISTED', 'CLIENT_PREFERRED', 'BACKUP', 'REJECTED', 'WITHDRAWN'].map((v) => ({ value: v, label: CANDIDATE_STATUS[v].label }));

function useBusy() {
  const [busy, setBusy] = useState(false);
  const go = async (fn, ok, done) => { setBusy(true); try { const r = await fn(); if (ok) toast.success(ok); done(r); } catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); } };
  return [busy, go];
}
function Dlg({ title, sub, onClose, children, width = 'max-w-lg' }) {
  return <Modal open onClose={onClose} width={width}><div className="space-y-4 p-6"><div className="pr-10"><h2 className="text-xl font-black">{title}</h2>{sub && <p className="mt-1 text-[11px] text-white/45">{sub}</p>}</div>{children}</div></Modal>;
}
const Actions = ({ busy, onClose, onSave, valid, label }) => (
  <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!valid || busy} onClick={onSave}>{busy ? 'Saving…' : label}</Btn></div>
);

const left = (deadline, now) => {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - now;
  if (ms <= 0) return { text: 'Overdue', late: true };
  const h = Math.floor(ms / 3600000);
  return { text: h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h left` : `${h}h ${Math.floor((ms % 3600000) / 60000)}m left`, late: h < 6 };
};

/* ───────── dossier edit ───────── */
function EditModal({ d, producers, onClose, onDone }) {
  const [f, setF] = useState({ projectTitle: d.projectTitle, clientName: d.client.name, clientEmail: d.client.email ?? '', shootStart: d10(d.shootStart), shootEnd: d10(d.shootEnd), locations: d.locations ?? '', notes: d.notes ?? '', leadId: d.lead?.id ?? '' });
  const [busy, go] = useBusy();
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const dateErr = f.shootStart && f.shootEnd && f.shootEnd < f.shootStart ? 'The shoot ends before it starts' : '';
  const emailErr = f.clientEmail && !/^\S+@\S+\.\S+$/.test(f.clientEmail.trim()) ? 'Enter a valid email' : '';
  const save = () => {
    const b = {}; const diff = (k, v, cur) => { if (v !== cur) b[k] = v; };
    diff('projectTitle', f.projectTitle.trim(), d.projectTitle); diff('clientName', f.clientName.trim(), d.client.name);
    diff('clientEmail', f.clientEmail.trim() || null, d.client.email ?? null); diff('shootStart', f.shootStart || null, d10(d.shootStart) || null);
    diff('shootEnd', f.shootEnd || null, d10(d.shootEnd) || null); diff('locations', f.locations.trim() || null, d.locations ?? null);
    diff('notes', f.notes.trim() || null, d.notes ?? null); diff('leadId', f.leadId || null, d.lead?.id ?? null);
    if (!Object.keys(b).length) return onClose();
    go(() => A.patchDossier(d.id, b), 'Dossier updated', onDone);
  };
  return (
    <Dlg title="Edit dossier" onClose={() => !busy && onClose()} width="max-w-2xl">
      <FormField label="Lead producer"><Select value={f.leadId} onChange={(v) => set('leadId', v)} options={[{ value: '', label: 'Unassigned' }, ...producers.map((p) => ({ value: p.id, label: p.email }))]} /></FormField>
      <FormField label="Project title" required><input value={f.projectTitle} maxLength={160} onChange={(e) => set('projectTitle', e.target.value)} className={inputCls} /></FormField>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Client name" required><input value={f.clientName} maxLength={120} onChange={(e) => set('clientName', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Client email" error={emailErr}><input type="email" value={f.clientEmail} onChange={(e) => set('clientEmail', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Shoot start"><input type="date" value={f.shootStart} onChange={(e) => set('shootStart', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Shoot end" error={dateErr}><input type="date" value={f.shootEnd} onChange={(e) => set('shootEnd', e.target.value)} className={inputCls} /></FormField>
      </div>
      <FormField label="Locations"><input value={f.locations} maxLength={300} onChange={(e) => set('locations', e.target.value)} className={inputCls} /></FormField>
      <FormField label="Notes"><textarea rows={3} maxLength={2000} value={f.notes} onChange={(e) => set('notes', e.target.value)} className={inputCls} /></FormField>
      <Actions busy={busy} valid={f.projectTitle.trim() && f.clientName.trim() && !dateErr && !emailErr} onClose={onClose} onSave={save} label="Save changes" />
    </Dlg>
  );
}

/* ───────── roles ───────── */
function RoleModal({ id, role, onClose, onDone }) {
  const [f, setF] = useState({ title: role?.title ?? '', category: role?.category ?? 'CREW', qty: role?.qty ?? 1, windowStart: d10(role?.windowStart), windowEnd: d10(role?.windowEnd), rateCap: role ? nairaStr(role.rateCapKobo) : '', isKey: !!role?.isKey, notes: role?.notes ?? '' });
  const [busy, go] = useBusy();
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const dateErr = f.windowStart && f.windowEnd && f.windowEnd < f.windowStart ? 'The window ends before it starts' : '';
  const qtyOk = Number.isInteger(Number(f.qty)) && Number(f.qty) >= 1 && Number(f.qty) <= 500;
  const locked = role && ['BOOKED', 'CONTRACTED', 'DROPOUT'].includes(role.status);
  const save = () => {
    const b = { title: f.title.trim(), category: f.category, qty: Number(f.qty), isKey: f.isKey, windowStart: f.windowStart || null, windowEnd: f.windowEnd || null, rateCap: f.rateCap === '' ? null : Number(f.rateCap), notes: f.notes.trim() || (role ? null : undefined) };
    go(() => (role ? A.updateRole(id, role.id, b) : A.addRole(id, b)), role ? 'Role updated' : 'Role added', onDone);
  };
  return (
    <Dlg title={role ? 'Edit role' : 'Add role requirement'} onClose={() => !busy && onClose()}>
      <FormField label="Role title" required><input value={f.title} maxLength={120} onChange={(e) => set('title', e.target.value)} className={inputCls} /></FormField>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Category"><Select value={f.category} onChange={(v) => set('category', v)} options={CATEGORY_OPTIONS} /></FormField>
        <FormField label="Headcount" error={qtyOk ? '' : '1 to 500'} hint={locked ? 'Locked on a booked, contracted or dropout role.' : ''}><input type="number" min="1" disabled={locked} value={f.qty} onChange={(e) => set('qty', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Window start"><input type="date" value={f.windowStart} onChange={(e) => set('windowStart', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Window end" error={dateErr}><input type="date" value={f.windowEnd} onChange={(e) => set('windowEnd', e.target.value)} className={inputCls} /></FormField>
      </div>
      <FormField label="Rate cap per person (₦)" hint="Leave empty for no cap."><input type="number" min="0" value={f.rateCap} onChange={(e) => set('rateCap', e.target.value)} className={inputCls} /></FormField>
      <FormField label="Notes"><textarea rows={2} maxLength={500} value={f.notes} onChange={(e) => set('notes', e.target.value)} className={inputCls} /></FormField>
      <label className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={f.isKey} onChange={(e) => set('isKey', e.target.checked)} className="accent-red-600" /> Key role (head of department or lead cast)</label>
      <Actions busy={busy} valid={f.title.trim() && qtyOk && !dateErr} onClose={onClose} onSave={save} label={role ? 'Save changes' : 'Add role'} />
    </Dlg>
  );
}

/* ───────── candidates ───────── */
function CandidateModal({ id, roleId, c, onClose, onDone }) {
  const [f, setF] = useState({ name: c?.name ?? '', guild: c?.guild ?? '', matchScore: c?.matchScore ?? '', quote: c ? nairaStr(c.quoteKobo) : '', availability: c?.availability ?? '', reelUrl: c?.reelUrl ?? '', notes: c?.notes ?? '', talentId: c?.talentId ?? '', status: 'PROPOSED' });
  const [busy, go] = useBusy();
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const scoreOk = f.matchScore === '' || (Number.isInteger(Number(f.matchScore)) && Number(f.matchScore) >= 0 && Number(f.matchScore) <= 100);
  const urlOk = !f.reelUrl.trim() || /^https?:\/\/\S+$/.test(f.reelUrl.trim());
  const save = () => {
    if (c) {
      return go(() => A.updateCandidate(id, c.id, {
        name: f.name.trim(), guild: f.guild.trim() || null, matchScore: f.matchScore === '' ? null : Number(f.matchScore),
        quote: f.quote === '' ? null : Number(f.quote), availability: f.availability.trim() || null, reelUrl: f.reelUrl.trim() || null, notes: f.notes.trim() || null,
      }), 'Candidate updated', onDone);
    }
    go(() => A.addCandidate(id, roleId, {
      name: f.name.trim(), guild: f.guild.trim() || undefined, talentId: f.talentId.trim() || undefined, matchScore: f.matchScore === '' ? undefined : Number(f.matchScore),
      quote: f.quote === '' ? undefined : Number(f.quote), availability: f.availability.trim() || undefined, reelUrl: f.reelUrl.trim() || undefined,
      notes: f.notes.trim() || undefined, status: f.status,
    }), 'Candidate added', onDone);
  };
  return (
    <Dlg title={c ? 'Edit candidate' : 'Add candidate'} sub="The client never sees the match score or your notes." onClose={() => !busy && onClose()} width="max-w-xl">
      <FormField label="Full name" required><input value={f.name} maxLength={120} onChange={(e) => set('name', e.target.value)} className={inputCls} /></FormField>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Guild / affiliation"><input value={f.guild} maxLength={80} onChange={(e) => set('guild', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Match score (0 to 100)" error={scoreOk ? '' : '0 to 100'}><input type="number" value={f.matchScore} onChange={(e) => set('matchScore', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Quote (₦)"><input type="number" min="0" value={f.quote} onChange={(e) => set('quote', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Availability"><input value={f.availability} maxLength={200} onChange={(e) => set('availability', e.target.value)} className={inputCls} /></FormField>
      </div>
      <FormField label="Showreel link" error={urlOk ? '' : 'Use a full link starting with https://'}><input value={f.reelUrl} onChange={(e) => set('reelUrl', e.target.value)} placeholder="https://…" className={inputCls} /></FormField>
      {!c && (
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Start as"><Select value={f.status} onChange={(v) => set('status', v)} options={[{ value: 'PROPOSED', label: 'Proposed' }, { value: 'SHORTLISTED', label: 'Shortlisted' }, { value: 'BACKUP', label: 'Backup' }]} /></FormField>
          <FormField label="Talent ID (optional)"><input value={f.talentId} maxLength={60} onChange={(e) => set('talentId', e.target.value)} className={inputCls} /></FormField>
        </div>
      )}
      <FormField label="Internal notes"><textarea rows={2} maxLength={1000} value={f.notes} onChange={(e) => set('notes', e.target.value)} className={inputCls} /></FormField>
      <Actions busy={busy} valid={f.name.trim() && scoreOk && urlOk} onClose={onClose} onSave={save} label={c ? 'Save changes' : 'Add candidate'} />
    </Dlg>
  );
}

function DropoutModal({ id, role, onClose, onDone }) {
  const booked = role.candidates.filter((c) => c.status === 'BOOKED');
  const [who, setWho] = useState(booked.length === 1 ? booked[0].id : '');
  const [reason, setReason] = useState('');
  const [deadline, setDeadline] = useState('');
  const [busy, go] = useBusy();
  const future = !deadline || new Date(deadline) > new Date();
  return (
    <Dlg title={`Record dropout: ${role.title}`} sub="The person is withdrawn, admins are notified, and a replacement clock starts." onClose={() => !busy && onClose()}>
      {booked.length > 1 && <FormField label="Who dropped out?" required><Select value={who} onChange={setWho} placeholder="Choose…" options={booked.map((c) => ({ value: c.id, label: c.name }))} /></FormField>}
      <FormField label="Reason" required><textarea rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} /></FormField>
      <FormField label="Replacement needed by" hint="Leave empty for 24 hours from now." error={future ? '' : 'Choose a time in the future'}><input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} /></FormField>
      <Actions busy={busy} valid={reason.trim().length >= 3 && who && future} onClose={onClose} label="Record dropout"
        onSave={() => go(() => A.dropout(id, role.id, { reason: reason.trim(), candidateId: who, deadline: deadline ? new Date(deadline).toISOString() : undefined }), 'Dropout recorded', onDone)} />
    </Dlg>
  );
}

function ShortlistModal({ res, onClose }) {
  const copy = async () => { try { await navigator.clipboard.writeText(res.link); toast.success('Link copied'); } catch { toast.error('Could not copy'); } };
  return (
    <Dlg title={res.emailSent ? 'Shortlist sent' : 'Shortlist ready, email not sent'} onClose={onClose}>
      <p className="text-xs leading-relaxed text-white/65">{res.emailSent ? `The client was emailed a private link covering ${res.roles} role(s).` : 'The email could not be delivered. Copy the link and send it to the client yourself.'}</p>
      <div className="break-all rounded-lg bg-neutral-900 p-3 font-mono text-[11px]">{res.link}</div>
      <p className="text-[10px] text-white/40">Shown once. Sending again creates a new link and the old one stops working. It expires after 45 days.</p>
      <div className="flex gap-2"><Btn variant="soft" onClick={onClose}>Close</Btn><Btn onClick={copy}><FiCopy /> Copy link</Btn></div>
    </Dlg>
  );
}

/* ───────── role card ───────── */
function RoleCard({ d, r, can, editable, reload, setDlg }) {
  const [busy, setBusy] = useState(false);
  const live = r.candidates.filter((c) => !['REJECTED', 'WITHDRAWN'].includes(c.status));
  const dead = r.candidates.filter((c) => ['REJECTED', 'WITHDRAWN'].includes(c.status));
  const act = async (fn, ok) => { setBusy(true); try { await fn(); if (ok) toast.success(ok); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } setBusy(false); };
  const book = (c) => {
    if (c.overCap) return setDlg({ t: 'cap', r, c });
    act(() => A.bookRole(d.id, r.id, { candidateId: c.id }), `${c.name} booked`);
  };
  const full = r.bookedCount >= r.qty;
  const ok = can.write && editable && !busy;
  const stat = ROLE_STATUS[r.status];

  const Cand = ({ c }) => (
    <div className={`rounded-lg border p-3 text-xs ${c.status === 'BOOKED' ? 'border-emerald-500/40 bg-emerald-500/[0.06]' : c.status === 'CLIENT_PREFERRED' ? 'border-red-600/40 bg-red-600/[0.05]' : 'border-white/[0.07] bg-neutral-950'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0"><b className="text-sm">{c.name}</b>{c.guild && <span className="ml-2 text-white/45">{c.guild}</span>}
          <p className="mt-1 text-[11px] text-white/50">{[c.matchScore != null && `Match ${c.matchScore}%`, c.availability && `Available: ${c.availability}`].filter(Boolean).join(' • ')}</p></div>
        <div className="text-right"><b className="block text-sm">{c.quoteKobo != null ? ngn(c.quoteKobo, true) : 'No quote'}</b>{c.overCap && <Pill tone="amber">Over cap</Pill>}</div>
      </div>
      {c.notes && <p className="mt-2 text-[11px] text-white/45">Note: {c.notes}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill tone={CANDIDATE_STATUS[c.status].tone}>{CANDIDATE_STATUS[c.status].label}</Pill>
        {c.reelUrl && <a href={c.reelUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300"><FiExternalLink /> Reel</a>}
        {c.clientPickedAt && <span className="text-[10px] text-white/40">Client chose {ago(c.clientPickedAt)}</span>}
        <span className="ml-auto flex flex-wrap items-center gap-2">
          {c.status !== 'BOOKED' && !['REJECTED', 'WITHDRAWN'].includes(c.status) && <Btn className="px-3 py-1.5" disabled={!ok || full || r.status === 'CONTRACTED'} onClick={() => book(c)}>Book</Btn>}
          {c.status !== 'BOOKED' && <div className="w-40"><Select value={c.status} disabled={!ok} onChange={(v) => v !== c.status && act(() => A.updateCandidate(d.id, c.id, { status: v }), 'Status updated')} options={CAND_OPTS} /></div>}
          <Btn variant="soft" className="px-3 py-1.5" disabled={!ok} onClick={() => setDlg({ t: 'cand', r, c })}><FiEdit2 /></Btn>
        </span>
      </div>
    </div>
  );

  return (
    <Card className={`space-y-3 p-5 ${r.status === 'DROPOUT' ? 'border-red-600/60' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><b className="text-lg">{r.title}</b>{r.isKey && <Pill tone="red">Key role</Pill>}<Pill>{ROLE_CATEGORY[r.category]}</Pill><Pill tone={stat.tone}>{stat.label}</Pill></div>
          <p className="mt-1 text-[11px] text-white/45">{[`${r.bookedCount}/${r.qty} booked`, r.windowStart && `${fmtDate(r.windowStart, false)}${r.windowEnd ? ` to ${fmtDate(r.windowEnd, false)}` : ''}`, r.rateCapKobo != null && `Cap ${ngn(r.rateCapKobo, true)} each`].filter(Boolean).join(' • ')}</p>
          {r.notes && <p className="mt-1 text-[11px] text-white/40">{r.notes}</p>}
          {r.status === 'DROPOUT' && <p className="mt-2 rounded-lg bg-red-600/10 p-2 text-[11px] text-red-200">Dropout {ago(r.dropoutAt)}: {r.dropoutReason}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="soft" className="px-3 py-1.5" disabled={!ok || r.status === 'CONTRACTED'} onClick={() => setDlg({ t: 'cand', r })}><FiUserPlus /> Candidate</Btn>
          <Btn variant="soft" className="px-3 py-1.5" disabled={!ok} onClick={() => setDlg({ t: 'role', r })}><FiEdit2 /></Btn>
          {r.status === 'BOOKED' && <Btn className="px-3 py-1.5" disabled={!ok} onClick={() => act(() => A.contractRole(d.id, r.id), 'Role marked contracted')}><FiCheck /> Mark contracted</Btn>}
          {r.bookedCount > 0 && <Btn variant="soft" className="px-3 py-1.5" disabled={!ok} onClick={() => setDlg({ t: 'drop', r })}><FiUserX /> Dropout</Btn>}
          <Btn variant="soft" className="px-3 py-1.5" disabled={!ok} onClick={() => setDlg({ t: 'rmRole', r })}><FiTrash2 /></Btn>
        </div>
      </div>
      {live.map((c) => <Cand key={c.id} c={c} />)}
      {!live.length && <p className="rounded-lg border border-dashed border-white/10 p-4 text-center text-[11px] text-white/35">No candidates yet. Add the people you want to propose.</p>}
      {dead.length > 0 && <details className="text-[11px] text-white/40"><summary className="cursor-pointer">{dead.length} rejected or withdrawn</summary><div className="mt-2 space-y-2">{dead.map((c) => <Cand key={c.id} c={c} />)}</div></details>}
    </Card>
  );
}

/* ───────── page ───────── */
export default function ProdSourcingDetail() {
  const { id } = useParams();
  const { can } = useProdAccess();
  const now = useNow(30000);
  const q = useLoad(() => A.dossier(id), [id]);
  const prod = useLoad(() => A.producers());
  const [dlg, setDlg] = useState(null);
  const [sent, setSent] = useState(null);
  const [busy, setBusy] = useState(false);
  const d = q.data;

  if (!d) return q.error ? <Card className="p-10 text-center">{q.error} <Link to="/admin/production/sourcing" className="text-[#FFBF00] underline">Back to sourcing</Link></Card> : <p className="font-mono text-xs font-bold">LOADING…</p>;

  const st = SOURCING_STATUS[d.status];
  const closed = d.status === 'CLOSED';
  const reload = q.reload;
  const done = () => { setDlg(null); reload(); };
  const run = async (fn, ok) => { setBusy(true); try { const r = await fn(); if (ok) toast.success(ok); reload(); return r; } catch (e) { toast.error(apiErrorMessage(e)); } finally { setBusy(false); } };
  const shortlist = async () => {
    if (!d.client.email) return toast.error('Add the client email to this dossier first.');
    const r = await run(() => A.sendShortlist(id));
    if (r) setSent(r);
  };

  return (
    <>
      <Card className="flex flex-wrap items-center gap-3 p-3 text-[11px]">
        <Link to="/admin/production/sourcing" className="flex items-center gap-2 font-bold hover:text-[#FFBF00]"><FiArrowLeft /> Back to crew & cast sourcing</Link>
        <span className="text-white/40">/</span><b className="rounded bg-neutral-900 px-2 py-1 font-mono">{d.reference}</b>
      </Card>

      <Card index={1} className="space-y-4 border-l-4 border-l-red-600 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap gap-2"><Pill tone={st.tone}>{st.label}</Pill><Pill>{d.origin === 'WEB' ? 'From request' : 'Direct'}</Pill></div>
            <h1 className="text-3xl font-black md:text-5xl">{d.projectTitle}</h1>
            <p className="text-xs text-white/55">{d.client.name}{d.client.email ? ` • ${d.client.email}` : ' • no client email'} • Lead {d.lead?.email ?? 'unassigned'}</p>
            <p className="text-[11px] text-white/40">{[d.shootStart && `Shoot ${fmtDate(d.shootStart, false)}${d.shootEnd ? ` to ${fmtDate(d.shootEnd, false)}` : ''}`, d.locations].filter(Boolean).join(' • ') || 'No dates or locations set'}</p>
            {d.notes && <p className="rounded-lg bg-neutral-900 p-3 text-xs text-white/65">{d.notes}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn variant="soft" disabled={!can.write || closed} onClick={() => setDlg({ t: 'edit' })}><FiEdit2 /> Edit dossier</Btn>
            <Btn disabled={!can.write || closed || busy} onClick={shortlist}><FiSend /> {d.shortlist.sentAt ? 'Re-send shortlist' : 'Send shortlist to client'}</Btn>
            {closed ? <Btn variant="soft" disabled={!can.write || busy} onClick={() => run(() => A.setDossierStatus(id, 'OPEN'), 'Dossier reopened')}>Reopen</Btn>
              : <Btn variant="soft" disabled={!can.write} onClick={() => setDlg({ t: 'close' })}>Close dossier</Btn>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3 text-[11px]">
          {d.links.project && <Link to={`/admin/production/projects/${d.links.project.id}`}><Btn variant="soft">Project {d.links.project.reference}</Btn></Link>}
          {d.links.request && <Link to={`/admin/production/requests/${d.links.request.id}`}><Btn variant="soft">Request {d.links.request.reference}</Btn></Link>}
        </div>
      </Card>

      {d.alerts.map((a) => {
        const t = left(a.replacementDeadline, now);
        return (
          <Card key={a.roleId} className="flex flex-wrap items-center gap-4 border-red-600/60 bg-red-600/[0.07] p-4">
            <FiAlertTriangle className="shrink-0 text-2xl text-red-400" />
            <div className="min-w-0 flex-1"><b className="block text-sm">Dropout: {a.title}{a.isKey ? ' (key role)' : ''}</b><span className="text-xs text-white/60">{a.reason} • {a.replacements} replacement candidate(s) ready to book</span></div>
            {t && <div className="text-right"><span className={`${mono} block text-[9px] text-white/45`}>Replacement clock</span><b className={`text-lg ${t.late ? 'text-red-400' : ''}`}>{t.text}</b></div>}
          </Card>
        );
      })}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="space-y-2 p-5"><span className={`${mono} text-[9px] text-white/45`}>Roles locked</span><b className="block text-3xl font-black">{d.clientApproval.locked} of {d.clientApproval.total}</b><Bar percent={d.clientApproval.pct} /></Card>
        <Card className="space-y-1 p-5"><span className={`${mono} text-[9px] text-white/45`}>Budget</span><b className="block text-2xl font-black">{ngn(d.budget.bookedKobo, true)}</b><span className="text-[11px] text-white/45">booked of {ngn(d.budget.allocatedKobo, true)} in rate caps (per-person caps added together)</span></Card>
        <Card className="space-y-1 p-5"><span className={`${mono} text-[9px] text-white/45`}>Client shortlist</span>
          {d.shortlist.sentAt ? <><b className="block text-lg">{d.shortlist.openedAt ? `Opened ${ago(d.shortlist.openedAt)}` : 'Not opened yet'}</b><span className="text-[11px] text-white/45">Sent {fmtDate(d.shortlist.sentAt)} • link {d.shortlist.active ? 'active' : 'inactive'}</span></> : <b className="block text-lg text-white/40">Not sent</b>}</Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="flex items-center justify-between"><h2 className="text-xl font-black">Cast & crew roster specification ({d.roles.length} roles)</h2><Btn variant="soft" disabled={!can.write || closed} onClick={() => setDlg({ t: 'role' })}><FiPlus /> Add role requirement</Btn></div>
          {!d.roles.length && <Card className="p-10 text-center text-sm text-white/40">No roles yet. Add the first role requirement.</Card>}
          {d.roles.map((r) => <RoleCard key={r.id} d={d} r={r} can={can} editable={!closed} reload={reload} setDlg={setDlg} />)}
          {!can.write && <p className="text-[10px] text-white/35">You have read-only access to Production.</p>}
        </div>
        <div className="xl:col-span-4">
          <Card className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Dispatch event log</span>
            <div className="max-h-[32rem] space-y-2 overflow-y-auto">
              {d.activity.map((a) => <div key={a.id} className="border-l-2 border-red-600 bg-neutral-900 px-3 py-2"><div className="flex justify-between gap-2 text-[10px]"><b className="break-all">{a.actor}</b><span className="shrink-0 text-white/40">{ago(a.createdAt)}</span></div><p className="mt-1 text-xs text-white/70">{a.message}</p></div>)}
            </div>
          </Card>
        </div>
      </div>

      <ErrorLine>{prod.error}</ErrorLine>
      {dlg?.t === 'edit' && <EditModal d={d} producers={prod.data ?? []} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.t === 'role' && <RoleModal id={id} role={dlg.r} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.t === 'cand' && <CandidateModal id={id} roleId={dlg.r.id} c={dlg.c} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.t === 'drop' && <DropoutModal id={id} role={dlg.r} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.t === 'cap' && (
        <ConfirmModal open title="Book over the rate cap?" confirmLabel="Book anyway" onClose={() => setDlg(null)}
          onConfirm={async () => { try { await A.bookRole(id, dlg.r.id, { candidateId: dlg.c.id, acceptOverCap: true }); toast.success(`${dlg.c.name} booked`); done(); } catch (e) { toast.error(apiErrorMessage(e)); } }}>
          <p>{dlg.c.name} quoted {ngn(dlg.c.quoteKobo, true)}, above the {ngn(dlg.r.rateCapKobo, true)} cap for “{dlg.r.title}”.</p>
        </ConfirmModal>
      )}
      {dlg?.t === 'rmRole' && (
        <ConfirmModal open title="Remove this role?" confirmLabel="Remove role" onClose={() => setDlg(null)}
          onConfirm={async () => { try { await A.removeRole(id, dlg.r.id); toast.success('Role removed'); done(); } catch (e) { toast.error(apiErrorMessage(e)); } }}>
          <p>“{dlg.r.title}” and its candidates are removed. A role with booked or contracted people can’t be removed. Record a dropout first.</p>
        </ConfirmModal>
      )}
      {dlg?.t === 'close' && (
        <ConfirmModal open title="Close this dossier?" confirmLabel="Close dossier" onClose={() => setDlg(null)}
          onConfirm={async () => { try { await A.setDossierStatus(id, 'CLOSED'); toast.success('Dossier closed'); done(); } catch (e) { toast.error(apiErrorMessage(e)); } }}>
          <p>The client shortlist link stops working. You can reopen the dossier later.</p>
        </ConfirmModal>
      )}
      {sent && <ShortlistModal res={sent} onClose={() => setSent(null)} />}
    </>
  );
}