'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { footerLinks } from './footerLinks';

export interface IFooterProps {}

export const Footer: React.FC<IFooterProps> = () => {
    const { t } = useTranslations();

    return (
        <footer className="flex justify-center border-t border-neutral-100 bg-neutral-0 px-6 py-5">
            <div className="flex flex-col md:flex-row md:gap-6">
                {footerLinks.map(({ link, label }) => (
                    <a key={label} href={link}>
                        {t(`app.application.footer.link.${label}`)}
                    </a>
                ))}
            </div>
        </footer>
    );
};
