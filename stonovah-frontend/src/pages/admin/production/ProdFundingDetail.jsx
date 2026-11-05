import React, { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCopy, FiDownload, FiEdit2, FiImage, FiLink2, FiSave, FiSend, FiTrash2, FiUploadCloud, FiRotateCcw, FiCheckCircle } from 'react-icons/fi';
import { Card, Pill, Btn, Modal, Bar } from '../ui';
import { FormField, inputCls } from '../ui2';
import { useLoad, ErrorLine, ConfirmModal, KV } from '../adminBits';
import { fmtDate, ago } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A, openSigned } from '../../../api/adminProduction';
import { Select } from '../ui2';
import { useProdAccess } from './useProdAccess';
import { mono, FORMAT_LABEL, AUDIENCE_LABEL, AUDIENCE_OPTIONS, FUNDING_LABEL, FUNDING_KEYS, PITCH_STATUS, DELIVERABLE_STATUS, d10 } from './prodAdmin';

const FILE_EXT = ['pdf', 'docx', 'xlsx', 'pptx', 'zip', 'png', 'jpg', 'jpeg'];
const mb = (n) => (n ? `${(n / 1048576).toFixed(1)} MB` : '');

function useBusy() {
  const [busy, setBusy] = useState(false);
  const go = async (fn, ok, done) => { setBusy(true); try { const r = await fn(); if (ok) toast.success(ok); done(r); } catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); } };
  return [busy, go];
}
function Dlg({ title, sub, onClose, children, width = 'max-w-lg' }) {
  return <Modal open onClose={onClose} width={width}><div className="space-y-4 p-6"><div className="pr-10"><h2 className="text-xl font-black">{title}</h2>{sub && <p className="mt-1 text-[11px] text-white/45">{sub}</p>}</div>{children}</div></Modal>;
}
const Actions = ({ busy, onClose, onSave, valid, label }) => (
  <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!valid || busy} onClick={onSave}>{busy ? 'Working…' : label}</Btn></div>
);

