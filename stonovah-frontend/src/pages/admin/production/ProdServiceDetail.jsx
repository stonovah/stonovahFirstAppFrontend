import React, { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiExternalLink, FiPlus, FiTrash2, FiSave, FiUploadCloud, FiSend, FiArchive } from 'react-icons/fi';
import { Card, Pill, Btn, Img } from '../ui';
import { FormField, Toggle, inputCls } from '../ui2';
import { useLoad, ErrorLine, ConfirmModal } from '../adminBits';
import { fmtDate, ago } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A } from '../../../api/adminProduction';
import { Select } from '../ui2';
import { useProdAccess } from './useProdAccess';
import { mono, FORMAT_OPTIONS, STAGE_OPTIONS, ICON_OPTIONS } from './prodAdmin';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugKey = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

const toForm = (e) => {
  const c = e.content ?? {};
  const m = c.sampleManifest;
  return {
    name: e.name ?? '', slug: e.slug ?? '', badge: e.badge ?? '', stage: e.stage, stageLabel: e.stageLabel ?? '', shortDescription: e.shortDescription ?? '',
    mandate: e.mandate ?? '', iconKey: e.iconKey ?? '', leadTimeLabel: e.leadTimeLabel ?? '', leadTimeDays: e.leadTimeDays == null ? '' : String(e.leadTimeDays),
    formats: e.formats ?? [], relatedSlugs: e.relatedSlugs ?? [],
    tiers: (e.tiers ?? []).map((t) => ({ id: t.id, name: t.name, tag: t.tag ?? '', description: t.description ?? '', price: t.fromPriceKobo == null ? '' : String(Number(t.fromPriceKobo) / 100) })),
    scopeOptions: (e.scopeOptions ?? []).map((o) => ({ key: o.key, existing: true, label: o.label, summary: o.summary ?? '', durationLabel: o.durationLabel ?? '', primaryDeliverable: o.primaryDeliverable ?? '', details: o.details ?? null })),
    tagline: c.tagline ?? '', specRows: c.specSheet?.rows ?? [], specNote: c.specSheet?.note ?? '', heroStats: c.heroStats ?? [],
    audiences: (c.audiences ?? []).map((x) => ({ title: x.title, body: x.body ?? '' })), deliverables: (c.deliverables ?? []).map((x) => ({ title: x.title, body: x.body ?? '' })),
    steps: (c.steps ?? []).map((x) => ({ title: x.title, body: x.body ?? '' })), requirements: (c.requirements ?? []).map((x) => ({ title: x.title, body: x.body ?? '' })),
    assuranceTitle: c.assurance?.title ?? '', assuranceBody: c.assurance?.body ?? '', downloads: c.downloads ?? [], ctaHeading: c.cta?.heading ?? '', ctaBody: c.cta?.body ?? '',
    manifest: m ? { title: m.title, subtitle: m.subtitle ?? '', illustrative: !!m.illustrative, columns: m.columns.join(', '), rows: m.rows.map((r) => r.join(' | ')).join('\n') } : null,
  };
};

