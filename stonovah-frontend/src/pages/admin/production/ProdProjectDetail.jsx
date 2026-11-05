import React, { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiEdit2, FiTrash2, FiPlus, FiCheck, FiDownload, FiUploadCloud, FiSend, FiUsers, FiArchive, FiDollarSign } from 'react-icons/fi';
import { Card, Pill, Btn, Modal, Bar } from '../ui';
import { FormField, inputCls } from '../ui2';
import { useLoad, ErrorLine, ConfirmModal } from '../adminBits';
import { fmtDate, ago } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A, openSigned } from '../../../api/adminProduction';
import { Select } from '../ui2';
import { useProdAccess } from './useProdAccess';
import { ngn, mono, FORMAT_LABEL, STAGE_LABEL, PROJECT_STATUS, WORK_STATUS, TRANCHE_STATUS, LIFECYCLE, FORMAT_OPTIONS, nairaStr, d10 } from './prodAdmin';

const STAGE_OPTS = [...LIFECYCLE, 'CROSS'].map((s) => ({ value: s, label: STAGE_LABEL[s] }));
const LIFE_OPTS = LIFECYCLE.map((s) => ({ value: s, label: STAGE_LABEL[s] }));
const FILE_EXT = ['pdf', 'docx', 'xlsx', 'pptx', 'zip', 'png', 'jpg', 'jpeg'];

// A small wrapper so every modal handles busy and errors the same way.
function Dlg({ title, sub, onClose, children, width = 'max-w-lg' }) {
  return (
    <Modal open onClose={onClose} width={width}>
      <div className="space-y-4 p-6"><div className="pr-10"><h2 className="text-xl font-black">{title}</h2>{sub && <p className="mt-1 text-[11px] text-white/45">{sub}</p>}</div>{children}</div>
    </Modal>
  );
}
const Actions = ({ busy, onClose, onSave, valid, label }) => (
  <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!valid || busy} onClick={onSave}>{busy ? 'Saving…' : label}</Btn></div>
);
function useBusy() {
  const [busy, setBusy] = useState(false);
  const go = async (fn, ok, done) => { setBusy(true); try { await fn(); if (ok) toast.success(ok); done(); } catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); } };
  return [busy, go];
}

