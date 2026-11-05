import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPrinter, FiLink, FiMessageCircle, FiDownload, FiFileText, FiCalendar, FiMail, FiSend, FiSave, FiPhone, FiShield } from 'react-icons/fi';
import { Card, Pill, Btn, Modal } from '../ui';
import { FormField, inputCls, Select } from '../ui2';
import { useLoad, ErrorLine, KV, ConfirmModal, humanize } from '../adminBits';
import { fmtDate, ago } from '../adminLive';
import { apiErrorMessage } from '../../../api/apiClient';
import { adminProductionApi as A, openSigned } from '../../../api/adminProduction';
import { useProdAccess } from './useProdAccess';
import { ngn, mono, REQ_STATUS, PROPOSAL_STATUS, FORMAT_LABEL, PIPELINE_LABEL, DELIVERY_LABEL, FUNDING_LABEL, AUDIENCE_LABEL, STAGE_LABEL, budgetText } from './prodAdmin';

function CallModal({ id, onClose, onDone }) {
  const [at, setAt] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const valid = at && new Date(at) > new Date();
  const submit = async () => {
    setBusy(true);
    try {
      const res = await A.scheduleCall(id, { callAt: new Date(at).toISOString(), callLink: link.trim() || undefined });
      res.emailSent ? toast.success('Call booked and the client was emailed') : toast.error('Call booked, but the email could not be sent. Tell the client yourself.');
      onDone();
    } catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };
  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-lg">
      <div className="space-y-4 p-6">
        <h2 className="pr-10 text-xl font-black">Schedule discovery call</h2>
        <FormField label="Date & time (your local time)" required error={at && !valid ? 'Choose a time in the future' : ''}><input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} className={inputCls} /></FormField>
        <FormField label="Meeting link (optional)" hint="Google Meet, Zoom or any link. If empty, the client is told you will phone them."><input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" className={inputCls} /></FormField>
        <p className="text-[10px] text-white/40">The request moves to “Call booked” and the client receives one email.</p>
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!valid || busy} onClick={submit}>{busy ? 'Working…' : 'Book call'}</Btn></div>
      </div>
    </Modal>
  );
}

function EmailModal({ r, onClose, onDone }) {
  const [subject, setSubject] = useState(`Your production brief ${r.reference}`);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try { await A.emailClient(r.id, { subject: subject.trim(), message: message.trim() }); toast.success(`Email sent to ${r.contact.email}`); onDone(); }
    catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };
  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-lg">
      <div className="space-y-4 p-6">
        <h2 className="pr-10 text-xl font-black">Email {r.contact.name}</h2>
        <FormField label="Subject" required><input value={subject} maxLength={200} onChange={(e) => setSubject(e.target.value)} className={inputCls} /></FormField>
        <FormField label="Message" required hint="Signed “The Stonovah Production Desk” automatically."><textarea rows={6} maxLength={5000} value={message} onChange={(e) => setMessage(e.target.value)} className={inputCls} /></FormField>
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={busy || !subject.trim() || !message.trim()} onClick={submit}><FiSend /> {busy ? 'Sending…' : 'Send'}</Btn></div>
      </div>
    </Modal>
  );
}

