import { getTranslations } from '@/shared/components/translationsContextProvider/translations';
import '@aragon/ods/index.css';
import type { ReactNode } from 'react';
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
    const translations = await getTranslations();

    return (
        <html lang="en" className="h-full">
            <body className="flex h-full flex-col bg-neutral-50">
                <Providers translations={translations}>
                    <div className="flex grow flex-col">{children}</div>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
};
