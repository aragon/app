'use client';

import { Card, invariant, MemberAvatar, Tag } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { useAccount } from 'wagmi';
import { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import type { ITransactionInfo } from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { ApplicationDialogId } from '../../constants/applicationDialogId';

/** ENS suffix appended to member subdomains. */
const ENS_SUBDOMAIN_SUFFIX = '.member.dao.eth';

/**
 * ENS Reverse Registrar contract address on mainnet.
 * Source: https://docs.ens.domains/contract-api-reference/reverseregistrar
 */
const ENS_REVERSE_REGISTRAR_ADDRESS =
    '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb' as const;

/** Minimal ABI for ENS ReverseRegistrar.setName. */
const ensReverseRegistrarAbi = [
    {
        type: 'function',
        name: 'setName',
        inputs: [{ name: 'name', type: 'string' }],
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'nonpayable',
    },
] as const;

/** Required params for {@link AragonProfileSetReverseEnsTransactionDialog}. */
export interface IAragonProfileSetReverseEnsTransactionDialogParams {
    /** ENS subdomain label, e.g. "alice". */
    subdomain: string;
    /** Transaction info used to display the step counter (e.g. step 2 of 2). */
    transactionInfo: ITransactionInfo;
}

/** Props for {@link AragonProfileSetReverseEnsTransactionDialog}. */
export interface IAragonProfileSetReverseEnsTransactionDialogProps
    extends IDialogComponentProps<IAragonProfileSetReverseEnsTransactionDialogParams> {}

export const AragonProfileSetReverseEnsTransactionDialog: React.FC<
    IAragonProfileSetReverseEnsTransactionDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'AragonProfileSetReverseEnsTransactionDialog: required params must be set.',
    );
    const { subdomain, transactionInfo } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const { address } = useAccount();

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({ initialActiveStep: TransactionDialogStep.PREPARE });

    const handleCancel = useCallback(
        () => close(location.id),
        [close, location.id],
    );

    const prepareTransaction = useCallback(() => {
        const fullEnsName = `${subdomain}${ENS_SUBDOMAIN_SUFFIX}`;
        return Promise.resolve({
            to: ENS_REVERSE_REGISTRAR_ADDRESS,
            data: encodeFunctionData({
                abi: ensReverseRegistrarAbi,
                functionName: 'setName',
                args: [fullEnsName],
            }),
            value: BigInt(0),
        });
    }, [subdomain]);

    const handleSuccess = useCallback(() => {
        open(ApplicationDialogId.ARAGON_PROFILE);
    }, [open]);

    const fullEnsName = `${subdomain}${ENS_SUBDOMAIN_SUFFIX}`;

    return (
        <TransactionDialog
            description={t(
                'app.application.aragonProfileSetReverseEnsTransactionDialog.description',
            )}
            network={Network.ETHEREUM_MAINNET}
            onCancelClick={handleCancel}
            onSuccess={handleSuccess}
            prepareTransaction={prepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.application.aragonProfileSetReverseEnsTransactionDialog.submit',
            )}
            successLink={{
                label: t(
                    'app.application.aragonProfileSetReverseEnsTransactionDialog.successLink.label',
                ),
                onClick: handleSuccess,
            }}
            title={t(
                'app.application.aragonProfileSetReverseEnsTransactionDialog.title',
            )}
            transactionInfo={transactionInfo}
        >
            <Card className="w-full border border-neutral-100 px-6 py-0 shadow-neutral-sm">
                <div className="flex flex-col gap-3 py-6">
                    <div className="flex items-center gap-4">
                        <MemberAvatar address={address} size="md" />
                        <div className="flex flex-1 justify-end">
                            <Tag
                                label={t(
                                    'app.application.aragonProfileSetReverseEnsTransactionDialog.you',
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
