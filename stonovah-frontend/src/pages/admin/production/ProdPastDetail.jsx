import React, { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheckCircle, FiDownload, FiExternalLink, FiLock, FiPlus, FiSave, FiSend, FiStar, FiTrash2, FiUploadCloud, FiAlertTriangle } from 'react-icons/fi';
import { Card, Pill, Btn, Modal, Img } from '../ui';
import { FormField, Toggle, inputCls } from '../ui2';
import { useLoad, ErrorLine, ConfirmModal } from '../adminBits';
import { fmtDate, ago } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A, openSigned } from '../../../api/adminProduction';
import { Select } from '../ui2';
import { useProdAccess } from './useProdAccess';
import { mono, FORMAT_OPTIONS, PAST_STATUS } from './prodAdmin';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TEXT_KEYS = ['categoryTag', 'clientName', 'clientRep', 'runtimeLabel', 'location', 'highlight', 'logline', 'trailerUrl', 'trailerTimecode', 'testimonialQuote', 'testimonialAuthor', 'testimonialRole'];
const mb = (n) => (n ? `${(n / 1048576).toFixed(1)} MB` : '');

const toF = (p) => ({
  title: p.title, format: p.format, slug: p.slug, year: p.year == null ? '' : String(p.year), shootDays: p.shootDays == null ? '' : String(p.shootDays),
  categoryTag: p.categoryTag ?? '', clientName: p.client.name ?? '', clientRep: p.client.rep ?? '', runtimeLabel: p.runtimeLabel ?? '', location: p.location ?? '',
  highlight: p.highlight ?? '', logline: p.logline ?? '', trailerUrl: p.trailer.url ?? '', trailerTimecode: p.trailer.timecode ?? '', aspectRatio: p.trailer.aspectRatio ?? '',
  testimonialQuote: p.testimonial.quote ?? '', testimonialAuthor: p.testimonial.author ?? '', testimonialRole: p.testimonial.role ?? '',
  laurels: (p.laurels ?? []).map((l) => ({ label: l.label })), serviceIds: p.services.map((s) => s.id),
});

function diff(f, p) {
  const cur = toF(p);
  const body = {};
  const errors = [];
  if (!f.title.trim()) errors.push('Title is required'); else if (f.title !== cur.title) body.title = f.title.trim();
  if (f.format !== cur.format) body.format = f.format;
  if (f.slug !== cur.slug) { if (SLUG.test(f.slug.trim())) body.slug = f.slug.trim(); else errors.push('Slug must use lowercase letters, numbers and dashes'); }
  TEXT_KEYS.forEach((k) => { if (f[k] !== cur[k]) body[k] = f[k].trim() || null; });
  if (f.trailerUrl.trim() && !/^https?:\/\/\S+$/.test(f.trailerUrl.trim())) errors.push('The trailer link must start with https://');
  if (f.trailerTimecode.trim() && !/^\d{2}:\d{2}:\d{2}$/.test(f.trailerTimecode.trim())) errors.push('Timecode must look like 00:00:15');
  if (f.aspectRatio !== cur.aspectRatio) body.aspectRatio = f.aspectRatio || null;
  [['year', 1990, 2100], ['shootDays', 1, 2000]].forEach(([k, lo, hi]) => {
    if (f[k] === cur[k]) return;
    const n = f[k] === '' ? null : Number(f[k]);
    if (n !== null && !(Number.isInteger(n) && n >= lo && n <= hi)) errors.push(`${k === 'year' ? 'Year' : 'Shoot days'} must be ${lo} to ${hi}`); else body[k] = n;
  });
  const laurels = f.laurels.filter((l) => l.label.trim()).map((l) => ({ label: l.label.trim() }));
  if (JSON.stringify(laurels) !== JSON.stringify(cur.laurels)) body.laurels = laurels;
  if (JSON.stringify(f.serviceIds) !== JSON.stringify(cur.serviceIds)) body.serviceIds = f.serviceIds;
  return { body, errors };
}

