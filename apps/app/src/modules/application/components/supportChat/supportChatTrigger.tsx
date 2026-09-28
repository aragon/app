'use client';

import { Button, IconType } from '@aragon/gov-ui-kit';
import { useEffect, useRef } from 'react';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSupportChatContext } from './supportChatContext';

// Header entry point of the support chat. Rendered at the trailing edge of the navigation bar
// (outside the centered container) so it always sits right next to the panel, and withdrawn while
// the panel is open — the panel then owns its own collapse control.
export const SupportChatTrigger: React.FC = () => {
    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();
    const { isOpen, open } = useSupportChatContext();

    const buttonRef = useRef<HTMLButtonElement>(null);
    const wasOpen = useRef(false);

    // The trigger withdraws while the panel is open, so collapsing the chat would leave the
    // keyboard on the document body: focus returns to the trigger that comes back in its place.
    useEffect(() => {
        if (!isOpen && wasOpen.current) {
            buttonRef.current?.focus();
        }

        wasOpen.current = isOpen;
    }, [isOpen]);

    if (!isEnabled('supportChat') || isOpen) {
        return null;
    }

    return (
        <div className="flex items-center pr-3 pl-2 lg:pr-4">
            <Button
                aria-label={t('app.application.supportChat.trigger.open')}
                iconLeft={IconType.FEEDBACK}
                onClick={open}
                ref={buttonRef}
                size="md"
                variant="tertiary"
            />
        </div>
    );
};
