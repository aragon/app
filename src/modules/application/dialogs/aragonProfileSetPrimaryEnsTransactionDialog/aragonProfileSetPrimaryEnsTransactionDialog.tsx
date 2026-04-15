'use client';

import { invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { useConnection } from 'wagmi';
import {
    ensReverseRegistrarAbi,
    ensReverseRegistrarAddress,
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

/** Required params for {@link AragonProfileSetPrimaryEnsTransactionDialog}. */
export interface IAragonProfileSetPrimaryEnsTransactionDialogParams {
    /** ENS subdomain label, e.g. "alice". */
    subdomain: string;
    /**
     * When true, shows a "2 of 2" step indicator.
     * Set when this dialog follows the register step in the two-step claim flow.
     * Omit or set to false when setting the primary ENS standalone.
     */
    isPartOfTwoStepFlow?: boolean;
}

/** Props for {@link AragonProfileSetPrimaryEnsTransactionDialog}. */
export interface IAragonProfileSetPrimaryEnsTransactionDialogProps
    extends IDialogComponentProps<IAragonProfileSetPrimaryEnsTransactionDialogParams> {}

export const AragonProfileSetPrimaryEnsTransactionDialog: React.FC<
    IAragonProfileSetPrimaryEnsTransactionDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'AragonProfileSetPrimaryEnsTransactionDialog: required params must be set.',
    );
    const { subdomain, isPartOfTwoStepFlow } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const { address } = useConnection();
    const queryClient = useQueryClient();
    const { queryKey: ensNameQueryKey } = useEnsName(address);

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handleCancel = useCallback(
        () => close(location.id),
        [close, location.id],
    );

    const fullEnsName = `${subdomain}${ensSubdomainSuffix}`;

    const prepareTransaction = useCallback(
        () =>
            Promise.resolve({
                to: ensReverseRegistrarAddress,
                data: encodeFunctionData({
                    abi: ensReverseRegistrarAbi,
                    functionName: 'setName',
                    args: [fullEnsName],
                }),
                value: BigInt(0),
            }),
        [fullEnsName],
    );

    const handleSuccessClick = useCallback(() => {
        open(ApplicationDialogId.ARAGON_PROFILE);
    }, [open]);

    const handleSuccess = useCallback(() => {
        void queryClient.invalidateQueries({ queryKey: ensNameQueryKey });
    }, [queryClient.invalidateQueries, ensNameQueryKey]);

    return (
        <TransactionDialog
            description={t(
                'app.application.aragonProfileSetPrimaryEnsTransactionDialog.description',
            )}
            network={Network.ETHEREUM_MAINNET}
            onCancelClick={handleCancel}
            onSuccess={handleSuccess}
            prepareTransaction={prepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.application.aragonProfileSetPrimaryEnsTransactionDialog.submit',
            )}
            successLink={{
                label: t(
                    'app.application.aragonProfileSetPrimaryEnsTransactionDialog.successLink.label',
                ),
                onClick: handleSuccessClick,
            }}
            title={t(
                'app.application.aragonProfileSetPrimaryEnsTransactionDialog.title',
            )}
            transactionInfo={
                isPartOfTwoStepFlow
                    ? {
                          title: t(
                              'app.application.aragonProfileSetPrimaryEnsTransactionDialog.transactionInfo',
                          ),
                          current: 2,
                          total: 2,
                      }
                    : undefined
            }
        >
            <AragonProfilePreviewCard address={address} label={fullEnsName} />
        </TransactionDialog>
    );
};
