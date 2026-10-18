// src/pages/admin/pages/TicketTemplates.jsx
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiZap, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, CountUp } from '../ui';
import { Toggle, FormField, inputCls } from '../ui2';
import { PassPreview } from '../../steps/TicketTemplate';
import { adminApi } from '../../../api/admin';
import { uploadsApi } from '../../../api/events';
import { apiErrorMessage } from '../../../api/apiClient';
import { useLoad, ErrorLine, ConfirmModal } from '../adminBits';
import { ago } from '../adminLive';

const CATS = ['General Admission', 'VIP & Gala', 'Concert & Arena', 'Festival & Multi-day', 'Other'];
const ZONES = [['qr', 'QR code'], ['eventName', 'Event name'], ['attendeeName', 'Attendee name'], ['tierName', 'Ticket type']];
const SAMPLE = { eventName: 'SAMPLE EVENT NAME', attendeeName: 'Sample Attendee', tierName: 'General Admission' };
const R = Math.round;

const defaults = (w, h) => {
  const q = Math.max(40, R(w * 0.22));
  return {
    qr: { x: Math.max(0, w - q - R(w * 0.05)), y: Math.max(0, h - q - R(h * 0.05)), size: q },
    eventName: { x: R(w * 0.06), y: R(h * 0.22), fontSize: Math.max(10, R(w * 0.06)) },
    attendeeName: { x: R(w * 0.06), y: R(h * 0.5), fontSize: Math.max(10, R(w * 0.04)) },
    tierName: { x: R(w * 0.06), y: R(h * 0.6), fontSize: Math.max(10, R(w * 0.035)) },
  };
};

// mirrors the server's checks
const problems = (l, w, h) => {
  const p = [];
  if (l.qr.size < 40) p.push('The QR code must be at least 40 px.');
  if (l.qr.x < 0 || l.qr.y < 0 || l.qr.x + l.qr.size > w || l.qr.y + l.qr.size > h) p.push('The QR code must sit fully inside the image.');
  [['eventName', 'Event name'], ['attendeeName', 'Attendee name'], ['tierName', 'Ticket type']].forEach(([k, label]) => {
    const z = l[k];
    if (z.fontSize < 10) p.push(`${label} text must be at least 10 px.`);
    if (z.x < 0 || z.x >= w || z.y > h || z.y - z.fontSize < 0) p.push(`${label} must sit inside the image.`);
  });
  return p;
};

