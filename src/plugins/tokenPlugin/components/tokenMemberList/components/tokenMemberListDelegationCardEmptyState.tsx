'use client';

import { CardEmptyState } from '@aragon/gov-ui-kit';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { TokenPluginDialogId } from '../../../constants/tokenPluginDialogId';
import type { ITokenDelegationOnboardingDialogParams } from '../../../dialogs/tokenDelegationOnboardingFormDialog';
import type { ITokenPluginSettingsToken } from '../../../types';

export interface ITokenMemberListDelegationCardEmptyStateProps {
    token: ITokenPluginSettingsToken;
    daoId: string;
}

export const TokenMemberListDelegationCardEmptyState: React.FC<
    ITokenMemberListDelegationCardEmptyStateProps
> = (props) => {
    const { token, daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const handleSetUpDelegation = () => {
        const params: ITokenDelegationOnboardingDialogParams = {
            tokenAddress: token.address,
            tokenSymbol: token.symbol,
            daoId,
        };
        open(TokenPluginDialogId.DELEGATION_ONBOARDING, { params });
    };

    return (
        <CardEmptyState
            description={t(
                'app.plugins.token.tokenMemberList.delegationOnboardingCard.description',
            )}
            heading={t(
                'app.plugins.token.tokenMemberList.delegationOnboardingCard.heading',
                { symbol: token.symbol },
            )}
            humanIllustration={{
                body: 'ELEVATING',
                hairs: 'SHORT',
                accessory: 'PIERCINGS_TATTOO',
                sunglasses: 'LARGE_STYLIZED',
                expression: 'SMILE_WINK',
            }}
            isStacked={false}
            primaryButton={{
                label: t(
                    'app.plugins.token.tokenMemberList.delegationOnboardingCard.action',
                ),
                onClick: handleSetUpDelegation,
            }}
        />
    );
};
