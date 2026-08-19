'use client';

import { AlertCard, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    useMpcAcknowledgeRecovery,
    useMpcReshare,
    useMpcServerShare,
} from '@/modules/mpc/api/mpcService';
import type { IMpcSystem } from '@/modules/mpc/api/mpcService/domain';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { MpcMockBanner } from '@/modules/mpc/components/mpcMockBanner';
import { MpcPasswordInput } from '@/modules/mpc/components/mpcPasswordInput';
import { MpcRecoveryShareCard } from '@/modules/mpc/components/mpcRecoveryShareCard';
import { MPC_PASSPHRASE_MIN_LENGTH } from '@/modules/mpc/constants/mpcConstants';
import { useMpcHasDeviceShare } from '@/modules/mpc/hooks/useMpcHasDeviceShare';
import { useMpcProvider } from '@/modules/mpc/hooks/useMpcProvider';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export interface IMpcReshareDialogParams {
    /**
     * System to reshare.
     */
    system: IMpcSystem;
}

export interface IMpcReshareDialogProps
    extends IDialogComponentProps<IMpcReshareDialogParams> {}

interface IMpcReshareFormData {
    passphrase: string;
    newPassphrase: string;
    confirmPassphrase: string;
}

export const MpcReshareDialog: React.FC<IMpcReshareDialogProps> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'MpcReshareDialog: required parameters must be set.',
    );
    const { system } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const handleClose = () => close(location.id);

    const provider = useMpcProvider(system.providerId);
    const { refresh: refreshDeviceShare } = useMpcHasDeviceShare(
        system.id,
        system.providerId,
    );

    const [recoveryShareText, setRecoveryShareText] = useState<string>();
    const [newEpoch, setNewEpoch] = useState<number>();
    const [acknowledged, setAcknowledged] = useState(false);
    const [showAckError, setShowAckError] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<unknown>();

    const { control, handleSubmit, getValues } = useForm<IMpcReshareFormData>({
        mode: 'onTouched',
        defaultValues: {
            passphrase: '',
            newPassphrase: '',
            confirmPassphrase: '',
        },
    });
    const passphraseField = useFormField<IMpcReshareFormData, 'passphrase'>(
        'passphrase',
        {
            control,
            label: t('app.mpc.mpcReshareDialog.passphrase.label'),
            rules: { required: true },
            sanitizeMode: 'none',
        },
    );
    const newPassphraseField = useFormField<
        IMpcReshareFormData,
        'newPassphrase'
    >('newPassphrase', {
        control,
        label: t('app.mpc.mpcReshareDialog.newPassphrase.label'),
        rules: {
            validate: (value) =>
                value.length === 0 || value.length >= MPC_PASSPHRASE_MIN_LENGTH
                    ? true
                    : 'app.mpc.mpcReshareDialog.errors.passphraseLength',
        },
        sanitizeMode: 'none',
    });
    const confirmField = useFormField<IMpcReshareFormData, 'confirmPassphrase'>(
        'confirmPassphrase',
        {
            control,
            label: t('app.mpc.mpcReshareDialog.confirmPassphrase.label'),
            rules: {
                validate: (value) =>
                    value === getValues('newPassphrase')
                        ? true
                        : 'app.mpc.mpcReshareDialog.errors.passphraseMismatch',
            },
            sanitizeMode: 'none',
        },
    );

    const { mutateAsync: releaseServerShare } = useMpcServerShare();
    const { mutateAsync: reshare } = useMpcReshare();
    const { mutate: acknowledgeRecovery, isPending: isAcknowledging } =
        useMpcAcknowledgeRecovery({ onSuccess: handleClose });

    const onSubmit = handleSubmit(async ({ passphrase, newPassphrase }) => {
        setIsProcessing(true);
        setError(undefined);
        try {
            const { serverShare } = await releaseServerShare({
                urlParams: { systemId: system.id },
                body: { purpose: 'reshare' },
            });
            // POC / mock: reconstruct (verified against the system address) + re-split in the browser; the new
            // server share is uploaded first and the new device share is stored only once the co-signer accepted it.
            let updatedEpoch: number | undefined;
            const result = await provider.reshare({
                systemId: system.id,
                passphrase,
                newPassphrase:
                    newPassphrase.length > 0 ? newPassphrase : undefined,
                serverShare,
                expectedAddress: system.address,
                uploadServerShare: async (newServerShare) => {
                    const updated = await reshare({
                        urlParams: { systemId: system.id },
                        body: { serverShare: newServerShare, mode: 'reshare' },
                    });
                    updatedEpoch = updated.epoch;
                },
            });
            setNewEpoch(updatedEpoch);
            setRecoveryShareText(result.recoveryShareText);
            refreshDeviceShare();
        } catch (reshareError: unknown) {
            setError(reshareError);
        } finally {
            setIsProcessing(false);
        }
    });

    const handleDone = () => {
        if (!acknowledged) {
            setShowAckError(true);
            return;
        }
        acknowledgeRecovery({ urlParams: { systemId: system.id } });
    };

    return (
        <>
            <Dialog.Header
                description={t('app.mpc.mpcReshareDialog.description')}
                onClose={recoveryShareText == null ? handleClose : undefined}
                title={t('app.mpc.mpcReshareDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                {recoveryShareText == null ? (
                    <>
                        <MpcMockBanner />
                        <AlertCard
                            message={t('app.mpc.mpcReshareDialog.notice.title')}
                            variant="info"
                        >
                            {t('app.mpc.mpcReshareDialog.notice.description', {
                                epoch: system.epoch,
                                next: system.epoch + 1,
                            })}
                        </AlertCard>
                        <MpcPasswordInput
                            autoComplete="off"
                            {...passphraseField}
                        />
                        <MpcPasswordInput
                            autoComplete="new-password"
                            helpText={t(
                                'app.mpc.mpcReshareDialog.newPassphrase.helpText',
                            )}
                            isOptional={true}
                            {...newPassphraseField}
                        />
                        <MpcPasswordInput
                            autoComplete="new-password"
                            isOptional={true}
                            {...confirmField}
                        />
                        <MpcErrorAlert error={error} />
                    </>
                ) : (
                    <>
                        <AlertCard
                            message={t('app.mpc.mpcReshareDialog.done.title', {
                                epoch: newEpoch ?? system.epoch + 1,
                            })}
                            variant="success"
                        >
                            {t('app.mpc.mpcReshareDialog.done.description')}
                        </AlertCard>
                        <MpcRecoveryShareCard
                            acknowledged={acknowledged}
                            alertMessage={
                                showAckError && !acknowledged
                                    ? t(
                                          'app.mpc.mpcReshareDialog.errors.acknowledge',
                                      )
                                    : undefined
                            }
                            fileName={`aragon-mpc-recovery-${system.id}-epoch-${(newEpoch ?? system.epoch + 1).toString()}.txt`}
                            onAcknowledgedChange={setAcknowledged}
                            recoveryShareText={recoveryShareText}
                        />
                    </>
                )}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={
                    recoveryShareText == null
                        ? {
                              label: t(
                                  'app.mpc.mpcReshareDialog.actions.submit',
                              ),
                              onClick: onSubmit,
                              isLoading: isProcessing,
                          }
                        : {
                              label: t('app.mpc.mpcReshareDialog.actions.done'),
                              onClick: handleDone,
                              isLoading: isAcknowledging,
                          }
                }
                secondaryAction={
                    recoveryShareText == null
                        ? {
                              label: t(
                                  'app.mpc.mpcReshareDialog.actions.cancel',
                              ),
                              onClick: handleClose,
                              disabled: isProcessing,
                          }
                        : undefined
                }
            />
        </>
    );
};
