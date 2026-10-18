// src/pages/CreateEvent.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiArrowLeft, FiArrowRight, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

import BasicDetails from './steps/BasicDetails';
import TicketTypes from './steps/TicketTypes';
import ServiceFee from './steps/ServiceFee';
import TicketTemplate from './steps/TicketTemplate';
import ReviewPublish from './steps/ReviewPublish';
import SubmittedForReview from './steps/SubmittedForReview';
import {
  containerAnimation, emptyForm, eventToForm, eventPayload, tierFromApi, tierBody, tierChanged,
  tierError, feeHandlingOf, readiness, step1Valid, titleOk, tiersValid, useFeeRate,
} from './steps/helpers';
import { eventsApi, tiersApi, templatesApi, uploadsApi } from '../api/events';
import { apiErrorMessage } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/routes';
import { settingsApi } from '../api/settings';

const wizardSteps = [
  { id: 1, title: 'Basic Details', subtitle: 'EVENT INFO' },
  { id: 2, title: 'Ticket Types', subtitle: 'INVENTORY' },
  { id: 3, title: 'Service Fee Configuration', subtitle: 'FEES & TAXES' },
  { id: 4, title: 'Ticket Template', subtitle: 'AESTHETIC' },
  { id: 5, title: 'Review & Publish', subtitle: 'LAUNCH' },
];

