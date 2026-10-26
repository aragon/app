'use client';

import { GukCoreProvider } from '@aragon/gov-ui-kit';
import Link from 'fumadocs-core/link';
import type { FC, ReactNode } from 'react';

// The gov-ui-kit bundle has no client directive and reads React context, so only client modules
// import it; server modules use what this one exports.
export { Icon } from '@aragon/gov-ui-kit';

// Kit links go through the Next link, which adds the base path to site routes.
const kitValues = { Link: Link as unknown as FC };

export const KitProvider = ({ children }: { children: ReactNode }) => (
    <GukCoreProvider values={kitValues}>{children}</GukCoreProvider>
);
