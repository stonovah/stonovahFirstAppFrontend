import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFileText, FiInbox, FiClock, FiFilm, FiCheckCircle, FiUsers, FiArrowRight } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal, CountUp, Bar } from '../ui';
import { useLoad, ErrorLine } from '../adminBits';
import { ago } from '../adminLive';
import { adminProductionApi as A } from '../../../api/adminProduction';
import { useProdAccess } from './useProdAccess';
import { ngn, mono, REQ_STATUS, STAGE_LABEL, FORMAT_LABEL, budgetText } from './prodAdmin';
import { Select } from '../ui2';

const COLORS = ['#e10613', '#f59e0b', '#a3a3a3', '#38bdf8', '#34d399'];

function Kpi({ i, icon: Icon, label, value, sub, badge, badgeTone = 'green', to }) {
  const body = (
    <Card index={i} hover className="h-full space-y-3 p-5">
      <div className="flex items-center justify-between">
        <span className={`${mono} text-[9px] text-white/45`}>{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-red-500"><Icon /></span>
      </div>
      <div className="flex items-end gap-2">
        <b className="text-4xl font-black leading-none"><CountUp value={value ?? 0} /></b>
        {badge && <Pill tone={badgeTone}>{badge}</Pill>}
      </div>
      <p className="text-[11px] leading-snug text-white/50">{sub}</p>
    </Card>
  );
  return to ? <Link to={to} className="block">{body}</Link> : body;
}

const tick = (s) => {
  if (/^\d{4}-\d{2}$/.test(s)) return new Date(`${s}-01`).toLocaleString('en-GB', { month: 'short' });
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short' });
  return s;
};

function TrendChart({ t }) {
  const W = 640, H = 230, P = { l: 30, r: 12, t: 12, b: 26 };
  const top = Math.max(2, Math.ceil(Math.max(0, ...t.series.flatMap((s) => s.values))));
  const n = t.labels.length;
  const x = (i) => P.l + (n <= 1 ? 0 : (i * (W - P.l - P.r)) / (n - 1));
  const y = (v) => H - P.b - (v / top) * (H - P.t - P.b);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Requests over time">
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={P.l} x2={W - P.r} y1={y(top * f)} y2={y(top * f)} stroke="#fff" strokeOpacity="0.07" />
          <text x={P.l - 6} y={y(top * f) + 3} textAnchor="end" fontSize="9" fill="#fff" fillOpacity="0.4">{Math.round(top * f)}</text>
        </g>
      ))}
      {t.labels.map((l, i) => <text key={l} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#fff" fillOpacity="0.45">{tick(l)}</text>)}
      {t.series.map((s, k) => (
        <g key={s.slug}>
          <polyline fill="none" stroke={COLORS[k % COLORS.length]} strokeWidth="2.2" points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
          {s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={COLORS[k % COLORS.length]} />)}
        </g>
      ))}
    </svg>
  );
}

