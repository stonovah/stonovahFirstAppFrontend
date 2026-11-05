import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiFileText, FiLock, FiPhone, FiPlus, FiTrash2, FiUploadCloud, FiX, FiLink } from 'react-icons/fi';
import * as P from '../../api/production';
import { apiErrorMessage } from '../../lib/api';
import { useProduction } from './ProductionContext';
import { tokenStore, useProdData, usePageTitle } from './ProdLive';
import { Breadcrumb, Btn, Card, ErrorBox, Loading } from './ProdUi';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';
const input = 'mt-2 w-full rounded-md border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-red-500';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+0-9()\s-]{7,20}$/;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const briefStore = tokenStore('stonovah_prod_brief');
const syncStore = tokenStore('stonovah_prod_brief_pkgsync');
const pkgStore = tokenStore('stonovah_prod_package');

const d10 = (v) => (v ? String(v).slice(0, 10) : '');
const toForm = (b) => ({
  contactName: b.contact.name ?? '', contactEmail: b.contact.email ?? '', contactPhone: b.contact.phone ?? '',
  entityType: b.contact.entityType ?? 'STUDIO', companyName: b.contact.companyName ?? '', companyRegNo: b.contact.companyRegNo ?? '',
  projectTitle: b.project.title ?? '', isWorkingTitle: !!b.project.isWorkingTitle, format: b.project.format ?? '', logline: b.project.logline ?? '',
  pipelineStage: b.project.pipelineStage ?? '', deliveryFormat: b.project.deliveryFormat ?? '',
  targetStart: d10(b.logistics.targetStart), targetEnd: d10(b.logistics.targetEnd), territory: b.logistics.territory ?? '', budgetTier: b.logistics.budgetTier ?? '',
  producerNotes: b.producerNotes ?? '',
  crewRoles: b.crewRoles.map((r) => ({ role: r.role, notes: r.notes ?? '', qty: r.qty, windowStart: d10(r.windowStart), windowEnd: d10(r.windowEnd) })),
  funding: { materials: b.funding?.materials ?? [], audience: b.funding?.audience ?? null, deadline: d10(b.funding?.deadline) },
});

// Returns the value to send, or undefined to hold the field back until it is valid.
function remoteValue(key, v, all) {
  if (key === 'contactEmail') return v.trim() === '' ? null : EMAIL.test(v.trim()) ? v.trim() : undefined;
  if (key === 'contactPhone') return v.trim() === '' ? null : PHONE.test(v.trim()) ? v.trim() : undefined;
  if (key === 'targetStart' || key === 'targetEnd') {
    const s = key === 'targetStart' ? v : all.targetStart;
    const e = key === 'targetEnd' ? v : all.targetEnd;
    return s && e && e < s ? undefined : v || null;
  }
  if (key === 'crewRoles') {
    return v.filter((r) => r.role.trim()).map((r) => ({
      role: r.role.trim(), notes: r.notes || null, qty: Math.min(500, Math.max(1, Number(r.qty) || 1)),
      windowStart: r.windowStart || null, windowEnd: r.windowStart && r.windowEnd && r.windowEnd < r.windowStart ? null : r.windowEnd || null,
    }));
  }
  if (key === 'funding') return { materials: v.materials, audience: v.audience, deadline: v.deadline || null };
  return v;
}

function Module({ no, title, children }) {
  return (
    <Card className="border-t-2 border-t-red-600/60 p-6 sm:p-7">
      <p className={`${mono} text-red-400`}>Module {no}</p>
      <h2 className="mt-1 text-lg font-bold uppercase tracking-wide">{title}</h2>
      <div className="mt-5">{children}</div>
    </Card>
  );
}
const Field = ({ label, required, error, children, className = '' }) => (
  <label className={`block ${className}`}>
    <span className={`${mono} text-white/45`}>{label}{required && ' *'}</span>
    {children}
    {error && <span className="mt-1 block text-[11px] text-red-400">{error}</span>}
  </label>
);
const Chip = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} className={`rounded-md border px-4 py-2.5 text-xs font-bold transition-colors ${active ? 'border-red-600 bg-red-600 text-white' : 'border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25'}`}>{children}</button>
);

