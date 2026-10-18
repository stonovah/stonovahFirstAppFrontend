// src/pages/organizer/TeamTab.jsx
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2, FiUserPlus, FiSend } from 'react-icons/fi';
import { Card, Pill, Btn, Modal } from '../admin/ui';
import { FormField, inputCls } from '../admin/ui2';
import { teamApi } from '../../api/team';
import { apiErrorMessage } from '../../api/apiClient';

const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const ROLE_ORDER = ['ADMIN', 'FINANCE', 'GATE_STAFF', 'VIEWER'];

export default function TeamTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ email: '', name: '', role: 'VIEWER' });
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setError('');
    try { setData(await teamApi.list()); } catch (e) { setError(apiErrorMessage(e, 'Could not load your team.')); }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!data) return error ? <p className="font-mono text-xs font-bold text-red-400 bg-black rounded-xl p-3">{error}</p> : <p className="font-mono text-xs font-bold">LOADING TEAM…</p>;

  const { owner, members, roles } = data;
  const dup = members.some((m) => m.email === f.email.trim().toLowerCase());
  const err = f.email && !emailOk(f.email.trim()) ? 'Enter a valid email' : dup ? 'Already on your team' : '';

  const sendInvite = async () => {
    setBusy('invite');
    try {
      const r = await teamApi.invite({ email: f.email.trim(), name: f.name.trim() || undefined, role: f.role });
      r.emailSent ? toast.success('Invitation sent') : toast.error('Invited, but the email could not be sent. Use “Resend invite”.');
      setF({ email: '', name: '', role: 'VIEWER' }); setOpen(false); await load();
    } catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setBusy(''); }
  };

  const resend = async (m) => {
    setBusy(m.id);
    try { const r = await teamApi.resend(m.id); r.emailSent ? toast.success('Invitation sent again') : toast.error('The email could not be sent. Try again shortly.'); await load(); }
    catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setBusy(''); }
  };

  const changeRole = async (m, role) => {
    const before = data;
    setData({ ...data, members: data.members.map((x) => (x.id === m.id ? { ...x, role } : x)) }); // optimistic
    try { await teamApi.setRole(m.id, role); toast.success(`${m.name || m.email} is now ${roles[role].label}`); }
    catch (e) { setData(before); toast.error(apiErrorMessage(e)); }
  };

  const confirmRemove = async () => {
    setBusy('remove');
    try { await teamApi.remove(del.id); toast.success('Member removed'); setDel(null); await load(); }
    catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setBusy(''); }
  };

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center gap-3">
          <h2 className="text-xl font-black font-sans">Team members</h2>
          <Btn onClick={() => setOpen(true)}><FiUserPlus /> Invite Member</Btn>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead><tr className="text-[9px] text-neutral-500 text-left"><th className="py-2">MEMBER</th><th>ROLE</th><th>STATUS</th><th /></tr></thead>
            <tbody>
              <tr className="border-t border-neutral-800">
                <td className="py-3"><b className="block">{owner.name}</b><span className="text-neutral-400">{owner.email}</span></td>
                <td><Pill tone="solid">Owner</Pill></td><td><Pill tone="green">Active</Pill></td><td />
              </tr>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-neutral-800">
                  <td className="py-3"><b className="block">{m.name || m.email.split('@')[0]}</b><span className="text-neutral-400">{m.email}</span></td>
                  <td>
                    <select value={m.role} onChange={(e) => changeRole(m, e.target.value)} className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-xs cursor-pointer">
                      {ROLE_ORDER.map((r) => <option key={r} value={r}>{roles[r].label}</option>)}
                    </select>
                  </td>
                  <td>
                    {m.status === 'ACTIVE' ? <Pill tone="green">Active</Pill> : m.inviteExpired ? <Pill tone="red">Invite expired</Pill> : <Pill tone="amber">Invited</Pill>}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    {m.status === 'INVITED' && (
                      <button type="button" disabled={busy === m.id} onClick={() => resend(m)} className="text-[10px] font-bold text-[#FFBF00] hover:text-white cursor-pointer px-2 inline-flex items-center gap-1 disabled:opacity-50"><FiSend /> Resend invite</button>
                    )}
                    <button type="button" aria-label={`Remove ${m.email}`} onClick={() => setDel(m)} className="text-neutral-400 hover:text-red-500 cursor-pointer p-2"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ROLE_ORDER.map((r) => <div key={r} className="bg-neutral-900 rounded-lg px-3 py-2 text-[11px]"><b>{roles[r].label}:</b> <span className="text-neutral-400">{roles[r].description}</span></div>)}
        </div>
        <p className="text-[10px] text-neutral-500">Role changes and removals take effect immediately. Only the account owner can manage the team.</p>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} width="max-w-md">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-black font-sans pr-10">Invite team member</h2>
          <FormField label="Email" required error={err}><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inputCls} /></FormField>
          <FormField label="Name (optional)"><input value={f.name} maxLength={80} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} /></FormField>
          <FormField label="Role" hint={roles[f.role].description}>
            <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className={inputCls}>{ROLE_ORDER.map((r) => <option key={r} value={r}>{roles[r].label}</option>)}</select>
          </FormField>
          <p className="text-[10px] text-neutral-500">They get an email to create their own login. The email must not already have a Stonovah account.</p>
          <div className="flex gap-2"><Btn variant="soft" onClick={() => setOpen(false)}>Cancel</Btn><Btn disabled={!emailOk(f.email.trim()) || dup || busy === 'invite'} onClick={sendInvite}>{busy === 'invite' ? 'Sending…' : 'Send Invite'}</Btn></div>
        </div>
      </Modal>

      <Modal open={!!del} onClose={() => !busy && setDel(null)} width="max-w-md">
        {del && (
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-black font-sans pr-10">Remove {del.name || del.email}?</h2>
            <p className="text-xs text-neutral-300">Their login is deleted and they lose access immediately. They can be invited again later.</p>
            <div className="flex gap-2"><Btn variant="soft" onClick={() => setDel(null)}>Cancel</Btn><Btn disabled={busy === 'remove'} onClick={confirmRemove}>{busy === 'remove' ? 'Removing…' : 'Remove Member'}</Btn></div>
          </div>
        )}
      </Modal>
    </>
  );
}