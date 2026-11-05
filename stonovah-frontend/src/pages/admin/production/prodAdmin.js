import { humanize } from '../adminBits';

export const mono = 'font-mono text-[10px] font-bold uppercase tracking-[0.18em]';

// Kobo to a naira label: 11500000000 -> ₦115M. full = exact figure with separators.
export function ngn(kobo, full = false) {
  if (kobo === null || kobo === undefined) return '—';
  const n = Number(kobo) / 100;
  if (full) return '₦' + new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(n);
  const t = (v) => String(+v.toFixed(1));
  if (n >= 1e9) return `₦${t(n / 1e9)}B`;
  if (n >= 1e6) return `₦${t(n / 1e6)}M`;
  if (n >= 1e3) return `₦${t(n / 1e3)}K`;
  return `₦${n}`;
}

export const REQ_STATUS = {
  NEW: { label: 'New', tone: 'solid' },
  IN_REVIEW: { label: 'In review', tone: 'amber' },
  CALL_BOOKED: { label: 'Call booked', tone: 'red' },
  PROPOSAL_SENT: { label: 'Proposal sent', tone: 'amber' },
  ACCEPTED: { label: 'Accepted', tone: 'green' },
  DECLINED: { label: 'Declined', tone: 'grey' },
};

export const FORMAT_LABEL = { FEATURE_FILM: 'Feature Film', DOCUMENTARY: 'Documentary', TV_SERIES: 'TV Series', COMMERCIAL: 'Commercial', MUSIC_VIDEO: 'Music Video' };
export const STAGE_LABEL = { DEVELOP: 'Develop', PREPARE: 'Prepare', SHOOT: 'Shoot', FINISH: 'Finish', RELEASE: 'Release', CROSS: 'All stages' };
export const PIPELINE_LABEL = { IDEA: 'Idea / Treatment', SCRIPT_LOCKED: 'Completed Script', FINANCED_PREP: 'Financed / In Prep', SHOT_POST: 'Shot / In Post-Production', ROUGH_CUT: 'Rough Cut Ready for Release' };
export const DELIVERY_LABEL = { THEATRICAL: 'Theatrical Release', BROADCAST: 'Broadcast Television', STREAMING: 'Streaming Master', DIGITAL: 'Digital & Social Matrix' };
export const FUNDING_LABEL = { LOGLINE_SYNOPSIS: 'Logline & Synopsis', PITCH_DECK: 'Pitch Deck', LOOKBOOK: 'Lookbook', BUDGET_FINANCING: 'Budget Top Sheet & Financing Plan', INVESTOR_PACK: 'Investor or Funder Pack' };
export const AUDIENCE_LABEL = { INVESTOR: 'Investor', GRANT_BODY: 'Grant Body', BROADCASTER: 'Broadcaster / Platform', BRAND_CLIENT: 'Brand / Agency Client' };
export const PROPOSAL_STATUS = {
  DRAFT: { label: 'Draft', tone: 'grey' }, SENT: { label: 'Sent', tone: 'amber' }, ACCEPTED: { label: 'Accepted', tone: 'green' },
  DECLINED: { label: 'Declined', tone: 'red' }, EXPIRED: { label: 'Expired', tone: 'grey' },
};

// Budget range from the stored tier bounds (kobo).
export function budgetText(l) {
  const a = l.budgetMinKobo;
  const b = l.budgetMaxKobo;
  if (a == null && b == null) return l.budgetTier ? humanize(l.budgetTier) : '—';
  if (b == null) return `${ngn(a)}+`;
  if (a == null || Number(a) === 0) return `Under ${ngn(b)}`;
  return `${ngn(a)} – ${ngn(b)}`;
}

