import { Link, Outlet } from 'react-router-dom';
import { ErrorBox } from './ProdUi';

export function LinkGone({ message }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <ErrorBox message={message ?? 'This link is no longer valid or has expired. Please contact the production desk for a new one.'} />
      <Link to="/production" className="mt-4 inline-block text-xs underline text-white/60">Visit Stonovah Production</Link>
    </div>
  );
}

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <div className="border-b border-white/5 bg-black/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <span className="flex items-center gap-2 rounded bg-red-600/20 px-2.5 py-1.5 font-mono text-[9px] font-bold tracking-[0.16em] text-red-400">
            <span className="h-1 w-1 rounded-full bg-red-500" /> STONOVAH PRODUCTION
          </span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Private client link</span>
        </div>
      </div>
      <main><Outlet /></main>
      <p className="px-5 py-10 text-center text-xs text-white/35">© {new Date().getFullYear()} Stonovah Creative House Limited. This page is private to you. Please do not share the link.</p>
    </div>
  );
}