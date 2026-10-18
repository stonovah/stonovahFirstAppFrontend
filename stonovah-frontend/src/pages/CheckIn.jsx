// src/pages/CheckIn.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import {
  FiActivity, FiCheck, FiX, FiAlertTriangle, FiRefreshCw, FiDownload, FiSearch, FiCamera, FiCameraOff, FiHelpCircle,
} from 'react-icons/fi';
import { eventsApi } from '../api/events';
import { checkinApi, attendeesApi } from '../api/gate';
import { apiErrorMessage } from '../api/apiClient';
import { useCan } from '../context/AuthContext';

const POLL_MS = 8000;
const CAMERA_ELEMENT = 'qr-reader';
const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-GB') : '—');

// Short beep so staff can scan without looking at the screen
function beep(ok) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = ok ? 880 : 220;
    gain.gain.value = 0.08;
    osc.start();
    osc.stop(ctx.currentTime + (ok ? 0.12 : 0.35));
    setTimeout(() => ctx.close(), 600);
  } catch { /* sound unavailable */ }
}

const RESULT = {
  VALID: { title: 'VALID TICKET', sub: 'ACCESS GRANTED', box: 'bg-emerald-950/40 border-emerald-500/40', iconBg: 'bg-emerald-500 text-black', text: 'text-emerald-400', subText: 'text-emerald-300', Icon: FiCheck },
  ALREADY_USED: { title: 'ALREADY USED', sub: 'DO NOT ADMIT', box: 'bg-amber-950/40 border-amber-500/40', iconBg: 'bg-amber-500 text-black', text: 'text-amber-400', subText: 'text-amber-300', Icon: FiAlertTriangle },
  VOID: { title: 'TICKET CANCELLED', sub: 'DO NOT ADMIT', box: 'bg-red-950/40 border-red-500/40', iconBg: 'bg-red-500 text-white', text: 'text-red-400', subText: 'text-red-300', Icon: FiX },
  NOT_RECOGNIZED: { title: 'NOT FOUND', sub: 'NOT A TICKET FOR THIS EVENT', box: 'bg-red-950/40 border-red-500/40', iconBg: 'bg-red-500 text-white', text: 'text-red-400', subText: 'text-red-300', Icon: FiHelpCircle },
  ERROR: { title: 'SCAN FAILED', sub: 'TRY AGAIN', box: 'bg-neutral-900 border-neutral-700', iconBg: 'bg-neutral-700 text-white', text: 'text-neutral-200', subText: 'text-neutral-400', Icon: FiAlertTriangle },
};