export const PROJECT_STATUS = {
  ACTIVE: { label: 'Active', tone: 'green' }, ON_HOLD: { label: 'On hold', tone: 'amber' },
  COMPLETED: { label: 'Completed', tone: 'grey' }, CANCELLED: { label: 'Cancelled', tone: 'red' },
};
export const WORK_STATUS = {
  NOT_STARTED: { label: 'Not started', tone: 'grey' }, IN_PROGRESS: { label: 'In progress', tone: 'amber' }, DONE: { label: 'Done', tone: 'green' },
};
export const TRANCHE_STATUS = { PENDING: { label: 'Pending', tone: 'amber' }, PAID: { label: 'Paid', tone: 'green' }, CANCELLED: { label: 'Cancelled', tone: 'grey' } };
export const LIFECYCLE = ['DEVELOP', 'PREPARE', 'SHOOT', 'FINISH', 'RELEASE'];
export const FORMAT_OPTIONS = Object.entries(FORMAT_LABEL).map(([value, label]) => ({ value, label }));
export const nairaStr = (kobo) => (kobo == null ? '' : String(Number(kobo) / 100));
export const d10 = (v) => (v ? String(v).slice(0, 10) : '');

export const SOURCING_STATUS = {
  SOURCING_ACTIVE: { label: 'Sourcing active', tone: 'amber' }, REVIEW_PENDING: { label: 'Review pending', tone: 'red' },
  SHORTLIST_SENT: { label: 'Shortlist sent', tone: 'amber' }, BOOKED: { label: 'Booked', tone: 'green' },
  DROPOUT_ALERT: { label: 'Dropout alert', tone: 'red' }, CONTRACTED: { label: 'Contracted', tone: 'green' }, CLOSED: { label: 'Closed', tone: 'grey' },
};
export const ROLE_STATUS = {
  OPEN: { label: 'Open', tone: 'grey' }, SHORTLIST_READY: { label: 'Shortlist ready', tone: 'amber' }, CLIENT_REVIEW: { label: 'Client review', tone: 'amber' },
  BOOKED: { label: 'Booked', tone: 'green' }, CONTRACTED: { label: 'Contracted', tone: 'green' }, DROPOUT: { label: 'Dropout', tone: 'red' },
};
export const CANDIDATE_STATUS = {
  PROPOSED: { label: 'Proposed', tone: 'grey' }, SHORTLISTED: { label: 'Shortlisted', tone: 'amber' }, CLIENT_PREFERRED: { label: 'Client preferred', tone: 'red' },
  BACKUP: { label: 'Backup', tone: 'grey' }, BOOKED: { label: 'Booked', tone: 'green' }, REJECTED: { label: 'Rejected', tone: 'grey' }, WITHDRAWN: { label: 'Withdrawn', tone: 'grey' },
};
export const ROLE_CATEGORY = { CREW: 'Crew', CAST: 'Cast', BACKGROUND: 'Background' };
export const CATEGORY_OPTIONS = Object.entries(ROLE_CATEGORY).map(([value, label]) => ({ value, label }));


export const PITCH_STATUS = {
  NEW: { label: 'New', tone: 'solid' }, IN_PROGRESS: { label: 'In progress', tone: 'amber' }, IN_REVIEW: { label: 'In review', tone: 'amber' },
  DRAFT_SENT: { label: 'Draft sent', tone: 'red' }, DELIVERED: { label: 'Delivered', tone: 'green' },
};
export const DELIVERABLE_STATUS = {
  NOT_STARTED: { label: 'Not started', tone: 'grey' }, DRAFTING: { label: 'Drafting', tone: 'amber' },
  WITH_CLIENT: { label: 'With client', tone: 'red' }, FINAL: { label: 'Final', tone: 'green' },
};
export const AUDIENCE_OPTIONS = Object.entries(AUDIENCE_LABEL).map(([value, label]) => ({ value, label }));
export const FUNDING_KEYS = Object.keys(FUNDING_LABEL);
export const PAST_STATUS = {
  DRAFT: { label: 'Draft', tone: 'grey' }, PUBLISHED: { label: 'Live', tone: 'green' }, HIDDEN: { label: 'Hidden', tone: 'amber' },
};
export const STAGE_OPTIONS = ['DEVELOP', 'PREPARE', 'SHOOT', 'FINISH', 'RELEASE', 'CROSS'].map((value) => ({ value, label: STAGE_LABEL[value] }));
export const ICON_OPTIONS = ['layers', 'file-text', 'calendar', 'users', 'dollar-sign', 'video', 'clipboard', 'sliders', 'shield', 'award', 'film', 'clapperboard', 'megaphone']
  .map((value) => ({ value, label: value }));