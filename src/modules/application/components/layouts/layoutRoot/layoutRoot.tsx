import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { translations } from '@/shared/constants/translations';
import '@aragon/gov-ui-kit/index.css';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { cookieToInitialState } from 'wagmi';
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
                <Providers translations={translationAssets} wagmiInitialState={wagmiInitialState}>
                    <ErrorBoundary>
                        <div className="flex grow flex-col">{children}</div>
                    </ErrorBoundary>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
};
