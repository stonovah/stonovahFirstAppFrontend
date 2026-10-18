import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { seedEvents, genOrders, genAttendees, buildPayouts, seedTemplates, seedSettings, seedTeam, seedSessions, seedBank, ORG } from './organizerData';

const Ctx = createContext(null);
export const useOrg = () => useContext(Ctx);

export function OrganizerProvider({ children }) {
  const [events] = useState(seedEvents);
  const [orders, setOrders] = useState(genOrders);
  const [attendees] = useState(() => genAttendees(orders));
  const [payouts] = useState(() => buildPayouts(seedEvents, orders));
  const [advanceReq, setAdvanceReq] = useState({});
  const [templates, setTemplates] = useState(seedTemplates);
  const [settings, setSettings] = useState(seedSettings);
  const [bank, setBank] = useState(seedBank);
  const [team, setTeam] = useState(seedTeam);
  const [sessions, setSessions] = useState(seedSessions);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message) => setToast({ id: Date.now(), message }), []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  
  // PLACEHOLDER actions. Replace each with an API call.
  const resendTicket = (id) => notify(`Tickets for ${id} queued for re-send`);
  const requestRefund = (id, reason) => {
    setOrders((l) => l.map((o) => (o.id === id ? { ...o, status: 'refund_requested', refundReason: reason } : o)));
    notify('Refund request recorded for Stonovah review');
  };
  const requestAdvance = (eventId) => { setAdvanceReq((r) => ({ ...r, [eventId]: Date.now() })); notify('Advance request submitted for review'); };

  const updateTemplate = (id, ch) => setTemplates((l) => l.map((t) => (t.id === id ? { ...t, ...ch } : t)));
  const duplicateTemplate = (id) =>
    setTemplates((l) => {
      const s = l.find((t) => t.id === id);
      if (!s) return l;
      return [...l, { ...JSON.parse(JSON.stringify(s)), id: `MT-${String(l.length + 1).padStart(3, '0')}`, nickname: `${s.nickname || ''} (Copy)`.trim(), favorite: false, archived: false, usage: [] }];
    });

  const saveSettings = (next) => { setSettings(next); notify('Settings saved'); };
  const requestBankChange = ({ bankName, last4, accountName }) => { setBank((b) => ({ ...b, status: 'change_requested', pending: { bankName, last4, accountName } })); notify('Account change sent to compliance for verification'); };
  const inviteMember = (m) => setTeam((l) => [...l, { id: `M-${Date.now()}`, status: 'invited', ...m }]);
  const removeMember = (id) => setTeam((l) => l.filter((m) => m.id !== id));
  const setRole = (id, role) => setTeam((l) => l.map((m) => (m.id === id ? { ...m, role } : m)));
  const revokeSession = (id) => { setSessions((l) => l.filter((s) => s.id !== id)); notify('Session signed out'); };

  return (
    <Ctx.Provider value={{ org: ORG, events, orders, attendees, payouts, advanceReq, templates, settings, bank, team, sessions, toast, notify, resendTicket, requestRefund, requestAdvance, updateTemplate, duplicateTemplate, saveSettings, requestBankChange, inviteMember, removeMember, setRole, revokeSession }}>
      {children}
    </Ctx.Provider>
  );
}

export const OrganizerRoot = () => (
  <OrganizerProvider>
    <Outlet />
  </OrganizerProvider>
);