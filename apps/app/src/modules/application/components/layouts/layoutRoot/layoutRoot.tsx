import { dehydrate, QueryClient } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
import {
    SupportChatContextProvider,
    SupportChatPanel,
} from '../../supportChat';
import './layoutRoot.css';

export interface ILayoutRootProps {
    /**
     * Children of the root layout.
     */
    children?: ReactNode;
}

// Initialise plugin registry for server-side components
initPluginRegistry();
initActionViewRegistry();

export const LayoutRoot: React.FC<ILayoutRootProps> = async (props) => {
    const { children } = props;

    const [translationAssets, requestHeaders, featureFlagsSnapshot] =
        await Promise.all([
            translations.en(),
            headers(),
            featureFlags.getSnapshot(),
        ]);

    // Intercept fetch requests (if enabled) for server-side components. The flag can only be
    // resolved asynchronously, so this cannot live at module scope: it must still run before any
    // nested layout prefetches, which it does as this layout renders first.
    const useMocks =
        featureFlagsSnapshot.find((f) => f.key === 'useMocks')?.enabled ??
        false;
    fetchInterceptorUtils.intercept(useMocks);

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
                    {/* App column + chat panel: the panel is an in-flow sibling so the whole
                        app (header, content and footer) resizes to fit when the chat is open. */}
                    <SupportChatContextProvider>
                        <div className="flex grow flex-row">
                            <div className="flex min-w-0 grow flex-col">
                                <ErrorBoundary>
                                    <div className="flex grow flex-col">
                                        {children}
                                    </div>
                                    {isDebugPanelEnabled && <DebugPanelLazy />}
                                </ErrorBoundary>
                                <Footer />
                            </div>
                            <SupportChatPanel />
                        </div>
                    </SupportChatContextProvider>
                </Providers>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
};
