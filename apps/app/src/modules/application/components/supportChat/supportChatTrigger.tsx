'use client';

import { Button, IconType } from '@aragon/gov-ui-kit';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSupportChatContext } from './supportChatContext';

// Header entry point of the support chat: the feedback icon opens the side panel, the chevron
// (pointing at the panel edge) tucks it away again. Rendered at the trailing edge of the
// navigation bar (outside the centered container) so it always sits right next to the panel.
export const SupportChatTrigger: React.FC = () => {
    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();
    const { isOpen, toggle } = useSupportChatContext();

    if (!isEnabled('supportChat')) {
        return null;
    }

    const label = t(
        isOpen
            ? 'app.application.supportChat.trigger.close'
            : 'app.application.supportChat.trigger.open',
    );

    return (
        <div className="flex items-center pr-3 pl-2 lg:pr-4">
            <Button
                aria-label={label}
                iconLeft={isOpen ? IconType.CHEVRON_RIGHT : IconType.FEEDBACK}
                onClick={toggle}
                size="md"
                variant="tertiary"
            />
        </div>
    );
};
