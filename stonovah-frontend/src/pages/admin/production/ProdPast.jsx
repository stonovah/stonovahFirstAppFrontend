import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiStar, FiAward, FiLock } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal, CountUp, Img } from '../ui';
import { Pagination, FormField, Toggle, inputCls } from '../ui2';
import { useLoad, ErrorLine } from '../adminBits';
import { useDebounced } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A } from '../../../api/adminProduction';
import { Select } from '../ui2';
import { useProdAccess } from './useProdAccess';
import { mono, FORMAT_LABEL, FORMAT_OPTIONS, PAST_STATUS } from './prodAdmin';

const PAGE = 12;
const TABS = [['', 'All works', 'all'], ['published', 'Published', 'published'], ['hidden', 'Hidden', 'hidden'], ['draft', 'Drafts', 'draft'], ['featured', 'Hero featured', 'featured']];

function NewModal({ onClose }) {
  const navigate = useNavigate();
  const [f, setF] = useState({ title: '', format: '' });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try { const p = await A.createPast({ title: f.title.trim(), format: f.format }); toast.success('Draft production created'); navigate(`/admin/production/past/${p.id}`); }
    catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };
  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-md">
      <div className="space-y-4 p-6">
        <div className="pr-10"><h2 className="text-xl font-black">Add production</h2><p className="mt-1 text-[11px] text-white/45">It starts as a draft. Add details, an image and client clearance, then publish.</p></div>
        <FormField label="Format" required><Select value={f.format} onChange={(v) => setF({ ...f, format: v })} options={FORMAT_OPTIONS} placeholder="Select…" /></FormField>
        <FormField label="Production title" required><input value={f.title} maxLength={160} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} /></FormField>
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!f.title.trim() || !f.format || busy} onClick={submit}>{busy ? 'Creating…' : 'Create draft'}</Btn></div>
      </div>
    </Modal>
  );
}

