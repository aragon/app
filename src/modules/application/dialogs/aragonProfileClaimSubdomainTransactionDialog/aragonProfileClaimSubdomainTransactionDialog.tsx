'use client';

import { invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { Address } from 'viem';
import { encodeFunctionData } from 'viem';
import { useConnection } from 'wagmi';
import {
    ensReverseRegistrarAbi,
    ensReverseRegistrarAddress,
    memberRegistryAbi,
    memberRegistryAddress,
    useEnsName,
} from '@/modules/ens';
import { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { AragonProfilePreviewCard } from '../../components/aragonProfilePreviewCard';
import { ApplicationDialogId } from '../../constants/applicationDialogId';
import { ensSubdomainSuffix } from '../../constants/aragonProfile';

/** Required params for {@link AragonProfileClaimSubdomainTransactionDialog}. */
export interface IAragonProfileClaimSubdomainTransactionDialogParams {
    /** ENS subdomain label to claim, e.g. "alice". */
    subdomain: string;
}

/** Props for {@link AragonProfileClaimSubdomainTransactionDialog}. */
export interface IAragonProfileClaimSubdomainTransactionDialogProps
    extends IDialogComponentProps<IAragonProfileClaimSubdomainTransactionDialogParams> {}

export const AragonProfileClaimSubdomainTransactionDialog: React.FC<
    IAragonProfileClaimSubdomainTransactionDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'AragonProfileClaimSubdomainTransactionDialog: required params must be set.',
    );
    const { subdomain } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const { address } = useConnection();
    const queryClient = useQueryClient();
    const { queryKey: ensNameQueryKey } = useEnsName(address);

    const [phase, setPhase] = useState<1 | 2>(1);

    const registerStepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({ initialActiveStep: TransactionDialogStep.PREPARE });

    const setReverseStepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({ initialActiveStep: TransactionDialogStep.PREPARE });

    const handleCancel = useCallback(
        () => close(location.id),
        [close, location.id],
    );

    const prepareRegisterTransaction = useCallback(
        () =>
            Promise.resolve({
                to: memberRegistryAddress as Address,
                data: encodeFunctionData({
                    abi: memberRegistryAbi,
                    functionName: 'register',
                    args: [subdomain],
                }),
                value: BigInt(0),
            }),
        [subdomain],
    );

    const prepareSetReverseTransaction = useCallback(
        () =>
            Promise.resolve({
                to: ensReverseRegistrarAddress,
                data: encodeFunctionData({
                    abi: ensReverseRegistrarAbi,
                    functionName: 'setName',
                    args: [`${subdomain}${ensSubdomainSuffix}`],
                }),
                value: BigInt(0),
            }),
        [subdomain],
    );

    const handleRegisterSuccess = useCallback(() => setPhase(2), []);

    const handleSetReverseSuccessClick = useCallback(() => {
        open(ApplicationDialogId.ARAGON_PROFILE);
    }, [open]);

    const handleSetReverseSuccess = useCallback(() => {
        void queryClient.invalidateQueries({ queryKey: ensNameQueryKey });
    }, [queryClient.invalidateQueries, ensNameQueryKey]);

    const fullEnsName = `${subdomain}${ensSubdomainSuffix}`;

    const profileCard = (
        <AragonProfilePreviewCard address={address} label={fullEnsName} />
    );

    const sharedDialogProps = {
        description: t(
            'app.application.aragonProfileClaimSubdomainTransactionDialog.description',
        ),
        network: Network.ETHEREUM_MAINNET,
        onCancelClick: handleCancel,
        submitLabel: t(
            'app.application.aragonProfileClaimSubdomainTransactionDialog.submit',
        ),
        title: t(
            'app.application.aragonProfileClaimSubdomainTransactionDialog.title',
        ),
    };

    if (phase === 1) {
        return (
            <TransactionDialog
                key="register"
                {...sharedDialogProps}
                onSuccess={handleRegisterSuccess}
                prepareTransaction={prepareRegisterTransaction}
                stepper={registerStepper}
                transactionInfo={{
                    title: t(
                        'app.application.aragonProfileClaimSubdomainTransactionDialog.transactionInfo.register',
                    ),
                    current: 1,
                    total: 2,
                }}
            >
                {profileCard}
            </TransactionDialog>
        );
    }
    return (
        <TransactionDialog
            key="set-reverse"
            {...sharedDialogProps}
            onSuccess={handleSetReverseSuccess}
            prepareTransaction={prepareSetReverseTransaction}
            stepper={setReverseStepper}
            successLink={{
                label: t(
                    'app.application.aragonProfileClaimSubdomainTransactionDialog.successLink.label',
                ),
                onClick: handleSetReverseSuccessClick,
            }}
            transactionInfo={{
                title: t(
                    'app.application.aragonProfileClaimSubdomainTransactionDialog.transactionInfo.setReverse',
                ),
                current: 2,
                total: 2,
            }}
        >
            {profileCard}
        </TransactionDialog>
    );
};
