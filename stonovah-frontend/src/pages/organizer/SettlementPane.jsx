// src/pages/organizer/SettlementPane.jsx
import React, { useCallback, useEffect, useState } from 'react';
import SettlementAccountCard from './SettlementAccount';
import { financeApi } from '../../api/finance';
import { apiErrorMessage } from '../../api/apiClient';
import { useCan } from '../../context/AuthContext';

export default function SettlementPane() {
  const can = useCan();
  const [bank, setBank] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(() => financeApi.settlementAccount().then(setBank).catch((e) => setError(apiErrorMessage(e))), []);
  useEffect(() => { load(); }, [load]);

  if (error) return <p className="font-mono text-xs font-bold text-red-400 bg-black rounded-xl p-3">{error}</p>;
  if (!bank) return <p className="font-mono text-xs font-bold">LOADING…</p>;
  return <div className="max-w-xl"><SettlementAccountCard bank={bank} onChanged={load} canEdit={can('finance.write')} /></div>;
}