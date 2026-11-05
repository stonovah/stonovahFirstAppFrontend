import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowRight, FiAward, FiPlay, FiX } from 'react-icons/fi';
import * as P from '../../api/production';
import { FORMAT_LABEL, useProdData, usePageTitle } from './ProdLive';
import { Breadcrumb, Btn, Card, Chip, ErrorBox, Eyebrow, Loading } from './ProdUi';
import { ProjectCard } from './ProductionProjects';

const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';

function Lightbox({ items, index, onClose, onMove }) {
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') onMove(1); if (e.key === 'ArrowLeft') onMove(-1); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose, onMove]);
  const m = items[index];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button aria-label="Close" className="absolute right-5 top-5 text-3xl" onClick={onClose}><FiX /></button>
      <figure onClick={(e) => e.stopPropagation()} className="max-h-full max-w-5xl">
        <img src={m.url} alt={m.caption ?? ''} className="max-h-[80vh] w-auto rounded-lg object-contain" />
        {(m.caption || m.meta) && <figcaption className="mt-3 text-center text-sm text-white/70">{[m.caption, m.meta].filter(Boolean).join(' • ')}</figcaption>}
      </figure>
      {items.length > 1 && (
        <>
          <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); onMove(-1); }} className="absolute left-4 top-1/2 rounded bg-white/10 px-3 py-2 text-xl">‹</button>
          <button aria-label="Next" onClick={(e) => { e.stopPropagation(); onMove(1); }} className="absolute right-4 top-1/2 rounded bg-white/10 px-3 py-2 text-xl">›</button>
        </>
      )}
    </div>
  );
}

function Page({ p }) {
  const [box, setBox] = useState(null);
  const gallery = p.media ?? [];
  const move = (d) => setBox((i) => (i === null ? i : (i + d + gallery.length) % gallery.length));
  const facts = [
    ['Year', p.year], ['Format', FORMAT_LABEL[p.format]], ['Runtime', p.runtimeLabel], ['Shoot days', p.shootDays ? `${p.shootDays} days` : null],
    ['Location', p.location], ['Client', p.clientName],
  ].filter(([, v]) => v);

  return (
    <>
      <section className="relative border-b border-white/5">
        {p.coverUrl && <img src={p.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/40" />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-6">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Production', to: '/production' }, { label: 'Projects', to: '/production/projects' }, { label: p.title }]} />
          <div className="mt-24 max-w-3xl">
            <Chip>{[FORMAT_LABEL[p.format], p.categoryTag].filter(Boolean).join(' // ')}</Chip>
            <h1 className="mt-5 text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">{p.title}</h1>
            {p.logline && <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70">{p.logline}</p>}
            {p.trailer?.url && (
              <div className="mt-8">
                <Btn href={p.trailer.url} target="_blank" rel="noreferrer"><FiPlay /> Watch trailer{p.trailer.timecode && p.trailer.timecode !== '00:00:00' ? ` (from ${p.trailer.timecode})` : ''}</Btn>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_320px]">
          <div>
            {p.highlight && <p className="flex items-center gap-2 text-sm font-semibold text-red-400"><FiAward /> {p.highlight}</p>}
            {p.laurels?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {p.laurels.map((l) => <span key={l.label} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold"><FiAward className="text-red-500" /> {l.label}</span>)}
              </div>
            )}
            {p.testimonial && (
              <Card className="mt-8 p-7">
                <p className={`${mono} text-red-400`}>Client testimonial</p>
                <blockquote className="mt-4 text-lg leading-relaxed text-white/85">“{p.testimonial.quote}”</blockquote>
                {(p.testimonial.author || p.testimonial.role) && <p className="mt-4 text-sm text-white/55"><b className="text-white">{p.testimonial.author}</b>{p.testimonial.role ? `, ${p.testimonial.role}` : ''}</p>}
              </Card>
            )}
          </div>
          <Card className="h-fit p-6">
            <p className={`${mono} text-white/45`}>Production facts</p>
            <dl className="mt-4 divide-y divide-white/5">
              {facts.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5 text-xs"><dt className="text-white/50">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
            </dl>
          </Card>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-[#0d0d0d] py-14">
          <div className="mx-auto max-w-7xl px-5">
            <Eyebrow>Production stills & media</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Gallery</h2>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              {gallery.map((m, i) => (
                <button key={m.id} onClick={() => setBox(i)} className="group relative aspect-video overflow-hidden rounded-lg bg-white/5">
                  <img src={m.url} alt={m.caption ?? ''} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {m.caption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left text-[11px] font-semibold">{m.caption}</span>}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {p.services?.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-5">
            <Eyebrow>Delivered by Stonovah</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Services provided</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {p.services.map((s) => <Link key={s.slug} to={`/production/services/${s.slug}`} className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold hover:border-white/30">{s.name} <FiArrowRight className="ml-1 inline text-red-500" /></Link>)}
            </div>
          </div>
        </section>
      )}

      {p.related?.length > 0 && (
        <section className="bg-[#0d0d0d] py-14">
          <div className="mx-auto max-w-7xl px-5">
            <h2 className="text-3xl font-bold tracking-tight">More {FORMAT_LABEL[p.format] ?? 'productions'}</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">{p.related.map((r, i) => <ProjectCard key={r.slug} p={r} delay={i * 0.05} />)}</div>
          </div>
        </section>
      )}

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">Have a project like this?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">Tell us about your script, shoot or campaign and a producer will respond with next steps.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3"><Btn to="/production/request" arrow>Request a production service</Btn><Btn to="/production/projects" variant="ghost">Back to all projects</Btn></div>
        </div>
      </section>

      {box !== null && <Lightbox items={gallery} index={box} onClose={() => setBox(null)} onMove={move} />}
    </>
  );
}

export default function ProductionProjectDetail() {
  const { slug } = useParams();
  const { data, loading, error, reload } = useProdData(() => P.getPastProduction(slug), [slug]);
  usePageTitle(data ? `${data.title} | Stonovah Production` : undefined);
  if (loading) return <Loading />;
  if (error || !data) return <div className="mx-auto max-w-3xl px-5 py-20"><ErrorBox message={error ?? 'Production not found'} onRetry={reload} /><Link to="/production/projects" className="mt-4 inline-block text-xs underline">Back to projects</Link></div>;
  return <Page key={data.slug} p={data} />;
}