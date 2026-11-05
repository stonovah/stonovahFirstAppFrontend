import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowRight, FiCheck, FiGrid, FiLayers, FiLink, FiPhone, FiX } from 'react-icons/fi';
import * as P from '../../api/production';
import { useProduction } from './ProductionContext';
import { STAGE_NO, ngn, useProdData, usePageTitle } from './ProdLive';
import { Breadcrumb, Btn, Card, ErrorBox, Loading } from './ProdUi';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';

function Pill({ active, onClick, children, disabled }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className={`rounded-md border px-4 py-2.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active ? 'border-red-600 bg-red-600 text-white' : 'border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25'}`}>
      {children}
    </button>
  );
}

function ServiceCard({ s, selected, locked, busy, onToggle }) {
  return (
    <div role="button" tabIndex={locked ? -1 : 0} onClick={() => !locked && !busy && onToggle()}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !locked && !busy) { e.preventDefault(); onToggle(); } }}
      className={`rounded-xl border p-5 transition-colors ${locked ? 'cursor-default' : 'cursor-pointer'} ${selected ? 'border-red-600/70 bg-red-600/[0.06]' : 'border-white/[0.07] bg-[#161616] hover:border-white/25'}`}>
      <div className="flex items-start gap-4">
        <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded ${selected ? 'bg-red-600' : 'border border-white/20'}`}>{selected && <FiCheck className="text-xs" />}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-base font-bold">{s.name}</h3>
            {s.leadTimeLabel && <span className={`${mono} text-white/40`}>Lead time {s.leadTimeLabel}</span>}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-white/55">{s.shortDescription}</p>
          <Link to={`/production/services/${s.slug}`} onClick={(e) => e.stopPropagation()} className="mt-3 inline-block text-[11px] font-semibold text-white/60 hover:text-white">View details →</Link>
        </div>
      </div>
    </div>
  );
}

export default function ProductionBuildPackage() {
  usePageTitle('Build Your Package | Stonovah Production');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { options, pkg, has, addService, removeService, clearPackage, updatePackage, adoptPackage } = useProduction();
  const { data, loading, error, reload } = useProdData(() => P.getServices(), []);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = params.get('package');
    if (t) adoptPackage(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mode = pkg?.mode ?? 'MODULAR';
  const full = mode === 'FULL';
  const stages = data?.stages ?? [];
  const items = pkg?.items ?? [];
  const est = pkg?.estimate;
  const phone = options?.hotlinePhone;

  const run = async (fn) => { setBusy(true); await fn(); setBusy(false); };
  const switchMode = (m) => {
    if (m === mode) return;
    if (items.length && !window.confirm(m === 'FULL' ? 'The Full Package replaces the individual services in your package. Continue?' : 'This removes the Full Package so you can pick individual services. Continue?')) return;
    run(() => updatePackage({ mode: m }));
  };
  const toggle = (s) => run(() => (has(s.id) ? removeService(s.id) : addService(s.id)));
  const copyLink = async () => {
    if (!pkg?.token) return toast.error('Add a service first, then you can save your package.');
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/production/build-package?package=${pkg.token}`);
      toast.success('Package link copied');
    } catch { toast.error('Could not copy the link'); }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-6">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Production', to: '/production' }, { label: 'Build Your Package' }]} />
      <div className="mt-10">
        <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Production configurator // modular studio engine
        </span>
        <h1 className="mt-5 text-5xl font-black uppercase tracking-tight sm:text-7xl">Build your <span className="text-[#e10613]">package</span></h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60">Select an end-to-end turnkey production team or customize your exact scope across our full script-to-screen pipeline. Your selections carry straight to your executive intake brief.</p>
      </div>

      {/* deployment structure */}
      <Card className="mt-10 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`${mono} text-white/45`}>Execution model</p>
            <h2 className="mt-1 text-xl font-bold">Select deployment structure</h2>
          </div>
          <div className="flex gap-1 rounded-lg bg-black/40 p-1">
            {[['FULL', 'Full Package', 'Turnkey all-inclusive', FiLayers], ['MODULAR', 'Choose What You Need', 'Modular à la carte', FiGrid]].map(([k, t, sub, I]) => (
              <button key={k} disabled={busy} onClick={() => switchMode(k)} className={`flex items-center gap-3 rounded-md px-4 py-2.5 text-left transition-colors ${mode === k ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                <I className="text-red-500" />
                <span><span className="block text-xs font-bold">{t}</span><span className="block text-[10px] text-white/45">{sub}</span></span>
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 rounded-lg border-l-2 border-red-600/60 bg-black/30 p-4 text-sm text-white/60">
          {full ? 'Full Package active. Every pipeline stage is covered by one team, one plan and one schedule.' : 'Modular à la carte mode active. Toggle specific pipeline items to suit your current development state, post workflows or shooting schedule.'}
        </p>
      </Card>

      {/* steps 1 and 2 */}
      {options && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <p className={`${mono} text-white/45`}>Step 1</p>
            <h2 className="mt-1 text-lg font-bold">Project type & distribution format</h2>
            <p className={`${mono} mt-5 text-white/40`}>Project category</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {options.projectCategories.map((c) => <Pill key={c.key} active={pkg?.category === c.key} onClick={() => updatePackage({ category: c.key })}>{c.label}</Pill>)}
            </div>
            <p className={`${mono} mt-5 text-white/40`}>Delivery format & master spec</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {options.deliveryFormats.map((d) => (
                <button key={d.key} onClick={() => updatePackage({ deliveryFormat: d.key })}
                  className={`rounded-lg border p-3 text-left transition-colors ${pkg?.deliveryFormat === d.key ? 'border-red-600 bg-red-600/10' : 'border-white/10 hover:border-white/25'}`}>
                  <p className="text-xs font-bold">{d.label}</p>
                  <p className="mt-0.5 text-[11px] text-white/45">{d.detail}</p>
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div><p className={`${mono} text-white/45`}>Step 2 (optional)</p><h2 className="mt-1 text-lg font-bold">Where are you now?</h2></div>
            </div>
            <p className="mt-2 text-xs text-white/50">Tell us where your project stands today so our producers can calibrate your intake scope.</p>
            <div className="mt-4 space-y-2">
              {options.pipelineStages.map((st) => (
                <button key={st.key} onClick={() => updatePackage({ pipelineStage: st.key })}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${pkg?.pipelineStage === st.key ? 'border-red-600 bg-red-600/10' : 'border-white/10 hover:border-white/25'}`}>
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${pkg?.pipelineStage === st.key ? 'border-red-500' : 'border-white/30'}`}>{pkg?.pipelineStage === st.key && <span className="h-2 w-2 rounded-full bg-red-500" />}</span>
                  <span><span className="block text-xs font-bold">{st.label}</span><span className="block text-[11px] text-white/45">{st.detail}</span></span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* matrix and summary */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <p className={`${mono} text-red-400`}>● Pipeline matrix</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Service selection by production phase</h2>
            <span className={`${mono} hidden text-white/35 sm:block`}>Click card or toggle to add/remove</span>
          </div>
          {loading && <Loading />}
          {error && <ErrorBox message={error} onRetry={reload} />}
          {data && !stages.length && <p className="mt-8 rounded-lg border border-white/10 p-6 text-sm text-white/55">The service catalogue is not published yet. Please check back soon, or <Link to="/production/request" className="underline">send us your brief directly</Link>.</p>}

          {stages.map((s) => (
            <section key={s.stage} className="mt-8">
              <div className="flex items-center gap-3">
                <span className={`${mono} text-white/40`}>{s.stage === 'CROSS' ? 'Cross-pipeline' : `Phase 0${STAGE_NO[s.stage]}`}</span>
                <h3 className="text-lg font-bold">{s.stage === 'CROSS' ? 'Legal, Finance & Governance' : s.label}</h3>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="mt-4 space-y-3">
                {s.services.map((sv) => <ServiceCard key={sv.id} s={sv} selected={full || has(sv.id)} locked={full} busy={busy} onToggle={() => toggle(sv)} />)}
              </div>
            </section>
          ))}
          {full && stages.length > 0 && <p className="mt-6 text-xs text-white/45">Every service is included in the Full Package. Switch to “Choose What You Need” to pick individual services.</p>}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="border-t-2 border-t-red-600 p-6">
            <div className="flex items-start justify-between">
              <div><p className={`${mono} text-white/45`}>Summary dossier</p><h2 className="mt-1 text-2xl font-bold">My Package</h2></div>
              <span className="rounded bg-red-600 px-2 py-1 font-mono text-[9px] font-bold">{items.length} selected</span>
            </div>

            <div className="mt-5 rounded-lg bg-black/40 p-4">
              <p className={`${mono} text-white/35`}>Target configuration</p>
              <p className="mt-2 text-xs text-white/75">
                {[options?.projectCategories.find((c) => c.key === pkg?.category)?.label, options?.deliveryFormats.find((d) => d.key === pkg?.deliveryFormat)?.label, options?.pipelineStages.find((p) => p.key === pkg?.pipelineStage)?.label].filter(Boolean).join(' • ') || 'Choose a category, format and stage above'}
              </p>
            </div>

            <p className={`${mono} mt-5 text-white/40`}>Selected pipeline modules</p>
            <ul className="mt-3 space-y-2">
              {items.map((i) => (
                <li key={i.serviceId} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2.5">
                  <div className="min-w-0"><p className="truncate text-xs font-semibold">{i.name}</p><p className="text-[10px] text-white/40">{i.scopeOption?.label ?? i.stageLabel}</p></div>
                  <button aria-label={`Remove ${i.name}`} onClick={() => run(() => removeService(i.serviceId))} className="text-white/40 hover:text-white"><FiX /></button>
                </li>
              ))}
              {!items.length && <li className="text-xs text-white/40">Nothing selected yet.</li>}
            </ul>
            {items.length > 0 && <button onClick={() => window.confirm('Clear your whole package?') && run(clearPackage)} className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white">Clear all</button>}

            <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs">
              {est?.fromKobo ? <div className="flex justify-between gap-3"><dt className="text-white/45">Indicative from</dt><dd className="font-bold">{ngn(est.fromKobo, { full: true })}</dd></div> : null}
              <div className="flex justify-between gap-3"><dt className="text-white/45">Pricing</dt><dd className="text-right font-semibold">{est?.fromKobo ? (est.quoteOnRequestCount ? `+ quote for ${est.quoteOnRequestCount} item(s)` : 'Final price in proposal') : 'Quote on request'}</dd></div>
              {est?.longestLeadTimeDays ? <div className="flex justify-between gap-3"><dt className="text-white/45">Longest lead time</dt><dd className="font-semibold">~{est.longestLeadTimeDays} days</dd></div> : null}
              <div className="flex justify-between gap-3"><dt className="text-white/45">NDA</dt><dd className="font-semibold">Mutual NDA on submission</dd></div>
            </dl>

            <Btn onClick={() => navigate('/production/request')} arrow className="mt-6 w-full">Continue to request brief</Btn>
            <p className="mt-3 text-center text-[11px] text-white/40">Your selections carry into the production intake form. The estimate is indicative, not a quote.</p>
            <button onClick={copyLink} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-white/10 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white/70 hover:border-white/30"><FiLink /> Save package / copy link</button>
          </Card>
          {phone && (
            <Card className="mt-4 p-5 text-center">
              <p className={`${mono} text-white/40`}>Need custom advisory?</p>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold"><FiPhone className="text-red-500" /> Call our studio desk at {phone}</a>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}