'use client';

import { CardEmptyState } from '@aragon/gov-ui-kit';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { TokenPluginDialogId } from '../../../constants/tokenPluginDialogId';
import type { ITokenDelegationOnboardingDialogParams } from '../../../dialogs/tokenDelegationOnboardingFormDialog';
import type { ITokenPluginSettingsToken } from '../../../types';

export interface ITokenMemberListDelegationCardEmptyStateProps {
    /**
     * Token to display the delegation card for.
     */
    token: ITokenPluginSettingsToken;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const TokenMemberListDelegationCardEmptyState: React.FC<
    ITokenMemberListDelegationCardEmptyStateProps
> = (props) => {
    const { token, daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const heading =
        token.name && token.symbol
            ? t(
                  'app.plugins.token.tokenMemberList.delegationOnboardingCard.heading',
                  { symbol: token.symbol },
              )
            : t(
                  'app.plugins.token.tokenMemberList.delegationOnboardingCard.headingNoTokenMetadata',
              );

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
            heading={heading}
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