function Editor({ initial, eventCount, onClose, onSaved }) {
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || CATS[0]);
  const [url, setUrl] = useState(initial?.backgroundUrl || '');
  const [layout, setLayout] = useState(initial?.layoutConfig || null);
  const [aiPrompt, setAiPrompt] = useState(initial?.aiPrompt || '');
  const [prompt, setPrompt] = useState('');
  const [dims, setDims] = useState(initial?.imageWidth ? { w: initial.imageWidth, h: initial.imageHeight } : null);
  const [sel, setSel] = useState('qr');
  const [busy, setBusy] = useState('');
  const svgRef = useRef(null);
  const drag = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!url) { setDims(null); return; }
    const img = new window.Image();
    img.onload = () => {
      const d = { w: img.naturalWidth, h: img.naturalHeight };
      setDims(d);
      setLayout((l) => (l && !problems(l, d.w, d.h).length ? l : defaults(d.w, d.h)));
    };
    img.onerror = () => toast.error('The background image could not be loaded.');
    img.src = url;
  }, [url]);

  const W = dims?.w || 0;
  const H = dims?.h || 0;
  const issues = layout && dims ? problems(layout, W, H) : [];
  const valid = name.trim().length > 0 && !!url && !!layout && !!dims && !issues.length;
  const setZone = (key, patch) => setLayout((l) => ({ ...l, [key]: { ...l[key], ...patch } }));

  const toSvg = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  const down = (key) => (e) => {
    e.preventDefault();
    const p = toSvg(e);
    drag.current = { key, dx: p.x - layout[key].x, dy: p.y - layout[key].y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setSel(key);
  };
  const move = (e) => {
    const d = drag.current;
    if (!d) return;
    const p = toSvg(e);
    const x = p.x - d.dx;
    const y = p.y - d.dy;
    if (d.key === 'qr') setZone('qr', { x: Math.min(Math.max(R(x), 0), Math.max(0, W - layout.qr.size)), y: Math.min(Math.max(R(y), 0), Math.max(0, H - layout.qr.size)) });
    else setZone(d.key, { x: Math.min(Math.max(R(x), 0), W - 1), y: Math.min(Math.max(R(y), layout[d.key].fontSize), H) });
  };
  const up = () => { drag.current = null; };

  const upload = async (file) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return toast.error('Use a PNG, JPG or WebP image.');
    setBusy('upload');
    try { setUrl(await uploadsApi.image(file)); setAiPrompt(''); } catch (e) { toast.error(apiErrorMessage(e, 'Upload failed.')); } finally { setBusy(''); }
  };
  const generate = async () => {
    setBusy('ai');
    try { const r = await adminApi.templates.generate(prompt.trim()); setUrl(r.previewUrl); setAiPrompt(r.prompt); } catch (e) { toast.error(apiErrorMessage(e)); } finally { setBusy(''); }
  };
  const save = async () => {
    setBusy('save');
    const body = { name: name.trim(), category, backgroundUrl: url, layoutConfig: layout, ...(aiPrompt ? { aiPrompt } : {}) };
    try {
      if (initial?.id) await adminApi.templates.update(initial.id, body); else await adminApi.templates.create(body);
      toast.success(initial?.id ? 'Template saved' : 'Saved as unpublished. Publish it when you are ready.');
      onSaved();
    } catch (e) { toast.error(apiErrorMessage(e)); setBusy(''); }
  };

  const sw = Math.max(2, W * 0.003);
  const z = layout?.[sel];
  const numInput = (label, key, min = 0) => (
    <label className="text-[10px] font-bold text-neutral-400 uppercase">{label}
      <input type="number" min={min} value={z[key]} onChange={(e) => setZone(sel, { [key]: R(Number(e.target.value) || 0) })} className={`${inputCls} mt-1`} /></label>
  );

  return (
    <>
      <button type="button" onClick={onClose} className="inline-flex items-center gap-2 text-xs font-mono font-bold hover:underline cursor-pointer"><FiArrowLeft /> Back to templates</button>
      <PageHeader eyebrow="TICKET DESIGN" title={initial?.id ? 'Edit Ticket Template' : 'New Ticket Template'} desc="Choose a background, then drag the QR code and text onto it. Organizers pick published templates when they create an event." />

      {eventCount > 0 && <p className="font-mono text-xs font-bold bg-black text-[#FFBF00] rounded-xl p-3 flex gap-2"><FiAlertTriangle className="shrink-0 mt-0.5" /> {eventCount} event{eventCount === 1 ? ' uses' : 's use'} this template. Changes apply to tickets issued from now on. Tickets already sent are not changed.</p>}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <Card className="xl:col-span-8 p-4 space-y-3">
          {!url && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
              <div className="bg-neutral-900 rounded-xl p-5 space-y-3"><b className="font-sans block">Upload a background</b><p className="text-[11px] text-neutral-400">PNG, JPG or WebP. Portrait works well for mobile tickets.</p>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
                <Btn disabled={!!busy} onClick={() => fileRef.current?.click()}><FiUpload /> {busy === 'upload' ? 'Uploading…' : 'Choose image'}</Btn></div>
              <div className="bg-neutral-900 rounded-xl p-5 space-y-3"><b className="font-sans block">Generate with AI</b>
                <textarea rows={3} maxLength={500} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the artwork, e.g. “dark gold art-deco border, empty centre”" className={inputCls} />
                <Btn disabled={prompt.trim().length < 5 || !!busy} onClick={generate}><FiZap /> {busy === 'ai' ? 'Generating… this can take a minute' : 'Generate artwork'}</Btn></div>
            </div>
          )}
          {url && dims && layout && (
            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none touch-none rounded-lg bg-neutral-900" onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
              <image href={url} x="0" y="0" width={W} height={H} />
              <g onPointerDown={down('qr')} style={{ cursor: 'move' }}>
                <rect x={layout.qr.x} y={layout.qr.y} width={layout.qr.size} height={layout.qr.size} fill="#fff" fillOpacity="0.9" stroke={sel === 'qr' ? '#dc2626' : '#000'} strokeWidth={sw} strokeDasharray={sel === 'qr' ? `${sw * 3} ${sw * 2}` : undefined} />
                <text x={layout.qr.x + layout.qr.size / 2} y={layout.qr.y + layout.qr.size / 2} fontSize={layout.qr.size * 0.2} textAnchor="middle" dominantBaseline="middle" fill="#000" fontWeight="700">QR</text>
              </g>
              {['eventName', 'attendeeName', 'tierName'].map((k) => {
                const t = layout[k];
                const text = SAMPLE[k];
                return (
                  <g key={k} onPointerDown={down(k)} style={{ cursor: 'move' }}>
                    <rect x={t.x} y={t.y - t.fontSize} width={t.fontSize * 0.62 * text.length} height={t.fontSize * 1.2} fill="transparent" stroke={sel === k ? '#dc2626' : 'none'} strokeWidth={sw} strokeDasharray={`${sw * 3} ${sw * 2}`} />
                    <text x={t.x} y={t.y} fontSize={t.fontSize} fill="#fff" stroke="#000" strokeWidth={t.fontSize * 0.06} paintOrder="stroke" fontWeight="700">{text}</text>
                  </g>
                );
              })}
            </svg>
          )}
          {url && !dims && <p className="text-xs text-neutral-400 py-10 text-center">Loading image…</p>}
          {url && <p className="text-[10px] text-neutral-500">Drag an element to move it. The text position is its baseline. The final ticket draws text in the platform’s ticket style, so this preview is approximate.</p>}
        </Card>

        <div className="xl:col-span-4 space-y-4">
          <Card className="p-5 space-y-4">
            <FormField label="Template name" required><input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} className={inputCls} /></FormField>
            <FormField label="Category"><select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>{[...new Set([...CATS, category])].map((c) => <option key={c}>{c}</option>)}</select></FormField>
            {url && (
              <div className="flex flex-wrap gap-2">
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
                <Btn variant="soft" disabled={!!busy} onClick={() => fileRef.current?.click()}><FiUpload /> {busy === 'upload' ? 'Uploading…' : 'Replace image'}</Btn>
                <Btn variant="soft" disabled={!!busy} onClick={() => { setUrl(''); setLayout(null); }}>Generate instead</Btn>
              </div>
            )}
            {dims && <p className="text-[10px] text-neutral-500">Image size: {W} × {H} px. All positions are in image pixels.</p>}
          </Card>

          {layout && dims && (
            <Card className="p-5 space-y-4">
              <h3 className="text-lg font-black font-sans">Position</h3>
              <div className="grid grid-cols-2 gap-2">{ZONES.map(([k, l]) => <button key={k} type="button" onClick={() => setSel(k)} className={`text-xs font-bold px-3 py-2 rounded-lg cursor-pointer ${sel === k ? 'bg-red-600' : 'bg-neutral-900 hover:bg-neutral-800'}`}>{l}</button>)}</div>
              <div className="grid grid-cols-3 gap-2">{numInput('X', 'x')}{numInput('Y', 'y')}{sel === 'qr' ? numInput('Size', 'size', 40) : numInput('Font px', 'fontSize', 10)}</div>
              {issues.map((i) => <p key={i} className="text-[11px] text-red-300">• {i}</p>)}
              <Btn variant="soft" onClick={() => setLayout(defaults(W, H))}>Reset layout</Btn>
            </Card>
          )}

          <Btn className="w-full" disabled={!valid || !!busy} onClick={save}>{busy === 'save' ? 'Checking the layout and saving…' : 'Save Template'}</Btn>
          {!initial?.id && <p className="text-[10px] text-neutral-400">New templates are saved unpublished. Publish one from the list when it is ready.</p>}
        </div>
      </div>
    </>
  );
}