function ClearanceModal({ id, replacing, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [by, setBy] = useState('');
  const [at, setAt] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef(null);
  const ext = file?.name.split('.').pop().toLowerCase();
  const err = file && !['pdf', 'png', 'jpg', 'jpeg', 'docx'].includes(ext) ? 'Allowed types: PDF, DOCX, PNG, JPG' : file && file.size > 25 * 1048576 ? 'Files can be up to 25 MB' : '';
  const send = async () => {
    setBusy(true);
    try { await A.addClearance(id, file, { approvedBy: by.trim(), signedAt: at || undefined }); toast.success('Clearance recorded'); onDone(); }
    catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };
  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-lg">
      <div className="space-y-4 p-6">
        <div className="pr-10"><h2 className="text-xl font-black">{replacing ? 'Replace clearance document' : 'Record client clearance'}</h2><p className="mt-1 text-[11px] text-white/45">Upload the client’s signed approval for public use of this production. It is stored privately.</p></div>
        <input ref={input} type="file" className="hidden" accept=".pdf,.docx,.png,.jpg,.jpeg" onChange={(e) => { setFile(e.target.files[0] ?? null); e.target.value = ''; }} />
        <button type="button" onClick={() => input.current?.click()} className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 p-4 text-left text-xs hover:border-white/40">
          <FiUploadCloud className="text-2xl text-red-500" /><span>{file ? <><b className="block">{file.name}</b><span className="text-white/45">{mb(file.size)}</span></> : 'Choose the signed document (PDF, DOCX, PNG or JPG, up to 25 MB)'}</span>
        </button>
        {err && <p className="text-[10px] font-semibold text-red-400">{err}</p>}
        <FormField label="Approved by (client representative)" required><input value={by} maxLength={120} onChange={(e) => setBy(e.target.value)} className={inputCls} /></FormField>
        <FormField label="Date signed" hint="Leave empty for today."><input type="date" value={at} onChange={(e) => setAt(e.target.value)} className={inputCls} /></FormField>
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!file || !!err || by.trim().length < 1 || busy} onClick={send}>{busy ? 'Uploading…' : 'Save clearance'}</Btn></div>
      </div>
    </Modal>
  );
}

function MediaTile({ id, m, can, reload, onRemove }) {
  const [cap, setCap] = useState(m.caption ?? '');
  const act = async (fn, ok) => { try { await fn(); if (ok) toast.success(ok); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } };
  return (
    <div className="space-y-2 rounded-lg bg-neutral-950 p-2">
      <div className="relative"><Img src={m.url} className="h-28 w-full rounded object-cover" />{m.isPrimary && <span className="absolute left-1.5 top-1.5"><Pill tone="solid">Primary cover</Pill></span>}</div>
      <input value={cap} disabled={!can.write} maxLength={160} placeholder="Caption" onChange={(e) => setCap(e.target.value)}
        onBlur={() => cap.trim() !== (m.caption ?? '') && act(() => A.updatePastMedia(id, m.id, { caption: cap.trim() || null }))} className={inputCls} />
      <div className="flex gap-1.5">
        {!m.isPrimary && <Btn variant="soft" className="flex-1 px-2 py-1.5 text-[10px]" disabled={!can.write} onClick={() => act(() => A.updatePastMedia(id, m.id, { isPrimary: true }), 'Cover changed')}>Set as cover</Btn>}
        <Btn variant="soft" className="px-2.5 py-1.5" disabled={!can.write} onClick={onRemove}><FiTrash2 /></Btn>
      </div>
    </div>
  );
}

