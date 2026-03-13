'use client';

import { CardEmptyState } from '@aragon/gov-ui-kit';
import { GaugeVoterPluginDialogId } from '@/plugins/gaugeVoterPlugin/constants/gaugeVoterPluginDialogId';
import type { IGaugeVoterLockOnboardingIntroDialogParams } from '@/plugins/gaugeVoterPlugin/dialogs/gaugeVoterLockOnboardingIntroDialog/gaugeVoterLockOnboardingIntroDialog';
import type { IGaugeVoterPlugin } from '@/plugins/gaugeVoterPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ITokenPluginSettings } from '../../../types';

export interface ITokenMemberListLockCardEmptyStateProps {
    plugin: IDaoPlugin<ITokenPluginSettings>;
    daoId: string;
}

export const TokenMemberListLockCardEmptyState: React.FC<
    ITokenMemberListLockCardEmptyStateProps
> = (props) => {
    const { plugin, daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { token } = plugin.settings;

    const handleLockTokens = () => {
        const params: IGaugeVoterLockOnboardingIntroDialogParams = {
            plugin: plugin as unknown as IGaugeVoterPlugin,
            daoId,
        };
        open(GaugeVoterPluginDialogId.LOCK_ONBOARDING_INTRO, { params });
    };

    return (
        <CardEmptyState
            description={t(
                'app.plugins.token.tokenMemberList.lockOnboardingCard.description',
            )}
            heading={t(
                'app.plugins.token.tokenMemberList.lockOnboardingCard.heading',
                { symbol: token.symbol },
            )}
            isStacked={false}
            objectIllustration={{ object: 'WALLET' }}
            primaryButton={{
                label: t(
                    'app.plugins.token.tokenMemberList.lockOnboardingCard.action',
                ),
                onClick: handleLockTokens,
            }}
        />
    );
};
