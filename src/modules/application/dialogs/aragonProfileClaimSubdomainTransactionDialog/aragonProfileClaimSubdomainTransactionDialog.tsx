'use client';

import { Card, invariant, MemberAvatar, Tag } from '@aragon/gov-ui-kit';
import { useCallback, useState } from 'react';
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

/**
 * ENS Reverse Registrar contract address on mainnet.
 * Source: https://docs.ens.domains/contract-api-reference/reverseregistrar
 */
const ensReverseRegistrarAddress =
    '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb' as const;

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

    const handleSetReverseSuccess = useCallback(() => {
        open(ApplicationDialogId.ARAGON_PROFILE);
    }, [open]);

    const fullEnsName = `${subdomain}${ensSubdomainSuffix}`;

    const profileCard = (
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
    );

    if (phase === 1) {
        return (
            <TransactionDialog
                description={t(
                    'app.application.aragonProfileClaimSubdomainTransactionDialog.description',
                )}
                network={Network.ETHEREUM_MAINNET}
                onCancelClick={handleCancel}
                onSuccess={handleRegisterSuccess}
                prepareTransaction={prepareRegisterTransaction}
                stepper={registerStepper}
                submitLabel={t(
                    'app.application.aragonProfileClaimSubdomainTransactionDialog.submit',
                )}
                title={t(
                    'app.application.aragonProfileClaimSubdomainTransactionDialog.title',
                )}
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
            description={t(
                'app.application.aragonProfileClaimSubdomainTransactionDialog.description',
            )}
            network={Network.ETHEREUM_MAINNET}
            onCancelClick={handleCancel}
            onSuccess={handleSetReverseSuccess}
            prepareTransaction={prepareSetReverseTransaction}
            stepper={setReverseStepper}
            submitLabel={t(
                'app.application.aragonProfileClaimSubdomainTransactionDialog.submit',
            )}
            successLink={{
                label: t(
                    'app.application.aragonProfileClaimSubdomainTransactionDialog.successLink.label',
                ),
                onClick: handleSetReverseSuccess,
            }}
            title={t(
                'app.application.aragonProfileClaimSubdomainTransactionDialog.title',
            )}
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
