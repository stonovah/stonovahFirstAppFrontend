// src/pages/organizer/OrganizerOnboarding.jsx — wired to the API
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiCheck } from 'react-icons/fi';

import AccountCredentials from './steps/AccountCredentials';
import KycCompliance from './steps/KycCompliance';
import KycPending from './steps/KycPending';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { organizerApi } from '../../api/organizer';
import { apiErrorMessage, apiFieldErrors } from '../../api/apiClient';
import { ROUTES } from '../../config/routes';

const DASHBOARD_PATH = ROUTES.organizerDashboard; // <- adjust to your dashboard route
const DRAFT_KEY = 'stonovah_organizer_draft';
const POLL_MS = 15000;

const emptyForm = {
  // step 1
  email: '', firstName: '', lastName: '', dialCode: '+234', phone: '', orgName: '',
  password: '', confirmPassword: '', tier: 'B', disciplines: [],
  agreeTerms: false, agreeConsent: false,
  // step 2
  kycType: 'business',
  biz: {
    legalName: '', entityType: 'Private Limited Company (Ltd / LLC)', cac: '', tin: '',
    country: 'Nigeria (NG)', state: 'Lagos State', address: '', director: '', repEmail: '',
    certificate: null, addressProof: null,
  },
  ind: {
    legalName: '', dob: '', nationality: 'Nigeria (NG - Federal Republic)', address: '', city: '',
    state: '', postal: '', nin: '', idType: 'NIN Digital Slip', idDoc: null, liveness: false,
  },
};

// Drafts never include passwords, files, NIN, or consent checkboxes
const serializeDraft = (f) =>
  JSON.stringify({
    ...f,
    password: '', confirmPassword: '', agreeTerms: false, agreeConsent: false,
    biz: { ...f.biz, certificate: null, addressProof: null },
    ind: { ...f.ind, idDoc: null, liveness: false, nin: '' },
  });

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...emptyForm, ...JSON.parse(raw) } : emptyForm;
  } catch {
    return emptyForm;
  }
};

// Display-only reference built from the profile record
const toSubmission = (profile) => ({
  reference: `KYC-ORG-${new Date(profile.updatedAt || Date.now()).getFullYear()}-${String(profile.id).slice(-4).toUpperCase()}-STN`,
  queue: `STN-${String(profile.id).slice(-3).toUpperCase()}`,
  submittedAt: new Date(profile.updatedAt || Date.now()).getTime(),
  status: profile.kycStatus,
});

// ---- request builders: frontend form -> backend body ----
const buildBusinessBody = (b) => ({
  organizationName: b.legalName.trim(),
  entityType: b.entityType,
  cacNumber: b.cac.trim(),
  tin: b.tin.trim() || undefined,
  country: b.country,
  jurisdictionState: b.state,
  address: b.address.trim(),
  directorName: b.director.trim(),
  representativeEmail: b.repEmail.trim().toLowerCase(),
});

const buildIndividualBody = (i) => ({
  fullName: i.legalName.trim(),
  dateOfBirth: i.dob,
  nationality: i.nationality,
  address: i.address.trim(),
  city: i.city.trim() || undefined,
  state: i.state || undefined,
  postal: i.postal.trim() || undefined,
  idType: i.idType,
  nin: i.nin.replace(/\D/g, ''),
});

// form field -> backend document key (must match KYC_DOCUMENT_KEYS)
const toFile = (f) => (f instanceof File ? f : f?.file || null);
const buildDocuments = (f) => {
  const fd = new FormData();
  const add = (key, v) => { const file = toFile(v); if (file) fd.append(key, file); };
  if (f.kycType === 'business') {
    add('cacCertificate', f.biz.certificate);
    add('addressProof', f.biz.addressProof);
  } else {
    add('idDocument', f.ind.idDoc);
  }
  return fd;
};

const steps = [
  { id: 1, title: 'Account Credentials' },
  { id: 2, title: 'KYC & Legal Entity' },
  { id: 3, title: 'KYC Review' },
];

const pageAnim = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.2 } },
};

