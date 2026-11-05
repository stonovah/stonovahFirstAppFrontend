import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as P from '../../api/production';
import { apiErrorMessage } from '../../lib/api';
import { tokenStore } from './ProdLive';
import { DEFAULT_TYPES } from './prodDefaults';

const Ctx = createContext(null);
export const useProduction = () => useContext(Ctx);

const pkgStore = tokenStore('stonovah_prod_package');

export function ProductionProvider({ children }) {
  const [options, setOptions] = useState(null); // brief options: budget tiers, SLA, hotline, regions, file limits
  const [types, setTypes] = useState([]); // project types for the header menu
  const [typesLoaded, setTypesLoaded] = useState(false); // true once the request settles, success or failure
  const [pkg, setPkg] = useState(null);

  useEffect(() => {
    P.getBriefOptions().then(setOptions).catch(() => {});
    P.getProjectTypes().then(setTypes).catch(() => {}).finally(() => setTypesLoaded(true));
    const t = pkgStore.get();
    if (t) P.getPackage(t).then(setPkg).catch(() => pkgStore.clear()); // an expired package just disappears
  }, []);

  // The package is created on the first add, so browsing never creates empty rows.
  const ensureToken = useCallback(async () => {
    const t = pkgStore.get();
    if (t) return t;
    const p = await P.createPackage({});
    pkgStore.set(p.token);
    setPkg(p);
    return p.token;
  }, []);

  const run = useCallback(
    async (fn, ok) => {
      try {
        const p = await fn(await ensureToken());
        setPkg(p);
        if (ok) toast.success(ok);
        return p;
      } catch (e) {
        if (e?.response?.status === 404 && /package/i.test(e.response?.data?.message ?? '')) {
          pkgStore.clear();
          setPkg(null);
          toast.error('Your package expired. Please try again.');
        } else toast.error(apiErrorMessage(e));
        return null;
      }
    },
    [ensureToken]
  );

  const value = useMemo(
    () => ({
      options, types: types.length ? types : DEFAULT_TYPES, typesLoaded, pkg,
      count: pkg?.itemCount ?? 0,
      has: (serviceId) => !!pkg?.items?.some((i) => i.serviceId === serviceId),
      addService: (serviceId, extra = {}) => run((t) => P.addPackageItem(t, { serviceId, ...extra }), 'Added to your package'),
      removeService: (serviceId) => run((t) => P.removePackageItem(t, serviceId), 'Removed from your package'),
      clearPackage: () => run((t) => P.clearPackage(t), 'Package cleared'),
      updatePackage: (body) => run((t) => P.patchPackage(t, body)),
      packageToken: () => pkgStore.get(),
            adoptPackage: async (token) => {
        try {
          const p = await P.getPackage(token);
          pkgStore.set(token);
          setPkg(p);
          return p;
        } catch {
          toast.error('That package link is no longer valid.');
          return null;
        }
      },
    }),
    [options, types, typesLoaded, pkg, run]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}