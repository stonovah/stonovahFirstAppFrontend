import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiAward, FiFilm } from 'react-icons/fi';
import * as P from '../../api/production';
import { FORMAT_LABEL, useProdData, usePageTitle } from './ProdLive';
import { Breadcrumb, Btn, Chip, EmptyState, ErrorBox, Loading, Reveal } from './ProdUi';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';

export function ProjectCard({ p, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <Link to={`/production/projects/${p.slug}`} className="group block h-full overflow-hidden rounded-xl border border-white/[0.07] bg-[#161616] hover:border-white/20">
        <div className="relative h-52 bg-[linear-gradient(135deg,#2a0508,#0f0f0f_70%)]">
          {p.coverUrl ? <img src={p.coverUrl} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <FiFilm className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl text-white/[0.06]" />}
          <Chip className="absolute left-3 top-3">{[FORMAT_LABEL[p.format], p.categoryTag].filter(Boolean).join(' // ')}</Chip>
          {p.year && <Chip className="absolute right-3 top-3">{p.year}</Chip>}
        </div>
        <div className="p-5">
          <p className={`${mono} text-white/40`}>{[p.runtimeLabel, p.location].filter(Boolean).join(' • ') || ' '}</p>
          <h3 className="mt-2 text-xl font-bold">{p.title}</h3>
          {p.logline && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/55">{p.logline}</p>}
          {p.highlight && <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-red-400"><FiAward className="shrink-0" /> {p.highlight}</p>}
          <p className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/75 group-hover:text-white">View project case study <FiArrowRight className="text-red-500" /></p>
        </div>
      </Link>
    </Reveal>
  );
}

const Pill = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`rounded-md border px-4 py-2 text-xs font-bold transition-colors ${active ? 'border-red-600 bg-red-600 text-white' : 'border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25'}`}>{children}</button>
);

export default function ProductionProjects() {
  usePageTitle('Past Productions | Stonovah Production');
  const [type, setType] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [facets, setFacets] = useState({ years: [], formats: [] });
  const { data, loading, error, reload } = useProdData(
    () => P.getPastProductions({ page, limit: 12, type: type || undefined, year: year || undefined }),
    [page, type, year]
  );
  useEffect(() => { if (data?.facets && !type && !year) setFacets(data.facets); }, [data, type, year]);

  const items = data?.data ?? [];
  const pages = data?.meta?.pages ?? 1;
  const filtered = !!(type || year);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-6">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Production', to: '/production' }, { label: 'Projects' }]} />
      <div className="mt-10">
        <p className={`${mono} flex items-center gap-2 text-red-400`}><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Proven portfolio track record</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Past Productions</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60">Case studies from the films, series and commercials we have packaged, produced and delivered.</p>
      </div>

      {(facets.formats.length > 1 || facets.years.length > 1) && (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Pill active={!type} onClick={() => { setType(''); setPage(1); }}>All</Pill>
          {facets.formats.map((f) => <Pill key={f.format} active={type === f.format} onClick={() => { setType(f.format); setPage(1); }}>{FORMAT_LABEL[f.format] ?? f.format} ({f.count})</Pill>)}
          {facets.years.length > 1 && (
            <Select
                value={year}
                onChange={(v) => { setYear(v); setPage(1); }}
                className="ml-auto w-36"
                options={[
                    { value: '', label: 'All years' },
                    ...facets.years.map((y) => ({ value: String(y.year), label: String(y.year) })),
                ]}
            />
          )}
        </div>
      )}

      <div className="mt-8">
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && !items.length && (
          <EmptyState icon={FiFilm} title={filtered ? 'No productions match these filters' : 'No productions published yet'}
            message={filtered ? 'Try a different format or year.' : 'Case studies from our completed work will appear here.'}
            action={filtered ? <Btn variant="ghost" onClick={() => { setType(''); setYear(''); setPage(1); }}>Clear filters</Btn> : <Btn to="/production/request" variant="ghost" arrow>Start your project</Btn>} />
        )}
        {items.length > 0 && <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((p, i) => <ProjectCard key={p.slug} p={p} delay={(i % 3) * 0.05} />)}</div>}
        {pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <Btn variant="ghost" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>Previous</Btn>
            <span className="text-xs text-white/50">Page {page} of {pages}</span>
            <Btn variant="ghost" disabled={page >= pages} onClick={() => setPage((n) => n + 1)}>Next</Btn>
          </div>
        )}
      </div>
    </div>
  );
}