// Builds the API body from the form. Rows left half-empty are dropped.
function toBody(f) {
  const errors = [];
  const cards = (list) => list.filter((x) => x.title.trim()).map((x) => ({ title: x.title.trim(), body: x.body.trim() }));
  const pairs = (list, a, b) => list.filter((x) => x[a].trim() && x[b].trim()).map((x) => ({ [a]: x[a].trim(), [b]: x[b].trim() }));
  if (!f.name.trim()) errors.push('Name is required');
  if (!SLUG.test(f.slug.trim())) errors.push('Slug must use lowercase letters, numbers and dashes');
  if (!f.shortDescription.trim()) errors.push('Short description is required');

  const seen = new Set();
  const scopeOptions = f.scopeOptions.filter((o) => o.label.trim()).map((o) => {
    let key = o.existing ? o.key : slugKey(o.key || o.label);
    if (key.length < 2) { errors.push(`Scope option “${o.label}” needs a longer label`); key = 'option'; }
    for (let n = 2; seen.has(key); n++) key = `${slugKey(o.label).slice(0, 36)}-${n}`;
    seen.add(key);
    return { key, label: o.label.trim(), summary: o.summary.trim() || null, durationLabel: o.durationLabel.trim() || null, primaryDeliverable: o.primaryDeliverable.trim() || null, details: o.details };
  });
  const tiers = f.tiers.filter((t) => t.name.trim()).map((t) => ({
    ...(t.id ? { id: t.id } : {}), name: t.name.trim(), tag: t.tag.trim() || null, description: t.description.trim() || null, fromPrice: t.price === '' ? null : Number(t.price),
  }));

  let sampleManifest = null;
  if (f.manifest && f.manifest.title.trim()) {
    const columns = f.manifest.columns.split(',').map((x) => x.trim()).filter(Boolean);
    const rows = f.manifest.rows.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.split('|').map((x) => x.trim()));
    rows.forEach((r, i) => { if (r.length !== columns.length) errors.push(`Manifest row ${i + 1} has ${r.length} cells but there are ${columns.length} columns`); });
    if (!columns.length) errors.push('The manifest needs at least one column');
    sampleManifest = { title: f.manifest.title.trim(), subtitle: f.manifest.subtitle.trim(), illustrative: f.manifest.illustrative, columns, rows };
  }
  const days = f.leadTimeDays === '' ? null : Number(f.leadTimeDays);
  if (days !== null && !(Number.isInteger(days) && days >= 0 && days <= 365)) errors.push('Lead time days must be 0 to 365');

  return {
    errors,
    body: {
      name: f.name.trim(), slug: f.slug.trim(), badge: f.badge.trim() || null, stage: f.stage, stageLabel: f.stageLabel.trim() || null,
      shortDescription: f.shortDescription.trim(), mandate: f.mandate.trim() || null, iconKey: f.iconKey || null,
      leadTimeLabel: f.leadTimeLabel.trim() || null, leadTimeDays: days, formats: f.formats, relatedSlugs: f.relatedSlugs, tiers, scopeOptions,
      content: {
        tagline: f.tagline.trim() || null,
        specSheet: { rows: pairs(f.specRows, 'label', 'value'), note: f.specNote.trim() },
        heroStats: pairs(f.heroStats, 'value', 'label'),
        audiences: cards(f.audiences), deliverables: cards(f.deliverables), steps: cards(f.steps), requirements: cards(f.requirements),
        assurance: f.assuranceTitle.trim() && f.assuranceBody.trim() ? { title: f.assuranceTitle.trim(), body: f.assuranceBody.trim() } : null,
        downloads: f.downloads.filter((d) => d.label.trim() && d.url.trim()).map((d) => ({ label: d.label.trim(), url: d.url.trim() })),
        cta: f.ctaHeading.trim() ? { heading: f.ctaHeading.trim(), body: f.ctaBody.trim() } : null,
        sampleManifest,
      },
    },
  };
}

const Sec = ({ title, sub, children }) => (
  <Card className="space-y-4 p-6"><div><h2 className="text-xl font-black">{title}</h2>{sub && <p className="mt-1 text-[11px] text-white/45">{sub}</p>}</div>{children}</Card>
);
const del = (list, i) => list.filter((_, n) => n !== i);
const upd = (list, i, patch) => list.map((x, n) => (n === i ? { ...x, ...patch } : x));

