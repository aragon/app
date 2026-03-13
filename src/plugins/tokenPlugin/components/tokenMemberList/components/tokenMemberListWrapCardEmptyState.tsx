'use client';

import { CardEmptyState } from '@aragon/gov-ui-kit';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { TokenPluginDialogId } from '../../../constants/tokenPluginDialogId';
import type { ITokenWrapOnboardingIntroDialogParams } from '../../../dialogs/tokenWrapOnboardingIntroDialog/tokenWrapOnboardingIntroDialog';
import type { ITokenPluginSettingsToken } from '../../../types';

export interface ITokenMemberListWrapCardEmptyStateProps {
    token: ITokenPluginSettingsToken;
    daoId: string;
}

export const TokenMemberListWrapCardEmptyState: React.FC<
    ITokenMemberListWrapCardEmptyStateProps
> = (props) => {
    const { token, daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const handleWrapTokens = () => {
        const params: ITokenWrapOnboardingIntroDialogParams = { token, daoId };
        open(TokenPluginDialogId.WRAP_ONBOARDING_INTRO, { params });
    };

    return (
        <CardEmptyState
            description={t(
                'app.plugins.token.tokenMemberList.wrapOnboardingCard.description',
            )}
            heading={t(
                'app.plugins.token.tokenMemberList.wrapOnboardingCard.heading',
                { symbol: token.symbol },
            )}
            isStacked={false}
            objectIllustration={{ object: 'WALLET' }}
            primaryButton={{
                label: t(
                    'app.plugins.token.tokenMemberList.wrapOnboardingCard.action',
                ),
                onClick: handleWrapTokens,
            }}
        />
    );
};
