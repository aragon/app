import { getTranslations } from '@/shared/components/translationsContextProvider/translations';
import { footerLinks } from './footerLinks';

export interface IFooterProps {}

export const Footer: React.FC<IFooterProps> = async () => {
    const translations = await getTranslations();

    return (
        <footer className="flex justify-center border-t border-neutral-100 bg-neutral-0 px-6 py-5">
            <div className="flex flex-col md:flex-row md:gap-6">
                {footerLinks.map(({ link, label }) => (
                    <a key={label} href={link}>
                        {translations.app.application.footer.link[label]}
                    </a>
                ))}
            </div>
        </footer>
    );
};