/* ───────── edit project ───────── */
function EditModal({ p, producers, onClose, onDone }) {
  const [f, setF] = useState({
    title: p.title, format: p.format ?? '', clientName: p.client.name, clientEmail: p.client.email ?? '', clientCompany: p.client.company ?? '',
    pmId: p.pm?.id ?? '', startDate: d10(p.startDate), endDate: d10(p.endDate), locations: p.locations ?? '', masterSpec: p.masterSpec ?? '',
    tags: (p.highlightTags ?? []).join(', '), synopsis: p.synopsis ?? '',
  });
  const [busy, go] = useBusy();
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const dateErr = f.startDate && f.endDate && f.endDate < f.startDate ? 'The end date is before the start date' : '';
  const tags = f.tags.split(',').map((t) => t.trim()).filter(Boolean);
  const tagErr = tags.length > 4 ? 'Up to 4 tags' : tags.some((t) => t.length > 40) ? 'Tags are up to 40 characters' : '';
  const valid = f.title.trim() && f.clientName.trim() && !dateErr && !tagErr;

  const save = () => {
    const b = {}; const diff = (k, v, cur) => { if (v !== cur) b[k] = v; };
    diff('title', f.title.trim(), p.title); diff('clientName', f.clientName.trim(), p.client.name);
    diff('clientEmail', f.clientEmail.trim() || null, p.client.email ?? null); diff('clientCompany', f.clientCompany.trim() || null, p.client.company ?? null);
    diff('format', f.format || null, p.format ?? null); diff('pmId', f.pmId || null, p.pm?.id ?? null);
    diff('startDate', f.startDate || null, d10(p.startDate) || null); diff('endDate', f.endDate || null, d10(p.endDate) || null);
    diff('locations', f.locations.trim() || null, p.locations ?? null); diff('masterSpec', f.masterSpec.trim() || null, p.masterSpec ?? null);
    diff('synopsis', f.synopsis.trim() || null, p.synopsis ?? null);
    if (JSON.stringify(tags) !== JSON.stringify(p.highlightTags ?? [])) b.highlightTags = tags;
    if (!Object.keys(b).length) return onClose();
    go(() => A.patchProject(p.id, b), 'Project updated', onDone);
  };
  return (
    <Dlg title="Edit project details" onClose={() => !busy && onClose()} width="max-w-2xl">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Format"><Select value={f.format} onChange={(v) => set('format', v)} options={[{ value: '', label: 'Not set' }, ...FORMAT_OPTIONS]} /></FormField>
        <FormField label="Project manager"><Select value={f.pmId} onChange={(v) => set('pmId', v)} options={[{ value: '', label: 'Unassigned' }, ...producers.map((x) => ({ value: x.id, label: x.email }))]} /></FormField>
      </div>
      <FormField label="Title" required><input value={f.title} maxLength={160} onChange={(e) => set('title', e.target.value)} className={inputCls} /></FormField>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Client name" required><input value={f.clientName} maxLength={120} onChange={(e) => set('clientName', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Client email"><input type="email" value={f.clientEmail} onChange={(e) => set('clientEmail', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Company"><input value={f.clientCompany} maxLength={160} onChange={(e) => set('clientCompany', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Locations"><input value={f.locations} maxLength={300} onChange={(e) => set('locations', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Principal photography start"><input type="date" value={f.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Target wrap" error={dateErr}><input type="date" value={f.endDate} onChange={(e) => set('endDate', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Master delivery spec"><input value={f.masterSpec} maxLength={300} onChange={(e) => set('masterSpec', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Board tags" hint="Comma-separated, up to 4." error={tagErr}><input value={f.tags} onChange={(e) => set('tags', e.target.value)} className={inputCls} /></FormField>
      </div>
      <FormField label="Synopsis"><textarea rows={3} maxLength={2000} value={f.synopsis} onChange={(e) => set('synopsis', e.target.value)} className={inputCls} /></FormField>
      <Actions busy={busy} valid={valid} onClose={onClose} onSave={save} label="Save changes" />
    </Dlg>
  );
}

/* ───────── SOW ───────── */
function SowModal({ pid, item, onClose, onDone }) {
  const [f, setF] = useState({ stage: item?.stage ?? 'DEVELOP', title: item?.title ?? '', leadName: item?.leadName ?? '', deliverable: item?.deliverable ?? '', docRef: item?.docRef ?? '', status: item?.status ?? 'NOT_STARTED', progressPct: item?.progressPct ?? 0 });
  const [busy, go] = useBusy();
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const pctOk = Number.isInteger(Number(f.progressPct)) && Number(f.progressPct) >= 0 && Number(f.progressPct) <= 100;
  const save = () => {
    if (!item) {
      return go(() => A.addSow(pid, { stage: f.stage, title: f.title.trim(), leadName: f.leadName.trim() || undefined, deliverable: f.deliverable.trim() || undefined, docRef: f.docRef.trim() || undefined }), 'SOW item added', onDone);
    }
    const b = { stage: f.stage, title: f.title.trim(), leadName: f.leadName.trim() || null, deliverable: f.deliverable.trim() || null, docRef: f.docRef.trim() || null };
    if (f.status !== item.status) { b.status = f.status; if (f.status === 'IN_PROGRESS') b.progressPct = Number(f.progressPct); }
    else if (Number(f.progressPct) !== item.progressPct) b.progressPct = Number(f.progressPct);
    go(() => A.updateSow(pid, item.id, b), 'SOW item updated', onDone);
  };
  return (
    <Dlg title={item ? 'Edit SOW item' : 'Add SOW item'} sub="Scope-of-work items are the contracted deliverables. Project progress is the average of their progress." onClose={() => !busy && onClose()}>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Phase"><Select value={f.stage} onChange={(v) => set('stage', v)} options={STAGE_OPTS} /></FormField>
        {item && <FormField label="Status"><Select value={f.status} onChange={(v) => set('status', v)} options={Object.entries(WORK_STATUS).map(([value, x]) => ({ value, label: x.label }))} /></FormField>}
      </div>
      <FormField label="Title" required><input value={f.title} maxLength={160} onChange={(e) => set('title', e.target.value)} className={inputCls} /></FormField>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Lead"><input value={f.leadName} maxLength={120} onChange={(e) => set('leadName', e.target.value)} className={inputCls} /></FormField>
        <FormField label="Document reference"><input value={f.docRef} maxLength={60} onChange={(e) => set('docRef', e.target.value)} className={inputCls} /></FormField>
      </div>
      <FormField label="Deliverable"><input value={f.deliverable} maxLength={300} onChange={(e) => set('deliverable', e.target.value)} className={inputCls} /></FormField>
      {item && <FormField label="Progress (%)" error={pctOk ? '' : '0 to 100'} hint="Setting 100 marks it done and 0 marks it not started."><input type="number" min="0" max="100" value={f.progressPct} onChange={(e) => set('progressPct', e.target.value)} className={inputCls} /></FormField>}
      <Actions busy={busy} valid={f.title.trim() && pctOk} onClose={onClose} onSave={save} label={item ? 'Save changes' : 'Add item'} />
    </Dlg>
  );
}
function SowMoneyModal({ pid, item, onClose, onDone }) {
  const [c, setC] = useState(nairaStr(item.contractKobo));
  const [dsb, setD] = useState(nairaStr(item.disbursedKobo));
  const [busy, go] = useBusy();
  const bad = Number(dsb) > Number(c);
  return (
    <Dlg title={`Money: ${item.title}`} sub="Amounts in naira." onClose={() => !busy && onClose()}>
      <FormField label="Contract value (₦)" required><input type="number" min="0" value={c} onChange={(e) => setC(e.target.value)} className={inputCls} /></FormField>
      <FormField label="Disbursed so far (₦)" error={bad ? 'Disbursed cannot exceed the contract value' : ''}><input type="number" min="0" value={dsb} onChange={(e) => setD(e.target.value)} className={inputCls} /></FormField>
      <Actions busy={busy} valid={c !== '' && dsb !== '' && !bad} onClose={onClose} label="Save amounts" onSave={() => go(() => A.updateSowMoney(pid, item.id, { contract: Number(c), disbursed: Number(dsb) }), 'Amounts saved', onDone)} />
    </Dlg>
  );
}

function SowTab({ p, can, reload }) {
  const [f, setF] = useState('ALL');
  const [dlg, setDlg] = useState(null);
  const items = p.sowItems.filter((i) => f === 'ALL' || i.status === f);
  const groups = [...LIFECYCLE, 'CROSS'].map((s) => ({ s, rows: items.filter((i) => i.stage === s) })).filter((g) => g.rows.length);
  const done = () => { setDlg(null); reload(); };
  const markDone = async (i) => { try { await A.updateSow(p.id, i.id, { status: 'DONE' }); toast.success('Marked done'); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">{[['ALL', `All (${p.sowItems.length})`], ...Object.entries(WORK_STATUS).map(([k, v]) => [k, `${v.label} (${p.sowItems.filter((i) => i.status === k).length})`])].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setF(k)} className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-bold ${f === k ? 'bg-red-600' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'}`}>{l}</button>))}</div>
        <Btn variant="soft" disabled={!can.write} onClick={() => setDlg({ t: 'sow' })}><FiPlus /> Add SOW item</Btn>
      </div>
      {!groups.length && <Card className="p-8 text-center text-sm text-white/40">No SOW items{f !== 'ALL' ? ' with this status' : ' yet'}.</Card>}
      {groups.map((g) => (
        <div key={g.s} className="space-y-2">
          <span className={`${mono} text-red-400`}>{STAGE_LABEL[g.s]}</span>
          {g.rows.map((i) => (
            <Card key={i.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><b className="text-sm">{i.title}</b><Pill tone={WORK_STATUS[i.status].tone}>{WORK_STATUS[i.status].label}</Pill></div>
                  <p className="mt-1 text-[11px] text-white/45">{[i.leadName && `Lead: ${i.leadName}`, i.deliverable && `Deliverable: ${i.deliverable}`, i.docRef && `Doc ${i.docRef}`].filter(Boolean).join(' • ') || 'No lead or deliverable set'}</p>
                  {i.signedOffAt && <p className="mt-1 text-[10px] text-emerald-400">Signed off {fmtDate(i.signedOffAt, false)}</p>}</div>
                <div className="text-right"><b className="block text-sm">{ngn(i.contractKobo, true)}</b><span className="text-[10px] text-white/45">{ngn(i.disbursedKobo, true)} disbursed</span></div>
              </div>
              <div className="flex items-center gap-3"><div className="flex-1"><Bar percent={i.progressPct} /></div><b className="w-10 text-right text-xs">{i.progressPct}%</b></div>
              <div className="flex flex-wrap gap-2">
                {i.status !== 'DONE' && <Btn variant="soft" className="px-3 py-1.5" disabled={!can.write} onClick={() => markDone(i)}><FiCheck /> Mark done</Btn>}
                <Btn variant="soft" className="px-3 py-1.5" disabled={!can.write} onClick={() => setDlg({ t: 'sow', item: i })}><FiEdit2 /> Edit</Btn>
                <Btn variant="soft" className="px-3 py-1.5" disabled={!can.finance} onClick={() => setDlg({ t: 'money', item: i })}><FiDollarSign /> Amounts</Btn>
                <Btn variant="soft" className="px-3 py-1.5" disabled={!can.write || i.disbursedKobo > 0n} title={i.disbursedKobo > 0n ? 'Funds already disbursed' : ''} onClick={() => setDlg({ t: 'rm', item: i })}><FiTrash2 /></Btn>
              </div>
            </Card>
          ))}
        </div>
      ))}
      {dlg?.t === 'sow' && <SowModal pid={p.id} item={dlg.item} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.t === 'money' && <SowMoneyModal pid={p.id} item={dlg.item} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.t === 'rm' && <ConfirmModal open title="Remove this SOW item?" confirmLabel="Remove" onClose={() => setDlg(null)} onConfirm={async () => { try { await A.removeSow(p.id, dlg.item.id); toast.success('Removed'); done(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>“{dlg.item.title}” is removed from this project’s scope.</p></ConfirmModal>}
    </div>
  );
}

/* ───────── milestones ───────── */
function MilestoneModal({ pid, m, onClose, onDone }) {
  const [f, setF] = useState({ title: m?.title ?? '', stage: m?.stage ?? '', dueDate: d10(m?.dueDate) });
  const [busy, go] = useBusy();
  const save = () => (m
    ? go(() => A.updateMilestone(pid, m.id, { title: f.title.trim(), stage: f.stage || null, dueDate: f.dueDate || null }), 'Milestone updated', onDone)
    : go(() => A.addMilestone(pid, { title: f.title.trim(), stage: f.stage || null, dueDate: f.dueDate || null }), 'Milestone added', onDone));
  return (
    <Dlg title={m ? 'Edit milestone' : 'Add milestone'} onClose={() => !busy && onClose()}>
      <FormField label="Phase"><Select value={f.stage} onChange={(v) => setF({ ...f, stage: v })} options={[{ value: '', label: 'Not tied to a phase' }, ...LIFE_OPTS]} /></FormField>
      <FormField label="Milestone" required><input value={f.title} maxLength={160} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} /></FormField>
      <FormField label="Due date"><input type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} className={inputCls} /></FormField>
      <Actions busy={busy} valid={!!f.title.trim()} onClose={onClose} onSave={save} label={m ? 'Save changes' : 'Add milestone'} />
    </Dlg>
  );
}
function MilestonesTab({ p, can, reload }) {
  const ms = useLoad(() => A.milestones(p.id), [p.id]);
  const [dlg, setDlg] = useState(null);
  const refresh = () => { setDlg(null); ms.reload(); reload(); };
  const toggle = async (m) => { try { await A.updateMilestone(p.id, m.id, { completed: !m.completedAt }); ms.reload(); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } };
  const rows = ms.data ?? [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><span className="text-xs text-white/50">{rows.filter((m) => m.completedAt).length} of {rows.length} complete</span><Btn variant="soft" disabled={!can.write} onClick={() => setDlg({})}><FiPlus /> Add milestone</Btn></div>
      <ErrorLine>{ms.error}</ErrorLine>
      {ms.data && !rows.length && <Card className="p-8 text-center text-sm text-white/40">No milestones yet.</Card>}
      {rows.map((m) => {
        const late = !m.completedAt && m.dueDate && new Date(m.dueDate) < new Date();
        return (
          <Card key={m.id} className="flex flex-wrap items-center gap-3 p-4">
            <button type="button" aria-label="Toggle complete" disabled={!can.write} onClick={() => toggle(m)} className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border disabled:cursor-not-allowed ${m.completedAt ? 'border-emerald-500 bg-emerald-500' : 'border-white/25'}`}>{m.completedAt && <FiCheck className="text-xs" />}</button>
            <div className="min-w-0 flex-1"><b className={`text-sm ${m.completedAt ? 'text-white/45 line-through' : ''}`}>{m.title}</b><p className="text-[11px] text-white/40">{[m.stage && STAGE_LABEL[m.stage], m.dueDate && `Due ${fmtDate(m.dueDate, false)}`, m.completedAt && `Done ${fmtDate(m.completedAt, false)}`].filter(Boolean).join(' • ')}</p></div>
            {late && <Pill tone="red">Overdue</Pill>}
            <Btn variant="soft" className="px-3 py-1.5" disabled={!can.write} onClick={() => setDlg({ m })}><FiEdit2 /></Btn>
            <Btn variant="soft" className="px-3 py-1.5" disabled={!can.write} onClick={() => setDlg({ rm: m })}><FiTrash2 /></Btn>
          </Card>
        );
      })}
      {dlg && !dlg.rm && <MilestoneModal pid={p.id} m={dlg.m} onClose={() => setDlg(null)} onDone={refresh} />}
      {dlg?.rm && <ConfirmModal open title="Remove this milestone?" confirmLabel="Remove" onClose={() => setDlg(null)} onConfirm={async () => { try { await A.removeMilestone(p.id, dlg.rm.id); toast.success('Removed'); refresh(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>“{dlg.rm.title}” is removed.</p></ConfirmModal>}
    </div>
  );
}

/* ───────── budget and tranches ───────── */
function ContractModal({ p, onClose, onDone }) {
  const [v, setV] = useState(nairaStr(p.budget.contractKobo));
  const [busy, go] = useBusy();
  return (
    <Dlg title="Set contract value" sub="The total the client has agreed to pay, in naira. It cannot be lower than the tranches already scheduled." onClose={() => !busy && onClose()}>
      <FormField label="Contract value (₦)" required><input type="number" min="0" value={v} onChange={(e) => setV(e.target.value)} className={inputCls} /></FormField>
      <Actions busy={busy} valid={v !== '' && Number(v) >= 0} onClose={onClose} label="Save contract" onSave={() => go(() => A.setContract(p.id, Number(v)), 'Contract updated', onDone)} />
    </Dlg>
  );
}
function TrancheModal({ pid, t, onClose, onDone }) {
  const [f, setF] = useState({ label: t?.label ?? '', trigger: t?.trigger ?? '', amount: t ? nairaStr(t.amountKobo) : '' });
  const [busy, go] = useBusy();
  const body = { label: f.label.trim(), trigger: f.trigger.trim() || (t ? null : undefined), amount: Number(f.amount) };
  return (
    <Dlg title={t ? 'Edit payment tranche' : 'Add payment tranche'} sub="A tranche is a payment expected from the client." onClose={() => !busy && onClose()}>
      <FormField label="Label" required><input value={f.label} maxLength={60} onChange={(e) => setF({ ...f, label: e.target.value })} className={inputCls} /></FormField>
      <FormField label="Amount (₦)" required><input type="number" min="0" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} className={inputCls} /></FormField>
      <FormField label="Trigger" hint="For example: Day 1 principal photography"><input value={f.trigger} maxLength={200} onChange={(e) => setF({ ...f, trigger: e.target.value })} className={inputCls} /></FormField>
      <Actions busy={busy} valid={f.label.trim() && Number(f.amount) > 0} onClose={onClose} label={t ? 'Save changes' : 'Add tranche'}
        onSave={() => go(() => (t ? A.updateTranche(pid, t.id, body) : A.addTranche(pid, body)), t ? 'Tranche updated' : 'Tranche added', onDone)} />
    </Dlg>
  );
}
function PayModal({ pid, t, onClose, onDone }) {
  const [ref, setRef] = useState('');
  const [at, setAt] = useState('');
  const [busy, go] = useBusy();
  return (
    <Dlg title={`Record payment: ${t.label}`} sub={`${ngn(t.amountKobo, true)}. This records that the client paid. It does not move money.`} onClose={() => !busy && onClose()}>
      <FormField label="Bank reference" required hint="Must be unique across all tranches."><input value={ref} maxLength={80} onChange={(e) => setRef(e.target.value)} className={inputCls} /></FormField>
      <FormField label="Date received" hint="Leave empty for today."><input type="date" value={at} onChange={(e) => setAt(e.target.value)} className={inputCls} /></FormField>
      <Actions busy={busy} valid={ref.trim().length >= 3} onClose={onClose} label="Record payment" onSave={() => go(() => A.payTranche(pid, t.id, { bankReference: ref.trim(), paidAt: at || undefined }), 'Payment recorded', onDone)} />
    </Dlg>
  );
}
function BudgetTab({ p, can, reload }) {
  const b = p.budget;
  const [dlg, setDlg] = useState(null);
  const done = () => { setDlg(null); reload(); };
  const cards = [['Contract value', ngn(b.contractKobo, true)], ['SOW scope', ngn(b.sowKobo, true)], ['Overhead', ngn(b.overheadKobo, true), 'Studio management, contingency and tax'], ['Received', ngn(b.paidKobo, true), `${b.paidPct}% of contract`], ['Pending tranches', ngn(b.pendingKobo, true)], ['Remaining', ngn(b.remainingKobo, true), 'Contract minus received']];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {cards.map(([k, v, sub]) => <Card key={k} className="space-y-1 p-4"><span className={`${mono} text-[9px] text-white/45`}>{k}</span><b className="block text-xl font-black">{v}</b>{sub && <span className="text-[10px] text-white/40">{sub}</span>}</Card>)}
      </div>
      <Card className="space-y-3 p-5">
        <div className="flex justify-between text-xs"><span className="text-white/50">Payment progress</span><b>{b.paidPct}%</b></div><Bar percent={b.paidPct} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-white/45">Unscheduled: {ngn(b.unallocatedKobo, true)} • SOW amounts disbursed: {ngn(b.sowDisbursedKobo, true)}</p>
          <div className="flex gap-2"><Btn variant="soft" disabled={!can.finance} onClick={() => setDlg({ t: 'contract' })}>Set contract value</Btn><Btn disabled={!can.finance || b.unallocatedKobo <= 0n} onClick={() => setDlg({ t: 'tranche' })}><FiPlus /> Add tranche</Btn></div>
        </div>
        {!can.finance && <p className="text-[10px] text-white/35">Only Lead or Finance roles can change money.</p>}
      </Card>
      {b.nextTranche && <Card className="border-l-4 border-l-amber-500 p-4 text-xs"><span className={`${mono} text-[9px] text-white/45`}>Next scheduled tranche</span><p className="mt-1"><b>{b.nextTranche.label}</b>: {ngn(b.nextTranche.amountKobo, true)}{b.nextTranche.trigger ? ` • ${b.nextTranche.trigger}` : ''}</p></Card>}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead><tr className={`${mono} border-b border-white/10 text-[9px] text-white/40`}><th className="p-3">#</th><th className="p-3">Tranche</th><th className="p-3 text-right">Amount</th><th className="p-3">Status</th><th className="p-3">Bank reference</th><th className="p-3" /></tr></thead>
          <tbody>
            {b.tranches.map((t) => (
              <tr key={t.id} className="border-b border-white/5 align-top">
                <td className="p-3 text-white/45">{t.sequence}</td>
                <td className="p-3"><b className="block">{t.label}</b>{t.trigger && <span className="text-white/45">{t.trigger}</span>}{t.cancelNote && <span className="block text-white/35">Cancelled: {t.cancelNote}</span>}</td>
                <td className="p-3 text-right font-bold">{ngn(t.amountKobo, true)}</td>
                <td className="p-3"><Pill tone={TRANCHE_STATUS[t.status].tone}>{TRANCHE_STATUS[t.status].label}</Pill></td>
                <td className="p-3 font-mono text-white/60">{t.bankReference ?? '—'}{t.paidAt && <span className="block text-[10px] text-white/35">{fmtDate(t.paidAt, false)}</span>}</td>
                <td className="p-3 text-right">{t.status === 'PENDING' && can.finance && (
                  <span className="flex justify-end gap-1"><Btn className="px-3 py-1.5" onClick={() => setDlg({ t: 'pay', tr: t })}>Mark paid</Btn><Btn variant="soft" className="px-3 py-1.5" onClick={() => setDlg({ t: 'tranche', tr: t })}><FiEdit2 /></Btn><Btn variant="soft" className="px-3 py-1.5" onClick={() => setDlg({ t: 'cancel', tr: t })}>Cancel</Btn></span>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!b.tranches.length && <p className="p-8 text-center text-sm text-white/40">No payment tranches scheduled.</p>}
      </Card>
      {dlg?.t === 'contract' && <ContractModal p={p} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.t === 'tranche' && <TrancheModal pid={p.id} t={dlg.tr} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.t === 'pay' && <PayModal pid={p.id} t={dlg.tr} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.t === 'cancel' && <ConfirmModal open title="Cancel this tranche?" confirmLabel="Cancel tranche" noteLabel="Reason" noteMin={3} onClose={() => setDlg(null)} onConfirm={async (n) => { try { await A.cancelTranche(p.id, dlg.tr.id, n); toast.success('Tranche cancelled'); done(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>“{dlg.tr.label}” ({ngn(dlg.tr.amountKobo, true)}) is removed from the schedule.</p></ConfirmModal>}
    </div>
  );
}

/* ───────── files ───────── */
function FilesTab({ p, can, reload }) {
  const files = useLoad(() => A.projectFiles(p.id), [p.id]);
  const [kind, setKind] = useState('DOC');
  const [pct, setPct] = useState(null);
  const [rm, setRm] = useState(null);
  const input = useRef(null);
  const pick = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!FILE_EXT.includes(ext)) return toast.error(`Allowed types: ${FILE_EXT.join(', ')}`);
    if (file.size > 25 * 1048576) return toast.error('Files can be up to 25 MB');
    setPct(0);
    try { await A.uploadProjectFile(p.id, file, kind, setPct); toast.success('File uploaded'); files.reload(); reload(); } catch (e) { toast.error(apiErrorMessage(e)); }
    setPct(null);
  };
  const open = async (f) => { try { await openSigned(A.projectFileUrl(p.id, f.id)); } catch (e) { toast.error(apiErrorMessage(e)); } };
  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-end gap-3 p-4">
        <FormField label="File type" className="w-52"><Select value={kind} onChange={setKind} options={[{ value: 'DOC', label: 'Document' }, { value: 'DELIVERABLE', label: 'Deliverable' }, { value: 'VISUAL', label: 'Visual / still' }]} /></FormField>
        <input ref={input} type="file" className="hidden" accept={FILE_EXT.map((x) => `.${x}`).join(',')} onChange={(e) => { pick(e.target.files[0]); e.target.value = ''; }} />
        <Btn disabled={!can.write || pct !== null} onClick={() => input.current?.click()}><FiUploadCloud /> {pct === null ? 'Upload file' : `Uploading ${pct}%`}</Btn>
        <p className="text-[10px] text-white/40">PDF, Word, Excel, PowerPoint, ZIP, PNG or JPG up to 25 MB. Stored privately.</p>
      </Card>
      <ErrorLine>{files.error}</ErrorLine>
      {files.data && !files.data.length && <Card className="p-8 text-center text-sm text-white/40">No files yet.</Card>}
      {(files.data ?? []).map((f) => (
        <Card key={f.id} className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1"><b className="block truncate text-sm">{f.name}</b><span className="text-[10px] text-white/45">{f.kind} • {(f.sizeBytes / 1048576).toFixed(1)} MB • {f.uploadedByEmail ?? 'unknown'} • {ago(f.createdAt)}</span></div>
          <Btn variant="soft" onClick={() => open(f)}><FiDownload /> Open</Btn>
          <Btn variant="soft" disabled={!can.write} onClick={() => setRm(f)}><FiTrash2 /></Btn>
        </Card>
      ))}
      {rm && <ConfirmModal open title="Remove this file?" confirmLabel="Remove" onClose={() => setRm(null)} onConfirm={async () => { try { await A.removeProjectFile(p.id, rm.id); toast.success('File removed'); setRm(null); files.reload(); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>“{rm.name}” is deleted from storage.</p></ConfirmModal>}
    </div>
  );
}

/* ───────── client updates ───────── */
function UpdatesTab({ p, can }) {
  const ups = useLoad(() => A.projectUpdates(p.id), [p.id]);
  const [msg, setMsg] = useState('');
  const [mail, setMail] = useState(!!p.client.email);
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    try {
      const r = await A.dispatchUpdate(p.id, { message: msg.trim(), sendEmail: mail });
      if (mail && !r.emailSent) toast.error('Update saved, but the email could not be sent.'); else toast.success(mail ? 'Update dispatched and emailed' : 'Update saved');
      setMsg(''); ups.reload();
    } catch (e) { toast.error(apiErrorMessage(e)); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-5">
        <span className={`${mono} text-white/45`}>Dispatch a client update</span>
        <textarea rows={4} maxLength={3000} value={msg} disabled={!can.write} onChange={(e) => setMsg(e.target.value)} placeholder="Write a milestone advisory or progress note for the client…" className={inputCls} />
        <label className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={mail} disabled={!p.client.email} onChange={(e) => setMail(e.target.checked)} className="accent-red-600" /> Email it to {p.client.email ?? 'the client (no email on file)'} with a private link</label>
        <Btn disabled={!can.write || !msg.trim() || busy} onClick={send}><FiSend /> {busy ? 'Sending…' : 'Dispatch'}</Btn>
      </Card>
      <ErrorLine>{ups.error}</ErrorLine>
      {ups.data && !ups.data.length && <Card className="p-8 text-center text-sm text-white/40">No updates sent yet.</Card>}
      {(ups.data ?? []).map((u) => (
        <Card key={u.id} className="space-y-2 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]"><b>{u.authorEmail}</b><span className="flex gap-2">{u.emailedAt ? <Pill tone="green">Emailed</Pill> : <Pill>Not emailed</Pill>}{u.readAt ? <Pill tone="green">Read {ago(u.readAt)}</Pill> : <Pill>Unread</Pill>}<span className="text-white/40">{ago(u.createdAt)}</span></span></div>
          <p className="whitespace-pre-line text-sm text-white/80">{u.message}</p>
        </Card>
      ))}
    </div>
  );
}

/* ───────── page ───────── */
const TABS = [['sow', 'Services & SOW'], ['milestones', 'Milestones'], ['budget', 'Budget & tranches'], ['files', 'Files'], ['updates', 'Client updates'], ['activity', 'Activity']];

export default function ProdProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useProdAccess();
  const d = useLoad(() => A.project(id), [id]);
  const prod = useLoad(() => A.producers());
  const [tab, setTab] = useState('sow');
  const [dlg, setDlg] = useState(null);
  const p = d.data;

  if (!p) return d.error ? <Card className="p-10 text-center">{d.error} <Link to="/admin/production/projects" className="text-[#FFBF00] underline">Back to projects</Link></Card> : <p className="font-mono text-xs font-bold">LOADING…</p>;

  const st = PROJECT_STATUS[p.status];
  const closed = ['COMPLETED', 'CANCELLED'].includes(p.status);
  const reload = d.reload;
  const act = async (fn, msg) => { try { await fn(); if (msg) toast.success(msg); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } };

  const onStatus = (v) => {
    if (v === p.status) return;
    if (v === 'ACTIVE') return act(() => A.setProjectStatus(id, { status: 'ACTIVE' }), 'Project resumed');
    setDlg({ t: 'status', status: v });
  };
  const sourcing = async () => {
    try { const r = await A.requestSourcing(id); toast.success(r.existing ? 'Opening the existing dossier' : `Dossier ${r.reference} created`); navigate(`/admin/production/sourcing/${r.id}`); }
    catch (e) { toast.error(apiErrorMessage(e)); }
  };
  const archive = async () => {
    try { const r = await A.archiveProject(id); toast.success('Added to Past Productions as a draft'); navigate(`/admin/production/past/${r.id}`); }
    catch (e) { toast.error(apiErrorMessage(e)); }
  };
  const statusCopy = { ON_HOLD: 'Work pauses. Resume it any time.', CANCELLED: 'This is final. A cancelled project cannot be reopened.', COMPLETED: 'This marks the project wrapped and is final. You can then add it to Past Productions.' };

  return (
    <>
      <Card className="flex flex-wrap items-center gap-3 p-3 text-[11px]">
        <Link to="/admin/production/projects" className="flex items-center gap-2 font-bold hover:text-[#FFBF00]"><FiArrowLeft /> Back to active projects</Link>
        <span className="text-white/40">/</span><b className="rounded bg-neutral-900 px-2 py-1 font-mono">{p.reference}</b>
      </Card>

      <Card index={1} className="space-y-5 border-l-4 border-l-red-600 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap gap-2"><Pill tone={st.tone}>{st.label}</Pill><Pill tone="red">Stage: {STAGE_LABEL[p.stage]}</Pill>{p.format && <Pill>{FORMAT_LABEL[p.format]}</Pill>}</div>
            <h1 className="text-3xl font-black md:text-5xl">{p.title}</h1>
            <p className="text-xs text-white/55">{p.client.name}{p.client.company ? ` • ${p.client.company}` : ''} • PM {p.pm?.email ?? 'unassigned'}</p>
            <p className="text-[11px] text-white/40">{[p.startDate && `Start ${fmtDate(p.startDate, false)}`, p.endDate && `Wrap ${fmtDate(p.endDate, false)}`, p.locations, p.masterSpec && `Master: ${p.masterSpec}`].filter(Boolean).join(' • ') || 'No dates or locations set'}</p>
            {p.statusNote && <p className="rounded-lg bg-neutral-900 p-3 text-xs text-white/65"><b>Reason:</b> {p.statusNote}</p>}
          </div>
          <div className="w-full space-y-2 lg:w-72">
            <div className="rounded-xl bg-neutral-900 p-4"><div className="flex justify-between text-[10px] text-white/45"><span>OVERALL PROGRESS</span><b className="text-white">{p.progressPct}%</b></div><div className="mt-2"><Bar percent={p.progressPct} /></div></div>
            <FormField label="Stage"><Select value={p.stage} disabled={!can.write || closed} onChange={(v) => v !== p.stage && act(() => A.setProjectStage(id, v), 'Stage updated')} options={LIFE_OPTS} /></FormField>
            <FormField label="Status"><Select value={p.status} disabled={!can.write || !p.allowedStatuses.length} onChange={onStatus} options={[p.status, ...p.allowedStatuses].map((s) => ({ value: s, label: PROJECT_STATUS[s].label }))} /></FormField>
          </div>
        </div>
        {p.synopsis && <p className="text-sm italic leading-relaxed text-white/65">“{p.synopsis}”</p>}
        <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <Btn variant="soft" disabled={!can.write} onClick={() => setDlg({ t: 'edit' })}><FiEdit2 /> Edit details</Btn>
          <Btn variant="soft" disabled={!can.write || closed} onClick={sourcing}><FiUsers /> Request crew & cast</Btn>
          {p.status === 'COMPLETED' && !p.links.past && <Btn disabled={!can.write} onClick={archive}><FiArchive /> Add to Past Productions</Btn>}
          {p.links.past && <Link to={`/admin/production/past/${p.links.past.id}`}><Btn variant="soft"><FiArchive /> Past production ({p.links.past.status.toLowerCase()})</Btn></Link>}
          {p.links.proposal && <Link to={`/admin/production/proposals/${p.links.proposal.id}`}><Btn variant="soft">Proposal {p.links.proposal.reference}</Btn></Link>}
          {p.links.request && <Link to={`/admin/production/requests/${p.links.request.id}`}><Btn variant="soft">Request {p.links.request.reference}</Btn></Link>}
          {p.links.sourcing.map((s) => <Link key={s.id} to={`/admin/production/sourcing/${s.id}`}><Btn variant="soft">Sourcing {s.reference}</Btn></Link>)}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {p.lifecycle.map((l, i) => (
          <Card key={l.stage} index={i} className={`space-y-2 p-4 ${l.state === 'ACTIVE' ? 'border-red-600/60' : ''}`}>
            <div className="flex items-center justify-between"><span className={`${mono} text-[9px] text-white/50`}>0{i + 1} • {l.label}</span><Pill tone={l.state === 'DONE' ? 'green' : l.state === 'ACTIVE' ? 'red' : 'grey'}>{l.state === 'DONE' ? 'Done' : l.state === 'ACTIVE' ? 'Active' : 'Queued'}</Pill></div>
            <Bar percent={l.progressPct} />
            <p className="text-[11px] text-white/50">{l.sowDone}/{l.sowCount} SOW • {l.milestonesDone}/{l.milestonesTotal} milestones</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`cursor-pointer rounded-lg px-4 py-2.5 text-xs font-bold transition ${tab === k ? 'bg-red-600' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'}`}>
            {l}{k === 'sow' ? ` (${p.counts.sow})` : k === 'files' ? ` (${p.counts.files})` : k === 'updates' ? ` (${p.counts.updates})` : ''}
          </button>
        ))}
      </div>

      {tab === 'sow' && <SowTab p={p} can={can} reload={reload} />}
      {tab === 'milestones' && <MilestonesTab p={p} can={can} reload={reload} />}
      {tab === 'budget' && <BudgetTab p={p} can={can} reload={reload} />}
      {tab === 'files' && <FilesTab p={p} can={can} reload={reload} />}
      {tab === 'updates' && <UpdatesTab p={p} can={can} />}
      {tab === 'activity' && (
        <Card className="space-y-2 p-5">
          {p.activity.map((a) => <div key={a.id} className="border-l-2 border-red-600 bg-neutral-900 px-3 py-2"><div className="flex justify-between gap-2 text-[10px]"><b className="break-all">{a.actor}</b><span className="shrink-0 text-white/40">{ago(a.createdAt)}</span></div><p className="mt-1 text-xs text-white/70">{a.message}</p></div>)}
          {!p.activity.length && <p className="text-sm text-white/40">No activity yet.</p>}
        </Card>
      )}

      {dlg?.t === 'edit' && <EditModal p={p} producers={prod.data ?? []} onClose={() => setDlg(null)} onDone={() => { setDlg(null); reload(); }} />}
      {dlg?.t === 'status' && (
        <ConfirmModal open title={`Mark this project ${PROJECT_STATUS[dlg.status].label.toLowerCase()}?`} confirmLabel="Confirm" noteLabel={dlg.status === 'COMPLETED' ? undefined : 'Reason'} noteMin={dlg.status === 'COMPLETED' ? 0 : 3} onClose={() => setDlg(null)}
          onConfirm={async (n) => { try { await A.setProjectStatus(id, { status: dlg.status, note: n || undefined }); toast.success('Status updated'); setDlg(null); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } }}>
          <p>{statusCopy[dlg.status]}</p>
        </ConfirmModal>
      )}
    </>
  );
}