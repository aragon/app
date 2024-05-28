'use client';

import AragonAppLogo from '@/assets/images/aragon-app.svg';
import { Container } from '@/shared/components/container';
import { Image } from '@/shared/components/image';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Tag } from '@aragon/ods';
import { footerLinks } from './footerLinks';

export interface IFooterProps {}

export const Footer: React.FC<IFooterProps> = () => {
    const { t } = useTranslations();

    const currentYear = new Date().getFullYear();
    const appVersion = `v${process.env.version}`;

    return (
        <footer className="border-t border-neutral-100 bg-neutral-0 py-5">
            <Container className="flex items-center justify-between">
                <div className="flex flex-row items-center gap-4">
                    <div className="flex flex-row gap-1">
                        <Image alt="Aragon logo" width={32} height={32} fill={false} src="/icon.svg" />
                        <Image alt="Aragon APP logo" width={40} fill={false} src={AragonAppLogo} />
                    </div>
                    <div className="flex flex-row gap-2">
                        <Tag variant="primary" label="Beta" />
                        <Tag variant="primary" label={appVersion} />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:gap-6">
                    {footerLinks.map(({ link, label }) => (
                        <Link key={label} className="text-base font-normal leading-tight text-neutral-500" href={link}>
                            {t(`app.application.footer.link.${label}`)}
                        </Link>
                    ))}
                </div>
                <p className="text-base font-normal leading-tight text-neutral-500">@ {currentYear} Aragon</p>
            </Container>
        </footer>
    );
};
