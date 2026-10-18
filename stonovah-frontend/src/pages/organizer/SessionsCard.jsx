// src/pages/organizer/SessionsCard.jsx
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, Pill, Btn } from '../admin/ui';
import { authApi } from '../../api/organizer';
import { apiErrorMessage } from '../../api/apiClient';

const seen = (iso) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 20) return 'Active recently';
  if (m < 60) return `${m} minutes ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h} hour${h === 1 ? '' : 's'} ago` : new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export default function SessionsCard({ reloadKey = 0 }) {
  const [list, setList] = useState(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(() => authApi.sessions().then(setList).catch((e) => { setList([]); toast.error(apiErrorMessage(e, 'Could not load your sessions.')); }), []);
  useEffect(() => { load(); }, [load, reloadKey]);

  const signOut = async (s) => {
    setBusy(s.id);
    try { await authApi.revokeSession(s.id); toast.success('Device signed out'); await load(); }
    catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setBusy(''); }
  };
  const signOutOthers = async () => {
    setBusy('all');
    try { const r = await authApi.revokeOtherSessions(); toast.success(r.count ? `${r.count} device(s) signed out` : 'No other devices were signed in'); await load(); }
    catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setBusy(''); }
  };

  const others = (list || []).filter((s) => !s.current).length;

  return (
    <Card index={1} className="p-6 space-y-3">
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-xl font-black font-sans">Active sessions</h2>
        <Btn variant="soft" className="py-1.5" disabled={!others || busy === 'all'} onClick={signOutOthers}>{busy === 'all' ? 'Signing out…' : 'Sign out all other devices'}</Btn>
      </div>
      {list === null && <p className="text-xs text-neutral-400">Loading…</p>}
      {list?.map((s) => (
        <div key={s.id} className="bg-neutral-900 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <span className="min-w-0">
            <b className="block">{s.device}</b>
            <span className="text-neutral-400">{s.ip ? `IP ${s.ip} • ` : ''}{seen(s.lastUsedAt)} • signed in {new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          </span>
          {s.current ? <Pill tone="green">This device</Pill> : <Btn variant="soft" className="py-1.5" disabled={busy === s.id} onClick={() => signOut(s)}>Sign out</Btn>}
        </div>
      ))}
      <p className="text-[10px] text-neutral-500">“Last seen” updates about every 15 minutes. A device you sign out loses access within 15 minutes at most.</p>
    </Card>
  );
}