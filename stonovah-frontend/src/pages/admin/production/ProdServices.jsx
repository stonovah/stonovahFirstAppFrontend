import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiArrowUp, FiArrowDown, FiEdit2, FiRotateCcw } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal, CountUp } from '../ui';
import { FormField, Toggle, inputCls } from '../ui2';
import { useLoad, ErrorLine } from '../adminBits';
import { ago, useDebounced } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A } from '../../../api/adminProduction';
import { Select } from '../ui2';
import { useProdAccess } from './useProdAccess';
import { mono, STAGE_LABEL, STAGE_OPTIONS, FORMAT_LABEL, FORMAT_OPTIONS } from './prodAdmin';

const GROUPS = [
  ['pkg', 'Full packages', (r) => r.kind === 'TURNKEY'],
  ...['DEVELOP', 'PREPARE', 'SHOOT', 'FINISH', 'RELEASE'].map((s, i) => [s, `Stage 0${i + 1}: ${STAGE_LABEL[s]}`, (r) => r.kind !== 'TURNKEY' && r.stage === s]),
  ['CROSS', 'Cross-cutting: legal, financing & governance', (r) => r.kind !== 'TURNKEY' && r.stage === 'CROSS'],
];

function NewModal({ onClose }) {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', stage: 'DEVELOP', shortDescription: '', formats: ['FEATURE_FILM'] });
  const [busy, setBusy] = useState(false);
  const toggle = (k) => setF((p) => ({ ...p, formats: p.formats.includes(k) ? p.formats.filter((x) => x !== k) : [...p.formats, k] }));
  const submit = async () => {
    setBusy(true);
    try {
      const s = await A.createService({ name: f.name.trim(), stage: f.stage, shortDescription: f.shortDescription.trim() || undefined, formats: f.formats });
      toast.success('Draft service created');
      navigate(`/admin/production/services/${s.id}`);
    } catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };
  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-lg">
      <div className="space-y-4 p-6">
        <div className="pr-10"><h2 className="text-xl font-black">Add custom service</h2><p className="mt-1 text-[11px] text-white/45">It starts as a draft. Fill it in on the next page, then publish.</p></div>
        <FormField label="Stage"><Select value={f.stage} onChange={(v) => setF({ ...f, stage: v })} options={STAGE_OPTIONS} /></FormField>
        <FormField label="Service name" required><input value={f.name} maxLength={120} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} /></FormField>
        <FormField label="Short description"><textarea rows={2} maxLength={200} value={f.shortDescription} onChange={(e) => setF({ ...f, shortDescription: e.target.value })} className={inputCls} /></FormField>
        <FormField label="Applicable project types">
          <div className="grid gap-2 sm:grid-cols-2">{FORMAT_OPTIONS.map((o) => <label key={o.value} className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={f.formats.includes(o.value)} onChange={() => toggle(o.value)} className="accent-red-600" /> {o.label}</label>)}</div>
        </FormField>
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!f.name.trim() || busy} onClick={submit}>{busy ? 'Creating…' : 'Create draft'}</Btn></div>
      </div>
    </Modal>
  );
}

