// src/components/NotificationBell.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import { notificationsApi } from '../api/settings';

// notification type -> dashboard tab
const TAB = {
  NEW_ORDER: 'Attendees & Orders', LOW_INVENTORY: 'My Events',
  EVENT_APPROVED: 'My Events', EVENT_REJECTED: 'My Events', EVENT_UNPUBLISHED: 'My Events',
  PAYOUT_PAID: 'Payouts & Revenue', REFUND_UPDATED: 'Attendees & Orders',
  TEAM_MEMBER_JOINED: 'Settings', ACCOUNT_STATUS_CHANGED: 'Settings', KYC_VERIFIED: 'Settings', KYC_REJECTED: 'Settings',
};

const ago = (iso) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function NotificationBell({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState(null);
  const box = useRef(null);

  const refreshCount = useCallback(() => notificationsApi.unread().then(setCount).catch(() => {}), []);
  useEffect(() => {
    refreshCount();
    const id = setInterval(refreshCount, 60000);
    return () => clearInterval(id);
  }, [refreshCount]);

  useEffect(() => {
    if (!open) return undefined;
    notificationsApi.list(20).then(setItems).catch(() => setItems([]));
    const onDown = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const openItem = async (n) => {
    if (!n.isRead) {
      setItems((l) => l.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setCount((c) => Math.max(0, c - 1));
      notificationsApi.markRead(n.id).catch(() => {});
    }
    if (TAB[n.type] && onNavigate) { setOpen(false); onNavigate(TAB[n.type]); }
  };

  const readAll = async () => {
    setItems((l) => l.map((x) => ({ ...x, isRead: true })));
    setCount(0);
    notificationsApi.markAllRead().catch(() => {});
  };

  return (
    <div ref={box} className="relative">
      <button type="button" aria-label="Notifications" onClick={() => setOpen((o) => !o)} className="relative w-8 h-8 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center cursor-pointer text-black">
        <FiBell />
        {count > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">{count > 9 ? '9+' : count}</span>}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 max-w-[85vw] z-50 bg-black text-white rounded-2xl border border-neutral-800 shadow-2xl font-mono overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <b className="text-xs uppercase tracking-wider">Notifications</b>
            {count > 0 && <button type="button" onClick={readAll} className="text-[10px] font-bold text-[#FFBF00] hover:text-white cursor-pointer flex items-center gap-1"><FiCheck /> Mark all read</button>}
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-neutral-800">
            {items === null && <p className="text-[11px] text-neutral-500 p-4">Loading…</p>}
            {items && items.length === 0 && <p className="text-[11px] text-neutral-500 p-4">You’re all caught up.</p>}
            {items?.map((n) => (
              <button key={n.id} type="button" onClick={() => openItem(n)} className={`w-full text-left px-4 py-3 hover:bg-neutral-900 transition cursor-pointer ${n.isRead ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-2">
                  {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />}
                  <div className="min-w-0">
                    <b className="text-xs block">{n.title}</b>
                    <span className="text-[11px] text-neutral-400 block leading-snug">{n.message}</span>
                    <span className="text-[9px] text-neutral-600">{ago(n.createdAt)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}