export default function TicketTemplates() {
  const list = useLoad(() => adminApi.templates.list());
  const [tab, setTab] = useState('all');
  const [editing, setEditing] = useState(null); // null | {} (new) | template
  const [del, setDel] = useState(null);
  const all = list.data || [];
  const rows = all.filter((t) => tab === 'all' || (tab === 'live' ? t.isActive : !t.isActive));

  if (editing) {
    return <Editor initial={editing.id ? editing : null} eventCount={editing.eventCount || 0} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); list.reload(); }} />;
  }

  const toggle = async (t) => {
    try { await adminApi.templates.setActive(t.id, !t.isActive); toast.success(t.isActive ? 'Template unpublished' : 'Template published'); list.reload(); }
    catch (e) { toast.error(apiErrorMessage(e)); }
  };

  return (
    <>
      <PageHeader eyebrow="TICKETING ENGINE" title="Ticket Templates Manager" desc="Designs organizers choose from when they create an event. Only published templates are offered.">
        <Card className="px-4 py-3"><span className="text-[9px] text-neutral-500 font-bold block">PUBLISHED</span><b className="text-2xl font-sans"><CountUp value={all.filter((t) => t.isActive).length} /></b></Card>
        <Card className="px-4 py-3"><span className="text-[9px] text-neutral-500 font-bold block">EVENTS USING TEMPLATES</span><b className="text-2xl font-sans"><CountUp value={all.reduce((n, t) => n + t.eventCount, 0)} /></b></Card>
      </PageHeader>

      <Card className="p-3 flex flex-wrap items-center gap-2">
        {[['all', `All (${all.length})`], ['live', `Published (${all.filter((t) => t.isActive).length})`], ['draft', `Unpublished (${all.filter((t) => !t.isActive).length})`]].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition ${tab === k ? 'bg-neutral-800' : 'text-neutral-400 hover:text-white'}`}>{l}</button>
        ))}
        <Btn className="ml-auto" onClick={() => setEditing({})}><FiPlus /> Create New Template</Btn>
      </Card>
      <ErrorLine>{list.error}</ErrorLine>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {rows.map((t, i) => (
          <Card key={t.id} index={i} hover className="p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex gap-2"><Pill>{t.category}</Pill>{t.generatedByAi && <Pill tone="amber">AI artwork</Pill>}</span>
              <span className="flex items-center gap-2 text-[10px] font-bold">{t.isActive ? 'PUBLISHED' : 'UNPUBLISHED'}<Toggle on={t.isActive} onChange={() => toggle(t)} label={`Publish ${t.name}`} /></span>
            </div>
            <h3 className="text-xl font-black font-sans leading-tight">{t.name}</h3>
            <PassPreview template={t} eventName="Sample Event" tierName="General Admission" />
            <div className="flex flex-wrap gap-4 text-[10px] text-neutral-400"><span>{t.eventCount} event{t.eventCount === 1 ? '' : 's'}</span><span>Updated {ago(t.updatedAt || t.createdAt)}</span></div>
            <div className="flex gap-2 items-center">
              <Btn variant="soft" onClick={() => setEditing(t)}><FiEdit2 /> Edit</Btn>
              <button type="button" aria-label="Delete template" disabled={t.eventCount > 0} title={t.eventCount > 0 ? 'In use. Unpublish it instead.' : 'Delete'} onClick={() => setDel(t)} className="ml-auto w-9 h-9 rounded-lg hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"><FiTrash2 /></button>
            </div>
          </Card>
        ))}
        {list.loading && !list.data && <p className="font-mono text-xs font-bold">LOADING…</p>}
        {list.data && !rows.length && <Card className="p-10 text-center text-sm text-neutral-400 xl:col-span-2">No templates here yet.</Card>}
      </div>

      {del && (
        <ConfirmModal open title={`Delete “${del.name}”?`} confirmLabel="Delete template" onClose={() => setDel(null)}
          onConfirm={async () => { try { await adminApi.templates.remove(del.id); toast.success('Template deleted'); setDel(null); list.reload(); } catch (e) { toast.error(apiErrorMessage(e)); } }}>
          <p>This removes the template and organizers’ favourites of it. Templates used by an event cannot be deleted.</p>
        </ConfirmModal>
      )}
    </>
  );
}