import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { translations } from '@/shared/constants/translations';
import '@aragon/gov-ui-kit/index.css';
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

export const LayoutRoot: React.FC<ILayoutRootProps> = async (props) => {
    const { children } = props;

    const translationAssets = await translations.en();

    const requestHeaders = await headers();
    const wagmiInitialState = cookieToInitialState(wagmiConfig, requestHeaders.get('cookie'));

    return (
        <html lang="en" className="h-full">
            <body className="flex h-full flex-col bg-neutral-50">
                <NextTopLoader
                    color="var(--guk-color-primary-400)"
                    height={4}
                    showSpinner={false}
                    easing="ease-in-out"
                    shadow="0 1px 3px 0 #003BF510, 0 1px 2px -1px #003BF510"
                />
                <Providers translations={translationAssets} wagmiInitialState={wagmiInitialState}>
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
