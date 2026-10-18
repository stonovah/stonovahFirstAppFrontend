// src/pages/admin/pages/ServiceRequests.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiSearch, FiUser, FiMail, FiPhone, FiHome, FiDownload, FiFileText, FiSave } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal } from '../ui';
import { Pagination, FormField, inputCls } from '../ui2';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';
import { useLoad, ErrorLine, humanize } from '../adminBits';
import { moneyK, fmtDate, ago, useDebounced } from '../adminLive';

const STATUS = { NEW: { label: 'New', tone: 'solid' }, IN_REVIEW: { label: 'In review', tone: 'amber' }, CONTACTED: { label: 'Contacted & quoted', tone: 'green' }, CLOSED: { label: 'Closed', tone: 'grey' } };
const PAGE = 15;

function Val({ v }) {
  if (Array.isArray(v)) return <ul className="list-disc pl-4 space-y-0.5">{v.map((x, i) => <li key={i}>{x && typeof x === 'object' ? <Val v={x} /> : String(x)}</li>)}</ul>;
  if (v && typeof v === 'object') return <div className="space-y-1">{Object.entries(v).filter(([, x]) => x !== null && x !== '').map(([k, x]) => <div key={k}><span className="text-neutral-500">{humanize(k)}: </span><Val v={x} /></div>)}</div>;
  if (typeof v === 'boolean') return <>{v ? 'Yes' : 'No'}</>;
  return <>{String(v)}</>;
}

function QuoteModal({ r, onClose, onDone }) {
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('14');
  const [note, setNote] = useState('');
  const [send, setSend] = useState(true);
  const [busy, setBusy] = useState(false);
  const amt = Number(amount);
  const errAmt = amount !== '' && !(amt > 0) ? 'Enter an amount above zero' : '';
  const errDays = !(Number.isInteger(Number(days)) && Number(days) >= 1 && Number(days) <= 90) ? '1 to 90 days' : '';
  const valid = amt > 0 && !errDays;

  const submit = async () => {
    setBusy(true);
    try {
      const res = await adminApi.serviceRequests.createQuote(r.id, { amount: amt, validityDays: Number(days), coverNote: note.trim() || undefined, sendEmail: send });
      if (send && !res.emailSent) toast.error('Quote saved, but the email could not be sent. Download the PDF and send it yourself.'); else toast.success(send ? 'Quote saved and emailed' : 'Quote saved');
      onDone();
    } catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };

  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-lg">
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-black font-sans pr-10">Quote V{(r.quotes?.length || 0) + 1}</h2>
        <p className="text-xs text-neutral-400">{r.serviceNeeded} • {r.contactName}{r.budgetRange ? ` • client budget: ${r.budgetRange}` : ''}</p>
        <FormField label="Proposed total (₦)" required error={errAmt}><input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} /></FormField>
        <FormField label="Valid for (days)" error={errDays}><input type="number" value={days} onChange={(e) => setDays(e.target.value)} className={inputCls} /></FormField>
        <FormField label="Cover note (optional)"><textarea rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} /></FormField>
        <label className="flex gap-2 text-xs cursor-pointer"><input type="checkbox" checked={send} onChange={(e) => setSend(e.target.checked)} className="mt-0.5 accent-red-600" />Email the quote PDF to {r.email}</label>
        <p className="text-[10px] text-neutral-500">The request moves to “Contacted & quoted” if it was new or in review. Every quote is kept, and nothing is overwritten.</p>
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!valid || busy} onClick={submit}>{busy ? 'Working…' : 'Save Quote'}</Btn></div>
      </div>
    </Modal>
  );
}

