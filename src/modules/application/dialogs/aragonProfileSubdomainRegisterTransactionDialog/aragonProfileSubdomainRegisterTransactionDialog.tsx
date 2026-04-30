'use client';

import { invariant } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { useConnection } from 'wagmi';
import {
    memberRegistryAbi,
    memberRegistryAddress,
    memberRegistrySubdomainSuffix,
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

export interface IAragonProfileSubdomainRegisterTransactionDialogParams {
    /** ENS subdomain label to register, e.g. "alice". */
    subdomain: string;
}

export interface IAragonProfileSubdomainRegisterTransactionDialogProps
    extends IDialogComponentProps<IAragonProfileSubdomainRegisterTransactionDialogParams> {}

export const AragonProfileSubdomainRegisterTransactionDialog: React.FC<
    IAragonProfileSubdomainRegisterTransactionDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'AragonProfileSubdomainRegisterTransactionDialog: required params must be set.',
    );
    const { subdomain } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const { address } = useConnection();

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

    const prepareTransaction = useCallback(
        () =>
            Promise.resolve({
                to: memberRegistryAddress,
                data: encodeFunctionData({
                    abi: memberRegistryAbi,
                    functionName: 'register',
                    args: [subdomain],
                }),
                value: BigInt(0),
            }),
        [subdomain],
    );

    const handleSuccess = useCallback(() => {
        open(ApplicationDialogId.ARAGON_PROFILE_SET_PRIMARY_ENS_TRANSACTION, {
            params: { subdomain, isPartOfTwoStepFlow: true },
        });
    }, [open, subdomain]);

    return (
        <TransactionDialog
            description={t(
                'app.application.aragonProfileSubdomainRegisterTransactionDialog.description',
            )}
            network={Network.ETHEREUM_MAINNET}
            onCancelClick={handleCancel}
            onSuccess={handleSuccess}
            prepareTransaction={prepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.application.aragonProfileSubdomainRegisterTransactionDialog.submit',
            )}
            title={t(
                'app.application.aragonProfileSubdomainRegisterTransactionDialog.title',
            )}
            transactionInfo={{
                title: t(
                    'app.application.aragonProfileSubdomainRegisterTransactionDialog.transactionInfo',
                ),
                current: 1,
                total: 2,
            }}
        >
            <AragonProfilePreviewCard
                address={address}
                label={`${subdomain}${memberRegistrySubdomainSuffix}`}
            />
        </TransactionDialog>
    );
};
