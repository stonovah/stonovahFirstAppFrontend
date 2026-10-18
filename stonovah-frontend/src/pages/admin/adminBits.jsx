// src/pages/admin/adminBits.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Btn } from './ui';
import { apiErrorMessage } from '../../api/apiClient';

// Loads data, keeps the previous value while reloading, and exposes reload()
export function useLoad(fn, deps = []) {
  const [state, set] = useState({ data: null, error: '', loading: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true;
    set((s) => ({ ...s, loading: true }));
    fn().then((d) => live && set({ data: d, error: '', loading: false })).catch((e) => live && set((s) => ({ data: s.data, error: apiErrorMessage(e), loading: false })));
    return () => { live = false; };
  }, [...deps, n]); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, reload: () => setN((x) => x + 1) };
}

export const ErrorLine = ({ children }) => (children ? <p className="font-mono text-xs font-bold text-red-400 bg-black rounded-xl p-3">{children}</p> : null);

export const KV = ({ k, v, mono }) => (
  <div className="bg-neutral-900 rounded-lg px-3 py-2.5 flex justify-between gap-3 text-xs">
    <span className="text-neutral-400 font-bold text-[10px] shrink-0">{k}</span>
    <span className={`text-right break-all ${mono ? 'font-mono' : 'font-bold'}`}>{v ?? '—'}</span>
  </div>
);

export const humanize = (k) => String(k).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase());

// Generic confirm dialog: optional note, optional "I confirm" tick. onConfirm(note) must throw-or-toast itself and close via the parent.
export function ConfirmModal({ open, title, children, confirmLabel = 'Confirm', onConfirm, onClose, noteLabel, noteMin = 0, checkLabel }) {
  const [note, setNote] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setNote(''); setOk(false); setBusy(false); } }, [open]);
  const valid = (!noteLabel || note.trim().length >= noteMin) && (!checkLabel || ok);
  const go = async () => { setBusy(true); try { await onConfirm(note.trim()); } finally { setBusy(false); } };
  return (
    <Modal open={open} onClose={() => !busy && onClose()} width="max-w-lg">
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-black font-sans pr-10">{title}</h2>
        <div className="text-xs text-neutral-300 leading-relaxed space-y-2">{children}</div>
        {noteLabel && (
          <label className="block text-[10px] font-bold text-neutral-400 uppercase">{noteLabel}{noteMin ? ' *' : ''}
            <textarea rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs normal-case text-white focus:outline-none focus:border-red-600" />
            {note.length > 0 && note.trim().length < noteMin && <span className="text-red-400 normal-case font-normal">At least {noteMin} characters.</span>}
          </label>
        )}
        {checkLabel && <label className="flex gap-2 text-xs cursor-pointer"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-0.5 accent-red-600" />{checkLabel}</label>}
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!valid || busy} onClick={go}>{busy ? 'Working…' : confirmLabel}</Btn></div>
      </div>
    </Modal>
  );
}