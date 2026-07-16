'use client';

import classNames from 'classnames';
import { useEffect } from 'react';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { SupportChat } from './supportChat';
import { useSupportChatContext } from './supportChatContext';

// Non-modal shell of the support chat: on lg+ screens it is an in-flow column the rest of the
// layout resizes around (animated through its width), below lg it covers the whole screen. The
// page stays scrollable and interactive while the chat is open; the panel is inert while closed
// so its kept-mounted content is unreachable for keyboard and screen readers.
const panelWidthClassName = 'lg:w-[clamp(500px,30vw,640px)]';

export const SupportChatPanel: React.FC = () => {
    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();
    const { isOpen } = useSupportChatContext();

    // Below lg the open panel covers the whole viewport: lock the page scroll behind it so the
    // chat is the only thing that scrolls (the class is breakpoint-scoped, lg+ stays scrollable).
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        document.body.classList.add('max-lg:overflow-hidden');

        return () => document.body.classList.remove('max-lg:overflow-hidden');
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
            aria-label={t('app.application.supportChat.panel.label')}
            className={panelClassNames}
            inert={!isOpen}
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
