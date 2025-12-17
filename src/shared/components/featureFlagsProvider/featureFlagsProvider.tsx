'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

import type { FeatureFlagKey, FeatureFlagOverrides, FeatureFlagSnapshot } from '@/shared/featureFlags';
import { parseFeatureFlagOverridesFromCookie, serializeFeatureFlagOverridesToCookie } from '@/shared/featureFlags/utils/cookieOverrides';

export interface IFeatureFlagsContextValue {
    /**
     * Current effective snapshot of all feature flags for this client session.
     */
    snapshot: FeatureFlagSnapshot[];
    /**
     * Check if a given feature flag is enabled in the current snapshot.
     */
    isEnabled: (key: FeatureFlagKey) => boolean;
    /**
     * Apply or clear a local override for a given flag.
     *
     * This updates:
     * - the overrides cookie (for persistence / server usage on next request)
     * - the in-memory snapshot (for immediate UI feedback)
     *
     * Passing `undefined` clears the override and reverts to the base value
     * resolved on the server.
     */
    setOverride: (key: FeatureFlagKey, value: boolean | undefined) => void;
}

export interface IFeatureFlagsProviderProps {
    /**
     * Initial feature flags snapshot resolved on the server.
     *
     * This must already include:
     * - static configuration
     * - CMS overrides
     * - cookie-based local overrides (for the current request)
     */
    initialSnapshot?: FeatureFlagSnapshot[];
    /**
     * Children of the provider.
     */
    children?: ReactNode;
}

const featureFlagsContext = createContext<IFeatureFlagsContextValue | null>(null);

export const FeatureFlagsProvider: React.FC<IFeatureFlagsProviderProps> = (props) => {
    const { initialSnapshot = [], children } = props;

    /**
     * Keep a stable reference to the base snapshot so that we can always
     * revert to the original server-resolved value when clearing overrides.
     */
    const baseSnapshotRef = useRef<FeatureFlagSnapshot[]>(initialSnapshot);
    const [snapshot, setSnapshot] = useState<FeatureFlagSnapshot[]>(initialSnapshot);

    const isEnabled = useCallback((key: FeatureFlagKey): boolean => snapshot.some((flag) => flag.key === key && flag.enabled), [snapshot]);

    const setOverride = useCallback((key: FeatureFlagKey, value: boolean | undefined): void => {
        if (typeof document === 'undefined') {
            // Best-effort only on client; ignore when running in non-DOM environments.
            return;
        }

        try {
            const currentOverrides = parseFeatureFlagOverridesFromCookie(document.cookie);

            let updatedOverrides: FeatureFlagOverrides;
            if (value == null) {
                const { [key]: _, ...rest } = currentOverrides;
                updatedOverrides = rest;
            } else {
                updatedOverrides = { ...currentOverrides, [key]: value };
            }

            // biome-ignore lint/suspicious/noDocumentCookie: cookie fallback is acceptable here
            document.cookie = serializeFeatureFlagOverridesToCookie(updatedOverrides);
        } catch {
            // Cookie persistence is best-effort; swallow errors.
        }

        setSnapshot((currentSnapshot) =>
            currentSnapshot.map((flag) => {
                if (flag.key !== key) {
                    return flag;
                }

                const baseFlag = baseSnapshotRef.current.find((item) => item.key === key);
                const baseEnabled = baseFlag?.enabled ?? flag.enabled;

                return {
                    ...flag,
                    enabled: value ?? baseEnabled,
                };
            })
        );
    }, []);

    const contextValue = useMemo<IFeatureFlagsContextValue>(
        () => ({
            snapshot,
            isEnabled,
            setOverride,
        }),
        [snapshot, isEnabled, setOverride]
    );

    return <featureFlagsContext.Provider value={contextValue}>{children}</featureFlagsContext.Provider>;
};

export const useFeatureFlags = (): IFeatureFlagsContextValue => {
    const context = useContext(featureFlagsContext);

    if (context == null) {
        throw new Error('useFeatureFlags: hook must be used within a FeatureFlagsProvider to work properly.');
    }

    return context;
};
