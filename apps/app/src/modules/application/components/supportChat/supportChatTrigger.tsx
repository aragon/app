'use client';

import { Button, IconType } from '@aragon/gov-ui-kit';
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

    if (!isEnabled('supportChat') || isOpen) {
        return null;
    }

    return (
        <div className="flex items-center pr-3 pl-2 lg:pr-4">
            <Button
                aria-label={t('app.application.supportChat.trigger.open')}
                iconLeft={IconType.FEEDBACK}
                onClick={open}
                size="md"
                variant="tertiary"
            />
        </div>
    );
};
