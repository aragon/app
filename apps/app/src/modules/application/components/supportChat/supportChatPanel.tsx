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
//
// The shell measures the browser window (`screen-lg`), not the `app` container the regular
// breakpoint variants query (see layoutRoot/breakpoints.css): docking is a window decision, and
// the CSS has to agree with the `matchMedia` query below, which only ever sees the window.
const panelWidthClassName = 'screen-lg:w-[clamp(500px,30vw,640px)]';

// Viewport `lg` breakpoint: above it the panel is an in-flow column, below it a fullscreen drawer.
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

        document.body.classList.add('screen-max-lg:overflow-hidden');

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
            document.body.classList.remove('screen-max-lg:overflow-hidden');
            desktopMedia?.removeEventListener('change', updateAppColumnInert);
            appColumn?.removeAttribute('inert');
        };
    }, [isOpen]);

    if (!isEnabled('supportChat')) {
        return null;
    }

    const panelClassNames = classNames(
        'justify-end overflow-hidden bg-neutral-0',
        'screen-lg:sticky screen-lg:top-0 screen-lg:h-dvh screen-lg:shrink-0 screen-lg:self-start',
        'screen-lg:transition-[width] screen-lg:duration-300 screen-lg:ease-in-out',
        isOpen
            ? classNames(
                  'fixed inset-0 z-[var(--guk-dialog-content-z-index)] flex',
                  'screen-lg:inset-auto screen-lg:z-auto screen-lg:flex screen-lg:border-neutral-100 screen-lg:border-l screen-lg:shadow-neutral-lg',
                  panelWidthClassName,
              )
            : 'hidden screen-lg:flex screen-lg:w-0',
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
                    'h-full w-full screen-lg:shrink-0',
                    panelWidthClassName,
                )}
            >
                <SupportChat />
            </div>
        </aside>
    );
};
