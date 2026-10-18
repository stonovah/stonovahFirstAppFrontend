// src/pages/admin/pages/PastEvents.jsx
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiSave, FiCheckCircle, FiArrowLeft, FiUpload, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, CountUp } from '../ui';
import { FormField, inputCls } from '../ui2';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';
import { useLoad, ErrorLine, ConfirmModal } from '../adminBits';
import { fmtDate } from '../adminLive';

const SERVICES = ['Event Coordination', 'Media Handling', 'Livestream Coordination', 'Turnstile & Ticketing', 'Full Agency Package'];
const YEAR = new Date().getFullYear();
const isVideo = (u) => /\.(mp4|mov|webm)(\?|$)/i.test(u);
const MAX_MB = 15;
const blank = { eventName: '', client: '', stonovahRole: '', serviceScope: '', location: '', attendance: '', year: YEAR, dateConcluded: '', testimonial: '' };

const Media = ({ url, className = '' }) => (isVideo(url) ? <video src={url} muted preload="metadata" className={className} /> : <img src={url} alt="" className={className} />);

function Editor({ entry, onClose, onChanged }) {
  const [id, setId] = useState(entry?.id || null);
  const [status, setStatus] = useState(entry?.status || 'DRAFT');
  const [media, setMedia] = useState(entry?.mediaUrls || []);
  const [f, setF] = useState(entry ? {
    eventName: entry.eventName || '', client: entry.client || '', stonovahRole: entry.stonovahRole || '', serviceScope: entry.serviceScope || '',
    location: entry.location || '', attendance: entry.attendance || '', year: entry.year || YEAR, dateConcluded: entry.dateConcluded ? String(entry.dateConcluded).slice(0, 10) : '', testimonial: entry.testimonial || '',
  } : blank);
  const [busy, setBusy] = useState('');
  const [rm, setRm] = useState(null);
  const [touched, setTouched] = useState(false);
  const fileRef = useRef(null);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const err = {
    eventName: !f.eventName.trim() && 'Event name is required',
    client: !f.client.trim() && 'Client is required (needed to publish)',
    date: f.dateConcluded && new Date(f.dateConcluded).getFullYear() !== Number(f.year) ? 'The date must fall in the selected year' : '',
  };
  const body = () => ({
    eventName: f.eventName.trim(), client: f.client.trim(), stonovahRole: f.stonovahRole.trim(), serviceScope: f.serviceScope.trim(),
    location: f.location.trim(), attendance: f.attendance.trim(), testimonial: f.testimonial.trim(), year: Number(f.year),
    ...(f.dateConcluded ? { dateConcluded: f.dateConcluded } : {}),
  });

  const saveDraft = async (quiet) => {
    setTouched(true);
    if (err.eventName || err.date) { toast.error(err.eventName || err.date); return null; }
    const saved = id ? await adminApi.pastEvents.update(id, body()) : await adminApi.pastEvents.create(body());
    setId(saved.id);
    if (!quiet) toast.success('Draft saved');
    onChanged();
    return saved;
  };
  const wrap = (key, fn) => async () => { setBusy(key); try { await fn(); } catch (e) { toast.error(apiErrorMessage(e)); } finally { setBusy(''); } };

  const publish = wrap('publish', async () => {
    setTouched(true);
    if (err.eventName || err.client || err.date) { toast.error('Fix the highlighted fields before publishing.'); return; }
    const saved = await saveDraft(true);
    if (!saved) return;
    await adminApi.pastEvents.publish(saved.id, 'PUBLISHED');
    setStatus('PUBLISHED'); toast.success('Published to the public portfolio'); onChanged();
  });
  const unpublish = wrap('publish', async () => { await adminApi.pastEvents.publish(id, 'DRAFT'); setStatus('DRAFT'); toast.success('Moved back to drafts'); onChanged(); });

  const upload = async (files) => {
    const list = [...files];
    if (!list.length) return;
    if (list.length + media.length > 100) return toast.error('A gallery holds at most 100 files.');
    if (list.length > 20) return toast.error('Upload at most 20 files at a time.');
    const bad = list.find((x) => !/^(image\/(png|jpe?g|webp|gif)|video\/(mp4|quicktime|webm))$/.test(x.type));
    if (bad) return toast.error(`“${bad.name}” must be an image (PNG, JPG, WebP, GIF) or video (MP4, MOV, WebM).`);
    const big = list.find((x) => x.size > MAX_MB * 1024 * 1024);
    if (big) return toast.error(`“${big.name}” is larger than ${MAX_MB} MB.`);
    setBusy('media');
    try { const r = await adminApi.pastEvents.addMedia(id, list); setMedia(r.mediaUrls || []); toast.success(`${list.length} file(s) added`); onChanged(); }
    catch (e) { toast.error(apiErrorMessage(e)); } finally { setBusy(''); }
  };
  const move = async (i, d) => {
    const next = [...media];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    const before = media; setMedia(next);
    try { await adminApi.pastEvents.reorderMedia(id, next); onChanged(); } catch (e) { setMedia(before); toast.error(apiErrorMessage(e)); }
  };
  const remove = async () => {
    try { const r = await adminApi.pastEvents.removeMedia(id, rm); setMedia(r.mediaUrls || []); setRm(null); onChanged(); } catch (e) { toast.error(apiErrorMessage(e)); }
  };

  const show = (k) => (touched ? err[k] : '');
  return (
    <>
      <button type="button" onClick={onClose} className="inline-flex items-center gap-2 text-xs font-mono font-bold hover:underline cursor-pointer"><FiArrowLeft /> Back to portfolio</button>
      <PageHeader eyebrow="PUBLIC PORTFOLIO" title={id ? 'Edit Portfolio Showcase' : 'New Portfolio Showcase'} desc="A case study shown on the public portfolio page once published.">
        <Pill tone={status === 'PUBLISHED' ? 'green' : 'amber'} className="py-2">{status === 'PUBLISHED' ? '● Published' : 'Draft'}</Pill>
      </PageHeader>

      <Card className="p-6 space-y-5 border-t-4 border-t-red-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Event name" required error={show('eventName')}><input value={f.eventName} maxLength={160} onChange={set('eventName')} className={inputCls} /></FormField>
          <FormField label="Client / partner" required error={show('client')}><input value={f.client} maxLength={160} onChange={set('client')} className={inputCls} /></FormField>
          <FormField label="Stonovah’s role"><input value={f.stonovahRole} maxLength={200} onChange={set('stonovahRole')} className={inputCls} /></FormField>
          <FormField label="Service scope"><input list="svc" value={f.serviceScope} maxLength={100} onChange={set('serviceScope')} className={inputCls} /><datalist id="svc">{SERVICES.map((s) => <option key={s} value={s} />)}</datalist></FormField>
          <FormField label="Location"><input value={f.location} maxLength={160} onChange={set('location')} className={inputCls} /></FormField>
          <FormField label="Attendance" hint="For example 4,200"><input value={f.attendance} maxLength={60} onChange={set('attendance')} className={inputCls} /></FormField>
          <FormField label="Year"><select value={f.year} onChange={set('year')} className={inputCls}>{Array.from({ length: 12 }, (_, i) => YEAR + 1 - i).map((y) => <option key={y}>{y}</option>)}</select></FormField>
          <FormField label="Date concluded" error={show('date')}><input type="date" value={f.dateConcluded} onChange={set('dateConcluded')} className={inputCls} /></FormField>
        </div>
        <FormField label="Client testimonial" hint="Only publish quotes the client has approved."><textarea rows={3} maxLength={1000} value={f.testimonial} onChange={set('testimonial')} className={inputCls} /></FormField>

        <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-neutral-800">
          <Btn variant="soft" disabled={!!busy} onClick={wrap('save', () => saveDraft(false))}><FiSave /> {busy === 'save' ? 'Saving…' : id ? 'Save Changes' : 'Save as Draft'}</Btn>
          {status === 'PUBLISHED'
            ? <Btn variant="soft" disabled={!!busy} onClick={unpublish}>Move back to Draft</Btn>
            : <Btn disabled={!!busy} onClick={publish}><FiCheckCircle /> {busy === 'publish' ? 'Publishing…' : 'Save & Publish'}</Btn>}
        </div>
        {status === 'PUBLISHED' && <p className="text-[10px] text-neutral-400">Changes you save here are visible on the public portfolio straight away.</p>}
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3"><div><h2 className="text-xl font-black font-sans">Photos & Videos</h2><p className="text-[11px] text-neutral-400">The first file is the cover. Publishing needs at least one. Up to {MAX_MB} MB each.</p></div>
          <span><input ref={fileRef} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm" className="hidden" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
            <Btn disabled={!id || !!busy} onClick={() => fileRef.current?.click()}><FiUpload /> {busy === 'media' ? 'Uploading…' : 'Add files'}</Btn></span></div>
        {!id && <p className="text-xs text-amber-300">Save the entry as a draft first, then add files.</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {media.map((u, i) => (
            <div key={u} className="bg-neutral-900 rounded-xl overflow-hidden relative group">
              <Media url={u} className="w-full h-28 object-cover" />
              {i === 0 && <span className="absolute top-1 left-1 text-[8px] font-bold bg-red-600 px-1.5 py-0.5 rounded">COVER</span>}
              {isVideo(u) && <span className="absolute top-1 right-1 text-[8px] font-bold bg-black/80 px-1.5 py-0.5 rounded">VIDEO</span>}
              <div className="flex justify-between p-1.5">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move earlier" className="w-7 h-7 rounded bg-neutral-800 disabled:opacity-30 flex items-center justify-center cursor-pointer"><FiChevronLeft /></button>
                <button type="button" onClick={() => setRm(u)} aria-label="Remove" className="w-7 h-7 rounded bg-neutral-800 hover:text-red-400 flex items-center justify-center cursor-pointer"><FiTrash2 /></button>
                <button type="button" disabled={i === media.length - 1} onClick={() => move(i, 1)} aria-label="Move later" className="w-7 h-7 rounded bg-neutral-800 disabled:opacity-30 flex items-center justify-center cursor-pointer"><FiChevronRight /></button>
              </div>
            </div>
          ))}
        </div>
        {id && !media.length && <p className="text-xs text-neutral-500">No files yet.</p>}
      </Card>

      {rm && <ConfirmModal open title="Remove this file?" confirmLabel="Remove" onClose={() => setRm(null)} onConfirm={remove}><p>It is removed from this gallery. It disappears from the public portfolio if the entry is published.</p></ConfirmModal>}
    </>
  );
}

export default function PastEvents() {
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | entry
  const list = useLoad(() => adminApi.pastEvents.list());
  const all = list.data || [];
  const counts = { all: all.length, PUBLISHED: all.filter((p) => p.status === 'PUBLISHED').length, DRAFT: all.filter((p) => p.status === 'DRAFT').length };
  const rows = all.filter((p) => tab === 'all' || p.status === tab).filter((p) => !q.trim() || `${p.eventName} ${p.client || ''} ${p.year || ''}`.toLowerCase().includes(q.trim().toLowerCase()));

  if (editing) return <Editor key={editing === 'new' ? 'new' : editing.id} entry={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onChanged={list.reload} />;

  return (
    <>
      <PageHeader eyebrow="PUBLIC PORTFOLIO" title="Past Events Portfolio Manager" desc="Case studies of Stonovah’s past productions. Published entries appear on the public portfolio page.">
        <Card className="px-4 py-3"><span className="text-[9px] text-neutral-500 font-bold block">PUBLISHED</span><b className="text-2xl font-sans"><CountUp value={counts.PUBLISHED} /></b></Card>
        <Card className="px-4 py-3"><span className="text-[9px] text-neutral-500 font-bold block">DRAFTS</span><b className="text-2xl font-sans"><CountUp value={counts.DRAFT} /></b></Card>
      </PageHeader>

      <Card className="p-3 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex flex-wrap gap-2">{[['all', 'All'], ['PUBLISHED', 'Published'], ['DRAFT', 'Drafts']].map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={`text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition ${tab === k ? 'bg-red-600' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300'}`}>{l} ({counts[k]})</button>)}</div>
        <div className="relative flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, client or year…" className={`${inputCls} pl-9`} /></div>
        <Btn onClick={() => setEditing('new')}><FiPlus /> Add Portfolio Event</Btn>
      </Card>
      <ErrorLine>{list.error}</ErrorLine>

      <Card index={1} className="overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-xs min-w-[800px]">
          <thead><tr className="text-[9px] text-neutral-500 text-left bg-neutral-950"><th className="p-4">EVENT</th><th>CLIENT</th><th>YEAR & DATE</th><th>STONOVAH’S ROLE</th><th>SERVICE</th><th className="pr-4">STATUS</th></tr></thead>
          <tbody>{rows.map((p, i) => (
            <motion.tr key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} onClick={() => setEditing(p)} className="border-t border-neutral-800 hover:bg-neutral-900 transition cursor-pointer">
              <td className="p-4"><div className="flex items-center gap-3"><div className="w-16 h-14 rounded overflow-hidden shrink-0 bg-neutral-900">{p.mediaUrls?.[0] && <Media url={p.mediaUrls[0]} className="w-full h-full object-cover" />}</div><span><b className="font-sans text-sm block">{p.eventName}</b><span className="text-[10px] text-neutral-400">{p.location} • {(p.mediaUrls || []).length} file(s)</span></span></div></td>
              <td>{p.client || '—'}</td><td><b className="font-sans block">{p.year || '—'}</b><span className="text-[10px] text-neutral-400">{p.dateConcluded ? fmtDate(p.dateConcluded, false) : ''}</span></td>
              <td className="max-w-[200px] truncate">{p.stonovahRole || '—'}</td><td>{p.serviceScope ? <Pill>{p.serviceScope}</Pill> : '—'}</td>
              <td className="pr-4"><Pill tone={p.status === 'PUBLISHED' ? 'green' : 'amber'}>{p.status === 'PUBLISHED' ? 'Published' : 'Draft'}</Pill></td>
            </motion.tr>))}</tbody></table>
          {list.loading && !list.data && <p className="text-center text-sm text-neutral-400 py-10">Loading…</p>}
          {list.data && !rows.length && <p className="text-center text-sm text-neutral-400 py-10">No portfolio entries match.</p>}
        </div>
      </Card>
    </>
  );
}