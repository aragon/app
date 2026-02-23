'use client';

import { invariant, MemberDataListItem } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { type Hex, zeroAddress } from 'viem';
import { mainnet } from 'viem/chains';
import { useConnection, useEnsName } from 'wagmi';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { tokenDelegationDialogUtils } from './tokenDelegationDialogUtils';

export interface ITokenDelegationDialogParams {
    /**
     * Address of the token.
     */
    token: string;
    /**
     * Address to delegate the voting power to.
     */
    delegate?: string;
    /**
     * Network used for the transaction.
     */
    network: Network;
}

export interface ITokenDelegationDialogProps
    extends IDialogComponentProps<ITokenDelegationDialogParams> {}

export const TokenDelegationDialog: React.FC<ITokenDelegationDialogProps> = (
    props,
) => {
    const { location } = props;
    invariant(
        location.params != null,
        'TokenDelegationDialog: required parameters must be set.',
    );

    const { address } = useConnection();
    invariant(
        address != null,
        'TokenDelegationDialog: user must be connected.',
    );

    const { token, delegate = zeroAddress, network } = location.params;
    const { data: delegateEnsName } = useEnsName({
        address: delegate as Hex,
        chainId: mainnet.id,
    });

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({ initialActiveStep });

    const handlePrepareTransaction = () =>
        tokenDelegationDialogUtils.buildTransaction(token, delegate);

    const onSuccessClick = () => {
        router.refresh();
    };

    return (
        <TransactionDialog
            description={t(
                'app.plugins.token.tokenDelegationForm.dialog.description',
            )}
            network={network}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.plugins.token.tokenDelegationForm.dialog.button.submit',
            )}
            successLink={{
                label: t(
                    'app.plugins.token.tokenDelegationForm.dialog.button.success',
                ),
                onClick: onSuccessClick,
            }}
            title={t('app.plugins.token.tokenDelegationForm.dialog.title')}
        >
            <MemberDataListItem.Structure
                address={delegate}
                ensName={delegateEnsName ?? undefined}
                isDelegate={true}
            />
        </TransactionDialog>
    );
};