/* ───────── edit ───────── */
function EditModal({ p, producers, onClose, onDone }) {
  const needed = p.deliverables.filter((d) => d.needed).map((d) => d.key);
  const [f, setF] = useState({ projectTitle: p.projectTitle, clientName: p.client.name, clientEmail: p.client.email ?? '', clientCompany: p.client.company ?? '', budgetLabel: p.budgetLabel ?? '', audience: p.audience ?? '', audienceNote: p.audienceNote ?? '', deadline: d10(p.deadline), producerId: p.producer?.id ?? '', strategistId: p.strategist?.id ?? '', materials: needed });
  const [busy, go] = useBusy();
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const emailOk = /^\S+@\S+\.\S+$/.test(f.clientEmail.trim());
  const toggle = (k) => set('materials', f.materials.includes(k) ? f.materials.filter((x) => x !== k) : [...f.materials, k]);
  const started = (k) => p.deliverables.find((d) => d.key === k)?.status !== 'NOT_STARTED';
  const people = [{ value: '', label: 'Unassigned' }, ...producers.map((x) => ({ value: x.id, label: x.email }))];
  const save = () => {
    const b = {}; const diff = (k, v, cur) => { if (v !== cur) b[k] = v; };
    diff('projectTitle', f.projectTitle.trim(), p.projectTitle); diff('clientName', f.clientName.trim(), p.client.name); diff('clientEmail', f.clientEmail.trim(), p.client.email);
    diff('clientCompany', f.clientCompany.trim() || null, p.client.company ?? null); diff('budgetLabel', f.budgetLabel.trim() || null, p.budgetLabel ?? null);
    diff('audience', f.audience || null, p.audience ?? null); diff('audienceNote', f.audienceNote.trim() || null, p.audienceNote ?? null);
    diff('deadline', f.deadline || null, d10(p.deadline) || null); diff('producerId', f.producerId || null, p.producer?.id ?? null); diff('strategistId', f.strategistId || null, p.strategist?.id ?? null);
    if ([...f.materials].sort().join() !== [...needed].sort().join()) b.materials = f.materials;
    if (!Object.keys(b).length) return onClose();
    go(() => A.patchPitch(p.id, b), 'Pitch updated', onDone);
  };
  return (
    <Dlg title="Edit pitch details" onClose={() => !busy && onClose()} width="max-w-2xl">
      <div className="grid gap-3 sm:grid-cols-3">
        <FormField label="Producer"><Select value={f.producerId} onChange={(v) => set('producerId', v)} options={people} /></FormField>
        <FormField label="Strategist"><Select value={f.strategistId} onChange={(v) => set('strategistId', v)} options={people} /></FormField>
        <FormField label="Pitching to"><Select value={f.audience} onChange={(v) => set('audience', v)} options={[{ value: '', label: 'Not set' }, ...AUDIENCE_OPTIONS]} /></FormField>
      </div>
      <FormField label="Project title" required><input value={f.projectTitle} maxLength={160} onChange={(e) => set('projectTitle', e.target.value)} className={inputCls} /></FormField>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Client name" required><input value={f.clientName} maxLength={120} onChange={(e) => set('clientName', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Client email" required error={emailOk ? '' : 'Enter a valid email'}><input type="email" value={f.clientEmail} onChange={(e) => set('clientEmail', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Company"><input value={f.clientCompany} maxLength={160} onChange={(e) => set('clientCompany', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Budget"><input value={f.budgetLabel} maxLength={80} onChange={(e) => set('budgetLabel', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Pitch deadline"><input type="date" value={f.deadline} onChange={(e) => set('deadline', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Audience note"><input value={f.audienceNote} maxLength={300} onChange={(e) => set('audienceNote', e.target.value)} className={inputCls} /></FormField>
      </div>
      <FormField label="Materials needed" hint="A material that has been started can't be removed.">
        <div className="grid gap-2 sm:grid-cols-2">
          {FUNDING_KEYS.map((k) => (
            <label key={k} className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${f.materials.includes(k) ? 'border-red-600 bg-red-600/10' : 'border-white/10'} ${started(k) && needed.includes(k) ? 'opacity-60' : 'cursor-pointer'}`}>
              <input type="checkbox" checked={f.materials.includes(k)} disabled={started(k) && needed.includes(k)} onChange={() => toggle(k)} className="accent-red-600" /> {FUNDING_LABEL[k]}
            </label>
          ))}
        </div>
      </FormField>
      <Actions busy={busy} valid={f.projectTitle.trim() && f.clientName.trim() && emailOk && f.materials.length > 0} onClose={onClose} onSave={save} label="Save changes" />
    </Dlg>
  );
}

/* ───────── version upload ───────── */
function VersionModal({ id, m, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [fin, setFin] = useState(false);
  const [pct, setPct] = useState(null);
  const input = useRef(null);
  const ext = file?.name.split('.').pop().toLowerCase();
  const err = file && !FILE_EXT.includes(ext) ? `Allowed types: ${FILE_EXT.join(', ')}` : file && file.size > 25 * 1048576 ? 'Files can be up to 25 MB' : '';
  const send = async () => {
    setPct(0);
    try { await A.addVersion(id, m.key, file, { label: label.trim() || undefined, note: note.trim() || undefined, isFinal: fin }, setPct); toast.success(`Version V${m.versionCount + 1} uploaded`); onDone(); }
    catch (e) { toast.error(apiErrorMessage(e)); setPct(null); }
  };
  return (
    <Dlg title={`Upload version: ${m.label}`} sub={`This becomes V${m.versionCount + 1}. The material is set to ${fin ? 'Final' : 'Drafting'}.`} onClose={() => pct === null && onClose()}>
      <input ref={input} type="file" className="hidden" accept={FILE_EXT.map((x) => `.${x}`).join(',')} onChange={(e) => { setFile(e.target.files[0] ?? null); e.target.value = ''; }} />
      <button type="button" onClick={() => input.current?.click()} className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 p-4 text-left text-xs hover:border-white/40">
        <FiUploadCloud className="text-2xl text-red-500" /><span>{file ? <><b className="block">{file.name}</b><span className="text-white/45">{mb(file.size)}</span></> : 'Choose a file (PDF, Word, Excel, PowerPoint, ZIP, PNG or JPG, up to 25 MB)'}</span>
      </button>
      {err && <p className="text-[10px] font-semibold text-red-400">{err}</p>}
      <FormField label="Label (optional)"><input value={label} maxLength={120} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Director feedback applied" className={inputCls} /></FormField>
      <FormField label="Internal note (optional)" hint="The client never sees this."><textarea rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} /></FormField>
      <label className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={fin} onChange={(e) => setFin(e.target.checked)} className="accent-red-600" /> This is the final version</label>
      {pct !== null && <div><div className="mb-1 text-[11px] text-white/55">Uploading… {pct}%</div><Bar percent={pct} /></div>}
      <Actions busy={pct !== null} valid={file && !err} onClose={onClose} onSave={send} label="Upload version" />
    </Dlg>
  );
}

function LinkModal({ res, delivered, onClose }) {
  const copy = async () => { try { await navigator.clipboard.writeText(res.link); toast.success('Link copied'); } catch { toast.error('Could not copy'); } };
  return (
    <Dlg title={delivered ? (res.emailSent ? 'Package delivered' : 'Delivered, email not sent') : (res.emailSent ? 'Link shared and emailed' : 'Link ready')} onClose={onClose}>
      <p className="text-xs leading-relaxed text-white/65">{res.emailSent ? 'The client was emailed the link.' : 'No email went out. Copy the link and send it to the client yourself.'}</p>
      <div className="break-all rounded-lg bg-neutral-900 p-3 font-mono text-[11px]">{res.link}</div>
      <p className="text-[10px] text-white/40">Shown once. Issuing a new link replaces this one.</p>
      <div className="flex gap-2"><Btn variant="soft" onClick={onClose}>Close</Btn><Btn onClick={copy}><FiCopy /> Copy link</Btn></div>
    </Dlg>
  );
}

function ShareModal({ id, onClose, onDone }) {
  const [mail, setMail] = useState(true);
  const [busy, go] = useBusy();
  return (
    <Dlg title="Share a private link" sub="The client sees only materials that are With client or Final. Anything still in preparation shows as 'In preparation'." onClose={() => !busy && onClose()}>
      <label className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={mail} onChange={(e) => setMail(e.target.checked)} className="accent-red-600" /> Email the link to the client</label>
      <Actions busy={busy} valid onClose={onClose} label="Issue link" onSave={() => go(() => A.issuePitchLink(id, mail), null, onDone)} />
    </Dlg>
  );
}

function ReopenModal({ p, onClose, onDone }) {
  const [reason, setReason] = useState('');
  const [keys, setKeys] = useState([]);
  const [busy, go] = useBusy();
  const toggle = (k) => setKeys((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  return (
    <Dlg title="Reopen this pitch" sub="The client link stops working immediately, and the pitch returns to In progress." onClose={() => !busy && onClose()}>
      <FormField label="Reason" required><textarea rows={3} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} /></FormField>
      <FormField label="Send these back to Drafting" hint="Materials you leave unticked stay Final.">
        <div className="space-y-2">{p.deliverables.filter((d) => d.needed).map((d) => <label key={d.key} className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={keys.includes(d.key)} onChange={() => toggle(d.key)} className="accent-red-600" /> {d.label}</label>)}</div>
      </FormField>
      <Actions busy={busy} valid={reason.trim().length >= 3} onClose={onClose} label="Reopen pitch" onSave={() => go(() => A.reopenPitch(p.id, { reason: reason.trim(), keys: keys.length ? keys : undefined }), 'Pitch reopened', onDone)} />
    </Dlg>
  );
}

/* ───────── one material ───────── */
function Material({ p, m, can, reload, setDlg }) {
  const [notes, setNotes] = useState(m.revisionNotes ?? '');
  const [busy, setBusy] = useState(false);
  const ok = can.write && p.editable;
  const st = DELIVERABLE_STATUS[m.status];
  const opts = Object.entries(DELIVERABLE_STATUS).filter(([k]) => m.versionCount > 0 || ['NOT_STARTED', 'DRAFTING'].includes(k)).map(([value, x]) => ({ value, label: x.label }));
  const run = async (fn, msg) => { setBusy(true); try { await fn(); if (msg) toast.success(msg); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } setBusy(false); };
  const open = async (v) => { try { await openSigned(A.pitchFileUrl(p.id, v.file.id)); } catch (e) { toast.error(apiErrorMessage(e)); } };

  return (
    <Card className={`space-y-3 p-5 ${m.needed ? '' : 'opacity-50'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="flex flex-wrap items-center gap-2"><b className="text-lg">{m.label}</b><Pill tone={st.tone}>{st.label}</Pill>{!m.needed && <Pill>Not requested</Pill>}</div>
          <p className="mt-1 text-[11px] text-white/45">{m.versionCount ? `${m.versionCount} version(s)` : 'No versions uploaded yet'}</p></div>
        {m.needed && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-40"><Select value={m.status} disabled={!ok || busy} onChange={(v) => v !== m.status && run(() => A.updateDeliverable(p.id, m.key, { status: v }), 'Status updated')} options={opts} /></div>
            <Btn className="px-3 py-2" disabled={!ok} onClick={() => setDlg({ t: 'version', m })}><FiUploadCloud /> Upload version</Btn>
          </div>
        )}
      </div>
      {m.needed && (
        <>
          {m.versions.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-neutral-950 p-3 text-xs">
              <b className="font-mono">V{v.version}</b>{v.isFinal && <Pill tone="green">Final</Pill>}
              <div className="min-w-0 flex-1"><b className="block truncate">{v.label || v.file?.name}</b><span className="text-[10px] text-white/45">{[v.file?.name, mb(v.file?.sizeBytes), v.uploadedByEmail, ago(v.createdAt)].filter(Boolean).join(' • ')}</span>{v.note && <span className="block text-[10px] text-white/40">Note: {v.note}</span>}</div>
              {v.file && <Btn variant="soft" className="px-3 py-1.5" onClick={() => open(v)}><FiDownload /> Open</Btn>}
            </div>
          ))}
          <div className="space-y-2">
            <span className={`${mono} text-[9px] text-white/45`}>Revision notes (internal)</span>
            <textarea rows={2} maxLength={3000} disabled={!ok} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What the client asked for, what is left to do…" className={inputCls} />
            {notes !== (m.revisionNotes ?? '') && <Btn variant="soft" className="px-3 py-1.5" disabled={!ok || busy} onClick={() => run(() => A.updateDeliverable(p.id, m.key, { revisionNotes: notes.trim() || null }), 'Notes saved')}><FiSave /> Save notes</Btn>}
          </div>
        </>
      )}
    </Card>
  );
}

/* ───────── page ───────── */
export default function ProdFundingDetail() {
  const { id } = useParams();
  const { can } = useProdAccess();
  const q = useLoad(() => A.pitch(id), [id]);
  const prod = useLoad(() => A.producers());
  const [dlg, setDlg] = useState(null);
  const [res, setRes] = useState(null);
  const [note, setNote] = useState('');
  const [pct, setPct] = useState(null);
  const vis = useRef(null);
  const p = q.data;

  if (!p) return q.error ? <Card className="p-10 text-center">{q.error} <Link to="/admin/production/funding" className="text-[#FFBF00] underline">Back to funding</Link></Card> : <p className="font-mono text-xs font-bold">LOADING…</p>;

  const st = PITCH_STATUS[p.status];
  const reload = q.reload;
  const ok = can.write && p.editable;
  const needed = p.deliverables.filter((d) => d.needed);
  const allFinal = needed.length > 0 && needed.every((d) => d.status === 'FINAL');
  const canShare = needed.some((d) => ['WITH_CLIENT', 'FINAL'].includes(d.status));
  const act = async (fn, msg) => { try { await fn(); if (msg) toast.success(msg); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } };
  const done = () => { setDlg(null); reload(); };
  const open = async (fileId) => { try { await openSigned(A.pitchFileUrl(id, fileId)); } catch (e) { toast.error(apiErrorMessage(e)); } };
  const upVisual = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['png', 'jpg', 'jpeg'].includes(ext)) return toast.error('Key visuals must be PNG or JPG');
    if (file.size > 15 * 1048576) return toast.error('Images can be up to 15 MB');
    setPct(0);
    try { await A.addVisual(id, file); toast.success('Visual added'); reload(); } catch (e) { toast.error(apiErrorMessage(e)); }
    setPct(null);
  };
  const statusOpts = [{ value: 'IN_PROGRESS', label: 'In progress' }, { value: 'IN_REVIEW', label: 'In review (internal)' }];
  const manual = ['IN_PROGRESS', 'IN_REVIEW'].includes(p.status) && can.write;
  const stages = [['NEW', 'New'], ['IN_PROGRESS', 'In progress'], ['IN_REVIEW', 'In review'], ['DRAFT_SENT', 'Draft sent'], ['DELIVERED', 'Delivered']];
  const at = stages.findIndex(([k]) => k === p.status);

  return (
    <>
      <Card className="flex flex-wrap items-center gap-3 p-3 text-[11px]">
        <Link to="/admin/production/funding" className="flex items-center gap-2 font-bold hover:text-[#FFBF00]"><FiArrowLeft /> Back to funding & pitch pipeline</Link>
        <span className="text-white/40">/</span><b className="rounded bg-neutral-900 px-2 py-1 font-mono">{p.reference ?? 'Manual pitch'}</b>
        {p.request && <Link to={`/admin/production/requests/${p.request.id}`} className="text-white/55 hover:text-white">View source request</Link>}
      </Card>

      <Card index={1} className="space-y-4 border-l-4 border-l-red-600 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap gap-2"><Pill tone={st.tone}>{st.label}</Pill>{p.format && <Pill>{FORMAT_LABEL[p.format]}</Pill>}{p.budgetLabel && <Pill>{p.budgetLabel}</Pill>}{!p.editable && <Pill tone="amber">Locked after delivery</Pill>}</div>
            <h1 className="text-3xl font-black md:text-5xl">{p.projectTitle}: Pitch & Financing Dossier</h1>
            <p className="text-xs text-white/55">{p.client.name}{p.client.company ? ` • ${p.client.company}` : ''} • {p.client.email}{p.client.phone ? ` • ${p.client.phone}` : ''}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn variant="soft" disabled={!ok} onClick={() => setDlg({ t: 'edit' })}><FiEdit2 /> Edit details</Btn>
            {p.status === 'DELIVERED' && <Btn disabled={!can.write} onClick={() => setDlg({ t: 'reopen' })}><FiRotateCcw /> Reopen</Btn>}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {stages.map(([k, l], i) => <div key={k} className="space-y-1"><div className={`h-1.5 rounded-full ${i <= at ? 'bg-[#e10613]' : 'bg-white/10'}`} /><span className={`block text-center text-[9px] ${i === at ? 'font-bold text-white' : 'text-white/35'}`}>{l}</span></div>)}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-black">Financing materials engine</h2><span className="text-xs text-white/50">{p.pacing.final} of {p.pacing.needed} final • {p.pacing.withClient} with client</span></div>
          <Bar percent={p.pacing.pct} />
          {p.deliverables.map((m) => <Material key={m.key} p={p} m={m} can={can} reload={reload} setDlg={setDlg} />)}

          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-black"><FiImage /> Creative look & tone: key visuals ({p.visuals.length})</h2>
              <><input ref={vis} type="file" className="hidden" accept=".png,.jpg,.jpeg" onChange={(e) => { upVisual(e.target.files[0]); e.target.value = ''; }} />
                <Btn variant="soft" disabled={!ok || pct !== null} onClick={() => vis.current?.click()}><FiUploadCloud /> {pct === null ? 'Add visual' : 'Uploading…'}</Btn></></div>
            {!p.visuals.length && <p className="text-xs text-white/40">No visuals yet. PNG or JPG up to 15 MB, stored privately.</p>}
            {p.visuals.map((v) => (
              <div key={v.id} className="flex items-center gap-3 rounded-lg bg-neutral-950 p-3 text-xs"><div className="min-w-0 flex-1"><b className="block truncate">{v.name}</b><span className="text-[10px] text-white/45">{mb(v.sizeBytes)} • {ago(v.createdAt)}</span></div>
                <Btn variant="soft" className="px-3 py-1.5" onClick={() => open(v.id)}><FiDownload /> Open</Btn>
                <Btn variant="soft" className="px-3 py-1.5" disabled={!ok} onClick={() => setDlg({ t: 'rmVisual', v })}><FiTrash2 /></Btn></div>
            ))}
          </Card>

          {p.request && (
            <Card className="space-y-3 p-5">
              <h2 className="text-xl font-black">Original client brief</h2>
              {p.request.logline && <div className="rounded-xl bg-neutral-900 p-4"><span className="mb-1 block text-[9px] font-bold text-neutral-500">LOGLINE</span><p className="text-sm italic text-neutral-200">“{p.request.logline}”</p></div>}
              {p.request.producerNotes && <div className="rounded-xl bg-neutral-900 p-4"><span className="mb-1 block text-[9px] font-bold text-neutral-500">CLIENT NOTES</span><p className="whitespace-pre-line text-sm text-neutral-200">{p.request.producerNotes}</p></div>}
              {p.request.files.map((f) => <div key={f.id} className="flex items-center gap-3 rounded-lg bg-neutral-950 p-3 text-xs"><div className="min-w-0 flex-1"><b className="block truncate">{f.name}</b><span className="text-[10px] text-white/45">{mb(f.sizeBytes)} • client upload • not virus scanned</span></div><Btn variant="soft" className="px-3 py-1.5" onClick={() => open(f.id)}><FiDownload /> Open</Btn></div>)}
            </Card>
          )}
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Card className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Status & stakeholders</span>
            <FormField label="Workflow status" hint={p.status === 'DRAFT_SENT' ? 'A material is with the client. Move it out of "With client" to change this.' : p.status === 'NEW' ? 'Starting a material moves it to In progress.' : ''}>
              <Select value={manual ? p.status : ''} disabled={!manual || p.status === 'DRAFT_SENT'} placeholder={st.label} onChange={(v) => v !== p.status && act(() => A.patchPitch(id, { status: v }), 'Status updated')} options={statusOpts} />
            </FormField>
            <div className="grid grid-cols-1 gap-2">
              <KV k="PITCHING TO" v={AUDIENCE_LABEL[p.audience]} /><KV k="DEADLINE" v={p.deadline ? fmtDate(p.deadline, false) : null} />
              <KV k="PRODUCER" v={p.producer?.email} /><KV k="STRATEGIST" v={p.strategist?.email} />
              {p.audienceNote && <KV k="AUDIENCE NOTE" v={p.audienceNote} />}
            </div>
          </Card>

          <Card className="space-y-3 p-5">
            <span className={`${mono} flex items-center gap-2 text-white/45`}><FiLink2 /> Client link & delivery</span>
            <div className="flex items-center gap-2"><Pill tone={p.link.active ? 'green' : 'grey'}>{p.link.active ? 'Link active' : 'No active link'}</Pill>{p.link.expiresAt && <span className="text-[10px] text-white/40">until {fmtDate(p.link.expiresAt, false)}</span>}</div>
            <Btn variant="soft" className="w-full" disabled={!can.write || !canShare} onClick={() => setDlg({ t: 'share' })}><FiSend /> {p.link.active ? 'Issue a new link' : 'Share a private link'}</Btn>
            {!canShare && <p className="text-[10px] text-white/35">Set at least one material to With client or Final to share.</p>}
            {p.link.active && <Btn variant="soft" className="w-full" disabled={!can.write} onClick={() => setDlg({ t: 'revoke' })}>Revoke link</Btn>}
            {p.editable && <><Btn className="w-full" disabled={!can.write || !allFinal} onClick={() => setDlg({ t: 'deliver' })}><FiCheckCircle /> Deliver final package</Btn>
              {!allFinal && <p className="text-[10px] text-white/35">Every requested material must be Final before delivery.</p>}</>}
            {p.deliveredAt && <p className="text-xs text-emerald-400">Delivered {fmtDate(p.deliveredAt)}</p>}
          </Card>

          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between"><span className={`${mono} text-white/45`}>Internal production notes</span><Pill>Team only</Pill></div>
            <textarea rows={3} maxLength={2000} value={note} disabled={!can.write} onChange={(e) => setNote(e.target.value)} placeholder="Add a confidential note…" className={inputCls} />
            <Btn disabled={!can.write || !note.trim()} onClick={() => act(async () => { await A.addPitchNote(id, note.trim()); setNote(''); }, 'Note saved')}><FiSave /> Post note</Btn>
            <div className="max-h-64 space-y-2 overflow-y-auto">{p.notes.map((n) => <div key={n.id} className="rounded-lg bg-neutral-900 p-3"><div className="flex justify-between gap-2 text-[10px]"><b className="break-all">{n.authorEmail}</b><span className="shrink-0 text-white/40">{ago(n.createdAt)}</span></div><p className="mt-1 whitespace-pre-line text-xs text-white/70">{n.body}</p></div>)}</div>
          </Card>

          <Card className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Activity & client feedback</span>
            <div className="max-h-96 space-y-2 overflow-y-auto">{p.activity.map((a) => <div key={a.id} className={`border-l-2 bg-neutral-900 px-3 py-2 ${a.action === 'CLIENT_FEEDBACK' ? 'border-amber-500' : 'border-red-600'}`}><div className="flex justify-between gap-2 text-[10px]"><b className="break-all">{a.actor}</b><span className="shrink-0 text-white/40">{ago(a.createdAt)}</span></div><p className="mt-1 text-xs text-white/70">{a.message}</p></div>)}</div>
          </Card>
        </div>
      </div>

      <ErrorLine>{prod.error}</ErrorLine>
      {dlg?.t === 'edit' && <EditModal p={p} producers={prod.data ?? []} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.t === 'version' && <VersionModal id={id} m={dlg.m} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.t === 'share' && <ShareModal id={id} onClose={() => setDlg(null)} onDone={(r) => { setDlg(null); reload(); setRes({ r, delivered: false }); }} />}
      {dlg?.t === 'reopen' && <ReopenModal p={p} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.t === 'revoke' && <ConfirmModal open title="Revoke the client link?" confirmLabel="Revoke link" onClose={() => setDlg(null)} onConfirm={async () => { try { await A.revokePitchLink(id); toast.success('Link revoked'); done(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>The client can no longer open their pitch page. You can issue a new link any time.</p></ConfirmModal>}
      {dlg?.t === 'rmVisual' && <ConfirmModal open title="Remove this visual?" confirmLabel="Remove" onClose={() => setDlg(null)} onConfirm={async () => { try { await A.removeVisual(id, dlg.v.id); toast.success('Visual removed'); done(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>“{dlg.v.name}” is deleted from storage.</p></ConfirmModal>}
      {dlg?.t === 'deliver' && (
        <ConfirmModal open title="Deliver the final package?" confirmLabel="Deliver" checkLabel="I have reviewed every final file." onClose={() => setDlg(null)}
          onConfirm={async () => { try { const r = await A.deliverPitch(id); setDlg(null); reload(); setRes({ r, delivered: true }); } catch (e) { toast.error(apiErrorMessage(e)); } }}>
          <p>The client is emailed a link that works for 90 days, and this pitch is locked. To change anything afterwards you must reopen it, which cuts the link.</p>
        </ConfirmModal>
      )}
      {res && <LinkModal res={res.r} delivered={res.delivered} onClose={() => setRes(null)} />}
    </>
  );
}