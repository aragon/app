'use client';

import { Tag } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { AragonLogo } from '@/shared/components/aragonLogo';
import { Container } from '@/shared/components/container';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useApplicationVersion } from '@/shared/hooks/useApplicationVersion';
import { footerLinks } from './footerLinks';

export interface IFooterProps extends ComponentProps<'footer'> {}

const linkClassNames =
    'truncate border-b last:border-none max-md:py-inset-nav-item--fixed-16 md:border-none type-control border-surface-secondary text-surface-secondary';

export const Footer: React.FC<IFooterProps> = (props) => {
    const { className, ...otherProps } = props;

    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();
    const exploreHref = isEnabled('workspaces') ? '/explore' : '/';

    const year = new Date().getFullYear();

    const layoutClassNames = [
        "[grid-template-areas:'metadata''links''copyright']", // Default
        "md:[grid-template-areas:'links''metadata''copyright'] md:justify-items-center", // MD
        "lg:grid-cols-[1fr_min-content_1fr] lg:[grid-template-areas:'metadata_links_copyright']", // LG
    ];

    const version = useApplicationVersion();

    return (
        <footer
            className={classNames(
                'border-t border-surface-secondary bg-surface-primary py-inset-nav-bar--fixed-20',
                className,
            )}
            {...otherProps}
        >
            <Container
                className={classNames(
                    'grid items-center md:gap-nav-section',
                    layoutClassNames,
                )}
            >
                <div className="flex flex-row items-center justify-between gap-nav-group [grid-area:metadata] md:justify-normal lg:justify-self-start max-md:pt-inset-nav-item max-md:pb-inset-nav-item--fixed-16">
                    <div className="flex items-center gap-nav-related--fixed-10">
                        <p className="type-supporting text-nowrap text-surface-primary">
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
                <div className="flex min-w-0 flex-col content-center [grid-area:links] md:flex-row md:gap-nav-section">
                    {footerLinks.map(({ link, label, target }) => (
                        <Link
                            className={linkClassNames}
                            href={label === 'explore' ? exploreHref : link}
                            key={label}
                            target={target}
                        >
                            {t(`app.application.footer.link.${label}`)}
                        </Link>
                    ))}
                </div>
                <p className="truncate type-caption--footnote text-surface-secondary [grid-area:copyright] lg:justify-self-end max-md:pt-inset-nav-item--fixed-24 max-md:pb-inset-nav-item">
                    {t('app.application.footer.copyright', { year })}
                </p>
            </Container>
        </footer>
    );
};
