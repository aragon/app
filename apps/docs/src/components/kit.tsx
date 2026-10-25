'use client';

import { GukCoreProvider, Icon, type IconType } from '@aragon/gov-ui-kit';
import Link from 'fumadocs-core/link';
import type { ComponentProps, ReactNode } from 'react';

// The gov-ui-kit bundle has no client directive and reads React context, so only client modules
// import it; server modules use what this one exports.

// Kit links go through the Next link, which adds the base path to site routes.
const kitValues = { Link: Link as unknown as React.FC };

export const KitProvider = ({ children }: { children: ReactNode }) => (
    <GukCoreProvider values={kitValues}>{children}</GukCoreProvider>
);

/**
 * A kit icon by name (`HOME`), the way the sidebar data names them (src/content/buildContent.ts).
 */
export const KitIcon = ({
    name,
    ...props
}: Omit<ComponentProps<typeof Icon>, 'icon'> & { name: string }) => (
    <Icon icon={name as IconType} {...props} />
);
