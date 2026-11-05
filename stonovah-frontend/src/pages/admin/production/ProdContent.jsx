import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowUp, FiArrowDown, FiEdit2, FiPlus, FiSave, FiSend, FiTrash2, FiRotateCcw, FiClock } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal } from '../ui';
import { FormField, Toggle, inputCls } from '../ui2';
import { useLoad, ErrorLine, ConfirmModal } from '../adminBits';
import { fmtDate, ago } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A } from '../../../api/adminProduction';
import { useProdAccess } from './useProdAccess';
import { mono } from './prodAdmin';

const slugKey = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'item';
const uniqueKey = (base, taken) => { let k = base; for (let n = 2; taken.includes(k); n++) k = `${base}-${n}`; return k; };
const del = (l, i) => l.filter((_, n) => n !== i);
const upd = (l, i, p) => l.map((x, n) => (n === i ? { ...x, ...p } : x));
const Sec = ({ title, sub, children }) => <Card className="space-y-4 p-6"><div><h2 className="text-xl font-black">{title}</h2>{sub && <p className="mt-1 text-[11px] text-white/45">{sub}</p>}</div>{children}</Card>;

/* ───────── FAQs ───────── */
function FaqModal({ faq, onClose, onDone }) {
  const [f, setF] = useState({ question: faq?.question ?? '', answer: faq?.answer ?? '', category: faq?.category ?? '', visible: faq?.visible ?? true });
  const [busy, setBusy] = useState(false);
  const valid = f.question.trim().length >= 5 && f.answer.trim().length >= 5;
  const save = async () => {
    setBusy(true);
    try {
      const body = { question: f.question.trim(), answer: f.answer.trim(), category: faq ? f.category.trim() || null : f.category.trim() || undefined, visible: f.visible };
      faq ? await A.updateFaq(faq.id, body) : await A.createFaq(body);
      toast.success(faq ? 'FAQ updated' : 'FAQ added'); onDone();
    } catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };
  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-xl">
      <div className="space-y-4 p-6">
        <div className="pr-10"><h2 className="text-xl font-black">{faq ? 'Edit question' : 'Add question'}</h2><p className="mt-1 text-[11px] text-white/45">FAQs go live on the website as soon as you save.</p></div>
        <FormField label="Category" hint="e.g. IP & Legal, Budgets & Billing"><input value={f.category} maxLength={40} onChange={(e) => setF({ ...f, category: e.target.value })} className={inputCls} /></FormField>
        <FormField label="Question" required><textarea rows={2} maxLength={300} value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} className={inputCls} /></FormField>
        <FormField label="Answer" required right={<span>{f.answer.length} / 3000</span>}><textarea rows={5} maxLength={3000} value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} className={inputCls} /></FormField>
        <label className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={f.visible} onChange={(e) => setF({ ...f, visible: e.target.checked })} className="accent-red-600" /> Visible on the website</label>
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!valid || busy} onClick={save}>{busy ? 'Saving…' : faq ? 'Save changes' : 'Add question'}</Btn></div>
      </div>
    </Modal>
  );
}

