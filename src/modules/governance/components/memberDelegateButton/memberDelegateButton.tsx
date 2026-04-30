'use client';

import { addressUtils, Button } from '@aragon/gov-ui-kit';
import { useConnection } from 'wagmi';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenDelegationOnboardingDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenDelegationOnboardingFormDialog/tokenDelegationOnboardingFormDialog.api';
import { useTokenCurrentDelegate } from '@/plugins/tokenPlugin/hooks/useTokenCurrentDelegate';
import { Network, useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMemberDelegateButtonProps {
    /**
     * Address of the member whose profile is being viewed.
     */
    memberAddress: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the governance token.
     */
    tokenAddress?: string;
    /**
     * Symbol of the governance token (e.g. "PDT").
     */
    tokenSymbol?: string;
    /**
     * Class name to apply to the button.
     */
    className?: string;
}

export const MemberDelegateButton: React.FC<IMemberDelegateButtonProps> = (
    props,
) => {
    const { memberAddress, daoId, tokenAddress, tokenSymbol, className } =
        props;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { address, isConnected } = useConnection();
    const { check: walletGuard } = useConnectedWalletGuard();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { data: currentDelegate } = useTokenCurrentDelegate({
        userAddress: address ?? undefined,
        tokenAddress,
        network: dao?.network ?? Network.ETHEREUM_MAINNET,
        enabled: dao != null && address != null,
    });

    const isOwnPage = addressUtils.isAddressEqual(address, memberAddress);
    const isAlreadyDelegated = addressUtils.isAddressEqual(
        currentDelegate,
        memberAddress,
    );
    const isPassive = isOwnPage || isAlreadyDelegated;

    const openDialog = (delegateAddress?: string) => {
        if (tokenAddress == null || tokenSymbol == null) {
            return;
        }

        const params: ITokenDelegationOnboardingDialogParams = {
            tokenAddress,
            tokenSymbol,
            daoId,
            delegateAddress,
        };
        open(TokenPluginDialogId.DELEGATION_ONBOARDING, { params });
    };

    const handleClick = () => {
        if (!isConnected) {
            // Pre-populate with memberAddress after connecting: a non-connected user
            // can't be on their own page, so delegating to this member is the right default.
            walletGuard({ onSuccess: () => openDialog(memberAddress) });
            return;
        }

        openDialog(isPassive ? undefined : memberAddress);
    };

    if (tokenAddress == null || tokenSymbol == null) {
        return null;
    }

    return (
        <Button
            className={className}
            onClick={handleClick}
            size="md"
            variant={isPassive ? 'secondary' : 'primary'}
        >
            {isPassive
                ? t('app.governance.memberDelegateButton.manageDelegation')
                : t('app.governance.memberDelegateButton.delegate', {
                      token: tokenSymbol,
                  })}
        </Button>
    );
};