export default function ProdRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useProdAccess();
  const d = useLoad(() => A.request(id), [id]);
  const prod = useLoad(() => A.producers());
  const [dlg, setDlg] = useState(null); // 'decline' | 'call' | 'email'
  const [note, setNote] = useState('');
  const r = d.data;

  if (!r) return d.error ? <Card className="p-10 text-center">{d.error} <Link to="/admin/production/requests" className="text-red-400 underline">Back to requests</Link></Card> : <p className="font-mono text-xs font-bold">LOADING…</p>;

  const st = REQ_STATUS[r.status];
  const closed = ['ACCEPTED', 'DECLINED'].includes(r.status);
  const close = () => setDlg(null);
  const refresh = () => d.reload();
  const act = async (fn, msg) => { try { await fn(); if (msg) toast.success(msg); refresh(); } catch (e) { toast.error(apiErrorMessage(e)); } };
  const changeStatus = (s) => (s === 'DECLINED' ? setDlg('decline') : act(() => A.setRequestStatus(id, { status: s }), 'Status updated'));
  const openFile = async (f) => { try { await openSigned(A.requestFileUrl(id, f.id)); } catch (e) { toast.error(apiErrorMessage(e)); } };
  const postNote = () => act(async () => { await A.addRequestNote(id, note.trim()); setNote(''); }, 'Note saved');
  const createProposal = async () => {
    try { const p = await A.createProposal({ requestId: id }); toast.success('Draft proposal created'); navigate(`/admin/production/proposals/${p.id}`); }
    catch (e) { toast.error(apiErrorMessage(e)); }
  };
  const copyLink = async () => { try { await navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); } catch { toast.error('Could not copy'); } };
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `${r.reference}.json` });
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  const wa = (() => { const n = String(r.contact.phone || '').replace(/\D/g, ''); return n ? `https://wa.me/${n.startsWith('0') ? `234${n.slice(1)}` : n}` : null; })();

  const funding = r.serviceDetails?.funding;
  const L = r.logistics;
  const P = r.project;

  return (
    <>
      <Card className="flex flex-wrap items-center gap-3 p-3 text-[11px] print:hidden">
        <Link to="/admin/production/requests" className="flex items-center gap-2 font-bold hover:text-red-400"><FiArrowLeft /> Back to service requests</Link>
        <span className="text-white/40">/</span><b className="rounded bg-neutral-900 px-2 py-1 font-mono">{r.reference}</b>
        <span className="ml-auto flex flex-wrap gap-2">
          <Btn variant="soft" onClick={() => window.print()}><FiPrinter /> Print brief</Btn>
          <Btn variant="soft" onClick={copyLink}><FiLink /> Copy link</Btn>
          <Btn variant="soft" onClick={exportJson}><FiDownload /> Export JSON</Btn>
        </span>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Card index={1} className="space-y-4 border-l-4 border-l-red-600 p-6">
            <div className="flex flex-wrap items-center gap-2"><Pill tone={st.tone}>{st.label}</Pill>{r.isRush && <Pill tone="red">Rush: shoot within 30 days</Pill>}<Pill>Received {fmtDate(r.submittedAt)}</Pill>{r.ndaAcceptedAt && <Pill tone="green"><FiShield /> NDA accepted {fmtDate(r.ndaAcceptedAt, false)}</Pill>}</div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h1 className="text-3xl font-black md:text-4xl">{r.contact.name}</h1><p className="mt-1 text-sm text-white/55">{r.contact.companyName || 'Individual producer'}{r.contact.companyRegNo ? ` • ${r.contact.companyRegNo}` : ''} • {r.contact.entityType === 'STUDIO' ? 'Studio / company' : 'Individual'}</p></div>
              <div className="space-y-1 text-xs text-white/70">
                <a href={`mailto:${r.contact.email}`} className="flex items-center gap-2 hover:text-white"><FiMail className="text-red-500" /> {r.contact.email}</a>
                <a href={`tel:${r.contact.phone}`} className="flex items-center gap-2 hover:text-white"><FiPhone className="text-red-500" /> {r.contact.phone}</a>
                {wa && <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><FiMessageCircle className="text-red-500" /> WhatsApp</a>}
              </div>
            </div>
          </Card>

          <Card index={2} className="space-y-4 p-6">
            <p className={`${mono} text-red-400`}>{FORMAT_LABEL[P.format] ?? 'Project'} brief</p>
            <h2 className="text-3xl font-black">{P.title}{P.isWorkingTitle && <span className="ml-2 text-xs font-bold text-white/40">(working title)</span>}</h2>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <KV k="PIPELINE STAGE" v={PIPELINE_LABEL[P.pipelineStage]} />
              <KV k="DELIVERY FORMAT" v={DELIVERY_LABEL[P.deliveryFormat]} />
              <KV k="PACKAGE" v={r.mode === 'FULL' ? 'Full turnkey' : 'À la carte'} />
              <KV k="BUDGET ENVELOPE" v={budgetText(L)} />
              <KV k="TARGET START" v={L.targetStart ? fmtDate(L.targetStart, false) : null} />
              <KV k="TARGET WRAP" v={L.targetEnd ? fmtDate(L.targetEnd, false) : null} />
              <KV k="TERRITORY" v={L.territory} />
            </div>
            {P.logline && <div className="rounded-xl bg-neutral-900 p-4"><span className="mb-1 block text-[9px] font-bold text-neutral-500">LOGLINE / SYNOPSIS</span><p className="whitespace-pre-line text-sm italic leading-relaxed text-neutral-200">“{P.logline}”</p></div>}
            {r.producerNotes && <div className="rounded-xl bg-neutral-900 p-4"><span className="mb-1 block text-[9px] font-bold text-neutral-500">CLIENT NOTES TO PRODUCERS</span><p className="whitespace-pre-line text-sm leading-relaxed text-neutral-200">{r.producerNotes}</p></div>}
          </Card>

          <Card index={3} className="space-y-3 p-6">
            <div className="flex items-center justify-between"><h2 className="text-xl font-black">Selected production modules</h2><Pill>{r.services.length} {r.mode === 'FULL' ? 'turnkey' : 'à la carte'}</Pill></div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {r.services.map((s) => <div key={s.serviceId} className="rounded-lg bg-neutral-900 p-3"><b className="block text-sm">{s.label}</b><span className={`${mono} text-[9px] text-white/40`}>{STAGE_LABEL[s.stage]}</span></div>)}
            </div>
          </Card>

          {r.crewRoles.length > 0 && (
            <Card index={4} className="space-y-3 p-6">
              <div className="flex items-center justify-between"><h2 className="text-xl font-black">Requested crew & cast attachments</h2><Pill tone="red">{r.crewRoles.reduce((n, c) => n + c.qty, 0)} headcount</Pill></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs">
                <thead><tr className={`${mono} text-[9px] text-white/40`}><th className="py-2">Role</th><th>Qty</th><th>Window</th><th>Notes</th></tr></thead>
                <tbody>{r.crewRoles.map((c) => (
                  <tr key={c.id} className="border-t border-white/5 align-top"><td className="py-3 pr-3 font-bold">{c.role}</td><td className="pr-3">{c.qty}</td>
                    <td className="pr-3 text-white/60">{c.windowStart ? fmtDate(c.windowStart, false) : '—'}{c.windowEnd ? ` to ${fmtDate(c.windowEnd, false)}` : ''}</td><td className="text-white/60">{c.notes || '—'}</td></tr>
                ))}</tbody></table></div>
            </Card>
          )}

          {funding && (
            <Card index={5} className="space-y-3 p-6">
              <div className="flex items-center justify-between"><h2 className="text-xl font-black">Funding & pitch intake</h2>{r.pitch && <Link to={`/admin/production/funding/${r.pitch.id}`}><Btn variant="soft">Open pitch dossier</Btn></Link>}</div>
              <div className="flex flex-wrap gap-2">{(funding.materials ?? []).map((m) => <Pill key={m} tone="red">{FUNDING_LABEL[m] ?? humanize(m)}</Pill>)}</div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2"><KV k="PITCHING TO" v={AUDIENCE_LABEL[funding.audience]} /><KV k="PITCH DEADLINE" v={funding.deadline ? fmtDate(funding.deadline, false) : null} /></div>
            </Card>
          )}

          <Card index={6} className="space-y-3 p-6">
            <h2 className="text-xl font-black">Creative depot & attachments ({r.files.length})</h2>
            {!r.files.length && <p className="text-xs text-white/40">No files were attached.</p>}
            {r.files.map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-xl bg-neutral-900 p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded bg-red-950 text-red-400"><FiFileText /></span>
                <div className="min-w-0 flex-1"><b className="block truncate text-sm">{f.name}</b><span className="text-[10px] text-white/45">{(f.sizeBytes / 1048576).toFixed(1)} MB • stored privately • not virus scanned • {f.sha256?.slice(0, 12)}…</span></div>
                <Btn variant="soft" onClick={() => openFile(f)}><FiDownload /> Open</Btn>
              </div>
            ))}
            <p className="text-[10px] text-white/35">Opening a file creates a 5-minute link and is recorded in the activity log.</p>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-4 print:hidden">
          <Card index={2} className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Workflow state</span>
            <Select
              value={r.status}
              disabled={!can.write}
              onChange={changeStatus}
              options={Object.entries(REQ_STATUS).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            {r.status === 'DECLINED' && r.declineNote && <p className="rounded-lg bg-neutral-900 p-3 text-xs text-white/65"><b>Decline reason:</b> {r.declineNote}</p>}
            <div className="grid grid-cols-2 gap-2">
              <Btn variant="soft" disabled={!can.write || r.status !== 'NEW'} onClick={() => changeStatus('IN_REVIEW')}>Mark in review</Btn>
              <Btn variant="soft" disabled={!can.write || closed} onClick={() => setDlg('call')}><FiCalendar /> Schedule call</Btn>
            </div>
            {r.call.at && <p className="rounded-lg bg-neutral-900 p-3 text-xs text-white/65">Discovery call: <b>{fmtDate(r.call.at)}</b>{r.call.link && <> • <a href={r.call.link} target="_blank" rel="noreferrer" className="text-red-400 underline">join link</a></>}</p>}
          </Card>

          <Card index={3} className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Supervising producer</span>
            <Select
              value={r.assignedTo?.id || ''}
              disabled={!can.write}
              onChange={(v) => act(() => A.assignRequest(id, v || null), 'Assignment updated')}
              options={[
                { value: '', label: 'Unassigned' },
                ...(prod.data ?? []).map((p) => ({ value: p.id, label: `${p.email} (${p.openTotal}/${p.capacity} open)` })),
              ]}
            />
          </Card>

          <Card index={4} className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Progression</span>
            <Btn className="w-full" disabled={!can.finance || r.status === 'DECLINED'} onClick={createProposal}><FiFileText /> Create proposal</Btn>
            {!can.finance && <p className="text-[10px] text-white/35">Only Lead or Finance roles can create proposals.</p>}
            {r.proposals.map((p) => (
              <Link key={p.id} to={`/admin/production/proposals/${p.id}`} className="flex items-center justify-between gap-2 rounded-lg bg-neutral-900 p-3 text-xs hover:bg-neutral-800">
                <span><b className="font-mono">{p.reference}</b> <span className="text-white/40">V{p.version}</span><span className="block text-white/50">{ngn(p.totalKobo)}</span></span>
                <Pill tone={PROPOSAL_STATUS[p.status].tone}>{PROPOSAL_STATUS[p.status].label}</Pill>
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <Btn variant="soft" disabled={!can.write} onClick={() => setDlg('email')}><FiMail /> Email client</Btn>
              <Btn variant="soft" disabled={!can.write} onClick={() => act(() => A.resendReceipt(id), 'Receipt resent')}>Resend receipt</Btn>
            </div>
          </Card>

          <Card index={5} className="space-y-3 p-5">
            <div className="flex items-center justify-between"><span className={`${mono} text-white/45`}>Internal notes</span><Pill>Team only</Pill></div>
            <textarea rows={3} maxLength={2000} value={note} disabled={!can.write} onChange={(e) => setNote(e.target.value)} placeholder="Add a confidential production note…" className={inputCls} />
            <Btn disabled={!can.write || !note.trim()} onClick={postNote}><FiSave /> Post note</Btn>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {r.notes.map((n) => <div key={n.id} className="rounded-lg bg-neutral-900 p-3"><div className="flex justify-between gap-2 text-[10px]"><b className="break-all">{n.authorEmail}</b><span className="shrink-0 text-white/40">{ago(n.createdAt)}</span></div><p className="mt-1 whitespace-pre-line text-xs text-white/70">{n.body}</p></div>)}
            </div>
          </Card>

          <Card index={6} className="space-y-3 p-5">
            <span className={`${mono} text-white/45`}>Activity timeline</span>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {r.activity.map((a) => (
                <div key={a.id} className="border-l-2 border-red-600 bg-neutral-900 px-3 py-2"><div className="flex justify-between gap-2 text-[10px]"><b className="break-all">{a.actor}</b><span className="shrink-0 text-white/40">{ago(a.createdAt)}</span></div><p className="mt-1 text-xs text-white/70">{a.message}</p></div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <ErrorLine>{prod.error}</ErrorLine>
      {dlg === 'call' && <CallModal id={id} onClose={close} onDone={() => { close(); refresh(); }} />}
      {dlg === 'email' && <EmailModal r={r} onClose={close} onDone={() => { close(); refresh(); }} />}
      {dlg === 'decline' && (
        <ConfirmModal open title="Decline this request?" confirmLabel="Decline request" noteLabel="Reason (kept internally)" noteMin={3} onClose={close}
          onConfirm={async (n) => { try { await A.setRequestStatus(id, { status: 'DECLINED', note: n }); toast.success('Request declined'); close(); refresh(); } catch (e) { toast.error(apiErrorMessage(e)); } }}>
          <p>The client is not emailed automatically. Use “Email client” if you want to tell them.</p>
        </ConfirmModal>
      )}
    </>
  );
}