function CardRows({ rows, onChange, disabled, max, addLabel, ph }) {
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={i} className="space-y-2 rounded-lg bg-neutral-950 p-3">
          <div className="flex gap-2"><input value={r.title} disabled={disabled} maxLength={120} placeholder={ph} onChange={(e) => onChange(upd(rows, i, { title: e.target.value }))} className={inputCls} />
            <Btn variant="soft" className="px-3" disabled={disabled} onClick={() => onChange(del(rows, i))}><FiTrash2 /></Btn></div>
          <textarea rows={2} maxLength={700} disabled={disabled} value={r.body} placeholder="Description" onChange={(e) => onChange(upd(rows, i, { body: e.target.value }))} className={inputCls} />
        </div>
      ))}
      {rows.length < max && <Btn variant="soft" disabled={disabled} onClick={() => onChange([...rows, { title: '', body: '' }])}><FiPlus /> {addLabel}</Btn>}
    </div>
  );
}
function PairRows({ rows, onChange, disabled, a, b, pa, pb, max }) {
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input value={r[a]} disabled={disabled} placeholder={pa} onChange={(e) => onChange(upd(rows, i, { [a]: e.target.value }))} className={inputCls} />
          <input value={r[b]} disabled={disabled} placeholder={pb} onChange={(e) => onChange(upd(rows, i, { [b]: e.target.value }))} className={inputCls} />
          <Btn variant="soft" className="px-3" disabled={disabled} onClick={() => onChange(del(rows, i))}><FiTrash2 /></Btn>
        </div>
      ))}
      {rows.length < max && <Btn variant="soft" disabled={disabled} onClick={() => onChange([...rows, { [a]: '', [b]: '' }])}><FiPlus /> Add row</Btn>}
    </div>
  );
}

