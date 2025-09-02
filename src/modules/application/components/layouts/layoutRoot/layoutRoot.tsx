import { initPluginRegistry } from '@/initPluginRegistry';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { fetchInterceptorUtils } from '@/modules/application/utils/fetchInterceptorUtils';
import { whitelistedAddressesOptions } from '@/modules/explore/api/cmsService/queries/useWhitelistedAddresses';
import { sanctionedAddressesOptions } from '@/modules/explore/api/cmsService';
import { translations } from '@/shared/constants/translations';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { headers } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import type { ReactNode } from 'react';
import { cookieToInitialState } from 'wagmi';
import { DebugPanel } from '../../debugPanel';
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
fetchInterceptorUtils.intecept();

export const LayoutRoot: React.FC<ILayoutRootProps> = async (props) => {
    const { children } = props;

    const translationAssets = await translations.en();

    const requestHeaders = await headers();
    const wagmiInitialState = cookieToInitialState(wagmiConfig, requestHeaders.get('cookie'));

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(sanctionedAddressesOptions());
    await queryClient.prefetchQuery(whitelistedAddressesOptions());
    const dehydratedState = dehydrate(queryClient);

    return (
        <html lang="en" className="h-full">
            <body className="flex h-full flex-col bg-neutral-50">
                <NextTopLoader
                    color="var(--color-primary-400)"
                    height={4}
                    showSpinner={false}
                    easing="ease-in-out"
                    shadow="0 1px 3px 0 #003BF510, 0 1px 2px -1px #003BF510"
                />
                <Providers
                    translations={translationAssets}
                    wagmiInitialState={wagmiInitialState}
                    dehydratedState={dehydratedState}
                >
                    <ErrorBoundary>
                        <div className="flex grow flex-col">{children}</div>
                        {process.env.NEXT_PUBLIC_FEATURE_DEBUG === 'true' && <DebugPanel />}
                    </ErrorBoundary>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
};