function Faqs({ can }) {
  const q = useLoad(() => A.faqs());
  const [dlg, setDlg] = useState(null);
  const rows = q.data ?? [];
  const act = async (fn, msg) => { try { await fn(); if (msg) toast.success(msg); q.reload(); } catch (e) { toast.error(apiErrorMessage(e)); } };
  const move = (i, d) => { const ids = rows.map((r) => r.id); [ids[i], ids[i + d]] = [ids[i + d], ids[i]]; act(() => A.reorderFaqs(ids), 'Order saved'); };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-white/50">{rows.filter((r) => r.visible).length} of {rows.length} visible on the storefront accordion</p><Btn disabled={!can.write} onClick={() => setDlg({})}><FiPlus /> Add question</Btn></div>
      <ErrorLine>{q.error}</ErrorLine>
      {q.data && !rows.length && <Card className="p-10 text-center text-sm text-white/40">No FAQs yet.</Card>}
      {rows.map((r, i) => (
        <Card key={r.id} className={`space-y-2 p-5 ${r.visible ? '' : 'opacity-60'}`}>
          <div className="flex flex-wrap items-center gap-2">{r.category && <Pill tone="red">{r.category}</Pill>}<Pill tone={r.visible ? 'green' : 'grey'}>{r.visible ? 'Visible' : 'Hidden'}</Pill></div>
          <b className="block text-base">{r.question}</b>
          <p className="line-clamp-3 text-xs leading-relaxed text-white/55">{r.answer}</p>
          <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
            <Toggle on={r.visible} label="Visible" disabled={!can.write} onChange={(v) => act(() => A.updateFaq(r.id, { visible: v }))} />
            <Btn variant="soft" className="px-3 py-1.5" disabled={!can.write} onClick={() => setDlg({ faq: r })}><FiEdit2 /> Edit</Btn>
            <Btn variant="soft" className="px-3 py-1.5" disabled={!can.write} onClick={() => setDlg({ rm: r })}><FiTrash2 /></Btn>
            <span className="ml-auto flex gap-1">
              <Btn variant="soft" className="px-2.5 py-1.5" disabled={!can.write || i === 0} onClick={() => move(i, -1)}><FiArrowUp /></Btn>
              <Btn variant="soft" className="px-2.5 py-1.5" disabled={!can.write || i === rows.length - 1} onClick={() => move(i, 1)}><FiArrowDown /></Btn>
            </span>
          </div>
        </Card>
      ))}
      {dlg && !dlg.rm && <FaqModal faq={dlg.faq} onClose={() => setDlg(null)} onDone={() => { setDlg(null); q.reload(); }} />}
      {dlg?.rm && <ConfirmModal open title="Delete this question?" confirmLabel="Delete" onClose={() => setDlg(null)} onConfirm={async () => { try { await A.removeFaq(dlg.rm.id); toast.success('Deleted'); setDlg(null); q.reload(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>It disappears from the website straight away.</p></ConfirmModal>}
    </div>
  );
}

/* ───────── landing content ───────── */
const toForm = (e) => ({
  eyebrow: e.hero?.eyebrow ?? '', headline: e.hero?.headline ?? '', subtext: e.hero?.subtext ?? '', primaryCtaLabel: e.hero?.primaryCtaLabel ?? '', secondaryCtaLabel: e.hero?.secondaryCtaLabel ?? '',
  stats: (e.hero?.stats ?? []).map((s) => ({ label: s.label, value: s.value })),
  pathways: (e.pathways ?? []).map((p) => ({ key: p.key, existing: true, badge: p.badge ?? '', title: p.title, subtitle: p.subtitle, bullets: (p.bullets ?? []).join('\n'), buttonLabel: p.buttonLabel, buttonHref: p.buttonHref })),
  segments: (e.segments ?? []).map((s) => ({ key: s.key, existing: true, name: s.name, positioning: s.positioning, focusArea: s.focusArea ?? '', iconKey: s.iconKey ?? '' })),
  seoTitle: e.seo?.title ?? '', seoDescription: e.seo?.description ?? '',
});

function toBody(f) {
  const errors = [];
  const need = (v, msg) => { if (!v.trim()) errors.push(msg); };
  need(f.headline, 'Hero headline is required'); need(f.subtext, 'Hero text is required'); need(f.primaryCtaLabel, 'Primary button label is required'); need(f.secondaryCtaLabel, 'Secondary button label is required');
  need(f.seoTitle, 'SEO title is required'); need(f.seoDescription, 'SEO description is required');
  if (f.seoTitle.length > 60) errors.push('SEO title is over 60 characters');
  if (f.seoDescription.length > 160) errors.push('SEO description is over 160 characters');
  if (!f.pathways.length) errors.push('Add at least one pathway card');
  if (!f.segments.length) errors.push('Add at least one segment');

  const pTaken = [];
  const pathways = f.pathways.map((p, i) => {
    const key = p.existing ? p.key : uniqueKey(slugKey(p.title), pTaken); pTaken.push(key);
    if (!p.title.trim() || !p.subtitle.trim() || !p.buttonLabel.trim()) errors.push(`Pathway ${i + 1} needs a title, subtitle and button label`);
    if (!/^(\/|https?:\/\/)\S*$/.test(p.buttonHref.trim())) errors.push(`Pathway ${i + 1}: the button link must start with / or https://`);
    return { key, badge: p.badge.trim(), title: p.title.trim(), subtitle: p.subtitle.trim(), bullets: p.bullets.split('\n').map((x) => x.trim()).filter(Boolean), buttonLabel: p.buttonLabel.trim(), buttonHref: p.buttonHref.trim() };
  });
  const sTaken = [];
  const segments = f.segments.map((s, i) => {
    const key = s.existing ? s.key : uniqueKey(slugKey(s.name), sTaken); sTaken.push(key);
    if (!s.name.trim() || !s.positioning.trim()) errors.push(`Segment ${i + 1} needs a name and description`);
    return { key, name: s.name.trim(), positioning: s.positioning.trim(), focusArea: s.focusArea.trim(), iconKey: s.iconKey.trim() };
  });
  return {
    errors,
    body: {
      hero: { eyebrow: f.eyebrow.trim(), headline: f.headline.trim(), subtext: f.subtext.trim(), primaryCtaLabel: f.primaryCtaLabel.trim(), secondaryCtaLabel: f.secondaryCtaLabel.trim(), stats: f.stats.filter((s) => s.label.trim() && s.value.trim()).map((s) => ({ label: s.label.trim(), value: s.value.trim() })) },
      pathways, segments, seo: { title: f.seoTitle.trim(), description: f.seoDescription.trim() },
    },
  };
}

function Landing({ can }) {
  const c = useLoad(() => A.content());
  const v = useLoad(() => A.contentVersions());
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dlg, setDlg] = useState(null);
  const d = c.data;
  useEffect(() => { if (d) setF(toForm(d.editor)); }, [d]);
  if (!f) return c.error ? <ErrorLine>{c.error}</ErrorLine> : <p className="font-mono text-xs font-bold">LOADING…</p>;

  const set = (k, x) => setF((p) => ({ ...p, [k]: x }));
  const cur = toBody(f);
  const dirty = JSON.stringify(cur.body) !== JSON.stringify(toBody(toForm(d.editor)).body);
  const off = !can.write;
  const run = async (fn, ok) => { setBusy(true); try { await fn(); if (ok) toast.success(ok); c.reload(); v.reload(); } catch (e) { toast.error(apiErrorMessage(e)); } setBusy(false); };
  const save = () => run(() => A.saveContentDraft(cur.body), 'Draft saved');
  const publish = () => run(async () => { if (dirty) await A.saveContentDraft(cur.body); await A.publishContent(); }, 'Content published');
  const canPublish = can.write && !cur.errors.length && (dirty || d.hasDraft);
  const t = (k, extra = {}) => <input value={f[k]} disabled={off} onChange={(e) => set(k, e.target.value)} className={inputCls} {...extra} />;

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-red-600 p-5">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2"><Pill tone="green">Version {d.version} live</Pill>{d.hasDraft && <Pill tone="amber">Unpublished draft</Pill>}{dirty && <Pill tone="red">Unsaved changes</Pill>}</div>
          <p className="text-xs text-white/50">{d.publishedAt ? `Published ${ago(d.publishedAt)}${d.publishedByEmail ? ` by ${d.publishedByEmail}` : ''}` : 'Never published'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="soft" onClick={() => setDlg('versions')}><FiClock /> Version history</Btn>
          <Btn variant="soft" disabled={!can.write || busy || (!d.hasDraft && !dirty)} onClick={() => setDlg('discard')}><FiRotateCcw /> Discard draft</Btn>
          <Btn variant="soft" disabled={!can.write || !dirty || busy} onClick={save}><FiSave /> Save draft</Btn>
          <Btn disabled={!canPublish || busy} onClick={publish}><FiSend /> Publish content updates</Btn>
        </div>
      </Card>
      {cur.errors.length > 0 && <Card className="space-y-1 border-amber-500/40 p-4 text-xs text-amber-200">{cur.errors.map((e) => <p key={e}>• {e}</p>)}</Card>}

      <Sec title="Hero module" sub="Above-the-fold text on the Production landing page.">
        <FormField label="Eyebrow tag">{t('eyebrow', { maxLength: 80 })}</FormField>
        <FormField label="Headline" required>{t('headline', { maxLength: 120 })}</FormField>
        <FormField label="Subtext" required right={<span>{f.subtext.length} / 500</span>}><textarea rows={3} maxLength={500} disabled={off} value={f.subtext} onChange={(e) => set('subtext', e.target.value)} className={inputCls} /></FormField>
        <div className="grid gap-3 md:grid-cols-2"><FormField label="Primary button label" required>{t('primaryCtaLabel', { maxLength: 40 })}</FormField><FormField label="Secondary button label" required>{t('secondaryCtaLabel', { maxLength: 40 })}</FormField></div>
        <FormField label="Hero facts (up to 6)" hint="Only add claims you can back up.">
          <div className="space-y-2">
            {f.stats.map((s, i) => (
              <div key={i} className="flex gap-2"><input value={s.label} disabled={off} maxLength={60} placeholder="Label" onChange={(e) => set('stats', upd(f.stats, i, { label: e.target.value }))} className={inputCls} /><input value={s.value} disabled={off} maxLength={80} placeholder="Value" onChange={(e) => set('stats', upd(f.stats, i, { value: e.target.value }))} className={inputCls} /><Btn variant="soft" className="px-3" disabled={off} onClick={() => set('stats', del(f.stats, i))}><FiTrash2 /></Btn></div>
            ))}
            {f.stats.length < 6 && <Btn variant="soft" disabled={off} onClick={() => set('stats', [...f.stats, { label: '', value: '' }])}><FiPlus /> Add fact</Btn>}
          </div>
        </FormField>
      </Sec>

      <Sec title="Pathway decision modules" sub="The “Full Package” and “Choose What You Need” cards (1 to 4).">
        {f.pathways.map((p, i) => (
          <div key={i} className="space-y-2 rounded-lg bg-neutral-950 p-4">
            <div className="flex items-center justify-between"><span className={`${mono} text-red-400`}>Card {i + 1}</span><Btn variant="soft" className="px-3 py-1.5" disabled={off || f.pathways.length <= 1} onClick={() => set('pathways', del(f.pathways, i))}><FiTrash2 /></Btn></div>
            <div className="grid gap-2 md:grid-cols-2"><input value={p.badge} disabled={off} maxLength={40} placeholder="Badge" onChange={(e) => set('pathways', upd(f.pathways, i, { badge: e.target.value }))} className={inputCls} /><input value={p.title} disabled={off} maxLength={80} placeholder="Title" onChange={(e) => set('pathways', upd(f.pathways, i, { title: e.target.value }))} className={inputCls} /></div>
            <textarea rows={2} maxLength={400} disabled={off} value={p.subtitle} placeholder="Value proposition" onChange={(e) => set('pathways', upd(f.pathways, i, { subtitle: e.target.value }))} className={inputCls} />
            <textarea rows={3} disabled={off} value={p.bullets} placeholder="Bullet points, one per line (up to 6)" onChange={(e) => set('pathways', upd(f.pathways, i, { bullets: e.target.value }))} className={inputCls} />
            <div className="grid gap-2 md:grid-cols-2"><input value={p.buttonLabel} disabled={off} maxLength={40} placeholder="Button label" onChange={(e) => set('pathways', upd(f.pathways, i, { buttonLabel: e.target.value }))} className={inputCls} /><input value={p.buttonHref} disabled={off} placeholder="/production/services/full-production" onChange={(e) => set('pathways', upd(f.pathways, i, { buttonHref: e.target.value }))} className={inputCls} /></div>
          </div>
        ))}
        {f.pathways.length < 4 && <Btn variant="soft" disabled={off} onClick={() => set('pathways', [...f.pathways, { key: '', existing: false, badge: '', title: '', subtitle: '', bullets: '', buttonLabel: '', buttonHref: '/production' }])}><FiPlus /> Add pathway card</Btn>}
      </Sec>

      <Sec title="Target segments (“Who we work with”)" sub="1 to 6 audience cards. Icon names: film, clapperboard, megaphone, users, layers…">
        {f.segments.map((s, i) => (
          <div key={i} className="space-y-2 rounded-lg bg-neutral-950 p-4">
            <div className="flex items-center justify-between"><span className={`${mono} text-red-400`}>Segment {i + 1}</span><Btn variant="soft" className="px-3 py-1.5" disabled={off || f.segments.length <= 1} onClick={() => set('segments', del(f.segments, i))}><FiTrash2 /></Btn></div>
            <div className="grid gap-2 md:grid-cols-[1fr_160px]"><input value={s.name} disabled={off} maxLength={60} placeholder="Segment name" onChange={(e) => set('segments', upd(f.segments, i, { name: e.target.value }))} className={inputCls} /><input value={s.iconKey} disabled={off} maxLength={40} placeholder="Icon" onChange={(e) => set('segments', upd(f.segments, i, { iconKey: e.target.value }))} className={inputCls} /></div>
            <textarea rows={2} maxLength={400} disabled={off} value={s.positioning} placeholder="Audience positioning" onChange={(e) => set('segments', upd(f.segments, i, { positioning: e.target.value }))} className={inputCls} />
            <input value={s.focusArea} disabled={off} maxLength={120} placeholder="Focus area" onChange={(e) => set('segments', upd(f.segments, i, { focusArea: e.target.value }))} className={inputCls} />
          </div>
        ))}
        {f.segments.length < 6 && <Btn variant="soft" disabled={off} onClick={() => set('segments', [...f.segments, { key: '', existing: false, name: '', positioning: '', focusArea: '', iconKey: '' }])}><FiPlus /> Add segment</Btn>}
      </Sec>

      <Sec title="Search metadata">
        <FormField label="Meta title" required right={<span className={f.seoTitle.length > 60 ? 'text-red-400' : ''}>{f.seoTitle.length} / 60</span>}>{t('seoTitle')}</FormField>
        <FormField label="Meta description" required right={<span className={f.seoDescription.length > 160 ? 'text-red-400' : ''}>{f.seoDescription.length} / 160</span>}><textarea rows={3} disabled={off} value={f.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} className={inputCls} /></FormField>
        <div className="rounded-lg bg-neutral-950 p-4"><p className="text-sm font-bold text-sky-300">{f.seoTitle || 'Meta title'}</p><p className="mt-1 text-xs text-white/55">{f.seoDescription || 'Meta description'}</p></div>
      </Sec>

      {dlg === 'versions' && (
        <Modal open onClose={() => setDlg(null)} width="max-w-md"><div className="space-y-3 p-6"><h2 className="pr-10 text-xl font-black">Version history</h2>
          {(v.data ?? []).map((x) => <div key={x.version} className="flex items-center justify-between rounded-lg bg-neutral-900 p-3 text-xs"><b>Version {x.version}</b><span className="text-white/50">{x.publishedByEmail ?? 'seed'} • {fmtDate(x.createdAt)}</span></div>)}
          {v.data && !v.data.length && <p className="text-sm text-white/40">Nothing published yet.</p>}</div></Modal>
      )}
      {dlg === 'discard' && <ConfirmModal open title="Discard unpublished changes?" confirmLabel="Discard" onClose={() => setDlg(null)} onConfirm={async () => { try { await A.discardContentDraft(); toast.success('Draft discarded'); setDlg(null); c.reload(); } catch (e) { toast.error(apiErrorMessage(e)); } }}><p>The form returns to the live version. Anything you have typed and not saved is lost.</p></ConfirmModal>}
    </div>
  );
}

export default function ProdContent() {
  const { can } = useProdAccess();
  const [tab, setTab] = useState('faq');
  return (
    <>
      <PageHeader eyebrow="STOREFRONT CONTENT" title="FAQ & Landing Page Content Editor" desc="Curate public inquiries, landing page messaging, pathway cards and audience segments." />
      <div className="flex gap-2">{[['faq', 'Production FAQs'], ['landing', 'Landing page content']].map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={`cursor-pointer rounded-lg px-4 py-2.5 text-xs font-bold ${tab === k ? 'bg-red-600' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'}`}>{l}</button>)}</div>
      {tab === 'faq' ? <Faqs can={can} /> : <Landing can={can} />}
    </>
  );
}