export default function ProdPast() {
  const { can } = useProdAccess();
  const [tab, setTab] = useState('');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [service, setService] = useState('');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('release');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const search = useDebounced(q.trim());
  const yr = /^\d{4}$/.test(year) ? year : undefined;

  const list = useLoad(() => A.past({ state: tab || undefined, search: search || undefined, type: type || undefined, service: service || undefined, year: yr, sort, page, limit: PAGE }), [tab, search, type, service, yr, sort, page]);
  const stats = useLoad(() => A.pastStats());
  const svc = useLoad(() => A.services());
  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? { total: 0, pages: 1 };
  const counts = list.data?.counts ?? {};
  const s = stats.data;
  const reset = () => setPage(1);
  const refresh = () => { list.reload(); stats.reload(); };
  const act = async (fn, msg) => { try { await fn(); if (msg) toast.success(msg); refresh(); } catch (e) { toast.error(apiErrorMessage(e)); } };

  return (
    <>
      <PageHeader eyebrow="PRODUCTION CATALOGUE" title="Past Productions Manager" desc="Curate the public portfolio. A production goes live only with client clearance and a cover image.">
        <Btn disabled={!can.write} onClick={() => setCreating(true)}><FiPlus /> Add production</Btn>
      </PageHeader>

      {s && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            ['Total archived works', s.total, `${s.draft} drafts`],
            ['Storefront published', s.published, 'Live on the public site'],
            ['Hidden', s.hidden, `${s.awaitingClearance} awaiting clearance`],
            ['Hero slots', `${s.heroSlots.used} / ${s.heroSlots.total}`, 'Featured on the Production pages'],
          ].map(([k, v, sub], i) => <Card key={k} index={i} className="space-y-1 p-5"><span className={`${mono} text-[9px] text-white/45`}>{k}</span><b className="block text-3xl font-black">{typeof v === 'number' ? <CountUp value={v} /> : v}</b><span className="text-[11px] text-white/45">{sub}</span></Card>)}
        </div>
      )}
      <ErrorLine>{stats.error}</ErrorLine>

      <Card className="space-y-3 p-3">
        <div className="flex flex-wrap gap-2">{TABS.map(([k, l, c]) => <button key={k} type="button" onClick={() => { setTab(k); reset(); }} className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-bold transition ${tab === k ? 'bg-red-600' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'}`}>{l} ({counts[c] ?? 0})</button>)}</div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-[220px] flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input value={q} onChange={(e) => { setQ(e.target.value); reset(); }} placeholder="Search title, client or slug…" className={`${inputCls} pl-9`} /></div>
          <Select className="lg:w-44" value={type} onChange={(v) => { setType(v); reset(); }} options={[{ value: '', label: 'All project types' }, ...FORMAT_OPTIONS]} />
          <Select className="lg:w-56" value={service} onChange={(v) => { setService(v); reset(); }} options={[{ value: '', label: 'All services' }, ...(svc.data?.data ?? []).map((x) => ({ value: x.id, label: x.name }))]} />
          <input value={year} onChange={(e) => { setYear(e.target.value.replace(/\D/g, '').slice(0, 4)); reset(); }} placeholder="Year" className={`${inputCls} lg:w-24`} />
          <Select className="lg:w-40" value={sort} onChange={(v) => { setSort(v); reset(); }} options={[{ value: 'release', label: 'Release year' }, { value: 'manual', label: 'Manual order' }]} />
        </div>
      </Card>
      <ErrorLine>{list.error}</ErrorLine>
      {list.loading && !list.data && <p className="font-mono text-xs font-bold">LOADING…</p>}
      {list.data && !rows.length && <Card className="p-10 text-center text-sm text-white/40">No productions match these filters.</Card>}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => {
          const st = PAST_STATUS[p.status];
          return (
            <Card key={p.id} className="flex flex-col overflow-hidden">
              <div className="relative h-44 bg-neutral-900">
                {p.coverUrl ? <Img src={p.coverUrl} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[11px] text-white/30">No cover image</div>}
                <div className="absolute left-3 top-3 flex gap-1.5">{p.isFeatured && <Pill tone="solid"><FiStar /> Slot {p.featuredRank}</Pill>}{p.year && <Pill>{p.year}</Pill>}</div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2"><Pill tone="red">{FORMAT_LABEL[p.format]}{p.categoryTag ? ` • ${p.categoryTag}` : ''}</Pill><Pill tone={st.tone}>{st.label}</Pill>{!p.clearanceApproved && <Pill tone="amber"><FiLock /> No clearance</Pill>}</div>
                <div><b className="text-xl">{p.title}</b><p className="text-xs text-white/45">{p.clientName ?? 'No client set'}</p></div>
                <div className="flex flex-wrap gap-1.5">{p.services.slice(0, 4).map((x) => <Pill key={x.id}>{x.name}</Pill>)}{p.services.length > 4 && <Pill>+{p.services.length - 4}</Pill>}</div>
                {p.highlight && <p className="flex items-center gap-2 text-[11px] text-red-300"><FiAward className="shrink-0" /> {p.highlight}</p>}
                <div className="mt-auto flex items-center gap-3 border-t border-white/5 pt-3">
                  <Toggle on={p.status === 'PUBLISHED'} label="Live" disabled={!can.write} onChange={(v) => act(() => A.setPastVisibility(p.id, v), v ? 'Published' : 'Hidden')} />
                  <span className="text-[10px] font-bold uppercase text-white/45">{p.status === 'PUBLISHED' ? 'Live' : 'Off'}</span>
                  <button type="button" disabled={!can.write || p.status !== 'PUBLISHED'} title={p.status === 'PUBLISHED' ? 'Toggle hero slot' : 'Publish first'} onClick={() => act(() => A.setPastFeatured(p.id, { featured: !p.isFeatured }), p.isFeatured ? 'Removed from hero' : 'Added to hero')}
                    className={`cursor-pointer text-lg disabled:cursor-not-allowed disabled:opacity-30 ${p.isFeatured ? 'text-amber-400' : 'text-white/35 hover:text-white'}`}><FiStar /></button>
                  <Link to={`/admin/production/past/${p.id}`} className="ml-auto"><Btn variant="soft" className="px-3 py-1.5">Edit dossier</Btn></Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
        <span>Showing {rows.length} of {meta.total} production(s)</span>
        {meta.pages > 1 && <Pagination page={page} pages={meta.pages} onPage={setPage} />}
      </div>
      {creating && <NewModal onClose={() => setCreating(false)} />}
    </>
  );
}