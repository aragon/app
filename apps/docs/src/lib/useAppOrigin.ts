'use client';

import { useSyncExternalStore } from 'react';
import { resolveAppOrigin } from './appLink';
import { appOrigins } from './site';

const subscribe = () => () => undefined;

const getServerSnapshot = () => '';

const getSnapshot = () => resolveAppOrigin(window.location.origin, appOrigins);

/**
 * Origin to put before a host-relative app link. Empty on the server and before hydration, so the
 * static HTML links to the host that serves the site; after hydration a site opened outside the
 * apps (a docs deployment) gets the first app origin.
 */
export const useAppOrigin = (): string =>
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