export default function ServiceRequests() {
  const [tab, setTab] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [selId, setSelId] = useState(null);
  const [note, setNote] = useState('');
  const [quoteOpen, setQuoteOpen] = useState(false);
  const search = useDebounced(q.trim());
  const list = useLoad(() => adminApi.serviceRequests.list({ status: tab, search, page, limit: PAGE }), [tab, search, page]);
  const admins = useLoad(() => adminApi.settings.admins());
  const detail = useLoad(() => (selId ? adminApi.serviceRequests.get(selId) : Promise.resolve(null)), [selId]);

  const rows = list.data?.data || [];
  const counts = list.data?.counts || {};
  const meta = list.data?.meta || { total: 0, pages: 1 };
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const r = detail.data;

  useEffect(() => { if (!selId && rows.length) setSelId(rows[0].id); }, [rows, selId]);

  const act = async (fn, msg) => { try { await fn(); if (msg) toast.success(msg); detail.reload(); list.reload(); } catch (e) { toast.error(apiErrorMessage(e)); } };
  const addNote = () => act(async () => { await adminApi.serviceRequests.addNote(selId, note.trim()); setNote(''); }, 'Note saved');
  const brief = r?.expandedBrief && typeof r.expandedBrief === 'object' ? Object.entries(r.expandedBrief).filter(([, v]) => v !== null && v !== '' && !(Array.isArray(v) && !v.length)) : [];

  return (
    <>
      <PageHeader eyebrow="CLIENT SERVICES INBOX" title="Service Requests Inbox" desc="Requests from the public Request a Service form. Assign them, record notes, and send quotes with a PDF." />

      <Card className="p-3 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex flex-wrap gap-2 flex-1">
          {[['', `All (${total})`], ...Object.entries(STATUS).map(([k, v]) => [k, `${v.label} (${counts[k] || 0})`])].map(([k, l]) => (
            <button key={k} type="button" onClick={() => { setTab(k); setPage(1); }} className={`text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition ${tab === k ? 'bg-red-600' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300'}`}>{l}</button>
          ))}
        </div>
        <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" /><input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, organization, email…" className={`${inputCls} pl-9 lg:w-80`} /></div>
      </Card>
      <ErrorLine>{list.error}</ErrorLine>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-3">
          {rows.map((x, i) => (
            <motion.button key={x.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} type="button" onClick={() => setSelId(x.id)}
              className={`w-full text-left bg-black text-white rounded-2xl p-4 space-y-1.5 font-mono shadow-xl cursor-pointer border-l-4 transition ${selId === x.id ? 'border-red-600 ring-1 ring-red-600' : 'border-neutral-700 hover:border-neutral-500'}`}>
              <div className="flex justify-between gap-2 text-[10px] font-bold"><span className="text-neutral-500">{ago(x.createdAt)}</span><Pill tone={STATUS[x.status].tone}>{STATUS[x.status].label}</Pill></div>
              <b className="text-base font-black font-sans leading-tight block">{x.serviceNeeded}</b>
              <span className="text-[11px] text-neutral-400 block">{x.contactName}{x.organization ? ` • ${x.organization}` : ''}</span>
              <span className="text-[10px] text-neutral-500 block">{x.assignedTo ? `Assigned to ${x.assignedTo.email}` : 'Unassigned'} • {x._count.quotes} quote(s) • {x._count.notes} note(s)</span>
            </motion.button>
          ))}
          {list.loading && !list.data && <p className="font-mono text-xs font-bold">LOADING…</p>}
          {list.data && !rows.length && <Card className="p-8 text-center text-sm text-neutral-400">No requests match.</Card>}
          {meta.pages > 1 && <div className="flex justify-center"><Pagination page={page} pages={meta.pages} onPage={setPage} /></div>}
        </div>

        {r && (
          <Card key={r.id} index={1} className="xl:col-span-8 p-5 space-y-5 border-t-2 border-t-red-600">
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <div className="space-y-2"><div className="flex flex-wrap gap-2 text-[10px] font-bold"><Pill tone="solid">REQ {String(r.id).slice(-8).toUpperCase()}</Pill><Pill>Received {fmtDate(r.createdAt)}</Pill></div><h2 className="text-3xl font-black font-sans leading-tight">{r.serviceNeeded}</h2></div>
              <div className="space-y-2 lg:w-72 shrink-0">
                <select value={r.status} onChange={(e) => act(() => adminApi.serviceRequests.setStatus(r.id, e.target.value), 'Status updated')} className={inputCls}>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>Status: {v.label}</option>)}</select>
                <select value={r.assignedTo?.id || ''} onChange={(e) => act(() => adminApi.serviceRequests.assign(r.id, e.target.value || null), 'Assignment updated')} className={inputCls}><option value="">Unassigned</option>{(admins.data || []).filter((a) => a.isActive).map((a) => <option key={a.id} value={a.id}>{a.email}</option>)}</select>
                <Btn className="w-full" onClick={() => setQuoteOpen(true)}><FiFileText /> New Quote (V{r.quotes.length + 1})</Btn>
              </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {[[FiUser, 'CONTACT', r.contactName], [FiMail, 'EMAIL', r.email], [FiPhone, 'PHONE', r.phone], [FiHome, 'ORGANIZATION', r.organization]].map(([Icon, k, v]) => (
                <div key={k} className="bg-neutral-900 rounded-lg p-3 min-w-0"><span className="text-[9px] text-neutral-500 font-bold flex items-center gap-1"><Icon />{k}</span><b className="text-xs break-all">{v || '—'}</b></div>
              ))}
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
              {[['EVENT TYPE', r.eventType], ['TARGET DATE', r.eventDate ? fmtDate(r.eventDate, false) : null], ['LOCATION', r.location], ['AUDIENCE', r.audienceSize], ['CLIENT BUDGET', r.budgetRange]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="bg-neutral-900 rounded-lg p-3"><span className="text-[9px] text-neutral-500 font-bold block">{k}</span><b>{v}</b></div>
              ))}
            </div>

            {r.message && <div className="bg-neutral-900 rounded-xl p-4"><span className="text-[9px] text-neutral-500 font-bold block mb-1">THE BRIEF</span><p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line">{r.message}</p></div>}

            {brief.length > 0 && (
              <div className="space-y-2"><h3 className="text-lg font-black font-sans">Detailed brief</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{brief.map(([k, v]) => <div key={k} className="bg-neutral-900 rounded-xl p-3 text-xs space-y-1"><span className="text-[9px] text-neutral-500 font-bold block">{humanize(k).toUpperCase()}</span><div className="text-neutral-200 leading-relaxed"><Val v={v} /></div></div>)}</div></div>
            )}

            {r.attachments?.length > 0 && (
              <div className="bg-neutral-900 rounded-xl p-4 space-y-2">
                <h3 className="text-lg font-black font-sans">Attachments ({r.attachments.length})</h3>
                {r.attachments.map((a) => (
                  <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 bg-neutral-950 hover:bg-neutral-800 rounded-lg px-3 py-2 text-xs transition">
                    <span className="truncate">{a.name}</span><FiDownload className="shrink-0" />
                  </a>
                ))}
              </div>
            )}
            
            <div className="bg-neutral-900 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center"><h3 className="text-lg font-black font-sans">Quotes ({r.quotes.length})</h3><Btn variant="soft" onClick={() => adminApi.serviceRequests.pdf(r.id).catch((e) => toast.error(apiErrorMessage(e)))}><FiDownload /> Request summary PDF</Btn></div>
              {r.quotes.map((x) => (
                <div key={x.id} className="bg-neutral-950 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span><b className="font-sans text-sm">V{x.version} • {moneyK(x.amount)}</b> <span className="text-neutral-400">valid {x.validityDays} days • {x.createdByEmail} • {ago(x.createdAt)}</span>{x.coverNote && <span className="block text-neutral-400 mt-1">{x.coverNote}</span>}</span>
                  <span className="flex items-center gap-2">{x.emailedAt && <Pill tone="green">Emailed {ago(x.emailedAt)}</Pill>}<Btn variant="soft" className="py-1.5" onClick={() => adminApi.serviceRequests.pdf(r.id, x.version).catch((e) => toast.error(apiErrorMessage(e)))}><FiDownload /> PDF</Btn></span>
                </div>
              ))}
              {!r.quotes.length && <p className="text-xs text-neutral-500">No quotes yet.</p>}
            </div>

            <div className="bg-neutral-900 rounded-xl p-4 space-y-3">
              <div className="flex justify-between"><h3 className="text-lg font-black font-sans">Internal notes & history</h3><Pill>Admins only</Pill></div>
              <textarea rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note…" className={inputCls} />
              <Btn disabled={!note.trim()} onClick={addNote}><FiSave /> Save Note</Btn>
              <div className="space-y-2 max-h-72 overflow-y-auto">{r.notes.map((n) => <div key={n.id} className="bg-neutral-950 rounded-lg p-3"><div className="flex justify-between gap-2 text-[10px]"><b className="break-all">{n.authorEmail}</b><span className="text-neutral-500 shrink-0">{ago(n.createdAt)}</span></div><p className="text-xs text-neutral-300 mt-1">{n.note}</p></div>)}</div>
            </div>
          </Card>
        )}
        {!r && selId && <p className="xl:col-span-8 font-mono text-xs font-bold">{detail.error || 'LOADING…'}</p>}
      </div>

      {quoteOpen && r && <QuoteModal r={r} onClose={() => setQuoteOpen(false)} onDone={() => { setQuoteOpen(false); detail.reload(); list.reload(); }} />}
    </>
  );
}