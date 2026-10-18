// src/pages/organizer/pages/OrganizerTemplates.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiStar, FiEye, FiEdit2, FiArchive, FiRotateCcw, FiArrowRight, FiSearch, FiPlus } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal, CountUp } from '../../admin/ui';
import { FormField, inputCls } from '../../admin/ui2';
import { PassPreview } from '../../steps/TicketTemplate';
import { templateLibraryApi } from '../../../api/settings';
import { apiErrorMessage } from '../../../api/apiClient';
import { useCan } from '../../../context/AuthContext';
import { ROUTES } from '../../../config/routes';

const tabs = [['all', 'All'], ['fav', 'Favourites'], ['recent', 'Recently used'], ['archived', 'Archived']];
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not scheduled');
const nameOf = (t) => t.nickname || t.name;

export default function OrganizerTemplates({ onUse }) {
  const navigate = useNavigate();
  const can = useCan();
  const canEdit = can('settings.write');
  const canCreate = can('events.write');

  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [preview, setPreview] = useState(null);
  const [rename, setRename] = useState(null); // { id, nickname }

  const load = useCallback(async () => {
    setError('');
    try { setList(await templateLibraryApi.list()); }
    catch (e) { setError(apiErrorMessage(e, 'Could not load your templates.')); setList((p) => p ?? []); }
  }, []);
  useEffect(() => { load(); }, [load]);

  // optimistic: update the card now, roll back if the server says no
  const patch = async (t, body, message) => {
    const before = list;
    setList((l) => l.map((x) => (x.id === t.id ? { ...x, ...body } : x)));
    try { await templateLibraryApi.update(t.id, body); if (message) toast.success(message); }
    catch (e) { setList(before); toast.error(apiErrorMessage(e)); }
  };

  const startEvent = (template) => {
    const params = { step: '1', ...(template ? { template } : {}) };
    if (onUse) return onUse(params);
    return navigate(`${ROUTES.createEvent}?${new URLSearchParams(params)}`);
  };

  if (list === null) return <p className="font-mono text-xs font-bold">LOADING YOUR TEMPLATES…</p>;

  const needle = q.trim().toLowerCase();
  let view = list.filter((t) => (tab === 'archived' ? t.archived : !t.archived) && (tab !== 'fav' || t.favorite) && (!needle || `${nameOf(t)} ${t.name} ${t.category}`.toLowerCase().includes(needle)));
  if (tab === 'recent') view = [...view].sort((a, b) => new Date(b.lastUsedAt || 0) - new Date(a.lastUsedAt || 0));
  const top = [...list].sort((a, b) => b.eventCount - a.eventCount)[0];

  return (
    <>
      <PageHeader eyebrow="ORGANIZER PORTAL / PASS LIBRARY" title="Ticket Templates" desc="The ticket designs you have used on your events. Reuse one for a new event, mark favourites, or give a design your own name.">
        <Card className="px-4 py-3"><span className="text-[9px] text-neutral-500 font-bold block">SAVED DESIGNS</span><b className="text-2xl font-sans"><CountUp value={list.filter((t) => !t.archived).length} /></b></Card>
        <Card className="px-4 py-3"><span className="text-[9px] text-neutral-500 font-bold block">MOST USED</span><b className="text-sm font-sans">{top ? nameOf(top) : '—'}</b></Card>
        {canCreate && <Btn onClick={() => startEvent()}><FiPlus /> Start a New Event</Btn>}
      </PageHeader>

      {error && <p className="font-mono text-xs font-bold text-red-400 bg-black rounded-xl p-3">{error}</p>}

      <Card className="p-3 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex flex-wrap gap-2">{tabs.map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={`text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition ${tab === k ? 'bg-red-600' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300'}`}>{l}</button>)}</div>
        <div className="relative flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your designs…" className={`${inputCls} pl-9`} /></div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {view.map((t, i) => (
          <Card key={t.id} index={i} hover className="p-5 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2 mb-1">
                  <Pill>{t.category}</Pill>
                  {t.nickname && <Pill tone="grey">{t.name}</Pill>}
                  {t.archived && <Pill tone="amber">Archived</Pill>}
                  {!t.isActive && <Pill tone="red">No longer offered</Pill>}
                </div>
                <h3 className="text-xl font-black font-sans break-words">{nameOf(t)}</h3>
              </div>
              <button type="button" disabled={!canEdit} aria-label={t.favorite ? 'Remove favourite' : 'Mark favourite'} onClick={() => patch(t, { favorite: !t.favorite })} className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition disabled:cursor-not-allowed ${t.favorite ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-neutral-800 text-neutral-500'}`}>
                <FiStar className={t.favorite ? 'fill-current' : ''} />
              </button>
            </div>

            <PassPreview template={t} eventName={t.events[0]?.title} />

            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="bg-neutral-900 rounded-lg py-2"><b className="text-lg font-sans block">{t.eventCount}</b>events</div>
              <div className="bg-neutral-900 rounded-lg py-2"><b className="text-lg font-sans block">{t.ticketsIssued.toLocaleString()}</b>tickets issued</div>
              <div className="bg-neutral-900 rounded-lg py-2"><b className="text-xs font-sans block mt-1.5">{fmt(t.lastUsedAt)}</b>last used</div>
            </div>

            <div className="space-y-1">
              {t.events.map((e) => <div key={e.id} className="text-[11px] text-neutral-400 flex justify-between gap-2"><span className="truncate">• {e.title}</span><span className="shrink-0">{fmt(e.startAt)}</span></div>)}
              {t.eventCount > t.events.length && <span className="text-[10px] text-neutral-500">+ {t.eventCount - t.events.length} more</span>}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {!t.archived && canCreate && <Btn disabled={!t.isActive} onClick={() => startEvent(t.id)}>Use for New Event <FiArrowRight /></Btn>}
              <Btn variant="soft" onClick={() => setPreview(t)}><FiEye /> Preview</Btn>
              {canEdit && <Btn variant="soft" onClick={() => setRename({ id: t.id, nickname: t.nickname || '' })}><FiEdit2 /> Rename</Btn>}
              {canEdit && <Btn variant="soft" onClick={() => patch(t, { archived: !t.archived }, t.archived ? 'Restored to your library' : 'Archived. Your events keep their tickets')}>{t.archived ? <><FiRotateCcw /> Restore</> : <><FiArchive /> Archive</>}</Btn>}
            </div>
          </Card>
        ))}
        {!view.length && (
          <Card className="p-10 text-center text-sm text-neutral-400 xl:col-span-2 space-y-3">
            <p>{list.length ? 'Nothing here.' : 'Templates appear here once you select one for an event.'}</p>
            {!list.length && canCreate && <Btn onClick={() => startEvent()}>Start a New Event</Btn>}
          </Card>
        )}
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} width="max-w-2xl">
        {preview && (
          <div className="p-6 space-y-3">
            <h2 className="text-xl font-black font-sans pr-10">{nameOf(preview)}</h2>
            <PassPreview template={preview} eventName={preview.events[0]?.title} />
            <p className="text-[10px] text-neutral-500">Approximate preview. Real tickets use each buyer’s name and a unique QR code.</p>
          </div>
        )}
      </Modal>

      <Modal open={!!rename} onClose={() => setRename(null)} width="max-w-md">
        {rename && (
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-black font-sans pr-10">Rename this design</h2>
            <FormField label="Your name for this design" error={rename.nickname.length > 40 ? 'Max 40 characters' : ''} hint="Only you see this. Leave it empty to use the original name.">
              <input value={rename.nickname} maxLength={41} onChange={(e) => setRename({ ...rename, nickname: e.target.value })} className={inputCls} />
            </FormField>
            <div className="flex gap-2">
              <Btn variant="soft" onClick={() => setRename(null)}>Cancel</Btn>
              <Btn disabled={rename.nickname.length > 40} onClick={() => { const t = list.find((x) => x.id === rename.id); patch(t, { nickname: rename.nickname.trim() || null }, 'Name saved'); setRename(null); }}>Save</Btn>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}