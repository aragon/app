'use client';

import { Card, invariant, MemberAvatar, Tag } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { Address } from 'viem';
import { ENS_AVATAR_KEY, ensTransactionUtils } from '@/modules/ens';
import { Network } from '@/shared/api/daoService';
import { usePinFile } from '@/shared/api/ipfsService/mutations';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogActionParams,
    type ITransactionDialogStep,
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper/useStepper';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

/** Steps that precede the main on-chain transaction in the update flow. */
export enum AragonProfileUpdateStep {
    PIN_AVATAR = 'PIN_AVATAR',
}

export interface IAragonProfileUpdateTransactionDialogParams {
    /** ENS name of the user. */
    ensName: string;
    /** Connected wallet address. */
    address: Address;
    /** Avatar display URL for the preview (may be a blob URL if a new file was selected). */
    avatarSrc?: string;
    /** ENS text-record updates to commit onchain (does not include avatar). */
    updates: Record<string, string>;
    /** New avatar file to pin to IPFS before building the transaction. */
    avatarFile?: File;
}

/** Props for {@link AragonProfileUpdateTransactionDialog}. */
export interface IAragonProfileUpdateTransactionDialogProps
    extends IDialogComponentProps<IAragonProfileUpdateTransactionDialogParams> {}

export const AragonProfileUpdateTransactionDialog: React.FC<
    IAragonProfileUpdateTransactionDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'AragonProfileUpdateTransactionDialog: required params must be set.',
    );
    const { ensName, address, avatarSrc, updates, avatarFile } =
        location.params;
    const hasPinStep = avatarFile != null;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const queryClient = useQueryClient();

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        AragonProfileUpdateStep | TransactionDialogStep
    >({
        initialActiveStep: hasPinStep
            ? AragonProfileUpdateStep.PIN_AVATAR
            : TransactionDialogStep.PREPARE,
    });

    const {
        data: pinFileData,
        mutate: pinFile,
        status: pinFileStatus,
    } = usePinFile();

    const handlePinAvatar = useCallback(
        (params: ITransactionDialogActionParams) => {
            invariant(
                avatarFile != null,
                'AragonProfileUpdateTransactionDialog: avatarFile must be defined for PIN_AVATAR step.',
            );
            pinFile(
                { body: avatarFile },
                { onSuccess: stepper.nextStep, ...params },
            );
        },
        [avatarFile, pinFile, stepper.nextStep],
    );

    const handleCancel = useCallback(
        () => close(location.id),
        [close, location.id],
    );

    const handleSuccess = useCallback(() => {
        queryClient.refetchQueries({
            queryKey: ['ensRecords', ensName],
            type: 'all',
        });
        queryClient.refetchQueries({ queryKey: ['ensAvatar'], type: 'all' });
    }, [ensName, queryClient]);

    const prepareTransaction = useCallback(async () => {
        const allUpdates = { ...updates };
        if (pinFileData != null) {
            const avatarUri = ipfsUtils.cidToUri(pinFileData.IpfsHash);
            invariant(
                avatarUri != null,
                'AragonProfileUpdateTransactionDialog: avatar pin returned empty CID.',
            );
            allUpdates[ENS_AVATAR_KEY] = avatarUri;
        }
        return await ensTransactionUtils.buildUpdateRecordsTransaction({
            ensName,
            updates: allUpdates,
        });
    }, [ensName, updates, pinFileData]);

    const customSteps = useMemo<
        ITransactionDialogStep<AragonProfileUpdateStep>[]
    >(
        () =>
            hasPinStep
                ? [
                      {
                          id: AragonProfileUpdateStep.PIN_AVATAR,
                          order: 0,
                          meta: {
                              label: t(
                                  `app.application.aragonProfileUpdateTransactionDialog.step.${AragonProfileUpdateStep.PIN_AVATAR}.label`,
                              ),
                              errorLabel: t(
                                  `app.application.aragonProfileUpdateTransactionDialog.step.${AragonProfileUpdateStep.PIN_AVATAR}.errorLabel`,
                              ),
                              state: pinFileStatus,
                              action: handlePinAvatar,
                              auto: true,
                          },
                      },
                  ]
                : [],
        [hasPinStep, t, pinFileStatus, handlePinAvatar],
    );

    return (
        <TransactionDialog
            customSteps={customSteps}
            description={t(
                'app.application.aragonProfileUpdateTransactionDialog.description',
            )}
            network={Network.ETHEREUM_MAINNET}
            onCancelClick={handleCancel}
            onSuccess={handleSuccess}
            prepareTransaction={prepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.application.aragonProfileUpdateTransactionDialog.submit',
            )}
            successLink={{
                label: t(
                    'app.application.aragonProfileUpdateTransactionDialog.successLink.label',
                ),
            }}
            title={t(
                'app.application.aragonProfileUpdateTransactionDialog.title',
            )}
        >
            <Card className="w-full border border-neutral-100 px-6 py-0 shadow-neutral-sm">
                <div className="flex flex-col gap-3 py-6">
                    <div className="flex items-center gap-4">
                        <MemberAvatar
                            address={address}
                            avatarSrc={avatarSrc}
                            ensName={ensName}
                            size="md"
                        />
                        <div className="flex flex-1 justify-end">
                            <Tag
                                label={t(
                                    'app.application.aragonProfileUpdateTransactionDialog.you',
                                )}
                            />
                        </div>
                    </div>
                    <p className="truncate text-neutral-800 text-xl leading-tight">
                        {ensName}
                    </p>
                </div>
            </Card>
        </TransactionDialog>
    );
};
