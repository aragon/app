import { TranslationsContextProvider } from '@/shared/components/translationsContext';
import { getTranslations } from '@/shared/components/translationsContext/translations';
import '@aragon/ods/index.css';
import type { ReactNode } from 'react';
import { Footer } from '../footer';

export interface IRootLayoutProps {
    /**
     * Children of the root layout.
     */
    children?: ReactNode;
}

export const RootLayout: React.FC<IRootLayoutProps> = async (props) => {
    const { children } = props;
    const translations = await getTranslations();

    return (
        <html lang="en" className="h-full">
            <body className="flex h-full flex-col bg-neutral-50">
                <TranslationsContextProvider translations={translations}>
                    <div className="flex grow">{children}</div>
                    <Footer />
                </TranslationsContextProvider>
            </body>
        </html>
    );
};
