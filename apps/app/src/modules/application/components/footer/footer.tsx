'use client';

import { Tag } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { AragonLogo } from '@/shared/components/aragonLogo';
import { Container } from '@/shared/components/container';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useApplicationVersion } from '@/shared/hooks/useApplicationVersion';
import { footerLinks } from './footerLinks';

export interface IFooterProps extends ComponentProps<'footer'> {}

const linkClassNames =
    'truncate border-neutral-100 border-b py-4 font-normal text-base text-neutral-500 leading-tight last:border-none @app-md/app:border-none @app-md/app:py-0';

export const Footer: React.FC<IFooterProps> = (props) => {
    const { className, ...otherProps } = props;

    const { t } = useTranslations();

    const year = new Date().getFullYear();

    const layoutClassNames = [
        "[grid-template-areas:'metadata''links''copyright']", // Default
        "@app-md/app:[grid-template-areas:'links''metadata''copyright'] @app-md/app:justify-items-center", // MD
        "@app-lg/app:grid-cols-[1fr_min-content_1fr] @app-lg/app:[grid-template-areas:'metadata_links_copyright']", // LG
    ];

    const version = useApplicationVersion();

    return (
        <footer
            className={classNames(
                'border-neutral-100 border-t bg-neutral-0 py-5',
                className,
            )}
            {...otherProps}
        >
            <Container
                className={classNames(
                    'grid items-center @app-md/app:gap-6',
                    layoutClassNames,
                )}
            >
                <div className="flex flex-row items-center @app-md/app:justify-normal justify-between gap-4 @app-lg/app:justify-self-start @app-md/app:py-0 pt-3 pb-4 [grid-area:metadata]">
                    <div className="flex items-center gap-2.5">
                        <p className="text-nowrap @app-md/app:text-base text-neutral-800 text-sm leading-tight">
                            {t('app.application.footer.governed')}
                        </p>
                        <AragonLogo size="sm" />
                    </div>
                    <Tag
                        className="shrink-0"
                        label={version}
                        variant="primary"
                    />
                </div>
                <div className="flex min-w-0 @app-md/app:flex-row flex-col content-center @app-md/app:gap-6 [grid-area:links]">
                    {footerLinks.map(({ link, label, target }) => (
                        <Link
                            className={linkClassNames}
                            href={link}
                            key={label}
                            target={target}
                        >
                            {t(`app.application.footer.link.${label}`)}
                        </Link>
                    ))}
                </div>
                <p className="@app-lg/app:justify-self-end truncate @app-md/app:py-0 pt-6 pb-3 font-normal text-base text-neutral-500 leading-tight [grid-area:copyright]">
                    {t('app.application.footer.copyright', { year })}
                </p>
            </Container>
        </footer>
    );
};
