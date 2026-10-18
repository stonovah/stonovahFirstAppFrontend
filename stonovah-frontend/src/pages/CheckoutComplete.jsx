// src/pages/CheckoutComplete.jsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiAlertTriangle, FiDownload, FiLoader } from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { publicApi } from '../api/public';
import { apiErrorMessage } from '../api/apiClient';
import { CART_KEY, PENDING_KEY, naira, fmtDay, fmtTime } from './public/publicLive';

const Shell = ({ children }) => (
  <main className="min-h-screen bg-[#FFBF00] text-[#111111] font-sans antialiased selection:bg-[#E50914] selection:text-white">
    <Navbar /><div className="max-w-2xl mx-auto px-6 py-16">{children}</div><Footer />
  </main>
);
const Card = ({ children }) => <div className="bg-[#111111] text-white p-8 rounded-2xl shadow-2xl space-y-5">{children}</div>;
const btn = 'inline-block bg-[#E50914] hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition cursor-pointer';

export default function CheckoutComplete() {
  const [params] = useSearchParams();
  const orderId = params.get('order') || (() => { try { return sessionStorage.getItem(PENDING_KEY); } catch { return null; } })();
  const [o, setO] = useState(null);
  const [error, setError] = useState('');
  const [waited, setWaited] = useState(false); // polling gave up
  const [retryMsg, setRetryMsg] = useState('');
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!orderId) return undefined;
    let live = true;
    let timer;
    const run = async (n) => {
      try {
        const r = await publicApi.verifyOrder(orderId);
        if (!live) return;
        setO(r); setError('');
        // Done once the tickets exist and have PDFs. We no longer wait for the email.
        const done = r.status === 'PAID' && r.ticketCount >= r.expectedTickets && r.tickets?.some((t) => t.pdfUrl);
        const stop = r.status !== 'PAID' && (r.paymentStatus === 'failed' || r.paymentStatus === 'mismatch');
        if (done || stop) return;
        if (n >= 20) { setWaited(true); return; }
        timer = setTimeout(() => run(n + 1), n < 5 ? 3000 : 6000);
      } catch (e) {
        if (!live) return;
        setError(apiErrorMessage(e, 'We could not check your order. Please refresh this page.'));
      }
    };
    run(0);
    return () => { live = false; clearTimeout(timer); };
  }, [orderId]);

  useEffect(() => {
    if (o?.status === 'PAID') { try { sessionStorage.removeItem(CART_KEY); sessionStorage.removeItem(PENDING_KEY); } catch { /* ignore */ } }
  }, [o?.status]);

  const retry = async () => {
    setRetrying(true); setRetryMsg('');
    try { const p = await publicApi.startPayment(orderId); window.location.assign(p.authorizationUrl); }
    catch (e) { setRetryMsg(apiErrorMessage(e, 'Could not restart the payment.')); setRetrying(false); }
  };

  if (!orderId) return <Shell><Card><h1 className="text-2xl font-black uppercase">We couldn’t find your order</h1><Link to="/events" className={btn}>Browse events</Link></Card></Shell>;
  if (error && !o) return <Shell><Card><h1 className="text-2xl font-black uppercase">Something went wrong</h1><p className="text-xs text-neutral-400">{error}</p></Card></Shell>;
  if (!o) return <Shell><Card><p className="flex items-center gap-2 text-sm font-mono"><FiLoader className="animate-spin" /> Confirming your payment…</p></Card></Shell>;

  const ref = String(o.id).slice(-8).toUpperCase();

  if (o.status === 'PAID') {
    const ready = o.ticketCount >= o.expectedTickets;
    const downloadable = (o.tickets || []).filter((t) => t.pdfUrl);
    const preparing = !ready || downloadable.length === 0;

    return (
      <Shell>
        <Card>
          <div className="flex items-center gap-3"><FiCheckCircle className="text-emerald-400 text-3xl shrink-0" /><div><span className="text-[10px] font-mono text-[#FFBF00] font-bold uppercase tracking-widest block">ORDER {ref}</span><h1 className="text-2xl font-black uppercase leading-tight">You’re going!</h1></div></div>
          <div className="bg-neutral-900 rounded-xl p-4 space-y-1 text-xs">
            <b className="text-sm font-sans block">{o.event.title}</b>
            <span className="text-neutral-400 block">{fmtDay(o.event.startAt)} • {fmtTime(o.event.startAt)} • {o.event.venue}</span>
            <div className="pt-2 space-y-0.5 font-mono">{o.items.map((i) => <div key={i.id} className="flex justify-between"><span>{i.quantity} × {i.tierName}</span><span>{i.unitPrice ? naira(i.unitPrice * i.quantity) : 'Free'}</span></div>)}</div>
            <div className="flex justify-between font-bold pt-2 border-t border-neutral-800 font-mono"><span>Total paid</span><span className="text-[#FFBF00]">{o.totalAmount ? naira(o.totalAmount) : 'Free'}</span></div>
          </div>

          {preparing && !waited && (
            <p className="text-xs text-neutral-300 flex items-start gap-2"><FiLoader className="animate-spin mt-0.5 shrink-0" /> Your tickets are being prepared. Your download links will appear here in a moment.</p>
          )}
          {preparing && waited && (
            <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">Your payment is confirmed, but your tickets are taking longer than usual. Refresh this page in a minute, or contact <a href="mailto:contact@stonovah.com" className="underline font-bold">contact@stonovah.com</a> with reference <b>{ref}</b>.</p>
          )}

          {!preparing && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block">DOWNLOAD YOUR TICKETS</span>
              {downloadable.map((t) => (
                <a key={t.id} href={t.pdfUrl} target="_blank" rel="noopener noreferrer" download className="flex items-center justify-between gap-3 bg-neutral-900 hover:bg-neutral-800 rounded-lg px-4 py-3 text-xs transition">
                  <span><b className="font-mono text-[#FFBF00]">{t.ticketCode}</b> <span className="text-neutral-400">• {t.tierName}</span></span><FiDownload />
                </a>
              ))}
              <p className="text-[11px] text-neutral-400">
                {o.emailed
                  ? <>We also emailed your tickets to <b>{o.buyerEmail}</b>. If you can’t see the email, check your spam folder.</>
                  : <>Download and save your tickets now, since you’ll need them at the entrance.</>}
              </p>
            </div>
          )}

          <p className="text-[11px] text-neutral-500">Show the QR code on each ticket at the entrance. Every ticket works once. Please don’t share this page, since it links to your tickets.</p>
          <Link to="/events" className={btn}>Back to events</Link>
        </Card>
      </Shell>
    );
  }

  if (o.paymentStatus === 'failed') {
    return (
      <Shell><Card>
        <div className="flex items-center gap-3"><FiAlertTriangle className="text-amber-300 text-3xl shrink-0" /><h1 className="text-2xl font-black uppercase leading-tight">Payment wasn’t completed</h1></div>
        <p className="text-xs text-neutral-300">You haven’t been charged for order {ref}. You can try again, or choose different tickets.</p>
        {retryMsg && <p className="text-xs text-red-300">{retryMsg}</p>}
        <div className="flex flex-wrap gap-3"><button type="button" onClick={retry} disabled={retrying} className={`${btn} disabled:opacity-50`}>{retrying ? 'Please wait…' : 'Try payment again'}</button><Link to={`/events/${o.event.slug}`} className="text-[#FFBF00] text-xs font-bold hover:underline self-center">Choose different tickets</Link></div>
      </Card></Shell>
    );
  }

  if (o.paymentStatus === 'mismatch') {
    return (
      <Shell><Card>
        <div className="flex items-center gap-3"><FiAlertTriangle className="text-amber-300 text-3xl shrink-0" /><h1 className="text-2xl font-black uppercase leading-tight">We need to check your payment</h1></div>
        <p className="text-xs text-neutral-300">The amount we received for order <b>{ref}</b> doesn’t match the order total, so we’ve paused it for a manual check. Please contact us with this reference.</p>
        <a href="mailto:contact@stonovah.com" className="text-[#FFBF00] text-xs font-bold hover:underline">contact@stonovah.com</a>
      </Card></Shell>
    );
  }

  return (
    <Shell><Card>
      {waited ? (
        <>
          <div className="flex items-center gap-3"><FiAlertTriangle className="text-amber-300 text-3xl shrink-0" /><h1 className="text-2xl font-black uppercase leading-tight">Still waiting for confirmation</h1></div>
          <p className="text-xs text-neutral-300">We haven’t received confirmation for order <b>{ref}</b> yet. If you were charged, your tickets will appear on this page as soon as the payment is confirmed. If nothing shows within an hour, contact us with this reference.</p>
          <a href="mailto:contact@stonovah.com" className="text-[#FFBF00] text-xs font-bold hover:underline">contact@stonovah.com</a>
        </>
      ) : (
        <p className="flex items-center gap-2 text-sm font-mono"><FiLoader className="animate-spin" /> Confirming your payment…</p>
      )}
    </Card>
    </Shell>
  );
}