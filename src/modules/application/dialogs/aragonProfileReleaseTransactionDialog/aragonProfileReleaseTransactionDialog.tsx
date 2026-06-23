'use client';

import { invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { encodeFunctionData } from 'viem';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import {
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
import { buildIntentId } from '@/shared/utils/pendingTransactionManager';
import { AragonProfilePreviewCard } from '../../components/aragonProfilePreviewCard';

export interface IAragonProfileReleaseTransactionDialogParams {
    /** Full Aragon ENS name being released, e.g. "alice.aragon.eth". */
    ensName: string;
}

export interface IAragonProfileReleaseTransactionDialogProps
    extends IDialogComponentProps<IAragonProfileReleaseTransactionDialogParams> {}

export const AragonProfileReleaseTransactionDialog: React.FC<
    IAragonProfileReleaseTransactionDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'AragonProfileReleaseTransactionDialog: required params must be set.',
    );
    const { ensName } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const { address } = useWalletAccount();
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

    const intentId = useMemo(
        () => buildIntentId({ type: 'aragonProfileRelease', ensName, address }),
        [ensName, address],
    );

    const prepareTransaction = useCallback(
        () =>
            Promise.resolve({
                to: memberRegistryAddress,
                data: encodeFunctionData({
                    abi: memberRegistryAbi,
                    functionName: 'release',
                    args: [],
                }),
                value: BigInt(0),
            }),
        [],
    );

    const handleSuccess = useCallback(() => {
        void queryClient.invalidateQueries({ queryKey: ensNameQueryKey });
        void queryClient.invalidateQueries({ queryKey: ['ensRecords'] });
        void queryClient.invalidateQueries({ queryKey: ['ensAvatar'] });
    }, [queryClient, ensNameQueryKey]);

    return (
        <TransactionDialog
            description={t(
                'app.application.aragonProfileReleaseTransactionDialog.description',
            )}
            intentId={intentId}
            network={Network.ETHEREUM_MAINNET}
            onCancelClick={handleCancel}
            onSuccess={handleSuccess}
            prepareTransaction={prepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.application.aragonProfileReleaseTransactionDialog.submit',
            )}
            successLink={{
                label: t(
                    'app.application.aragonProfileReleaseTransactionDialog.successLink.label',
                ),
                onClick: handleCancel,
            }}
            title={t(
                'app.application.aragonProfileReleaseTransactionDialog.title',
            )}
            transactionInfo={{
                title: t(
                    'app.application.aragonProfileReleaseTransactionDialog.transactionInfo',
                ),
            }}
        >
            <AragonProfilePreviewCard address={address} label={ensName} />
        </TransactionDialog>
    );
};
