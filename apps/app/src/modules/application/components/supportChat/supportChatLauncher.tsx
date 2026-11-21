'use client';

import { Icon, IconType } from '@aragon/gov-ui-kit';
import { useEffect, useRef } from 'react';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSupportChatContext } from './supportChatContext';

/**
 * Floating entry point of the support chat on the side-navigation layout: a medium secondary-style button, collapsing
 * to a square icon button below `md`. It withdraws while the chat is open, whose panel owns the close control.
 *
 * Render it as the last child of the page column: the zero-height sticky wrapper pins it to the bottom of the window
 * while the page scrolls.
 */
export const SupportChatLauncher: React.FC = () => {
    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();
    const { isOpen, open } = useSupportChatContext();

    const buttonRef = useRef<HTMLButtonElement>(null);
    const wasOpen = useRef(false);

    // Closing from the panel would leave the keyboard on the now inert panel: focus returns to the
    // launcher that comes back in its place.
    useEffect(() => {
        if (!isOpen && wasOpen.current) {
            buttonRef.current?.focus();
        }

        wasOpen.current = isOpen;
    }, [isOpen]);

    if (!isEnabled('supportChat') || isOpen) {
        return null;
    }
    // delay-300 waits out the closing panel's 300ms width transition (supportChatPanel).
    return (
        <div className="sticky bottom-6 z-10 h-0 self-end transition-[opacity,translate] delay-300 duration-200 ease-out motion-reduce:transition-none starting:translate-y-2 starting:opacity-0">
            <button
                aria-label={t('app.application.supportChat.launcher.label')}
                className="group absolute right-6 bottom-0 flex size-10 cursor-pointer items-center justify-center gap-1 rounded-xl border border-accent-default bg-accent-default-inverse whitespace-nowrap text-accent-default focus-ring transition-all ring-accent-focus shadow-accent-sm hover:border-accent-hover hover:bg-accent-hover-inverse hover:shadow-accent-default active:border-accent-active active:bg-accent-active-inverse active:shadow-none md:w-auto md:px-3"
                onClick={open}
                ref={buttonRef}
                type="button"
            >
                <Icon
                    className="icon-accent-default transition-all group-hover:icon-accent-hover group-active:icon-accent-active"
                    icon={IconType.FEEDBACK}
                    size="md"
                />
                <span className="hidden text-base leading-tight md:inline">
                    {t('app.application.supportChat.launcher.label')}
                </span>
            </button>
        </div>
    );
};
