import { dehydrate, QueryClient } from '@tanstack/react-query';
import { headers } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import type { ReactNode } from 'react';
import { cookieToInitialState } from 'wagmi';
import { initActionViewRegistry } from '@/actions';
import { initPluginRegistry } from '@/initPluginRegistry';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { fetchInterceptorUtils } from '@/modules/application/utils/fetchInterceptorUtils';
import { sanctionedAddressesOptions } from '@/shared/api/cmsService';
import { whitelistedAddressesOptions } from '@/shared/api/cmsService/queries/useWhitelistedAddresses';
import { translations } from '@/shared/constants/translations';
import { featureFlags } from '@/shared/featureFlags';
import { DebugPanelLazy } from '../../debugPanel/lazyDebugPanel';
import { ErrorBoundary } from '../../errorBoundary';
import { Footer } from '../../footer';
import { Providers } from '../../providers';
import './layoutRoot.css';

export interface ILayoutRootProps {
    /**
     * Children of the root layout.
     */
    children?: ReactNode;
}

// Initialise plugin registry and intercept fetch requests (if enabled) for server-side components
initPluginRegistry();
fetchInterceptorUtils.intercept();
initActionViewRegistry();

export const LayoutRoot: React.FC<ILayoutRootProps> = async (props) => {
    const { children } = props;

    const [translationAssets, requestHeaders, featureFlagsSnapshot] =
        await Promise.all([
            translations.en(),
            headers(),
            featureFlags.getSnapshot(),
        ]);

    const wagmiInitialState = cookieToInitialState(
        wagmiConfig,
        requestHeaders.get('cookie'),
    );

    const isDebugPanelEnabled =
        featureFlagsSnapshot.find((f) => f.key === 'debugPanel')?.enabled ??
        false;

    const queryClient = new QueryClient();
    await Promise.all([
        queryClient.prefetchQuery(sanctionedAddressesOptions()),
        queryClient.prefetchQuery(whitelistedAddressesOptions()),
    ]);
    const dehydratedState = dehydrate(queryClient);

    return (
        <html className="h-full" lang="en">
            <head>
                <link href="https://aragon-1.mypinata.cloud" rel="preconnect" />
                <link
                    href="https://aragon-1.mypinata.cloud"
                    rel="dns-prefetch"
                />
            </head>
            <body className="flex h-full flex-col bg-neutral-50">
                <NextTopLoader
                    color="var(--color-primary-400)"
                    easing="ease-in-out"
                    height={4}
                    shadow="0 1px 3px 0 #003BF510, 0 1px 2px -1px #003BF510"
                    showSpinner={false}
                />
                <Providers
                    dehydratedState={dehydratedState}
                    featureFlagsSnapshot={featureFlagsSnapshot}
                    translations={translationAssets}
                    wagmiInitialState={wagmiInitialState}
                >
                    <ErrorBoundary>
                        <div className="flex grow flex-col">{children}</div>
                        {isDebugPanelEnabled && <DebugPanelLazy />}
                    </ErrorBoundary>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
};