function StageModal({ stage, onClose }) {
  const d = useLoad(() => A.stageProjects(stage), [stage]);
  return (
    <Modal open onClose={onClose} width="max-w-3xl">
      <div className="space-y-4 p-6">
        <div className="pr-10">
          <p className={`${mono} text-red-400`}>Pipeline stage</p>
          <h2 className="mt-1 text-2xl font-black">{STAGE_LABEL[stage]}</h2>
          {d.data && <p className="mt-1 text-xs text-white/50">{d.data.count} project(s) • {ngn(d.data.contractKobo)} contracted</p>}
        </div>
        <ErrorLine>{d.error}</ErrorLine>
        {!d.data && !d.error && <p className="font-mono text-xs font-bold">LOADING…</p>}
        {d.data && !d.data.projects.length && <p className="text-sm text-white/45">No active projects in this stage.</p>}
        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
          {d.data?.projects.map((p) => (
            <Link key={p.id} to={`/admin/production/projects/${p.id}`} className="block rounded-lg bg-neutral-900 p-3 transition hover:bg-neutral-800">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><b className="block truncate text-sm">{p.title}</b><span className="text-[11px] text-white/45">{p.reference} • {p.clientName}{p.pmEmail ? ` • PM ${p.pmEmail}` : ''}</span></div>
                <div className="shrink-0 text-right"><b className="text-sm">{ngn(p.contractKobo)}</b>{p.status === 'ON_HOLD' && <Pill tone="amber" className="ml-2">On hold</Pill>}</div>
              </div>
              <div className="mt-2"><Bar percent={p.progressPct} /></div>
            </Link>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function ProdOverview() {
  const { can } = useProdAccess();
  const [days, setDays] = useState(30);
  const [iv, setIv] = useState('monthly');
  const [stage, setStage] = useState(null);
  const o = useLoad(() => A.overview(days), [days]);
  const t = useLoad(() => A.trend(iv), [iv]);
  const latest = useLoad(() => A.requests({ limit: 5 }));

  const c = o.data?.cards;
  const pk = o.data?.packages;
  const change = c?.newRequests.changePct;

  return (
    <>
      <PageHeader eyebrow="ENTERPRISE PRODUCTION CONSOLE" title="Production Management & Intelligence" desc="Intake tracking, script-to-screen pipeline velocity and crew sourcing across the Production arm.">
        <Select
        value={days}
        onChange={setDays}
        className="w-40"
        options={[
            { value: 7, label: 'Last 7 days' },
            { value: 30, label: 'Last 30 days' },
            { value: 90, label: 'Last 90 days' },
        ]}
        />
        <Link to="/admin/production/past"><Btn variant="soft"><FiPlus /> Add Past Production</Btn></Link>
        {can.finance && <Link to="/admin/production/proposals"><Btn><FiFileText /> Create Proposal</Btn></Link>}
      </PageHeader>
      <ErrorLine>{o.error}</ErrorLine>

      {c && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Kpi i={0} icon={FiInbox} label="New requests" value={c.newRequests.open} to="/admin/production/requests?status=NEW"
            badge={change == null ? null : `${change > 0 ? '+' : ''}${change}%`} badgeTone={change != null && change < 0 ? 'amber' : 'green'}
            sub={`${c.newRequests.unassigned} unassigned • ${c.newRequests.inPeriod} received in the last ${days} days`} />
          <Kpi i={1} icon={FiClock} label="Awaiting proposal" value={c.awaitingProposal.count} to="/admin/production/requests"
            sub={`${ngn(c.awaitingProposal.budgetFloorKobo)} minimum pipeline value`} />
          <Kpi i={2} icon={FiFilm} label="Active projects" value={c.activeProjects.count} to="/admin/production/projects" sub={`${c.activeProjects.inShoot} in principal photography`} />
          <Kpi i={3} icon={FiCheckCircle} label="Delivered this year" value={c.deliveredThisYear.count} to="/admin/production/projects?status=COMPLETED"
            sub={`${ngn(c.deliveredThisYear.contractKobo)} contract value`} />
          <Kpi i={4} icon={FiUsers} label="Cast & crew slates" value={c.crewCast.openDossiers} to="/admin/production/sourcing"
            badge={c.crewCast.dropoutAlerts ? `${c.crewCast.dropoutAlerts} dropout` : null} badgeTone="red" sub={`${c.crewCast.rolesInVetting} roles in vetting`} />
        </div>
      )}

      {o.data && (
        <Card index={2} className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><span className={`${mono} text-white/45`}>Script-to-screen pipeline distribution</span> <Pill>{o.data.pipeline.total} active in funnel</Pill></div>
            <span className="text-[11px] text-white/40">Click a stage to inspect its projects</span>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {o.data.pipeline.stages.map((s, i) => (
              <button key={s.stage} type="button" onClick={() => setStage(s.stage)}
                className={`cursor-pointer rounded-xl border bg-neutral-900 p-4 text-left transition hover:border-white/30 ${s.stage === 'SHOOT' && s.count ? 'border-red-600/60' : 'border-white/[0.07]'}`}>
                <div className="flex items-center justify-between"><span className={`${mono} text-[9px] text-white/50`}>0{i + 1}. {STAGE_LABEL[s.stage]}</span><Pill>{s.sharePct}%</Pill></div>
                <p className="mt-3 text-3xl font-black">{s.count} <span className="text-sm font-semibold text-white/50">projects</span></p>
                <div className="mt-3"><Bar percent={s.sharePct} /></div>
                <p className="mt-2 text-[11px] font-bold text-white/60">{ngn(s.contractKobo)} contracted</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card index={3} className="space-y-3 p-5 xl:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-xl font-black">Production requests over time</h2><p className="text-[11px] text-white/45">Intake by project type</p></div>
            <div className="flex gap-1 rounded-lg bg-black/40 p-1">
              {['weekly', 'monthly', 'quarterly'].map((k) => (
                <button key={k} type="button" onClick={() => setIv(k)} className={`cursor-pointer rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${iv === k ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white'}`}>{k}</button>
              ))}
            </div>
          </div>
          <ErrorLine>{t.error}</ErrorLine>
          {t.data && t.data.total === 0 && <p className="py-14 text-center text-sm text-white/40">No requests in this range yet.</p>}
          {t.data && t.data.total > 0 && (
            <>
              <TrendChart t={t.data} />
              <div className="flex flex-wrap gap-4 text-[11px] text-white/65">
                {t.data.series.map((s, k) => <span key={s.slug} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[k % COLORS.length] }} />{s.name} ({s.values.reduce((a, b) => a + b, 0)})</span>)}
              </div>
            </>
          )}
        </Card>

        <div className="space-y-6 xl:col-span-5">
          {pk && (
            <Card index={4} className="space-y-3 p-5">
              <div className="flex items-start justify-between"><h2 className="text-xl font-black">Package selection</h2><span className={`${mono} text-white/45`}>{pk.total} briefs • last {days} days</span></div>
              <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
                <div className="bg-[#e10613]" style={{ width: `${pk.full.pct}%` }} />
                <div className="bg-white/30" style={{ width: `${pk.modular.pct}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-neutral-900 p-3"><span className="flex items-center gap-2 font-bold"><span className="h-2 w-2 rounded-full bg-[#e10613]" />Full turnkey</span><b className="mt-1 block text-lg">{pk.full.count} <span className="text-xs text-white/45">({pk.full.pct}%)</span></b></div>
                <div className="rounded-lg bg-neutral-900 p-3"><span className="flex items-center gap-2 font-bold"><span className="h-2 w-2 rounded-full bg-white/40" />À la carte</span><b className="mt-1 block text-lg">{pk.modular.count} <span className="text-xs text-white/45">({pk.modular.pct}%)</span></b></div>
              </div>
            </Card>
          )}
          {o.data && (
            <Card index={5} className="space-y-3 p-5">
              <div className="flex items-start justify-between"><h2 className="text-xl font-black">Most requested services</h2><span className={`${mono} text-white/45`}>Ranked intake</span></div>
              {!o.data.topServices.length && <p className="text-sm text-white/40">No requests in this period.</p>}
              {o.data.topServices.map((s) => (
                <div key={s.serviceId} className="space-y-1"><div className="flex justify-between text-xs"><span className="font-semibold">{s.name}</span><b>{s.count} <span className="text-white/45">({s.pct}%)</span></b></div><Bar percent={s.pct} /></div>
              ))}
            </Card>
          )}
        </div>
      </div>

      <Card index={6} className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h2 className="text-xl font-black">Latest production requests</h2><p className="text-[11px] text-white/45">Client briefs awaiting review and costing</p></div>
          <Link to="/admin/production/requests" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300">View all requests <FiArrowRight /></Link>
        </div>
        <ErrorLine>{latest.error}</ErrorLine>
        {latest.data && !latest.data.data.length && <p className="py-6 text-center text-sm text-white/40">No requests yet.</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <tbody>
              {latest.data?.data.map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="py-3 pr-3"><Link to={`/admin/production/requests/${r.id}`} className="block"><b className="block">{r.companyName || r.contactName}</b><span className="text-white/45">{r.contactName}</span></Link></td>
                  <td className="py-3 pr-3"><b className="block">{r.projectTitle}</b><span className="text-white/45">{FORMAT_LABEL[r.format] ?? '—'}</span></td>
                  <td className="py-3 pr-3 text-white/70">{r.services.slice(0, 2).join(', ')}{r.services.length > 2 ? ` +${r.services.length - 2}` : ''}</td>
                  <td className="py-3 pr-3 font-semibold">{budgetText(r)}</td>
                  <td className="py-3 pr-3 text-white/55">{ago(r.submittedAt)}</td>
                  <td className="py-3"><Pill tone={REQ_STATUS[r.status].tone}>{REQ_STATUS[r.status].label}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {stage && <StageModal stage={stage} onClose={() => setStage(null)} />}
    </>
  );
}