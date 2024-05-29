'use client';

import AragonAppLogo from '@/assets/images/aragon-app.svg';
import { Container } from '@/shared/components/container';
import { Image } from '@/shared/components/image';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Tag } from '@aragon/ods';
import classNames from 'classnames';
import { footerLinks } from './footerLinks';

export interface IFooterProps {}

export const Footer: React.FC<IFooterProps> = () => {
    const { t } = useTranslations();

    const year = new Date().getFullYear();
    const version = process.env.version!;

    const layoutClassNames = [
        "[grid-template-areas:'metadata''links''copyright']", // Default
        "md:[grid-template-areas:'links''metadata''copyright'] md:justify-items-center", // MD
        "xl:grid-cols-[auto_1fr_auto] xl:[grid-template-areas:'metadata_links_copyright']", // XL
    ];

    return (
        <footer className="border-t border-neutral-100 bg-neutral-0 py-5">
            <Container className={classNames('grid items-center md:gap-6', layoutClassNames)}>
                <div className="flex flex-row items-center justify-between gap-4 pb-4 pt-3 [grid-area:metadata] md:justify-normal md:py-0">
                    <div className="flex flex-row gap-1">
                        <Image alt="Aragon logo" width={32} height={32} fill={false} src="/icon.svg" />
                        <Image alt="Aragon App logo" className="w-10" fill={false} src={AragonAppLogo} />
                    </div>
                    <div className="flex flex-row gap-2">
                        <Tag variant="primary" label={t('app.application.footer.beta')} />
                        <Tag variant="primary" label={t('app.application.footer.version', { version })} />
                    </div>
                </div>
                <div className="flex min-w-0 flex-col content-center [grid-area:links] md:flex-row md:gap-6">
                    {footerLinks.map(({ link, label, target }) => (
                        <Link
                            className="truncate border-b border-neutral-100 py-4 text-base font-normal leading-tight text-neutral-500 last:border-none md:border-none md:py-0"
                            key={label}
                            href={link}
                            target={target}
                        >
                            {t(`app.application.footer.link.${label}`)}
                        </Link>
                    ))}
                </div>
                <p className="truncate pb-3 pt-6 text-base font-normal leading-tight text-neutral-500 [grid-area:copyright] md:py-0">
                    {t('app.application.footer.copyright', { year })}
                </p>
            </Container>
        </footer>
    );
};