function Editor({ s, all, reload }) {
  const { can } = useProdAccess();
  const [f, setF] = useState(() => toForm(s.editor));
  const [busy, setBusy] = useState(false);
  const [dlg, setDlg] = useState(null);
  const [pct, setPct] = useState(null);
  const hero = useRef(null);
  const still = useRef(null);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const archived = s.status === 'ARCHIVED';
  const off = !can.write || archived;
  const cur = toBody(f);
  const dirty = JSON.stringify(cur.body) !== JSON.stringify(toBody(toForm(s.editor)).body);
  const publishable = can.write && !archived && !cur.errors.length && f.formats.length > 0 && (dirty || s.hasDraft || s.status !== 'PUBLISHED');
  const others = all.filter((x) => x.id !== s.id);
  const input = (k, extra = {}) => <input value={f[k]} disabled={off} onChange={(e) => set(k, e.target.value)} className={inputCls} {...extra} />;

  const run = async (fn, ok) => { setBusy(true); try { await fn(); if (ok) toast.success(ok); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } setBusy(false); };
  const save = () => run(() => A.saveServiceDraft(s.id, cur.body), 'Draft saved');
  const publish = () => run(async () => { if (dirty) await A.saveServiceDraft(s.id, cur.body); await A.publishService(s.id); }, 'Published');
  const upload = async (file, kind) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Only image files are allowed');
    if (file.size > 15 * 1048576) return toast.error('Images can be up to 15 MB');
    setPct(0);
    try { await A.addServiceMedia(s.id, file, kind); toast.success(kind === 'HERO' ? 'Hero image set' : 'Still added'); reload(); } catch (e) { toast.error(apiErrorMessage(e)); }
    setPct(null);
  };
  const toggleIn = (k, v) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);
  const stills = s.media.filter((m) => m.kind !== 'HERO');
  const status = archived ? ['Archived', 'grey'] : s.status === 'DRAFT' ? ['Draft', 'grey'] : s.visibleOnWebsite ? ['Published & live', 'green'] : ['Published, hidden', 'amber'];

  return (
    <>
      <Card className="flex flex-wrap items-center gap-3 p-3 text-[11px]">
        <Link to="/admin/production/services" className="flex items-center gap-2 font-bold hover:text-[#FFBF00]"><FiArrowLeft /> Back to services catalogue</Link>
        <span className="text-white/40">/</span><b className="rounded bg-neutral-900 px-2 py-1 font-mono">{s.code}</b>
        {s.status === 'PUBLISHED' && <a href={s.publicPath} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 text-white/55 hover:text-white"><FiExternalLink /> Preview on website</a>}
      </Card>

      <Card index={1} className="flex flex-wrap items-start justify-between gap-4 border-l-4 border-l-red-600 p-6">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2"><Pill tone={status[1]}>{status[0]}</Pill>{s.hasDraft && <Pill tone="amber">Unpublished edits</Pill>}{dirty && <Pill tone="red">Unsaved changes</Pill>}</div>
          <h1 className="text-3xl font-black md:text-4xl">{f.name || 'Untitled service'}</h1>
          <p className="text-xs text-white/50">{s.lastEditedByEmail ? `Last edited by ${s.lastEditedByEmail} • ` : ''}{ago(s.updatedAt)}{s.publishedAt ? ` • published ${fmtDate(s.publishedAt, false)}` : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="soft" disabled={!can.write || !dirty || busy || archived} onClick={save}><FiSave /> Save draft</Btn>
          <Btn disabled={!publishable || busy} onClick={publish}><FiSend /> {s.status === 'PUBLISHED' ? 'Publish changes' : 'Publish'}</Btn>
        </div>
      </Card>
      {cur.errors.length > 0 && <Card className="space-y-1 border-amber-500/40 p-4 text-xs text-amber-200">{cur.errors.map((e) => <p key={e}>• {e}</p>)}</Card>}
      {archived && <Card className="p-4 text-xs text-white/60">This service is archived. Restore it from the catalogue to edit it.</Card>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Sec title="Basic information & taxonomy">
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Service name" required>{input('name', { maxLength: 120 })}</FormField>
              <FormField label="URL slug" required hint={`/production/services/${f.slug || '…'}`}>{input('slug', { maxLength: 80 })}</FormField>
              <FormField label="Catalogue badge text">{input('badge', { maxLength: 60 })}</FormField>
              <FormField label="Stage"><Select value={f.stage} disabled={off} onChange={(v) => set('stage', v)} options={STAGE_OPTIONS} /></FormField>
              <FormField label="Stage label" hint="e.g. Stage 2: Prepare">{input('stageLabel', { maxLength: 60 })}</FormField>
              <FormField label="Icon"><Select value={f.iconKey} disabled={off} onChange={(v) => set('iconKey', v)} options={[{ value: '', label: 'Default' }, ...ICON_OPTIONS]} /></FormField>
              <FormField label="Lead time label" hint="e.g. 14–28 business days">{input('leadTimeLabel', { maxLength: 60 })}</FormField>
              <FormField label="Lead time in days" hint="Used for the package estimate.">{input('leadTimeDays', { type: 'number', min: 0 })}</FormField>
            </div>
            <FormField label="Card short description" required right={<span>{f.shortDescription.length} / 200</span>}><textarea rows={2} maxLength={200} disabled={off} value={f.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} className={inputCls} /></FormField>
            <FormField label="Who it is for & mandate overview"><textarea rows={3} maxLength={2000} disabled={off} value={f.mandate} onChange={(e) => set('mandate', e.target.value)} className={inputCls} /></FormField>
          </Sec>

          <Sec title="Applicable project types & formats" sub="Choose which project types can book this service.">
            <div className="grid gap-2 sm:grid-cols-2">{FORMAT_OPTIONS.map((o) => <label key={o.value} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-xs ${f.formats.includes(o.value) ? 'border-red-600 bg-red-600/10' : 'border-white/10'}`}><input type="checkbox" disabled={off} checked={f.formats.includes(o.value)} onChange={() => toggleIn('formats', o.value)} className="accent-red-600" /> {o.label}</label>)}</div>
            {!f.formats.length && <p className="text-[11px] text-amber-300">Choose at least one before publishing.</p>}
          </Sec>

          <Sec title="Spec sheet & hero">
            <FormField label="Tagline" hint="One line shown under the hero text.">{input('tagline', { maxLength: 160 })}</FormField>
            <FormField label="Spec sheet rows"><PairRows rows={f.specRows} onChange={(v) => set('specRows', v)} disabled={off} a="label" b="value" pa="Label" pb="Value" max={8} /></FormField>
            <FormField label="Spec sheet note">{input('specNote', { maxLength: 300 })}</FormField>
            <FormField label="Hero stats" hint="Only add numbers you can back up."><PairRows rows={f.heroStats} onChange={(v) => set('heroStats', v)} disabled={off} a="value" b="label" pa="Value" pb="Label" max={4} /></FormField>
          </Sec>

          <Sec title="Configurable scope options" sub="The tabs visitors pick on the service page. An option’s key is fixed once saved.">
            {f.scopeOptions.map((o, i) => (
              <div key={i} className="space-y-2 rounded-lg bg-neutral-950 p-3">
                <div className="flex gap-2"><input value={o.label} disabled={off} maxLength={120} placeholder="Option label" onChange={(e) => set('scopeOptions', upd(f.scopeOptions, i, { label: e.target.value }))} className={inputCls} />
                  <Btn variant="soft" className="px-3" disabled={off} onClick={() => set('scopeOptions', del(f.scopeOptions, i))}><FiTrash2 /></Btn></div>
                <textarea rows={2} maxLength={500} disabled={off} value={o.summary} placeholder="Summary" onChange={(e) => set('scopeOptions', upd(f.scopeOptions, i, { summary: e.target.value }))} className={inputCls} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={o.durationLabel} disabled={off} maxLength={60} placeholder="Estimated duration" onChange={(e) => set('scopeOptions', upd(f.scopeOptions, i, { durationLabel: e.target.value }))} className={inputCls} />
                  <input value={o.primaryDeliverable} disabled={off} maxLength={200} placeholder="Primary deliverable" onChange={(e) => set('scopeOptions', upd(f.scopeOptions, i, { primaryDeliverable: e.target.value }))} className={inputCls} />
                </div>
                <p className="text-[10px] text-white/30">Key: {o.existing ? o.key : 'created from the label on save'}</p>
              </div>
            ))}
            {f.scopeOptions.length < 10 && <Btn variant="soft" disabled={off} onClick={() => set('scopeOptions', [...f.scopeOptions, { key: '', existing: false, label: '', summary: '', durationLabel: '', primaryDeliverable: '', details: null }])}><FiPlus /> Add scope option</Btn>}
          </Sec>

          <Sec title="Package tiers" sub="Prices are typed in naira. Leave the price empty to show “Quote on request”.">
            {f.tiers.map((t, i) => (
              <div key={t.id ?? i} className="space-y-2 rounded-lg bg-neutral-950 p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_140px_150px_auto]">
                  <input value={t.name} disabled={off} maxLength={80} placeholder="Tier name" onChange={(e) => set('tiers', upd(f.tiers, i, { name: e.target.value }))} className={inputCls} />
                  <input value={t.tag} disabled={off} maxLength={40} placeholder="Tag" onChange={(e) => set('tiers', upd(f.tiers, i, { tag: e.target.value }))} className={inputCls} />
                  <input type="number" min="0" value={t.price} disabled={off} placeholder="From (₦)" onChange={(e) => set('tiers', upd(f.tiers, i, { price: e.target.value }))} className={inputCls} />
                  <Btn variant="soft" className="px-3" disabled={off} onClick={() => set('tiers', del(f.tiers, i))}><FiTrash2 /></Btn>
                </div>
                <textarea rows={2} maxLength={400} disabled={off} value={t.description} placeholder="Description" onChange={(e) => set('tiers', upd(f.tiers, i, { description: e.target.value }))} className={inputCls} />
              </div>
            ))}
            {f.tiers.length < 6 && <Btn variant="soft" disabled={off} onClick={() => set('tiers', [...f.tiers, { name: '', tag: '', description: '', price: '' }])}><FiPlus /> Add package</Btn>}
          </Sec>

          <Sec title="Who it is for"><CardRows rows={f.audiences} onChange={(v) => set('audiences', v)} disabled={off} max={6} addLabel="Add audience" ph="Audience title" /></Sec>
          <Sec title="Standard deliverables (“What you get”)"><CardRows rows={f.deliverables} onChange={(v) => set('deliverables', v)} disabled={off} max={8} addLabel="Add deliverable" ph="Deliverable title" /></Sec>
          <Sec title="Process steps (“How it works”)"><CardRows rows={f.steps} onChange={(v) => set('steps', v)} disabled={off} max={8} addLabel="Add step" ph="Step title" /></Sec>
          <Sec title="Client requirements checklist"><CardRows rows={f.requirements} onChange={(v) => set('requirements', v)} disabled={off} max={8} addLabel="Add requirement" ph="Requirement" /></Sec>

          <Sec title="Assurance notice, downloads & closing call to action">
            <div className="grid gap-3 md:grid-cols-2"><FormField label="Assurance title">{input('assuranceTitle', { maxLength: 120 })}</FormField><FormField label="Closing CTA heading">{input('ctaHeading', { maxLength: 120 })}</FormField></div>
            <FormField label="Assurance text"><textarea rows={3} maxLength={800} disabled={off} value={f.assuranceBody} onChange={(e) => set('assuranceBody', e.target.value)} className={inputCls} /></FormField>
            <FormField label="Closing CTA text">{input('ctaBody', { maxLength: 400 })}</FormField>
            <FormField label="Downloads">
              <div className="space-y-2">{f.downloads.map((d, i) => (
                <div key={i} className="flex gap-2"><input value={d.label} disabled={off} placeholder="Label" onChange={(e) => set('downloads', upd(f.downloads, i, { label: e.target.value }))} className={inputCls} /><input value={d.url} disabled={off} placeholder="https://…" onChange={(e) => set('downloads', upd(f.downloads, i, { url: e.target.value }))} className={inputCls} /><Btn variant="soft" className="px-3" disabled={off} onClick={() => set('downloads', del(f.downloads, i))}><FiTrash2 /></Btn></div>))}
                {f.downloads.length < 4 && <Btn variant="soft" disabled={off} onClick={() => set('downloads', [...f.downloads, { label: '', url: '' }])}><FiPlus /> Add download link</Btn>}</div>
            </FormField>
          </Sec>

          <Sec title="Sample manifest table" sub="An optional illustrative table. Mark it illustrative unless it is real client data.">
            {!f.manifest ? <Btn variant="soft" disabled={off} onClick={() => set('manifest', { title: '', subtitle: '', illustrative: true, columns: '', rows: '' })}><FiPlus /> Add a sample table</Btn> : (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label="Title"><input value={f.manifest.title} disabled={off} onChange={(e) => set('manifest', { ...f.manifest, title: e.target.value })} className={inputCls} /></FormField>
                  <FormField label="Subtitle"><input value={f.manifest.subtitle} disabled={off} onChange={(e) => set('manifest', { ...f.manifest, subtitle: e.target.value })} className={inputCls} /></FormField>
                </div>
                <FormField label="Columns" hint="Comma-separated."><input value={f.manifest.columns} disabled={off} onChange={(e) => set('manifest', { ...f.manifest, columns: e.target.value })} className={inputCls} /></FormField>
                <FormField label="Rows" hint="One row per line. Separate cells with |."><textarea rows={5} disabled={off} value={f.manifest.rows} onChange={(e) => set('manifest', { ...f.manifest, rows: e.target.value })} className={`${inputCls} font-mono`} /></FormField>
                <label className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" disabled={off} checked={f.manifest.illustrative} onChange={(e) => set('manifest', { ...f.manifest, illustrative: e.target.checked })} className="accent-red-600" /> Label as “Illustrative example”</label>
                <Btn variant="soft" disabled={off} onClick={() => set('manifest', null)}>Remove the table</Btn>
              </div>
            )}
          </Sec>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Card className="space-y-4 p-5">
            <span className={`${mono} text-white/45`}>Publishing & distribution</span>
            {[['Visible on website', 'visibleOnWebsite', 'Public service pages'], ['Package builder', 'inPackageBuilder', 'Available in the quote builder'], ['Feature on home', 'featuredOnHome', 'Prominent top-tier spot']].map(([l, k, sub]) => (
              <div key={k} className="flex items-center justify-between gap-3"><div><b className="block text-xs">{l}</b><span className="text-[10px] text-white/40">{sub}</span></div>
                <Toggle on={s[k]} label={l} disabled={!can.write || s.status !== 'PUBLISHED' || busy} onChange={(v) => run(() => A.setServiceVisibility(s.id, { [k]: v }))} /></div>
            ))}
            {s.status !== 'PUBLISHED' && !archived && <p className="text-[10px] text-white/35">Publish this service to turn visibility on.</p>}
            <div className="space-y-2 border-t border-white/10 pt-3">
              <Btn className="w-full" disabled={!publishable || busy} onClick={publish}><FiSend /> {s.status === 'PUBLISHED' ? 'Publish changes' : 'Publish'}</Btn>
              {!archived && <Btn variant="soft" className="w-full" disabled={!can.write} onClick={() => setDlg('archive')}><FiArchive /> Archive service</Btn>}
            </div>
          </Card>

          <Card className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Media & lookbook</span>
            <input ref={hero} type="file" accept="image/*" className="hidden" onChange={(e) => { upload(e.target.files[0], 'HERO'); e.target.value = ''; }} />
            <input ref={still} type="file" accept="image/*" className="hidden" onChange={(e) => { upload(e.target.files[0], 'STILL'); e.target.value = ''; }} />
            {s.heroUrl ? <Img src={s.heroUrl} className="h-40 w-full rounded-lg object-cover" /> : <div className="flex h-24 items-center justify-center rounded-lg bg-neutral-950 text-[11px] text-white/35">No hero image</div>}
            <div className="grid grid-cols-2 gap-2">
              <Btn variant="soft" disabled={!can.write || archived || pct !== null} onClick={() => hero.current?.click()}><FiUploadCloud /> {s.heroUrl ? 'Change hero' : 'Set hero'}</Btn>
              <Btn variant="soft" disabled={!can.write || archived || pct !== null} onClick={() => still.current?.click()}><FiPlus /> Add still</Btn>
            </div>
            {s.heroUrl && <Btn variant="soft" className="w-full" disabled={!can.write} onClick={() => { const h = s.media.find((m) => m.kind === 'HERO'); if (h) setDlg({ rm: h }); }}>Remove hero</Btn>}
            <div className="grid grid-cols-3 gap-2">{stills.map((m) => (
              <div key={m.id} className="group relative"><Img src={m.url} className="h-16 w-full rounded object-cover" />
                <button type="button" disabled={!can.write} onClick={() => setDlg({ rm: m })} className="absolute right-1 top-1 hidden cursor-pointer rounded bg-black/80 p-1 text-xs group-hover:block"><FiTrash2 /></button></div>))}</div>
            <p className="text-[10px] text-white/35">Images up to 15 MB. Image changes go live immediately.</p>
          </Card>

          <Card className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Related cross-links ({f.relatedSlugs.length})</span>
            <p className="text-[10px] text-white/40">Shown at the bottom of this service page.</p>
            <div className="max-h-56 space-y-1.5 overflow-y-auto">{others.map((o) => (
              <label key={o.id} className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" disabled={off} checked={f.relatedSlugs.includes(o.slug)} onChange={() => toggleIn('relatedSlugs', o.slug)} className="accent-red-600" /> {o.name}</label>))}</div>
          </Card>
        </div>
      </div>

      {dlg === 'archive' && <ConfirmModal open title="Archive this service?" confirmLabel="Archive" onClose={() => setDlg(null)} onConfirm={async () => { try { await A.archiveService(s.id); toast.success('Service archived'); setDlg(null); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>It disappears from the website, package builder and home page. Existing requests and packages keep their copy. You can restore it later as a draft.</p></ConfirmModal>}
      {dlg?.rm && <ConfirmModal open title="Remove this image?" confirmLabel="Remove" onClose={() => setDlg(null)} onConfirm={async () => { try { await A.removeServiceMedia(s.id, dlg.rm.id); toast.success('Image removed'); setDlg(null); reload(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>The image stops showing on the website straight away.</p></ConfirmModal>}
    </>
  );
}

export default function ProdServiceDetail() {
  const { id } = useParams();
  const d = useLoad(() => A.service(id), [id]);
  const all = useLoad(() => A.services());
  if (!d.data) return d.error ? <Card className="p-10 text-center">{d.error} <Link to="/admin/production/services" className="text-[#FFBF00] underline">Back to catalogue</Link></Card> : <p className="font-mono text-xs font-bold">LOADING…</p>;
  return <><ErrorLine>{all.error}</ErrorLine><Editor key={id} s={d.data} all={all.data?.data ?? []} reload={d.reload} /></>;
}