// Errors raised by our own checks (as opposed to API errors)
class ValidationError extends Error {}
const errMsg = (e) => (e instanceof ValidationError ? e.message : apiErrorMessage(e));
const clock = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export default function CreateEventWizard({ onViewEvents, onDashboard } = {}) {
  const navigate = useNavigate();
  const goMyEvents = onViewEvents || (() => navigate(ROUTES.myEvents));
  const goDashboard = onDashboard || (() => navigate(ROUTES.organizerDashboard));
  const { user, refreshUser } = useAuth();
  const kycStatus = user?.organizerProfile?.kycStatus;
  const feeRate = useFeeRate();

  // The step AND the event id live in the URL: /create-event?event=<id>&step=3
  const [params, setParams] = useSearchParams();
  const eventId = params.get('event');
  const stepParam = Number(params.get('step'));
  const currentStep = stepParam >= 1 && stepParam <= wizardSteps.length ? stepParam : 1;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!!eventId);
  const [reloadKey, setReloadKey] = useState(0);
  const [blocked, setBlocked] = useState(null); // an event that can no longer be edited
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState('');
  const [submission, setSubmission] = useState(null);

  // Server-side state we diff against, so we only send what changed
  const idRef = useRef(eventId);
  const loadedFor = useRef(null);
  const serverTiers = useRef([]);
  const serverFee = useRef(null);
  const serverTemplate = useRef(null);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const setStep = (n) =>
    setParams({ ...(idRef.current ? { event: idRef.current } : {}), step: String(n) });

  // ---------- load an existing draft (or reset for a new one) ----------
  useEffect(() => {
    if (!eventId) {
      if (loadedFor.current) {
        loadedFor.current = null; idRef.current = null;
        serverTiers.current = []; serverFee.current = null; serverTemplate.current = null;
        setForm(emptyForm); setSubmission(null); setBlocked(null);
      }
      setLoading(false);
      return;
    }
    if (loadedFor.current === eventId && reloadKey === 0) return;
    loadedFor.current = eventId;
    idRef.current = eventId;
    (async () => {
      setLoading(true); setError('');
      try {
        const [ev, tiers] = await Promise.all([eventsApi.get(eventId), tiersApi.list(eventId)]);
        if (ev.status !== 'DRAFT') { setBlocked(ev); return; }
        setBlocked(null);
        serverTiers.current = tiers.map(tierFromApi);
        serverFee.current = ev.feeHandling;
        serverTemplate.current = ev.ticketTemplateId;
        setForm(eventToForm(ev, tiers));
      } catch (e) {
        setError(apiErrorMessage(e, 'Could not load this event.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, reloadKey]);

  // Published ticket templates (admin-managed)
  useEffect(() => {
    templatesApi.list().then(setTemplates).catch(() => {}).finally(() => setTemplatesLoading(false));
  }, []);

  // KYC may have been verified since login: refresh once so Publish unlocks
  useEffect(() => {
    if (kycStatus && kycStatus !== 'VERIFIED') refreshUser().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentStep]);

const defaultsApplied = useRef(false);
useEffect(() => {
  if (eventId || defaultsApplied.current) return;
  defaultsApplied.current = true;
  const fromLibrary = params.get('template');
  settingsApi.get()
    .then((s) => setForm((f) => ({
      ...f,
      feeOption: s.defaults.feeHandling === 'BUYER_ADDED' ? 'buyer' : 'organizer',
      templateId: fromLibrary || f.templateId || s.defaults.defaultTemplateId || null,
    })))
    .catch(() => { if (fromLibrary) setForm((f) => ({ ...f, templateId: fromLibrary })); });
}, [eventId])

useEffect(() => {
  if (!templatesLoading && form.templateId && !templates.some((t) => t.id === form.templateId)) update('templateId', null);
}, [templatesLoading, templates, form.templateId]);

  // ---------- persistence ----------
  const ensureEvent = async () => {
    if (!titleOk(form)) throw new ValidationError('Enter an event name (at least 3 characters).');
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
      throw new ValidationError('End time must be after the start time.');
    }
    const payload = eventPayload(form);
    if (!idRef.current) {
      const ev = await eventsApi.create(payload);
      idRef.current = ev.id;
      loadedFor.current = ev.id; // stops the load effect re-fetching what we just created
      return ev.id;
    }
    await eventsApi.update(idRef.current, payload);
    return idRef.current;
  };

  const syncTiers = async (id) => {
    for (const t of form.tiers) {
      const e = tierError(t);
      if (e) throw new ValidationError(`${t.name?.trim() || 'A ticket type'}: ${e}`);
    }
    let server = [...serverTiers.current];
    const resolved = new Map(); // local key -> saved tier
    try {
      for (const s of serverTiers.current) {
        if (!form.tiers.some((t) => t.id === s.id)) {
          await tiersApi.remove(id, s.id);
          server = server.filter((x) => x.id !== s.id);
        }
      }
      for (const t of form.tiers) {
        const body = tierBody(t);
        let saved;
        if (!t.id) saved = tierFromApi(await tiersApi.create(id, body));
        else if (tierChanged(t, server.find((x) => x.id === t.id))) saved = tierFromApi(await tiersApi.update(id, t.id, body));
        else continue;
        resolved.set(t.key, saved);
        server = [...server.filter((x) => x.id !== saved.id), saved];
      }
    } finally {
      // keep progress even if a later request failed, so a retry never duplicates a tier
      serverTiers.current = server;
      if (resolved.size) {
        setForm((f) => ({ ...f, tiers: f.tiers.map((t) => (resolved.has(t.key) ? { ...resolved.get(t.key), key: t.key } : t)) }));
      }
    }
  };

  // Saves everything up to and including `step`
  const saveUpTo = async (step) => {
    const id = await ensureEvent();
    if (step >= 2) await syncTiers(id);
    if (step >= 3) {
      const want = feeHandlingOf(form.feeOption);
      if (serverFee.current !== want) { await eventsApi.setFee(id, want); serverFee.current = want; }
    }
    if (step >= 4 && form.templateId && serverTemplate.current !== form.templateId) {
      await eventsApi.selectTemplate(id, form.templateId);
      serverTemplate.current = form.templateId;
    }
    setSavedAt(clock());
    return id;
  };

  // Forward navigation saves the current step first; going back never blocks
  const go = async (n) => {
    setError('');
    if (n > currentStep) {
      setBusy(true);
      try { await saveUpTo(currentStep); }
      catch (e) { setError(errMsg(e)); return; }
      finally { setBusy(false); }
    }
    setStep(n);
  };

  const saveDraft = async () => {
    setError(''); setBusy(true);
    try {
      await saveUpTo(currentStep);
      setStep(currentStep); // puts ?event=<id> into the URL after the first save
      toast.success('Draft saved');
    } catch (e) { setError(errMsg(e)); }
    finally { setBusy(false); }
  };

  const publish = async () => {
    setError(''); setBusy(true);
    try {
      const id = await saveUpTo(5); // never rely on earlier per-step saves
      const ev = await eventsApi.submit(id);
      setSubmission({
        submittedAt: new Date(ev.updatedAt).getTime(),
        eventId: ev.id,
        reviewRef: `REV-${new Date().getFullYear()}-${String(ev.id).slice(-4).toUpperCase()}`,
        queuePosition: null,
        curator: 'Compliance Team',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { setError(errMsg(e)); }
    finally { setBusy(false); }
  };

  const withdrawBlocked = async () => {
    try {
      await eventsApi.withdraw(blocked.id);
      loadedFor.current = null; setReloadKey((k) => k + 1);
      toast.success('Event withdrawn. You can edit it again.');
    } catch (e) { toast.error(apiErrorMessage(e)); }
  };

  const uploadPoster = async (file) => update('posterUrl', await uploadsApi.image(file));

  // ---------- derived ----------
  const checks = readiness(form, kycStatus);
  const allReady = checks.every((c) => c.ok);
  const canContinue =
    currentStep === 1 ? step1Valid(form)
    : currentStep === 2 ? tiersValid(form)
    : currentStep === 4 ? !!form.templateId
    : true;

  const ctx = {
    feeRate, templates, templatesLoading, kycStatus, checks, error,
    next: () => go(currentStep + 1),
    uploadPoster,
  };

  const renderStep = () => {
    const props = { form, update, goTo: go, ctx };
    switch (currentStep) {
      case 1: return <BasicDetails {...props} />;
      case 2: return <TicketTypes {...props} />;
      case 3: return <ServiceFee {...props} />;
      case 4: return <TicketTemplate {...props} />;
      case 5: return <ReviewPublish {...props} />;
      default: return null;
    }
  };

  // ---------- screens ----------
  const shell = (children) => (
    <div className="min-h-screen bg-[#FFBF00] text-black font-sans selection:bg-black selection:text-[#FFBF00]">
      <main className="p-4 md:p-8 overflow-x-hidden space-y-6">{children}</main>
    </div>
  );

  if (loading) return shell(<p className="font-mono text-xs font-bold">LOADING EVENT…</p>);

  if (blocked) {
    return shell(
      <div className="bg-black text-white p-6 rounded-2xl space-y-4 font-mono max-w-xl">
        <h2 className="text-xl font-black font-sans">“{blocked.title}” can’t be edited right now</h2>
        <p className="text-xs text-neutral-300">
          Its status is <b>{blocked.status}</b>. Only draft events can be edited.
          {blocked.status === 'PENDING' && ' Withdraw it from review to edit it again.'}
        </p>
        <div className="flex gap-2">
          {blocked.status === 'PENDING' && (
            <button type="button" onClick={withdrawBlocked} className="bg-red-600 hover:bg-red-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">Withdraw from review</button>
          )}
          <button type="button" onClick={goMyEvents} className="bg-neutral-900 border border-neutral-800 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">Back to My Events</button>
        </div>
      </div>
    );
  }

  if (submission) {
    return shell(
      <SubmittedForReview
        form={form}
        submission={submission}
        onViewEvents={goMyEvents}
        onDashboard={goDashboard}
      />
    );
  }

  return shell(
    <>
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black text-white p-6 rounded-2xl border border-black shadow-2xl">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
            PRODUCTION MANIFEST // STONOVAH LIVE • ID: {idRef.current ? String(idRef.current).slice(-8).toUpperCase() : 'NEW DRAFT'}
          </span>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white font-sans">
            {idRef.current ? 'Edit Live Event Production' : 'Create Live Event Production'}
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl font-mono shrink-0">
          <span className={`w-2 h-2 rounded-full ${savedAt ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
          <span className="text-[10px] text-neutral-300 uppercase font-bold">{savedAt ? `SAVED ${savedAt}` : 'NOT SAVED YET'}</span>
        </div>
      </div>

      {kycStatus && kycStatus !== 'VERIFIED' && (
        <p className="bg-black text-[#FFBF00] font-mono text-xs font-bold rounded-xl p-3">
          Your KYC is {kycStatus === 'REJECTED' ? 'rejected' : 'still under review'}. You can build and save this event now; submitting it for review unlocks once your KYC is verified.
        </p>
      )}

      {/* STEPPER */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 font-mono text-xs">
        {wizardSteps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <button
              key={step.id}
              type="button"
              disabled={busy}
              onClick={() => go(step.id)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                isActive ? 'bg-black text-white border-black shadow-lg ring-2 ring-red-600'
                : isCompleted ? 'bg-black/90 text-neutral-300 border-black/40'
                : 'bg-black/80 text-neutral-400 border-black/20 hover:bg-black'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-red-600 text-white' : isCompleted ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {isCompleted ? <FiCheck /> : step.id}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 block truncate">
                  {isActive ? 'ACTIVE STAGE' : step.subtitle}
                </span>
              </div>
              <span className="font-bold block truncate text-xs">{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE STEP */}
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial="hidden" animate="visible" exit="exit" variants={containerAnimation}>
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {error && <p className="font-mono text-xs font-bold text-red-400 bg-black rounded-xl p-3">{error}</p>}

      {/* FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/20 font-mono text-xs">
        <button
          type="button"
          onClick={() => go(currentStep - 1)}
          disabled={currentStep === 1 || busy}
          className="bg-black/10 hover:bg-black/20 cursor-pointer text-black font-bold px-5 py-2.5 rounded-xl border border-black/20 flex items-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiArrowLeft /> {currentStep === 1 ? 'Back' : `Back to ${wizardSteps[currentStep - 2].title}`}
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveDraft}
            disabled={busy || !titleOk(form)}
            className="bg-black/10 hover:bg-black/20 cursor-pointer text-black font-bold px-4 py-2.5 rounded-xl border border-black/20 flex items-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiSave /> {busy ? 'Saving…' : 'Save as Draft'}
          </button>

          {currentStep < wizardSteps.length ? (
            <button
              type="button"
              onClick={() => go(currentStep + 1)}
              disabled={!canContinue || busy}
              className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-2.5 rounded-xl uppercase tracking-wider shadow-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? 'Saving…' : <>Continue to {wizardSteps[currentStep].title} <FiArrowRight /></>}
            </button>
          ) : (
            <button
              type="button"
              onClick={publish}
              disabled={!allReady || busy}
              className="bg-red-600 cursor-pointer hover:bg-red-700 text-white font-black px-6 py-2.5 rounded-xl uppercase tracking-wider shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? 'Submitting…' : 'Submit for Review'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}