'use client';

import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { SupportChat } from './supportChat';
import { useSupportChatContext } from './supportChatContext';

// Non-modal shell of the support chat: on lg+ screens it is an in-flow column the rest of the
// layout resizes around (animated through its width), below lg it covers the whole screen. On
// lg+ the page stays scrollable and interactive while the chat is open; below lg the covered app
// column is made inert so the fullscreen drawer is modal for keyboard and screen readers. While
// closed the panel is inert and aria-hidden so its kept-mounted content is unreachable and it
// stops being a `complementary` landmark.
const panelWidthClassName = 'lg:w-[clamp(500px,30vw,640px)]';

// Tailwind `lg` breakpoint: above it the panel is an in-flow column, below it a fullscreen drawer.
const desktopMediaQuery = '(min-width: 64rem)';

export const SupportChatPanel: React.FC = () => {
    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();
    const { isOpen } = useSupportChatContext();
    const panelRef = useRef<HTMLElement>(null);

    // Below lg the open panel covers the whole viewport: lock the page scroll behind it (the
    // class is breakpoint-scoped, lg+ stays scrollable) and make the covered app column inert so
    // the drawer also traps keyboard and screen-reader focus. A resize across the breakpoint
    // re-evaluates through the media-query listener; lg+ stays fully non-modal.
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        document.body.classList.add('max-lg:overflow-hidden');

        const appColumn = panelRef.current?.previousElementSibling;
        const desktopMedia = window.matchMedia?.(desktopMediaQuery);
        const updateAppColumnInert = () =>
            appColumn?.toggleAttribute(
                'inert',
                !(desktopMedia?.matches ?? true),
            );

        updateAppColumnInert();
        desktopMedia?.addEventListener('change', updateAppColumnInert);

        return () => {
            document.body.classList.remove('max-lg:overflow-hidden');
            desktopMedia?.removeEventListener('change', updateAppColumnInert);
            appColumn?.removeAttribute('inert');
        };
    }, [isOpen]);

    if (!isEnabled('supportChat')) {
        return null;
    }

    const panelClassNames = classNames(
        'justify-end overflow-hidden bg-neutral-0',
        'lg:sticky lg:top-0 lg:h-dvh lg:shrink-0 lg:self-start',
        'lg:transition-[width] lg:duration-300 lg:ease-in-out',
        isOpen
            ? classNames(
                  'fixed inset-0 z-[var(--guk-dialog-content-z-index)] flex',
                  'lg:inset-auto lg:z-auto lg:flex lg:border-neutral-100 lg:border-l lg:shadow-neutral-lg',
                  panelWidthClassName,
              )
            : 'hidden lg:flex lg:w-0',
    );

    return (
        <aside
            aria-hidden={!isOpen}
            aria-label={t('app.application.supportChat.panel.label')}
            className={panelClassNames}
            inert={!isOpen}
            ref={panelRef}
        >
            {/* Fixed-width inner wrapper: the content keeps its final size while the panel width
                animates, so the chat appears to slide in from the right instead of reflowing. */}
            <div
                className={classNames(
                    'h-full w-full lg:shrink-0',
                    panelWidthClassName,
                )}
            >
                <SupportChat />
            </div>
        </aside>
    );
};
