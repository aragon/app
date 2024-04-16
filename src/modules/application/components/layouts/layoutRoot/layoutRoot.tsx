import { TranslationsContextProvider } from '@/shared/components/translationsContext';
import { getTranslations } from '@/shared/components/translationsContext/translations';
import '@aragon/ods/index.css';
import type { ReactNode } from 'react';
import { Footer } from '../../footer';
import './layoutRoot.css';

export interface ILayoutRootProps {
    /**
     * Children of the root layout.
     */
    children?: ReactNode;
}

export const LayoutRoot: React.FC<ILayoutRootProps> = async (props) => {
    const { children } = props;
    const translations = await getTranslations();

    return (
        <html lang="en" className="h-full">
            <body className="flex h-full flex-col bg-neutral-50">
                <TranslationsContextProvider translations={translations}>
                    <div className="flex grow flex-col">{children}</div>
                    <Footer />
                </TranslationsContextProvider>
            </body>
        </html>
    );
};