export default function OrganizerOnboarding() {
  const navigate = useNavigate();
  const { user, status: authStatus, login, refreshUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const [form, setForm] = useState(loadDraft);
  const [submission, setSubmission] = useState(null);
  const [maxReached, setMaxReached] = useState(1);
  const [savedAt, setSavedAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState('');

  // ---------- resume from server state (page reload / returning user) ----------
 useEffect(() => {
  if (user?.role === 'STAFF') { navigate(ROUTES.organizerDashboard, { replace: true }); return; }
  if(user?.role === 'ADMIN') {navigate("/admin")}
  if (authStatus !== 'authed' || !user?.organizerProfile) return;
  const p = user.organizerProfile;
  // The local draft is cleared after submit, so refill what the pending page displays
  setForm((f) => ({ ...f, email: f.email || user.email, phone: f.phone || user.phone || '', dialCode: f.phone ? f.dialCode : '' }));
  if (p.kycStatus === 'VERIFIED') { navigate(ROUTES.organizerDashboard, { replace: true }); return; }
  if (p.organizerType && p.kycStatus === 'PENDING') { setSubmission(toSubmission(p)); return; }
  setMaxReached((m) => Math.max(m, 2)); // account exists: skip the credentials step
  if (!params.get('step')) setParams({ step: '2' }, { replace: true });
  if (p.organizerType && p.kycStatus === 'REJECTED') {
    setNotice('Your previous KYC submission was rejected. Please review your details and resubmit.');
  }
  
}, [authStatus, user, navigate]);

  // ---------- poll KYC status while pending ----------
  useEffect(() => {
    if (!submission) return undefined;
    const tick = async () => {
      try {
        const s = await organizerApi.getKycStatus();
        if (s.kycStatus === 'VERIFIED') {
          await refreshUser();
          navigate(DASHBOARD_PATH, { replace: true });
        } else if (s.kycStatus === 'REJECTED') {
          setSubmission(null);
          setNotice('Your KYC was rejected. Please review your details and resubmit.');
          setParams({ step: '2' });
        }
      } catch { /* transient: try again next tick */ }
    };
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [submission, refreshUser, navigate, setParams]);

  // Pending page replaces step 3 once KYC is submitted
  const requested = Number(params.get('step')) || 1;
  const step = submission ? 3 : Math.min(Math.max(requested, 1), maxReached);
  const goTo = (n) => setParams({ step: String(n) });

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateNested = (group, field, value) =>
    setForm((f) => ({ ...f, [group]: { ...f[group], [field]: value } }));

  const saveDraft = async () => {
    try {
      localStorage.setItem(DRAFT_KEY, serializeDraft(form));
      setSavedAt(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    } catch { /* storage unavailable */ }
    // Once the account exists, also keep the safe fields on the server
    if (user) {
      const isBiz = form.kycType === 'business';
      organizerApi.saveDraft({
        organizationName: (isBiz ? form.biz.legalName : form.orgName).trim() || undefined,
        cacNumber: isBiz && form.biz.cac.trim().length >= 5 ? form.biz.cac.trim() : undefined,
      }).catch(() => {});
    }
  };

  // ---------- STEP 1: register (#24) -> login (#18) ----------
  const continueToKyc = async () => {
    if (user) { setMaxReached((m) => Math.max(m, 2)); goTo(2); return; } // account already created
    setBusy(true); setError(''); setFieldErrors({});
    try {
      const email = form.email.trim().toLowerCase();
      const phone = `${form.dialCode}${form.phone.replace(/\D/g, '').replace(/^0/, '')}`;
      await organizerApi.register({
        email,
        password: form.password,
        phone,
        organizationName: form.orgName.trim() || undefined,
      });
      await login(email, form.password); // register returns no tokens
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
      setMaxReached((m) => Math.max(m, 2));
      goTo(2);
    } catch (err) {
      setFieldErrors(apiFieldErrors(err));
      setError(err.response ? apiErrorMessage(err, 'Could not create your account.') : err.message);
    } finally {
      setBusy(false);
    }
  };

  // ---------- STEP 2: documents (#29) -> KYC (#27 / #28) ----------
  const submitKyc = async () => {
    setBusy(true); setError(''); setFieldErrors({}); setNotice('');
    try {
      const docs = buildDocuments(form);
      if ([...docs.keys()].length) await organizerApi.uploadKycDocuments(docs); // upload first: nothing is submitted if it fails
      const profile = form.kycType === 'business'
        ? await organizerApi.submitBusinessKyc(buildBusinessBody(form.biz))
        : await organizerApi.submitIndividualKyc(buildIndividualBody(form.ind));
      localStorage.removeItem(DRAFT_KEY);
      await refreshUser();
      setSubmission(toSubmission(profile));
      goTo(3);
    } catch (err) {
      setFieldErrors(apiFieldErrors(err));
      setError(apiErrorMessage(err, 'Could not submit your KYC.'));
    } finally {
      setBusy(false);
    }
  };

  const status = (id) => (submission && id <= 2 ? 'done' : step > id ? 'done' : step === id ? 'active' : 'locked');

  return (
    <div className="min-h-screen bg-[#FFBF00] text-black font-sans selection:bg-black selection:text-[#FFBF00] flex flex-col">
      <Navbar />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* STEPPER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-xs">
          {steps.map((s) => {
            const st = status(s.id);
            const clickable = s.id <= maxReached && !submission;
            return (
              <motion.button
                key={s.id}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && goTo(s.id)}
                whileHover={clickable ? { y: -2 } : {}}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  st === 'active'
                    ? 'bg-black text-white border-black ring-2 ring-red-600 shadow-lg'
                    : st === 'done'
                    ? 'bg-black/90 text-neutral-300 border-black/40'
                    : 'bg-black/70 text-neutral-500 border-black/20'
                } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span
                  className={`w-7 h-7 rounded flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    st === 'active' ? 'bg-red-600 text-white' : st === 'done' ? 'bg-emerald-500 text-black' : 'bg-neutral-800'
                  }`}
                >
                  {st === 'done' ? <FiCheck /> : st === 'locked' ? <FiLock /> : `0${s.id}`}
                </span>
                <span>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">
                    STEP 0{s.id} • {st === 'active' ? 'ACTIVE NODE' : st === 'done' ? 'COMPLETE' : 'LOCKED'}
                  </span>
                  <span className="font-bold text-sm block">
                    {submission && s.id === 2 ? 'KYC Under Review' : s.title}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* ACTIVE STEP */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial="hidden" animate="visible" exit="exit" variants={pageAnim}>
            {step === 1 && (
              <AccountCredentials
                form={form} update={update} onNext={continueToKyc} onSave={saveDraft} savedAt={savedAt}
                busy={busy} error={error} fieldErrors={fieldErrors}
              />
            )}
            {step === 2 && !submission && (
              <KycCompliance
                form={form} update={update} updateNested={updateNested}
                onBack={() => goTo(1)} onSubmit={submitKyc} onSave={saveDraft} savedAt={savedAt}
                busy={busy} error={error} fieldErrors={fieldErrors} notice={notice}
              />
            )}
            {step === 3 && submission && <KycPending form={form} submission={submission} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}