'use client';

import { Tag } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { type ComponentProps, useState } from 'react';
import { AragonLogo } from '@/shared/components/aragonLogo';
import { Container } from '@/shared/components/container';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useApplicationVersion } from '@/shared/hooks/useApplicationVersion';
import { SupportChat } from '../supportChat';
import { footerLinks } from './footerLinks';

export interface IFooterProps extends ComponentProps<'footer'> {}

const linkClassNames =
    'truncate border-neutral-100 border-b py-4 font-normal text-base text-neutral-500 leading-tight last:border-none md:border-none md:py-0';

export const Footer: React.FC<IFooterProps> = (props) => {
    const { className, ...otherProps } = props;

    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();

    const isSupportChatEnabled = isEnabled('supportChat');
    const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);

    // With the support chat flag on, the help entry is a real button that opens the chat drawer —
    // not an anchor, so hover / middle-click don't advertise a portal URL the click won't follow.
    // The portal stays reachable inside the widget (header link + error escape hatches). Flag off
    // keeps the plain portal anchor and its no-JS / middle-click fallback.
    const handleHelpClick = () => setIsSupportChatOpen(true);

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
                'border-neutral-100 border-t bg-neutral-0 py-5',
                className,
            )}
            {...otherProps}
        >
            <Container
                className={classNames(
                    'grid items-center md:gap-6',
                    layoutClassNames,
                )}
            >
                <div className="flex flex-row items-center justify-between gap-4 pt-3 pb-4 [grid-area:metadata] md:justify-normal md:py-0 lg:justify-self-start">
                    <div className="flex items-center gap-2.5">
                        <p className="text-nowrap text-neutral-800 text-sm leading-tight md:text-base">
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
                <div className="flex min-w-0 flex-col content-center [grid-area:links] md:flex-row md:gap-6">
                    {footerLinks.map(({ link, label, target }) => {
                        if (label === 'help' && isSupportChatEnabled) {
                            return (
                                <button
                                    className={classNames(
                                        linkClassNames,
                                        'cursor-pointer text-left',
                                    )}
                                    key={label}
                                    onClick={handleHelpClick}
                                    type="button"
                                >
                                    {t(`app.application.footer.link.${label}`)}
                                </button>
                            );
                        }

                        return (
                            <Link
                                className={linkClassNames}
                                href={link}
                                key={label}
                                target={target}
                            >
                                {t(`app.application.footer.link.${label}`)}
                            </Link>
                        );
                    })}
                </div>
                <p className="truncate pt-6 pb-3 font-normal text-base text-neutral-500 leading-tight [grid-area:copyright] md:py-0 lg:justify-self-end">
                    {t('app.application.footer.copyright', { year })}
                </p>
            </Container>
            {isSupportChatEnabled && (
                <SupportChat
                    isOpen={isSupportChatOpen}
                    onClose={() => setIsSupportChatOpen(false)}
                />
            )}
        </footer>
    );
};
