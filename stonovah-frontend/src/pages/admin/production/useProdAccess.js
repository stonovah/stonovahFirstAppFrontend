import { useEffect, useState } from 'react';
import { adminProductionApi } from '../../../api/adminProduction';

let cache = null; // one request per session

// can.write: requests, projects, sourcing, services, content, past productions, funding
// can.finance: proposal pricing, contracts, payment tranches
export function useProdAccess() {
  const [me, setMe] = useState(cache);
  useEffect(() => {
    if (cache) return;
    adminProductionApi.me().then((m) => { cache = m; setMe(m); }).catch(() => setMe({ active: false, permissions: [], role: null }));
  }, []);
  const has = (p) => !!me?.permissions?.includes(p);
  return {
    me, loaded: !!me,
    can: { read: has('production.read'), write: has('production.write'), finance: has('production.finance'), lead: has('production.write') && has('production.finance') },
  };
}