export default function ProductionRequest() {
  usePageTitle('Request a Production Service | Stonovah');
  const navigate = useNavigate();
  const { options, packageToken } = useProduction();
  const { data: cat } = useProdData(() => P.getServices(), []);

  const [boot, setBoot] = useState({ loading: true, error: null });
  const [f, setF] = useState(null);
  const [srv, setSrv] = useState({ services: [], files: [], completeness: { percent: 0, missing: [] } });
  const [save, setSave] = useState({ state: 'idle', error: null });
  const [nda, setNda] = useState(false);
  const [picker, setPicker] = useState(false);
  const [up, setUp] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [, force] = useState(0);

  const token = useRef(null);
  const pending = useRef({});
  const timer = useRef(null);
  const chain = useRef(Promise.resolve(true));
  const fRef = useRef(null);
  const started = useRef(false);
  fRef.current = f;

  // ───── autosave ─────
  const flush = useCallback(() => {
    clearTimeout(timer.current);
    chain.current = chain.current.then(async () => {
      const body = pending.current;
      if (!Object.keys(body).length || !token.current) return true;
      pending.current = {};
      setSave({ state: 'saving', error: null });
      try {
        const d = await P.patchBrief(token.current, body);
        setSrv((s) => ({ ...s, services: d.services, completeness: d.completeness }));
        setSave({ state: 'saved', error: null });
        return true;
      } catch (e) {
        pending.current = { ...body, ...pending.current };
        setSave({ state: 'error', error: apiErrorMessage(e) });
        return false;
      }
    });
    return chain.current;
  }, []);

  const enqueue = useCallback((key, value) => {
    const v = remoteValue(key, value, fRef.current ?? {});
    if (v === undefined) return;
    pending.current[key] = v;
    setSave((s) => ({ ...s, state: 'saving' }));
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 700);
  }, [flush]);

  const set = (key, value) => { setF((p) => ({ ...p, [key]: value })); enqueue(key, value); };
  useEffect(() => () => { clearTimeout(timer.current); if (Object.keys(pending.current).length) flush(); }, [flush]);

  // ───── start or resume the draft ─────
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const q = new URLSearchParams(window.location.search).get('resume');
        if (q && TOKEN.test(q)) { briefStore.set(q); window.history.replaceState({}, '', window.location.pathname); }

        let brief = null;
        const stored = briefStore.get();
        if (stored) {
          try { brief = await P.getBrief(stored); token.current = stored; } catch { briefStore.clear(); }
        }
        const pkTok = pkgStore.get() || packageToken();
        const pk = pkTok ? await P.getPackage(pkTok).catch(() => null) : null;

        if (!brief) {
          const r = await P.createBrief(pk ? { packageToken: pkTok } : {}).catch(() => P.createBrief({}));
          token.current = r.resumeToken;
          briefStore.set(r.resumeToken);
          brief = r.brief;
          if (pk) syncStore.set(pk.updatedAt);
        } else if (pk?.items.length && syncStore.get() !== pk.updatedAt) {
          // Merge the package into an existing draft once, so services removed later stay removed.
          const turnkeyId = (await P.getServices().catch(() => null))?.turnkey?.id;
          const pkTurn = pk.items.find((i) => i.kind === 'TURNKEY');
          let list = brief.services.map((s) => ({ serviceId: s.serviceId, scopeOptionId: s.scopeOptionId ?? null }));
          if (pkTurn) list = [{ serviceId: pkTurn.serviceId, scopeOptionId: null }];
          else {
            list = list.filter((s) => s.serviceId !== turnkeyId);
            pk.items.forEach((i) => { if (!list.some((s) => s.serviceId === i.serviceId)) list.push({ serviceId: i.serviceId, scopeOptionId: i.scopeOption?.id ?? null }); });
          }
          const body = { services: list, mode: pkTurn ? 'FULL' : 'MODULAR' };
          if (!brief.project.format && pk.category) body.format = pk.category;
          if (!brief.project.deliveryFormat && pk.deliveryFormat) body.deliveryFormat = pk.deliveryFormat;
          if (!brief.project.pipelineStage && pk.pipelineStage) body.pipelineStage = pk.pipelineStage;
          brief = await P.patchBrief(token.current, body);
          syncStore.set(pk.updatedAt);
        }
        setF(toForm(brief));
        setSrv({ services: brief.services, files: brief.files, completeness: brief.completeness });
        setBoot({ loading: false, error: null });
      } catch (e) {
        setBoot({ loading: false, error: apiErrorMessage(e) });
      }
    })();
  }, [packageToken]);

  // ───── services ─────
  const catalog = useMemo(() => {
    if (!cat) return [];
    return [...(cat.turnkey ? [cat.turnkey] : []), ...cat.stages.flatMap((s) => s.services)];
  }, [cat]);
  const turnkeySlug = cat?.turnkey?.slug;

  const applyServices = (next) => {
    setSrv((s) => ({ ...s, services: next }));
    enqueue('services', next.map((x) => ({ serviceId: x.serviceId, scopeOptionId: x.scopeOptionId ?? null })));
    enqueue('mode', next.some((x) => x.slug === turnkeySlug) ? 'FULL' : 'MODULAR');
  };
  const addSvc = (c) => {
    const row = { serviceId: c.id, slug: c.slug, name: c.name, label: c.name, scopeOptionId: null };
    applyServices(c.kind === 'TURNKEY' ? [row] : [...srv.services.filter((x) => x.slug !== turnkeySlug), row]);
    setPicker(false);
  };
  const hasSlug = (slug) => srv.services.some((x) => x.slug === slug);
  const hasCrew = hasSlug('crew-cast-sourcing');
  const hasFunding = hasSlug('funding-pitch-materials');

  const setRole = (i, patch) => set('crewRoles', f.crewRoles.map((r, n) => (n === i ? { ...r, ...patch } : r)));
  const toggleMaterial = (k) => {
    const m = f.funding.materials;
    set('funding', { ...f.funding, materials: m.includes(k) ? m.filter((x) => x !== k) : [...m, k] });
  };

  // ───── files ─────
  const onFiles = async (list) => {
    const maxBytes = options?.files?.maxBytes ?? 25 * 1024 * 1024;
    const exts = options?.files?.extensions ?? ['pdf', 'fdx', 'docx', 'pptx', 'fountain'];
    for (const file of Array.from(list)) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!exts.includes(ext)) { toast.error(`${file.name}: allowed types are ${exts.join(', ')}`); continue; }
      if (file.size > maxBytes) { toast.error(`${file.name} is over ${Math.round(maxBytes / 1048576)} MB`); continue; }
      setUp({ name: file.name, pct: 0 });
      try {
        const row = await P.uploadBriefFile(token.current, file, 'SCRIPT', (pct) => setUp({ name: file.name, pct }));
        setSrv((s) => ({ ...s, files: [...s.files, row] }));
      } catch (e) { toast.error(`${file.name}: ${apiErrorMessage(e)}`); }
    }
    setUp(null);
  };
  const removeFile = async (id) => {
    try { await P.deleteBriefFile(token.current, id); setSrv((s) => ({ ...s, files: s.files.filter((x) => x.id !== id) })); }
    catch (e) { toast.error(apiErrorMessage(e)); }
  };

  // ───── save link and submit ─────
  const copyResume = async () => {
    await flush();
    try { await navigator.clipboard.writeText(`${window.location.origin}/production/request?resume=${token.current}`); toast.success('Draft link copied. Anyone with it can edit this brief.'); }
    catch { toast.error('Could not copy the link'); }
  };
  const ndaNeeded = options?.nda?.enforced !== false;
  const ready = srv.completeness.missing.length === 0 && (!ndaNeeded || nda) && save.state !== 'error';
  const submit = async () => {
    setSubmitting(true);
    if (!(await flush())) { setSubmitting(false); return toast.error('Some changes could not be saved. Check the message above the button.'); }
    try {
      const r = await P.submitBrief(token.current, { acceptNda: nda });
      briefStore.clear(); syncStore.clear();
      navigate(`/production/request/confirmation/${r.reference}?token=${r.accessToken}`, { replace: true });
    } catch (e) { toast.error(apiErrorMessage(e)); setSubmitting(false); }
  };

  if (boot.loading) return <Loading label="Preparing your brief" />;
  if (boot.error || !f) return <div className="mx-auto max-w-3xl px-5 py-20"><ErrorBox message={boot.error ?? 'Could not start your brief'} onRetry={() => window.location.reload()} /></div>;

  const emailErr = f.contactEmail && !EMAIL.test(f.contactEmail.trim()) ? 'Enter a valid email address' : null;
  const phoneErr = f.contactPhone && !PHONE.test(f.contactPhone.trim()) ? 'Enter a valid phone number' : null;
  const dateErr = f.targetStart && f.targetEnd && f.targetEnd < f.targetStart ? 'The end date is before the start date' : null;
  const crewCount = f.crewRoles.reduce((n, r) => n + (Number(r.qty) || 0), 0);
  const tier = options?.budgetTiers?.find((t) => t.key === f.budgetTier);
  const phone = options?.hotlinePhone;
  const exts = options?.files?.extensions ?? [];
  const maxMb = Math.round((options?.files?.maxBytes ?? 26214400) / 1048576);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-6">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Production', to: '/production' }, { label: 'Request a production service' }]} />
      {srv.services.length > 0 && <Link to="/production/build-package" className="mt-4 inline-block text-[11px] font-semibold text-white/55 hover:text-white">← Back to build your package</Link>}

      <div className="mt-8">
        <p className={`${mono} flex items-center gap-2 text-red-400`}><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Production intake brief</p>
        <h1 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-6xl">Request a production <span className="text-[#e10613]">service</span></h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60">Complete your production brief. Your selected services and details are routed to our line producers for timeline and budget estimation.</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_330px]">
        <div className="space-y-6">
          <Module no="01" title="Contact & entity information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required><input className={input} value={f.contactName} onChange={(e) => set('contactName', e.target.value)} maxLength={120} /></Field>
              <Field label="Work / production email" required error={emailErr}><input type="email" className={input} value={f.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} /></Field>
              <Field label="Phone / WhatsApp" required error={phoneErr}><input type="tel" placeholder="+234 803 123 4567" className={input} value={f.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} /></Field>
              <div>
                <span className={`${mono} text-white/45`}>Entity structure *</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(options?.entityTypes ?? [{ key: 'INDIVIDUAL', label: 'Individual' }, { key: 'STUDIO', label: 'Studio / Co.' }]).map((t) => <Chip key={t.key} active={f.entityType === t.key} onClick={() => set('entityType', t.key)}>{t.label}</Chip>)}
                </div>
              </div>
              <Field label={`Company / studio legal entity${f.entityType === 'STUDIO' ? ' *' : ''}`}><input className={input} value={f.companyName} onChange={(e) => set('companyName', e.target.value)} maxLength={160} /></Field>
              <Field label="Registration no. (optional)"><input className={input} value={f.companyRegNo} onChange={(e) => set('companyRegNo', e.target.value)} maxLength={40} /></Field>
            </div>
          </Module>

          <Module no="02" title="Project identity & staging">
            <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`${mono} text-white/45`}>Project title *</span>
                  <label className="flex items-center gap-2 text-[11px] text-white/55"><input type="checkbox" checked={f.isWorkingTitle} onChange={(e) => set('isWorkingTitle', e.target.checked)} /> Working title</label>
                </div>
                <input className={input} value={f.projectTitle} onChange={(e) => set('projectTitle', e.target.value)} maxLength={160} />
              </div>
              <Field label="Project format *">
                <select className={input} value={f.format} onChange={(e) => set('format', e.target.value || null)}>
                  <option value="">Select…</option>
                  {options?.projectCategories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Logline / executive synopsis" className="mt-4">
              <textarea rows={3} className={input} value={f.logline} onChange={(e) => set('logline', e.target.value)} maxLength={600} />
              <span className="mt-1 block text-right text-[10px] text-white/35">{f.logline.length} / 600</span>
            </Field>
            <p className={`${mono} mt-4 text-white/45`}>Where you are in the pipeline</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {options?.pipelineStages.map((s) => <Chip key={s.key} active={f.pipelineStage === s.key} onClick={() => set('pipelineStage', s.key)}>{s.label}</Chip>)}
            </div>
          </Module>

          <Module no="03" title="Active production services">
            <div className="flex flex-wrap gap-2">
              {srv.services.map((s) => (
                <span key={s.serviceId} className="flex items-center gap-2 rounded-md border border-red-600/50 bg-red-600/10 px-3 py-2 text-xs font-semibold">
                  {s.label}
                  <button aria-label={`Remove ${s.name}`} onClick={() => applyServices(srv.services.filter((x) => x.serviceId !== s.serviceId))} className="text-white/50 hover:text-white"><FiX /></button>
                </span>
              ))}
              {!srv.services.length && <p className="text-sm text-white/45">No services selected yet. Add at least one.</p>}
            </div>
            <button onClick={() => setPicker((p) => !p)} className="mt-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/70 hover:text-white"><FiPlus /> Add a service</button>
            {picker && (
              <div className="mt-3 grid gap-2 rounded-lg bg-black/40 p-3 sm:grid-cols-2">
                {catalog.filter((c) => !srv.services.some((s) => s.serviceId === c.id)).map((c) => (
                  <button key={c.id} onClick={() => addSvc(c)} className="rounded-md px-3 py-2 text-left text-xs text-white/75 hover:bg-white/5">{c.name}</button>
                ))}
                {!catalog.length && <p className="p-2 text-xs text-white/45">The service catalogue is not available right now.</p>}
              </div>
            )}

            {hasCrew && (
              <div className="mt-6 rounded-lg border border-white/10 p-4">
                <p className={`${mono} text-red-400`}>Crew & cast sourcing: headcount attachment matrix</p>
                <p className="mt-1 text-xs text-white/50">Specify required department heads, camera operators or lead cast for immediate talent outreach.</p>
                <div className="mt-4 space-y-3">
                  {f.crewRoles.map((r, i) => (
                    <div key={i} className="grid gap-2 rounded-lg bg-black/30 p-3 sm:grid-cols-[1.3fr_1.5fr_70px_140px_140px_32px]">
                      <input placeholder="Role (e.g. Director of Photography)" className={`${input} mt-0`} value={r.role} onChange={(e) => setRole(i, { role: e.target.value })} maxLength={120} />
                      <input placeholder="Specialty / specification" className={`${input} mt-0`} value={r.notes} onChange={(e) => setRole(i, { notes: e.target.value })} maxLength={400} />
                      <input type="number" min={1} max={500} aria-label="Quantity" className={`${input} mt-0`} value={r.qty} onChange={(e) => setRole(i, { qty: e.target.value })} />
                      <input type="date" aria-label="Window start" className={`${input} mt-0`} value={r.windowStart} onChange={(e) => setRole(i, { windowStart: e.target.value })} />
                      <input type="date" aria-label="Window end" className={`${input} mt-0`} value={r.windowEnd} onChange={(e) => setRole(i, { windowEnd: e.target.value })} />
                      <button aria-label="Remove role" onClick={() => set('crewRoles', f.crewRoles.filter((_, n) => n !== i))} className="text-white/40 hover:text-red-400"><FiTrash2 /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => set('crewRoles', [...f.crewRoles, { role: '', notes: '', qty: 1, windowStart: '', windowEnd: '' }])} className="mt-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/70 hover:text-white"><FiPlus /> Add another role</button>
                <p className="mt-2 text-[11px] text-white/35">Rows without a role name are not saved.</p>
              </div>
            )}

            {hasFunding && (
              <div className="mt-6 rounded-lg border border-white/10 p-4">
                <p className={`${mono} text-red-400`}>Funding & pitch materials: packaging specification</p>
                <p className={`${mono} mt-4 text-white/45`}>Materials needed *</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {options?.fundingMaterials.map((m) => {
                    const on = f.funding.materials.includes(m.key);
                    return (
                      <button key={m.key} onClick={() => toggleMaterial(m.key)} className={`rounded-lg border p-3 text-left transition-colors ${on ? 'border-red-600 bg-red-600/10' : 'border-white/10 hover:border-white/25'}`}>
                        <p className="text-xs font-bold">{m.label}</p><p className="mt-0.5 text-[11px] text-white/45">{m.detail}</p>
                      </button>
                    );
                  })}
                </div>
                <p className={`${mono} mt-4 text-white/45`}>Who are you pitching to?</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {options?.pitchAudiences.map((a) => <Chip key={a.key} active={f.funding.audience === a.key} onClick={() => set('funding', { ...f.funding, audience: a.key })}>{a.label}</Chip>)}
                </div>
                <Field label="Pitch deadline (optional)" className="mt-4 max-w-xs"><input type="date" className={input} value={f.funding.deadline} onChange={(e) => set('funding', { ...f.funding, deadline: e.target.value })} /></Field>
              </div>
            )}
          </Module>

          <Module no="04" title="Logistics, timeline & budget envelope">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Target principal photography start"><input type="date" className={input} value={f.targetStart} onChange={(e) => set('targetStart', e.target.value)} /></Field>
              <Field label="Target wrap (optional)" error={dateErr}><input type="date" className={input} value={f.targetEnd} onChange={(e) => set('targetEnd', e.target.value)} /></Field>
              <Field label="Production territory / locations"><input className={input} value={f.territory} onChange={(e) => set('territory', e.target.value)} maxLength={200} placeholder="Lagos (Victoria Island, Lekki) & London" /></Field>
            </div>
            <p className={`${mono} mt-5 text-white/45`}>Allocated production budget envelope (total)</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {options?.budgetTiers.map((t) => (
                <button key={t.key} onClick={() => set('budgetTier', f.budgetTier === t.key ? null : t.key)} className={`rounded-lg border p-3 text-center text-xs font-bold transition-colors ${f.budgetTier === t.key ? 'border-red-600 bg-red-600 text-white' : 'border-white/10 text-white/65 hover:border-white/25'}`}>{t.label}</button>
              ))}
            </div>
          </Module>

          <Module no="05" title="Script & creative materials depot">
            <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
              className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-white/20 bg-black/30 px-6 py-10 text-center hover:border-white/40">
              <FiUploadCloud className="text-3xl text-red-500" />
              <p className="mt-3 text-sm font-bold uppercase tracking-wide">Drop shooting script, pitch deck or lookbook</p>
              <p className="mt-1 text-xs text-white/45">{exts.map((x) => x.toUpperCase()).join(', ')} up to {maxMb} MB per document, {options?.files?.maxCount ?? 5} files max</p>
              <span className="mt-4 rounded-md bg-white/[0.07] px-4 py-2 text-[11px] font-bold uppercase tracking-wider">Select files</span>
              <input type="file" multiple className="hidden" accept={exts.map((x) => `.${x}`).join(',')} disabled={!!up} onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
            </label>
            {up && <div className="mt-3"><p className="text-xs text-white/60">Uploading {up.name}… {up.pct}%</p><div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-red-600 transition-all" style={{ width: `${up.pct}%` }} /></div></div>}
            <ul className="mt-4 space-y-2">
              {srv.files.map((x) => (
                <li key={x.id} className="flex items-center gap-3 rounded-lg bg-black/30 p-3">
                  <FiFileText className="shrink-0 text-red-500" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{x.name}</p><p className="text-[11px] text-white/40">{(x.sizeBytes / 1048576).toFixed(1)} MB • stored privately</p></div>
                  <button aria-label={`Remove ${x.name}`} onClick={() => removeFile(x.id)} className="text-white/40 hover:text-red-400"><FiTrash2 /></button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-3 rounded-lg border border-red-600/30 bg-red-600/[0.06] p-4">
              <FiLock className="mt-0.5 shrink-0 text-red-400" />
              <p className="text-xs leading-relaxed text-white/60"><b className="text-white/85">Mutual non-disclosure agreement.</b> {options?.nda?.scriptPrivacyText}</p>
            </div>
          </Module>

          <Module no="06" title="Executive director & producer notes">
            <textarea rows={4} className={input.replace('mt-2 ', '')} placeholder="Co-finance status, schedule pressure, key hires you need, anything our producers should know." value={f.producerNotes} onChange={(e) => set('producerNotes', e.target.value)} maxLength={3000} />
          </Module>

          <div>
            {ndaNeeded && (
              <label className="mb-4 flex items-start gap-3 text-sm text-white/70">
                <input type="checkbox" className="mt-1" checked={nda} onChange={(e) => setNda(e.target.checked)} />
                I accept the mutual NDA and agree that my brief is submitted under its terms.
              </label>
            )}
            {srv.completeness.missing.length > 0 && <p className="mb-3 text-xs text-amber-300">Still needed: {srv.completeness.missing.join(', ')}</p>}
            {save.state === 'error' && <p className="mb-3 text-xs text-red-300">Not saved: {save.error}. Fix it to continue.</p>}
            <div className="flex flex-wrap items-center gap-3">
              <Btn onClick={submit} disabled={!ready || submitting || !!up} arrow>{submitting ? 'Submitting…' : 'Submit production brief & initiate review'}</Btn>
              <Btn variant="dark" onClick={copyResume}><FiLink /> Save draft & link</Btn>
            </div>
            <p className="mt-3 text-xs text-white/40">Producer review and a preliminary response within {options?.sla?.reviewDays ?? 2} business days.</p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="border-t-2 border-t-red-600 p-6">
            <p className={`${mono} text-white/45`}>Brief dossier summary</p>
            <h2 className="mt-1 text-xl font-bold uppercase">Real-time scope</h2>
            <dl className="mt-5 space-y-2.5 text-xs">
              {[
                ['Project name', f.projectTitle || '—'],
                ['Format target', options?.projectCategories.find((c) => c.key === f.format)?.label ?? '—'],
                ['Pipeline stage', options?.pipelineStages.find((p) => p.key === f.pipelineStage)?.label ?? '—'],
                ['Active modules', srv.services.length],
                ['Staged crew headcount', crewCount],
                ['Window', f.targetStart || '—'],
                ['Budget envelope', tier?.label ?? '—'],
              ].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-white/45">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
            </dl>
            <div className="mt-5">
              <div className="flex justify-between"><span className={`${mono} text-white/45`}>Brief completeness</span><span className="text-xs font-bold text-red-400">{srv.completeness.percent}%</span></div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-red-600 transition-all" style={{ width: `${srv.completeness.percent}%` }} /></div>
              <p className="mt-2 text-[11px] text-white/40">{{ idle: 'Autosave on', saving: 'Saving…', saved: 'All changes saved', error: 'Not saved' }[save.state]}</p>
            </div>
            <div className="mt-5 rounded-lg border border-red-600/30 bg-red-600/[0.06] p-3 text-[11px] leading-relaxed text-white/60"><b className="text-red-300">Studio confidentiality standard.</b> Under the mutual NDA, your logline, screenplay and attachments are strictly locked from external exposure.</div>
          </Card>
          {phone && (
            <Card className="mt-4 p-5">
              <p className={`${mono} text-white/40`}>Need immediate assistance?</p>
              <p className="mt-2 text-xs text-white/55">If your shoot date is inside 30 days, call the production desk directly.</p>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-400"><FiPhone /> {phone}</a>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}