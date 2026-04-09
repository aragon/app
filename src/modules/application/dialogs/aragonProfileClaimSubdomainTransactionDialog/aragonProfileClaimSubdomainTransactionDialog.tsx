'use client';

import { Card, invariant, MemberAvatar, Tag } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import type { Address } from 'viem';
import { encodeFunctionData } from 'viem';
import { useConnection } from 'wagmi';
import { memberRegistryAddress } from '@/modules/ens';
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
import { ApplicationDialogId } from '../../constants/applicationDialogId';
import { ensSubdomainSuffix } from '../../constants/aragonProfile';
import type { IAragonProfileSetReverseEnsTransactionDialogParams } from '../aragonProfileSetReverseEnsTransactionDialog';

/** Minimal ABI for IMemberRegistry.register. */
const memberRegistryAbi = [
    {
        type: 'function',
        name: 'register',
        inputs: [{ name: 'subdomain', type: 'string' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;

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

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({ initialActiveStep: TransactionDialogStep.PREPARE });

    const handleCancel = useCallback(
        () => close(location.id),
        [close, location.id],
    );

    const prepareTransaction = useCallback(
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

    const handleSuccess = useCallback(() => {
        const params: IAragonProfileSetReverseEnsTransactionDialogParams = {
            subdomain,
            transactionInfo: {
                title: t(
                    'app.application.aragonProfileSetReverseEnsTransactionDialog.transactionInfo.title',
                ),
                current: 2,
                total: 2,
            },
        };
        open(ApplicationDialogId.ARAGON_PROFILE_SET_REVERSE_ENS_TX, { params });
    }, [open, subdomain, t]);

    const fullEnsName = `${subdomain}${ensSubdomainSuffix}`;

    return (
        <TransactionDialog
            description={t(
                'app.application.aragonProfileClaimSubdomainTransactionDialog.description',
            )}
            network={Network.ETHEREUM_MAINNET}
            onCancelClick={handleCancel}
            onSuccess={handleSuccess}
            prepareTransaction={prepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.application.aragonProfileClaimSubdomainTransactionDialog.submit',
            )}
            title={t(
                'app.application.aragonProfileClaimSubdomainTransactionDialog.title',
            )}
            transactionInfo={{
                title: t(
                    'app.application.aragonProfileClaimSubdomainTransactionDialog.transactionInfo.title',
                ),
                current: 1,
                total: 2,
            }}
        >
            <Card className="w-full border border-neutral-100 px-6 py-0 shadow-neutral-sm">
                <div className="flex flex-col gap-3 py-6">
                    <div className="flex items-center gap-4">
                        <MemberAvatar address={address} size="md" />
                        <div className="flex flex-1 justify-end">
                            <Tag
                                label={t(
                                    'app.application.aragonProfileClaimSubdomainTransactionDialog.you',
                                )}
                            />
                        </div>
                    </div>
                    <p className="truncate text-neutral-800 text-xl leading-tight">
                        {fullEnsName}
                    </p>
                </div>
            </Card>
        </TransactionDialog>
    );
};