const OUTCOME = {
  VALID: ['VALID ENTRY', 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'],
  ALREADY_USED: ['ALREADY USED', 'bg-amber-950/60 border-amber-500/30 text-amber-400'],
  VOID: ['CANCELLED', 'bg-red-950/60 border-red-500/30 text-red-400'],
  NOT_RECOGNIZED: ['UNRECOGNIZED', 'bg-neutral-800 border-neutral-700 text-neutral-400'],
};

// ---------- camera ----------
function QrCamera({ onDecode, onError }) {
  const cb = useRef(onDecode);
  cb.current = onDecode;

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(CAMERA_ELEMENT);
    const stop = async () => {
      try { if (scanner.isScanning) await scanner.stop(); scanner.clear(); } catch { /* already stopped */ }
    };
    scanner
      .start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 240, height: 240 } }, (text) => cb.current(text), () => {})
      .then(() => { if (cancelled) stop(); }) // unmounted while the camera was starting
      .catch((e) => onError(e?.message || 'Could not start the camera. Allow camera access and use HTTPS.'));
    return () => { cancelled = true; stop(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div id={CAMERA_ELEMENT} className="w-full overflow-hidden rounded-lg bg-black" />;
}

// ---------- page ----------
export default function CheckIn() {
  const [params, setParams] = useSearchParams();
  const [events, setEvents] = useState(null);
  const [eventId, setEventId] = useState(params.get('event') || '');
  const [stats, setStats] = useState(null);
  const [serverLog, setServerLog] = useState([]);
  const [failures, setFailures] = useState([]); // rejected scans from this device
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [q, setQ] = useState('');
  const [matches, setMatches] = useState([]);
  const [searching, setSearching] = useState(false);

  const busyRef = useRef(false);
  const lastRef = useRef({ token: '', at: 0 });
  const inputRef = useRef(null);
  const canScan = useCan()('checkin.write');

  // ---------- live events ----------
  useEffect(() => {
    eventsApi.list('LIVE')
      .then((list) => {
        setEvents(list);
        setEventId((cur) => (cur && list.some((e) => e.id === cur) ? cur : list[0]?.id || ''));
      })
      .catch((e) => { setEvents([]); toast.error(apiErrorMessage(e, 'Could not load your live events.')); });
  }, []);

  const selected = (events || []).find((e) => e.id === eventId);

  // ---------- stats + log (polled, so other devices' scans show up) ----------
  const refresh = useCallback(async () => {
    if (!eventId) return;
    try {
      const [s, l] = await Promise.all([checkinApi.stats(eventId), checkinApi.log(eventId, 20)]);
      setStats(s); setServerLog(l);
    } catch { /* keep the last values */ }
  }, [eventId]);

  useEffect(() => {
    setStats(null); setServerLog([]); setFailures([]); setResult(null); setMatches([]); setQ('');
    if (eventId) setParams({ event: eventId }, { replace: true });
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- results ----------
  const showResult = useCallback((res, label) => {
    setResult({ ...res, at: Date.now() });
    beep(res.result === 'VALID');
    if (res.result !== 'VALID') {
      setFailures((f) => [{
        key: `f-${Date.now()}`, time: new Date().toISOString(), outcome: res.result,
        name: res.ticket?.order?.buyerName || label || 'Unknown code',
        code: res.ticket?.ticketCode || '—', tier: res.ticket?.tier?.name || '—',
      }, ...f].slice(0, 20));
    }
    refresh();
  }, [refresh]);

  const submitScan = useCallback(async (raw) => {
    const token = String(raw || '').trim();
    if (!token || !eventId || busyRef.current) return;
    // the camera reports the same code many times per second: ignore repeats for 4s
    if (lastRef.current.token === token && Date.now() - lastRef.current.at < 4000) return;
    lastRef.current = { token, at: Date.now() };

    busyRef.current = true; setBusy(true);
    try {
      showResult(await checkinApi.scan(eventId, token), `${token.slice(0, 8)}…`);
    } catch (e) {
      setResult({ result: 'ERROR', message: apiErrorMessage(e), at: Date.now() });
    } finally {
      busyRef.current = false; setBusy(false);
      inputRef.current?.focus();
    }
  }, [eventId, showResult]);

  const submitTyped = (e) => {
    e.preventDefault();
    lastRef.current = { token: '', at: 0 }; // typed entries may legitimately repeat
    submitScan(tokenInput);
    setTokenInput('');
  };

  // ---------- manual check-in: search, then pick the exact person ----------
  useEffect(() => {
    const term = q.trim();
    if (!eventId || term.length < 2) { setMatches([]); setSearching(false); return undefined; }
    let live = true;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const r = await attendeesApi.list(eventId, { search: term, limit: 8 });
        if (live) setMatches(r.data);
      } catch { if (live) setMatches([]); }
      finally { if (live) setSearching(false); }
    }, 350);
    return () => { live = false; clearTimeout(t); };
  }, [q, eventId]);

  const checkInManual = async (ticket) => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true);
    try {
      const res = await checkinApi.manual(eventId, ticket.id);
      showResult(res);
      if (res.result === 'VALID' || res.result === 'ALREADY_USED') {
        setMatches((m) => m.map((x) => (x.id === ticket.id ? { ...x, status: 'USED', checkedInAt: res.ticket?.checkedInAt || x.checkedInAt } : x)));
      }
    } catch (e) {
      setResult({ result: 'ERROR', message: apiErrorMessage(e), at: Date.now() });
    } finally {
      busyRef.current = false; setBusy(false);
    }
  };

  const exportCsv = async () => {
    try { await attendeesApi.exportCsv(eventId); } catch (e) { toast.error(apiErrorMessage(e, 'Could not export the list.')); }
  };

  // ---------- derived ----------
  const rows = [
    ...serverLog.map((t) => ({ key: t.id, time: t.checkedInAt, name: t.order?.buyerName, code: t.ticketCode, tier: t.tier?.name, outcome: 'VALID' })),
    ...failures,
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 20);

  const view = result ? RESULT[result.result] || RESULT.ERROR : null;
  const t = result?.ticket;
  const pctIn = stats?.total ? ((stats.checkedIn / stats.total) * 100).toFixed(1) : '0.0';

  // ---------- empty / loading ----------
  if (events === null) return <p className="font-mono text-xs font-bold">LOADING…</p>;
  if (events.length === 0) {
    return (
      <div className="bg-black text-white p-8 rounded-2xl font-mono text-center space-y-2">
        <h2 className="text-lg font-black font-sans">No live events to check in</h2>
        <p className="text-xs text-neutral-400">Check-in opens once an event has been approved and is live.</p>
      </div>
    );
  }

  const card = 'bg-[#171717] rounded-xl border border-neutral-800';

  return (
    <div className="w-full bg-black text-white rounded-2xl shadow-2xl border-4 border-black overflow-hidden">
      <div className="bg-[#111111] p-4 md:p-6 space-y-6">
        {/* HEADER */}
        <div className={`${card} p-4 flex flex-wrap items-center justify-between gap-4`}>
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-600/40 text-red-500 flex items-center justify-center shrink-0">
              <FiActivity className="text-lg animate-pulse" />
            </div>
            <div className="min-w-0">
              <select
                value={eventId} onChange={(e) => setEventId(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-sm font-bold max-w-full focus:outline-none focus:border-[#FFBF00]"
              >
                {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              <p className="text-[10px] font-mono text-neutral-500 mt-1 truncate">{selected?.venue || 'Venue not set'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 divide-x divide-neutral-800 font-mono">
            <div className="px-2">
              <div className="text-[10px] text-neutral-500 uppercase">CHECKED IN</div>
              <div className="text-base font-black">{stats ? stats.checkedIn.toLocaleString() : '—'} <span className="text-neutral-500 text-xs font-normal">/ {stats ? stats.total.toLocaleString() : '—'}</span></div>
              <div className="text-[9px] text-green-400">{pctIn}% of issued tickets</div>
            </div>
            <div className="pl-6">
              <div className="text-[10px] text-neutral-500 uppercase">REMAINING</div>
              <div className="text-base font-black">{stats ? stats.remaining.toLocaleString() : '—'}</div>
              <div className="text-[9px] text-neutral-500">{stats ? `${stats.capacity.toLocaleString()} capacity` : ''}</div>
            </div>
            <div className="pl-6 hidden sm:block">
              <div className="text-[10px] text-neutral-500 uppercase">FLOW (5 MIN AVG)</div>
              <div className="text-base font-black">{stats ? stats.scansPerMinute : '—'} <span className="text-neutral-500 text-xs font-normal">scans/min</span></div>
              <div className="text-[9px] text-neutral-500">{stats?.voided ? `${stats.voided} cancelled` : 'live'}</div>
            </div>
          </div>
        </div>

        {canScan ?
        <>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SCANNER */}
          <div className={`lg:col-span-7 ${card} p-5 space-y-4`}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-300 uppercase">
                <span className={`w-2 h-2 rounded-full ${cameraOn ? 'bg-red-500 animate-pulse' : 'bg-neutral-600'}`} /> Camera scanner
              </span>
              <button
                type="button"
                onClick={() => { setCameraError(''); setCameraOn((on) => !on); }}
                className="bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-[11px] uppercase px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer"
              >
                {cameraOn ? <><FiCameraOff /> Stop camera</> : <><FiCamera /> Start camera</>}
              </button>
            </div>

            <div className="min-h-[260px] bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-center p-2">
              {cameraOn ? (
                <div className="w-full"><QrCamera onDecode={submitScan} onError={(m) => { setCameraError(m); setCameraOn(false); }} /></div>
              ) : (
                <p className="text-[11px] font-mono text-neutral-500 text-center px-4">
                  {cameraError || 'Start the camera and hold a ticket QR code in front of it. The camera needs HTTPS (or localhost).'}
                </p>
              )}
            </div>

            <form onSubmit={submitTyped} className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400 uppercase block">Hardware scanner or pasted code</label>
              <div className="flex gap-2">
                <input
                  ref={inputRef} autoFocus value={tokenInput} onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Scan or paste the QR code, then press Enter"
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#FFBF00]"
                />
                <button type="submit" disabled={busy || !tokenInput.trim()} className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 font-mono font-bold text-xs px-4 rounded-lg cursor-pointer disabled:opacity-50">CHECK</button>
              </div>
            </form>
          </div>

          {/* RESULT */}
          <div className={`lg:col-span-5 ${card} p-5 space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase">Gate result</span>
              <span className="text-[10px] font-mono text-neutral-500">{result ? fmtTime(new Date(result.at).toISOString()) : ''}</span>
            </div>

            {!view ? (
              <p className="text-xs font-mono text-neutral-500 py-12 text-center">Waiting for the first scan…</p>
            ) : (
              <>
                <div className={`${view.box} border rounded-xl p-4 flex items-center gap-3`}>
                  <div className={`w-10 h-10 rounded-full ${view.iconBg} flex items-center justify-center text-xl shrink-0`}><view.Icon /></div>
                  <div>
                    <div className={`text-xl font-black leading-none ${view.text}`}>{view.title}</div>
                    <div className={`text-[10px] font-mono mt-1 ${view.subText}`}>{result.message || view.sub}</div>
                  </div>
                </div>

                {t && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FFBF00] text-black font-extrabold text-sm flex items-center justify-center shrink-0">
                        {(t.order?.buyerName || '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold truncate">{t.order?.buyerName}</h3>
                        <p className="text-[10px] font-mono text-neutral-500 truncate">{t.order?.buyerEmail}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-neutral-800 pt-3 text-xs">
                      <div><div className="text-[9px] font-mono text-neutral-500 uppercase">TIER</div><div className="font-bold">{t.tier?.name}</div></div>
                      <div><div className="text-[9px] font-mono text-neutral-500 uppercase">TICKET CODE</div><div className="font-mono font-bold text-[#FFBF00]">{t.ticketCode}</div></div>
                      {result.result === 'ALREADY_USED' && (
                        <div className="col-span-2"><div className="text-[9px] font-mono text-neutral-500 uppercase">FIRST CHECKED IN</div><div className="font-bold text-amber-400">{fmtTime(result.checkedInAt)}</div></div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className={`${card} p-4 space-y-3`}>
          <span className="text-xs font-mono font-bold text-neutral-400 uppercase">Manual check-in • unreadable or missing QR</span>
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search attendee name, email, ticket code or order ID…"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#FFBF00]"
            />
          </div>

          {searching && <p className="text-[10px] font-mono text-neutral-500">Searching…</p>}
          {!searching && q.trim().length >= 2 && matches.length === 0 && <p className="text-[10px] font-mono text-neutral-500">No attendee matches “{q.trim()}”.</p>}

          <div className="space-y-2">
            {matches.map((m) => (
              <div key={m.id} className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <b className="block truncate">{m.order?.buyerName}</b>
                  <span className="text-[10px] font-mono text-neutral-500 truncate block">{m.order?.buyerEmail} • {m.tier?.name} • <span className="text-[#FFBF00]">{m.ticketCode}</span></span>
                </div>
                {m.status === 'VALID' ? (
                  <button type="button" disabled={busy} onClick={() => checkInManual(m)} className="bg-red-600 hover:bg-red-700 font-mono font-bold text-[11px] px-3 py-1.5 rounded cursor-pointer disabled:opacity-50 shrink-0">CHECK IN</button>
                ) : (
                  <span className={`text-[10px] font-mono font-bold shrink-0 ${m.status === 'USED' ? 'text-amber-400' : 'text-red-400'}`}>
                    {m.status === 'USED' ? `USED ${fmtTime(m.checkedInAt)}` : 'CANCELLED'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div> </>: <div className={`${card} p-5 text-xs font-mono text-neutral-400`}>
          View only: your role can see check-in numbers and the scan log, but cannot scan or check attendees in.
        </div>}

        {/* LOG */}
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-4 gap-2">
            <div>
              <div className="text-[10px] font-mono text-[#FFBF00] font-bold uppercase">Live • updates every {POLL_MS / 1000}s</div>
              <h3 className="text-sm font-bold uppercase">Recent scans</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <button type="button" onClick={refresh} className="hover:text-white flex items-center gap-1 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800 cursor-pointer"><FiRefreshCw className="text-[10px]" /> REFRESH</button>
              <button type="button" onClick={exportCsv} className="hover:text-white flex items-center gap-1 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800 cursor-pointer"><FiDownload className="text-[10px]" /> ATTENDEE LIST CSV</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-[10px] font-mono text-neutral-500 uppercase">
                  <th className="pb-3 font-semibold">TIME</th><th className="pb-3 font-semibold">ATTENDEE</th><th className="pb-3 font-semibold">TIER</th><th className="pb-3 font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs font-mono">
                {rows.map((r) => {
                  const [label, cls] = OUTCOME[r.outcome] || OUTCOME.NOT_RECOGNIZED;
                  return (
                    <tr key={r.key}>
                      <td className="py-3 text-neutral-300 font-bold">{fmtTime(r.time)}</td>
                      <td className="py-3"><span className="font-bold text-white font-sans block">{r.name}</span><span className="text-[9px] text-neutral-500">{r.code}</span></td>
                      <td className="py-3 text-neutral-300 font-sans">{r.tier}</td>
                      <td className="py-3"><span className={`inline-flex border text-[10px] font-bold px-2 py-0.5 rounded ${cls}`}>{label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && <p className="text-center text-xs font-mono text-neutral-500 py-8">No scans yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}