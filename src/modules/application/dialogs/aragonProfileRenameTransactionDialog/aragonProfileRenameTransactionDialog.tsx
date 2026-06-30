'use client';

import { invariant } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import { type Address, encodeFunctionData, type Hex } from 'viem';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
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
import type { IMemberProfileTextRecord } from '../../api/memberProfileService';
import { AragonProfilePreviewCard } from '../../components/aragonProfilePreviewCard';
import { ApplicationDialogId } from '../../constants/applicationDialogId';

export interface IAragonProfileRecords {
    /**
     * ENS text records to carry over to the new subdomain.
     */
    textRecords: IMemberProfileTextRecord[];
    /**
     * Address record to set on the new subdomain.
     */
    addr: Address;
    /**
     * Content-hash record (encoded bytes) to set on the new subdomain.
     */
    contenthash: Hex;
}

export interface IAragonProfileRenameTransactionDialogParams {
    /** New ENS subdomain label, e.g. "alice". */
    subdomain: string;
    /** Existing profile records to move to the new subdomain (matches the registry `Records` struct). */
    records: IAragonProfileRecords;
}

export interface IAragonProfileRenameTransactionDialogProps
    extends IDialogComponentProps<IAragonProfileRenameTransactionDialogParams> {}

export const AragonProfileRenameTransactionDialog: React.FC<
    IAragonProfileRenameTransactionDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'AragonProfileRenameTransactionDialog: required params must be set.',
    );

    const { subdomain, records } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const { address } = useWalletAccount();

    const newEnsName = `${subdomain}${memberRegistrySubdomainSuffix}`;

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
                    functionName: 'move',
                    args: [subdomain, records],
                }),
                value: BigInt(0),
            }),
        [subdomain, records],
    );

    const handleSuccess = useCallback(() => {
        open(ApplicationDialogId.ARAGON_PROFILE_SET_PRIMARY_ENS_TRANSACTION, {
            params: { subdomain, isPartOfTwoStepFlow: true },
        });
    }, [open, subdomain]);

    return (
        <TransactionDialog
            description={t(
                'app.application.aragonProfileRenameTransactionDialog.description',
            )}
            network={Network.ETHEREUM_MAINNET}
            onCancelClick={handleCancel}
            onSuccess={handleSuccess}
            prepareTransaction={prepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.application.aragonProfileRenameTransactionDialog.submit',
            )}
            title={t(
                'app.application.aragonProfileRenameTransactionDialog.title',
            )}
            transactionInfo={{
                title: t(
                    'app.application.aragonProfileRenameTransactionDialog.transactionInfo',
                ),
                current: 1,
                total: 2,
            }}
        >
            <AragonProfilePreviewCard address={address} label={newEnsName} />
        </TransactionDialog>
    );
};
