'use client';

import { CardEmptyState } from '@aragon/gov-ui-kit';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { TokenPluginDialogId } from '../../../constants/tokenPluginDialogId';
import type { ITokenWrapOnboardingFormDialogParams } from '../../../dialogs/tokenWrapOnboardingFormDialog';
import type { ITokenPluginSettingsToken } from '../../../types';
import { tokenPluginUtils } from '../../../utils/tokenPluginUtils';

export interface ITokenMemberListWrapCardEmptyStateProps {
    token: ITokenPluginSettingsToken;
    daoId: string;
}

export const TokenMemberListWrapCardEmptyState: React.FC<
    ITokenMemberListWrapCardEmptyStateProps
> = (props) => {
    const { token, daoId } = props;
    const underlyingToken = tokenPluginUtils.getUnderlyingToken(token);

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const handleWrapTokens = () => {
        const params: ITokenWrapOnboardingFormDialogParams = { token, daoId };
        open(TokenPluginDialogId.WRAP_ONBOARDING_FORM, { params });
    };

    return (
        <CardEmptyState
            description={t(
                'app.plugins.token.tokenMemberList.wrapOnboardingCard.description',
            )}
            heading={t(
                'app.plugins.token.tokenMemberList.wrapOnboardingCard.heading',
                { symbol: underlyingToken.symbol },
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