export default function ProdServices() {
  const { can } = useProdAccess();
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('');
  const [state, setState] = useState('');
  const [creating, setCreating] = useState(false);
  const search = useDebounced(q.trim());
  const list = useLoad(() => A.services({ search: search || undefined, stage: stage || undefined, state: state || undefined }), [search, stage, state]);
  const rows = list.data?.data ?? [];
  const counts = list.data?.counts;
  const last = list.data?.lastPublished;
  const canReorder = can.write && !search && !stage && !state;

  const act = async (fn, msg) => { try { await fn(); if (msg) toast.success(msg); list.reload(); } catch (e) { toast.error(apiErrorMessage(e)); } };
  const move = (r, dir) => {
    const g = GROUPS.find((x) => x[2](r));
    const ids = rows.filter(g[2]).map((x) => x.id);
    const i = ids.indexOf(r.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    const full = rows.map((x) => x.id);
    const a = full.indexOf(ids[i]);
    const b = full.indexOf(ids[j]);
    [full[a], full[b]] = [full[b], full[a]];
    act(() => A.reorderServices(full), 'Order saved');
  };
  const status = (r) => (r.status === 'ARCHIVED' ? ['Archived', 'grey'] : r.status === 'DRAFT' ? ['Draft', 'grey'] : r.visibleOnWebsite ? ['Live', 'green'] : ['Hidden', 'amber']);

  return (
    <>
      <PageHeader eyebrow="PRODUCTION DIVISION • GOVERNANCE ENGINE" title="Services Catalogue" desc="Control public visibility, package builder availability and page content for every production service.">
        <Btn disabled={!can.write} onClick={() => setCreating(true)}><FiPlus /> Add custom service</Btn>
      </PageHeader>

      {counts && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            ['Total services', counts.total, `${counts.archived} archived`],
            ['Live on website', counts.live, `${counts.hidden} draft or hidden`],
            ['Active in packages', counts.inPackages, `of ${counts.total} in the package builder`],
          ].map(([k, v, sub], i) => <Card key={k} index={i} className="space-y-1 p-5"><span className={`${mono} text-[9px] text-white/45`}>{k}</span><b className="block text-3xl font-black"><CountUp value={v} /></b><span className="text-[11px] text-white/45">{sub}</span></Card>)}
          <Card index={3} className="space-y-1 p-5"><span className={`${mono} text-[9px] text-white/45`}>Last published</span><b className="block text-lg font-black">{last ? ago(last.at) : 'Never'}</b><span className="text-[11px] text-white/45">{last?.by ?? ''}</span></Card>
        </div>
      )}

      <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="relative min-w-55 flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, code or slug…" className={`${inputCls} pl-9`} /></div>
        <Select className="lg:w-48" value={stage} onChange={setStage} options={[{ value: '', label: 'All stages' }, ...STAGE_OPTIONS]} />
        <Select className="lg:w-44" value={state} onChange={setState} options={[{ value: '', label: 'All states' }, { value: 'published', label: 'Live' }, { value: 'hidden', label: 'Draft or hidden' }, { value: 'archived', label: 'Archived' }]} />
      </Card>
      {!canReorder && can.write && <p className="text-[11px] text-white/40">Clear the filters to reorder services.</p>}
      <ErrorLine>{list.error}</ErrorLine>
      {list.loading && !list.data && <p className="font-mono text-xs font-bold">LOADING…</p>}
      {list.data && !rows.length && <Card className="p-10 text-center text-sm text-white/40">No services match.</Card>}

      {GROUPS.map(([key, title, test]) => {
        const items = rows.filter(test);
        if (!items.length) return null;
        return (
          <section key={key} className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/4 px-4 py-2.5"><b className="text-sm uppercase tracking-wide">{title}</b><Pill>{items.length}</Pill></div>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((r, i) => {
                const [label, tone] = status(r);
                const archived = r.status === 'ARCHIVED';
                const published = r.status === 'PUBLISHED';
                return (
                  <Card key={r.id} className={`flex flex-col gap-3 p-5 ${archived ? 'opacity-60' : ''}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone="red">{r.stageLabel ?? STAGE_LABEL[r.stage]}</Pill><Pill tone={tone}>{label}</Pill>
                      {r.hasDraft && <Pill tone="amber">Unpublished edits</Pill>}
                      <span className="ml-auto font-mono text-[10px] text-white/35">{r.code}</span>
                    </div>
                    <div><b className="text-xl">{r.name}</b><p className="mt-1 text-xs leading-relaxed text-white/55">{r.shortDescription}</p></div>
                    <div className="flex flex-wrap gap-1.5">{r.formats.map((f) => <Pill key={f}>{FORMAT_LABEL[f] ?? f}</Pill>)}</div>
                    {!archived && (
                      <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-[10px] text-white/55">
                        {[['Website', 'visibleOnWebsite'], ['Package builder', 'inPackageBuilder'], ['Home feature', 'featuredOnHome']].map(([l, k]) => (
                          <label key={k} className="flex flex-col items-start gap-1.5"><span>{l}</span><Toggle on={r[k]} label={l} disabled={!can.write || !published} onChange={(v) => act(() => A.setServiceVisibility(r.id, { [k]: v }))} /></label>
                        ))}
                      </div>
                    )}
                    {!published && !archived && <p className="text-[10px] text-white/35">Publish this service to turn visibility on.</p>}
                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      <Link to={`/admin/production/services/${r.id}`}><Btn variant="soft" className="px-3 py-1.5"><FiEdit2 /> Edit service</Btn></Link>
                      {archived && <Btn variant="soft" className="px-3 py-1.5" disabled={!can.write} onClick={() => act(() => A.restoreService(r.id), 'Restored as a draft')}><FiRotateCcw /> Restore</Btn>}
                      {canReorder && !archived && (
                        <span className="ml-auto flex gap-1">
                          <Btn variant="soft" className="px-2.5 py-1.5" disabled={i === 0} onClick={() => move(r, -1)} title="Move up"><FiArrowUp /></Btn>
                          <Btn variant="soft" className="px-2.5 py-1.5" disabled={i === items.length - 1} onClick={() => move(r, 1)} title="Move down"><FiArrowDown /></Btn>
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
      {creating && <NewModal onClose={() => setCreating(false)} />}
    </>
  );
}