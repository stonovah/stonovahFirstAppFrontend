// src/pages/Checkout.jsx
import React, { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLock, FiShield } from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { publicApi } from '../api/public';
import { apiErrorMessage } from '../api/apiClient';
import { useFeeRate } from './steps/helpers';
import { MAX_PER_TYPE } from '../components/tickets/TicketPicker';
import { PENDING_KEY, readCart, usePublicEvent, naira, remaining, fmtDay, fmtTime, eventFacts } from './public/publicLive';

const Shell = ({ children }) => (
  <main className="min-h-screen bg-[#FFBF00] text-[#111111] font-sans antialiased selection:bg-[#E50914] selection:text-white">
    <Navbar />{children}<Footer />
  </main>
);
const Box = ({ children }) => (
  <div className="max-w-xl mx-auto px-6 py-20"><div className="bg-[#111111] text-white p-8 rounded-2xl text-center space-y-3">{children}</div></div>
);
const input = 'mt-1.5 w-full bg-neutral-900 border border-neutral-700 text-white px-3.5 py-3 rounded-lg text-sm normal-case focus:border-[#FFBF00] focus:outline-none';
const Field = ({ label, error, children }) => (
  <label className="block text-[10px] font-mono text-neutral-400 uppercase">{label}{children}{error && <span className="block mt-1 normal-case text-red-400">{error}</span>}</label>
);
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Checkout() {
  // ---- All hooks live here, before any early return ----
  const { state } = useLocation();
  const navigate = useNavigate();
  const feeRate = useFeeRate();
  const cart = useMemo(() => readCart(state), []); // eslint-disable-line react-hooks/exhaustive-deps
  const { data: e, loading, notFound, error } = usePublicEvent(cart?.slug || null);
  const [f, setF] = useState({ name: '', email: '', email2: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [touched, setTouched] = useState(false); // moved up from below the early returns
  const made = useRef(null); // { key, id }: reuse the order if the payment step failed and the buyer retries

  // ---- Early returns (no hooks below this line) ----
  if (!cart) return <Shell><Box><h1 className="text-2xl font-black uppercase">Your cart is empty</h1><p className="text-xs text-neutral-400">Pick some tickets first.</p><Link to="/events" className="inline-block text-[#FFBF00] text-xs font-bold hover:underline">Browse events</Link></Box></Shell>;
  if (loading) return <Shell><p className="max-w-7xl mx-auto px-6 py-20 font-mono text-xs font-bold">LOADING CHECKOUT…</p></Shell>;
  if (notFound || error || !e) return <Shell><Box><h1 className="text-2xl font-black uppercase">{notFound ? 'Event not found' : 'Something went wrong'}</h1><p className="text-xs text-neutral-400">{notFound ? 'This event is no longer on sale.' : error}</p><Link to="/events" className="inline-block text-[#FFBF00] text-xs font-bold hover:underline">Browse events</Link></Box></Shell>;

  const facts = eventFacts(e);
  // Prices and stock come from the server again, so a stale cart can't be bought
  const lines = cart.items
    .map((i) => { const t = e.tiers.find((x) => x.id === i.tierId); return t ? { tier: t, quantity: Math.min(i.quantity, remaining(t), MAX_PER_TYPE), wanted: i.quantity } : null; })
    .filter((l) => l && l.quantity > 0);
  const adjusted = cart.items.some((i) => { const l = lines.find((x) => x.tier.id === i.tierId); return !l || l.quantity < i.quantity; });
  const subtotal = lines.reduce((s, l) => s + l.tier.price * l.quantity, 0);
  const buyerPays = e.feeHandling === 'BUYER_ADDED';
  const fee = buyerPays ? Math.round(subtotal * feeRate) : 0;
  const total = subtotal + fee;
  const count = lines.reduce((s, l) => s + l.quantity, 0);

  const errs = {
    name: !f.name.trim() && 'Enter your full name',
    email: !emailRx.test(f.email.trim()) && 'Enter a valid email address',
    email2: f.email2.trim().toLowerCase() !== f.email.trim().toLowerCase() && 'The two emails do not match',
    phone: f.phone.trim().length < 7 && 'Enter a phone number (at least 7 characters)',
  };
  const valid = !Object.values(errs).some(Boolean) && lines.length > 0 && !facts.ended;
  const show = (k) => (touched ? errs[k] : '');

  const submit = async (ev) => {
    ev.preventDefault();
    setTouched(true);
    if (!valid || busy) return;
    setBusy(true); setMsg('');
    try {
      const body = {
        eventId: e.id, buyerName: f.name.trim(), buyerEmail: f.email.trim(), buyerPhone: f.phone.trim(),
        items: lines.map((l) => ({ tierId: l.tier.id, quantity: l.quantity })),
      };
      const key = JSON.stringify(body);
      if (made.current?.key !== key) made.current = { key, id: (await publicApi.createOrder(body)).id };
      const pay = await publicApi.startPayment(made.current.id);
      try { sessionStorage.setItem(PENDING_KEY, made.current.id); } catch { /* private mode */ }
      if (pay.free) { navigate(`/checkout/complete?order=${made.current.id}`, { replace: true }); return; }
      window.location.assign(pay.authorizationUrl); // on to Paystack
    } catch (err) {
      setMsg(apiErrorMessage(err, 'We could not start your payment. Please try again.'));
      setBusy(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link to={`/events/${e.slug}`} className="inline-flex items-center gap-2 text-xs font-mono font-bold hover:underline mb-6"><FiArrowLeft /> Change tickets</Link>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={submit} noValidate className="lg:col-span-7 bg-[#111111] text-white p-6 md:p-8 rounded-2xl shadow-2xl space-y-5">
            <div className="border-b border-neutral-800 pb-3"><span className="text-[10px] font-mono text-[#FFBF00] font-bold uppercase tracking-widest block mb-1">YOUR DETAILS</span><h2 className="text-xl font-black uppercase">Who are the tickets for?</h2></div>
            <Field label="Full name *" error={show('name')}><input autoComplete="name" maxLength={120} value={f.name} onChange={(x) => setF({ ...f, name: x.target.value })} className={input} /></Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Email *" error={show('email')}><input type="email" autoComplete="email" value={f.email} onChange={(x) => setF({ ...f, email: x.target.value })} className={input} /></Field>
              <Field label="Confirm email *" error={show('email2')}><input type="email" autoComplete="off" value={f.email2} onChange={(x) => setF({ ...f, email2: x.target.value })} className={input} /></Field>
            </div>
            <Field label="Phone *" error={show('phone')}><input type="tel" autoComplete="tel" maxLength={20} value={f.phone} onChange={(x) => setF({ ...f, phone: x.target.value })} placeholder="+234 …" className={input} /></Field>
            <p className="text-[11px] text-neutral-400">Your tickets are emailed to this address, so double-check it.</p>

            {adjusted && <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">Some tickets sold out while you were choosing, so we reduced your order. Check the summary before paying.</p>}
            {msg && <p className="text-xs text-red-300 bg-red-950/40 border border-red-900 rounded-lg p-3">{msg}</p>}

            <button type="submit" disabled={busy || lines.length === 0 || facts.ended}
              className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${busy || lines.length === 0 || facts.ended ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-[#E50914] hover:bg-red-700 text-white shadow-xl shadow-red-950/50 cursor-pointer'}`}>
              <FiLock /> {busy ? 'Please wait…' : lines.length === 0 ? 'Sold out' : total ? `Pay ${naira(total)}` : 'Get free tickets'}
            </button>
            <p className="text-[10px] text-neutral-500 text-center flex items-center justify-center gap-1.5"><FiShield className="text-[#FFBF00]" /> {total ? 'You will pay on Paystack’s secure page.' : 'No payment needed.'}</p>
          </form>

          <aside className="lg:col-span-5">
            <div className="sticky top-20 bg-[#111111] text-white p-6 rounded-2xl shadow-2xl space-y-4">
              <div className="border-b border-neutral-800 pb-3">
                <span className="text-[9px] font-mono text-neutral-400 uppercase block">ORDER SUMMARY</span>
                <h2 className="text-lg font-black uppercase leading-tight">{e.title}</h2>
                <span className="text-[11px] text-neutral-400 block mt-1">{fmtDay(e.startAt)} • {fmtTime(e.startAt)} • {e.venue}</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                {lines.map((l) => (
                  <div key={l.tier.id} className="flex justify-between gap-3 text-neutral-300"><span>{l.quantity} × {l.tier.name}</span><span className="shrink-0">{l.tier.price ? naira(l.tier.price * l.quantity) : 'Free'}</span></div>
                ))}
                {buyerPays && subtotal > 0 && <div className="flex justify-between text-neutral-400"><span>Booking fee</span><span>{naira(fee)}</span></div>}
                <div className="flex justify-between text-sm font-bold pt-3 border-t border-neutral-800"><span>Total ({count} ticket{count === 1 ? '' : 's'})</span><span className="text-[#FFBF00]">{total ? naira(total) : 'Free'}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}