function Editor({ p, all, reload }) {
  const navigate = useNavigate();
  const { can } = useProdAccess();
  const [f, setF] = useState(() => toF(p));
  const [busy, setBusy] = useState(false);
  const [dlg, setDlg] = useState(null);
  const [pct, setPct] = useState(null);
  const [rank, setRank] = useState('');
  const pic = useRef(null);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const { body, errors } = diff(f, p);
  const dirty = Object.keys(body).length > 0;
  const st = PAST_STATUS[p.status];
  const live = p.status === 'PUBLISHED';
  const input = (k, extra = {}) => <input value={f[k]} disabled={!can.write} onChange={(e) => set(k, e.target.value)} className={inputCls} {...extra} />;

  const run = async (fn, ok) => { setBusy(true); try { await fn(); if (ok) toast.success(ok); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } setBusy(false); };
  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Only image files are allowed');
    if (file.size > 15 * 1048576) return toast.error('Images can be up to 15 MB');
    setPct(0);
    try { await A.addPastMedia(p.id, file, {}); toast.success('Image added'); reload(); } catch (e) { toast.error(apiErrorMessage(e)); }
    setPct(null);
  };
  const toggleSvc = (id) => set('serviceIds', f.serviceIds.includes(id) ? f.serviceIds.filter((x) => x !== id) : [...f.serviceIds, id]);
  const feature = (on) => run(() => A.setPastFeatured(p.id, on ? { featured: true, rank: rank ? Number(rank) : undefined } : { featured: false }), on ? 'Placed in a hero slot' : 'Removed from hero');
  const open = async () => { try { await openSigned(A.clearanceUrl(p.id)); } catch (e) { toast.error(apiErrorMessage(e)); } };

  return (
    <>
      <Card className="flex flex-wrap items-center gap-3 p-3 text-[11px]">
        <Link to="/admin/production/past" className="flex items-center gap-2 font-bold hover:text-[#FFBF00]"><FiArrowLeft /> Back to past productions</Link>
        <span className="text-white/40">/</span><b className="rounded bg-neutral-900 px-2 py-1">{p.title}</b>
        {live && <a href={p.publicPath} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 text-white/55 hover:text-white"><FiExternalLink /> View on website</a>}
      </Card>

      <Card index={1} className="flex flex-wrap items-start justify-between gap-4 border-l-4 border-l-red-600 p-6">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2"><Pill tone={st.tone}>{st.label}</Pill>{p.isFeatured && <Pill tone="solid"><FiStar /> Hero slot {p.featuredRank}</Pill>}{dirty && <Pill tone="red">Unsaved changes</Pill>}{p.project && <Link to={`/admin/production/projects/${p.project.id}`}><Pill>From project {p.project.reference}</Pill></Link>}</div>
          <h1 className="text-3xl font-black md:text-4xl">Edit production dossier: {p.title}</h1>
          <p className="text-xs text-white/50">{p.publishedAt ? `First published ${fmtDate(p.publishedAt, false)} • ` : ''}Updated {ago(p.updatedAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="soft" disabled={!can.write || !dirty || errors.length > 0 || busy} onClick={() => run(() => A.patchPast(p.id, body), 'Changes saved')}><FiSave /> Save changes</Btn>
          {!live && <Btn disabled={!can.write || !p.readiness.canPublish || dirty || busy} onClick={() => run(() => A.publishPast(p.id), 'Published')}><FiSend /> Publish</Btn>}
        </div>
      </Card>
      {errors.length > 0 && <Card className="space-y-1 border-amber-500/40 p-4 text-xs text-amber-200">{errors.map((e) => <p key={e}>• {e}</p>)}</Card>}
      {dirty && !live && <p className="text-[11px] text-white/40">Save your changes before publishing.</p>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Card className="space-y-4 p-6">
            <h2 className="text-xl font-black">Core production metadata</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Production title" required>{input('title', { maxLength: 160 })}</FormField>
              <FormField label="Project type"><Select value={f.format} disabled={!can.write} onChange={(v) => set('format', v)} options={FORMAT_OPTIONS} /></FormField>
              <FormField label="URL slug" hint={`/production/past/${f.slug}`}>{input('slug', { maxLength: 80 })}</FormField>
              <FormField label="Category tag" hint="e.g. Crime Drama, Brand Campaign">{input('categoryTag', { maxLength: 60 })}</FormField>
              <FormField label="Release year">{input('year', { type: 'number' })}</FormField>
              <FormField label="Runtime label" hint="e.g. 118 min">{input('runtimeLabel', { maxLength: 40 })}</FormField>
              <FormField label="Commissioning client">{input('clientName', { maxLength: 160 })}</FormField>
              <FormField label="Client representative" hint="Internal. Never shown publicly.">{input('clientRep', { maxLength: 160 })}</FormField>
              <FormField label="Shoot days">{input('shootDays', { type: 'number' })}</FormField>
              <FormField label="Location">{input('location', { maxLength: 120 })}</FormField>
            </div>
            <FormField label="Highlight line" hint="One standout fact, shown on the card.">{input('highlight', { maxLength: 200 })}</FormField>
            <FormField label="Logline / executive summary" right={<span>{f.logline.length} / 1500</span>}><textarea rows={4} maxLength={1500} disabled={!can.write} value={f.logline} onChange={(e) => set('logline', e.target.value)} className={inputCls} /></FormField>
          </Card>

          <Card className="space-y-3 p-6">
            <h2 className="text-xl font-black">Services provided by Stonovah ({f.serviceIds.length})</h2>
            <div className="grid gap-2 sm:grid-cols-2">{all.map((s) => <label key={s.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-xs ${f.serviceIds.includes(s.id) ? 'border-red-600 bg-red-600/10' : 'border-white/10'}`}><input type="checkbox" disabled={!can.write} checked={f.serviceIds.includes(s.id)} onChange={() => toggleSvc(s.id)} className="accent-red-600" /> {s.name}</label>)}</div>
          </Card>

          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between"><h2 className="text-xl font-black">Production stills ({p.media.length})</h2>
              <><input ref={pic} type="file" accept="image/*" className="hidden" onChange={(e) => { upload(e.target.files[0]); e.target.value = ''; }} />
                <Btn variant="soft" disabled={!can.write || pct !== null} onClick={() => pic.current?.click()}><FiUploadCloud /> {pct === null ? 'Add image' : 'Uploading…'}</Btn></></div>
            {!p.media.length && <p className="text-xs text-white/40">No images yet. The first image becomes the cover. Images up to 15 MB. Image links are public once uploaded.</p>}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{p.media.map((m) => <MediaTile key={m.id} id={p.id} m={m} can={can} reload={reload} onRemove={() => setDlg({ rm: m })} />)}</div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="text-xl font-black">Trailer & showreel</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <FormField label="Trailer link" className="md:col-span-2">{input('trailerUrl', { placeholder: 'https://vimeo.com/…' })}</FormField>
              <FormField label="Start at" hint="HH:MM:SS">{input('trailerTimecode', { placeholder: '00:00:15', maxLength: 8 })}</FormField>
            </div>
            <FormField label="Aspect ratio"><Select value={f.aspectRatio} disabled={!can.write} onChange={(v) => set('aspectRatio', v)} options={[{ value: '', label: 'Not set' }, { value: '16:9', label: '16:9 widescreen' }, { value: '2.39:1', label: '2.39:1 anamorphic scope' }]} /></FormField>
            <p className="text-[10px] text-white/35">The public page shows this as a “Watch trailer” link. It is not an embedded player.</p>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="text-xl font-black">Client testimonial</h2>
            <FormField label="Quote"><textarea rows={3} maxLength={1000} disabled={!can.write} value={f.testimonialQuote} onChange={(e) => set('testimonialQuote', e.target.value)} className={inputCls} /></FormField>
            <div className="grid gap-3 md:grid-cols-2"><FormField label="Author">{input('testimonialAuthor', { maxLength: 120 })}</FormField><FormField label="Role & company">{input('testimonialRole', { maxLength: 160 })}</FormField></div>
          </Card>

          <Card className="space-y-3 p-6">
            <h2 className="text-xl font-black">Festival laurels & accolades ({f.laurels.length})</h2>
            {f.laurels.map((l, i) => (
              <div key={i} className="flex gap-2"><input value={l.label} disabled={!can.write} maxLength={120} placeholder="e.g. AMVCA Best Cinematography 2025" onChange={(e) => set('laurels', f.laurels.map((x, n) => (n === i ? { label: e.target.value } : x)))} className={inputCls} />
                <Btn variant="soft" className="px-3" disabled={!can.write} onClick={() => set('laurels', f.laurels.filter((_, n) => n !== i))}><FiTrash2 /></Btn></div>
            ))}
            {f.laurels.length < 8 && <Btn variant="soft" disabled={!can.write} onClick={() => set('laurels', [...f.laurels, { label: '' }])}><FiPlus /> Add laurel</Btn>}
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Card className={`space-y-3 p-5 ${p.clearance.approved ? '' : 'border-amber-500/40'}`}>
            <div className="flex items-center justify-between"><span className={`${mono} text-white/45`}>Legal clearance gate</span>{p.clearance.approved ? <Pill tone="green"><FiCheckCircle /> Cleared</Pill> : <Pill tone="amber"><FiLock /> Required</Pill>}</div>
            {p.clearance.approved ? (
              <div className="space-y-2 text-xs">
                <p className="text-white/65">Approved by <b className="text-white">{p.clearance.approvedBy}</b> on {fmtDate(p.clearance.approvedAt, false)}.</p>
                {p.clearance.file && <div className="rounded-lg bg-neutral-950 p-3"><b className="block truncate">{p.clearance.file.name}</b><span className="text-[10px] text-white/40">{mb(p.clearance.file.sizeBytes)} • private</span></div>}
                <div className="grid grid-cols-2 gap-2"><Btn variant="soft" onClick={open}><FiDownload /> Open</Btn><Btn variant="soft" disabled={!can.write} onClick={() => setDlg({ clear: true, replace: true })}>Replace</Btn></div>
                <Btn variant="soft" className="w-full" disabled={!can.write} onClick={() => setDlg({ revoke: true })}>Revoke clearance</Btn>
              </div>
            ) : (
              <div className="space-y-2"><p className="text-xs leading-relaxed text-white/60">Publishing is blocked until the client’s signed approval for public use is on file.</p><Btn className="w-full" disabled={!can.write} onClick={() => setDlg({ clear: true })}><FiUploadCloud /> Upload clearance</Btn></div>
            )}
          </Card>

          <Card className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Storefront & discovery</span>
            <div className="flex items-center justify-between gap-3"><div><b className="block text-xs">Publish to public portfolio</b><span className="text-[10px] text-white/40">{live ? 'Visible to everyone' : 'Not visible on the website'}</span></div>
              <Toggle on={live} label="Live" disabled={!can.write || busy || (!live && !p.readiness.canPublish) || p.status === 'DRAFT' && dirty} onChange={(v) => run(() => A.setPastVisibility(p.id, v), v ? 'Published' : 'Hidden')} /></div>
            {!live && p.readiness.missing.length > 0 && <div className="flex gap-2 rounded-lg bg-amber-500/10 p-3 text-[11px] text-amber-200"><FiAlertTriangle className="mt-0.5 shrink-0" /><span>Still needed: {p.readiness.missing.join(', ')}.</span></div>}
            {!live && p.readiness.canPublish && <p className="text-[11px] text-emerald-300">Ready to publish.</p>}
            <div className="space-y-2 border-t border-white/10 pt-3">
              <span className="text-[10px] font-bold uppercase text-white/45">Hero slot (1 to 4)</span>
              {p.isFeatured ? <Btn variant="soft" className="w-full" disabled={!can.write || busy} onClick={() => feature(false)}>Remove from hero slot {p.featuredRank}</Btn> : (
                <div className="flex gap-2"><div className="flex-1"><Select value={rank} disabled={!can.write || !live} onChange={setRank} options={[{ value: '', label: 'Auto (first free slot)' }, ...[1, 2, 3, 4].map((n) => ({ value: String(n), label: `Slot ${n}` }))]} /></div>
                  <Btn disabled={!can.write || !live || busy} onClick={() => feature(true)}><FiStar /> Feature</Btn></div>
              )}
              {!live && <p className="text-[10px] text-white/35">Only a published production can take a hero slot.</p>}
            </div>
          </Card>

          <Card className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Audit & version history</span>
            <div className="max-h-96 space-y-2 overflow-y-auto">{p.activity.map((a) => <div key={a.id} className="border-l-2 border-red-600 bg-neutral-900 px-3 py-2"><div className="flex justify-between gap-2 text-[10px]"><b className="break-all">{a.actor}</b><span className="shrink-0 text-white/40">{ago(a.createdAt)}</span></div><p className="mt-1 text-xs text-white/70">{a.message}</p></div>)}</div>
          </Card>

          <Card className="space-y-2 p-5">
            <span className={`${mono} text-white/45`}>Danger zone</span>
            <Btn variant="soft" className="w-full" disabled={!can.write || live} onClick={() => setDlg({ del: true })}><FiTrash2 /> Delete production</Btn>
            {live && <p className="text-[10px] text-white/35">Hide a live production before deleting it.</p>}
          </Card>
        </div>
      </div>

      {dlg?.clear && <ClearanceModal id={p.id} replacing={dlg.replace} onClose={() => setDlg(null)} onDone={() => { setDlg(null); reload(); }} />}
      {dlg?.revoke && <ConfirmModal open title="Revoke clearance?" confirmLabel="Revoke" onClose={() => setDlg(null)} onConfirm={async () => { try { await A.revokeClearance(p.id); toast.success('Clearance revoked'); setDlg(null); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>The clearance document is deleted.{live ? ' This production is taken offline and leaves its hero slot.' : ''}</p></ConfirmModal>}
      {dlg?.rm && <ConfirmModal open title="Remove this image?" confirmLabel="Remove" onClose={() => setDlg(null)} onConfirm={async () => { try { await A.removePastMedia(p.id, dlg.rm.id); toast.success('Image removed'); setDlg(null); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>A published production must keep at least one image.</p></ConfirmModal>}
      {dlg?.del && <ConfirmModal open title="Delete this production?" confirmLabel="Delete permanently" checkLabel="I understand this cannot be undone." onClose={() => setDlg(null)} onConfirm={async () => { try { await A.removePast(p.id); toast.success('Production deleted'); navigate('/admin/production/past'); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>The dossier, its images and its clearance file are removed. The source project, if any, is not affected.</p></ConfirmModal>}
    </>
  );
}

export default function ProdPastDetail() {
  const { id } = useParams();
  const d = useLoad(() => A.pastOne(id), [id]);
  const svc = useLoad(() => A.services());
  if (!d.data) return d.error ? <Card className="p-10 text-center">{d.error} <Link to="/admin/production/past" className="text-[#FFBF00] underline">Back to past productions</Link></Card> : <p className="font-mono text-xs font-bold">LOADING…</p>;
  return <><ErrorLine>{svc.error}</ErrorLine><Editor key={id} p={d.data} all={svc.data?.data ?? []} reload={d.reload} /></>;
}