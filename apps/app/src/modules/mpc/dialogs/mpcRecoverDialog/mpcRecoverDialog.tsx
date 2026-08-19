'use client';

import { AlertCard, Dialog, invariant, TextArea } from '@aragon/gov-ui-kit';
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
import { parseRecoveryShare } from '@/modules/mpc/utils/recoveryShare';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export interface IMpcRecoverDialogParams {
    /**
     * System to recover the device share for.
     */
    system: IMpcSystem;
}

export interface IMpcRecoverDialogProps
    extends IDialogComponentProps<IMpcRecoverDialogParams> {}

interface IMpcRecoverFormData {
    recoveryShare: string;
    newPassphrase: string;
    confirmPassphrase: string;
}

export const MpcRecoverDialog: React.FC<IMpcRecoverDialogProps> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'MpcRecoverDialog: required parameters must be set.',
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

    const { control, handleSubmit, getValues } = useForm<IMpcRecoverFormData>({
        mode: 'onTouched',
        defaultValues: {
            recoveryShare: '',
            newPassphrase: '',
            confirmPassphrase: '',
        },
    });

    const validateRecoveryShare = (value: string) => {
        try {
            const parsed = parseRecoveryShare(value, {
                systemId: system.id,
                epoch: system.epoch,
            });
            return parsed.systemId === system.id
                ? true
                : 'app.mpc.mpcRecoverDialog.errors.recoveryShareSystem';
        } catch {
            return 'app.mpc.mpcRecoverDialog.errors.recoveryShare';
        }
    };

    const recoveryShareField = useFormField<
        IMpcRecoverFormData,
        'recoveryShare'
    >('recoveryShare', {
        control,
        label: t('app.mpc.mpcRecoverDialog.recoveryShare.label'),
        rules: { required: true, validate: validateRecoveryShare },
        trimOnBlur: true,
    });
    const newPassphraseField = useFormField<
        IMpcRecoverFormData,
        'newPassphrase'
    >('newPassphrase', {
        control,
        label: t('app.mpc.mpcRecoverDialog.newPassphrase.label'),
        rules: { required: true, minLength: MPC_PASSPHRASE_MIN_LENGTH },
        sanitizeMode: 'none',
    });
    const confirmField = useFormField<IMpcRecoverFormData, 'confirmPassphrase'>(
        'confirmPassphrase',
        {
            control,
            label: t('app.mpc.mpcRecoverDialog.confirmPassphrase.label'),
            rules: {
                required: true,
                validate: (value) =>
                    value === getValues('newPassphrase')
                        ? true
                        : 'app.mpc.mpcRecoverDialog.errors.passphraseMismatch',
            },
            sanitizeMode: 'none',
        },
    );

    const { mutateAsync: releaseServerShare } = useMpcServerShare();
    const { mutateAsync: reshare } = useMpcReshare();
    const { mutate: acknowledgeRecovery, isPending: isAcknowledging } =
        useMpcAcknowledgeRecovery({ onSuccess: handleClose });

    const onSubmit = handleSubmit(async ({ recoveryShare, newPassphrase }) => {
        setIsProcessing(true);
        setError(undefined);
        try {
            const parsedRecoveryShare = parseRecoveryShare(recoveryShare, {
                systemId: system.id,
                epoch: system.epoch,
            });
            const { serverShare } = await releaseServerShare({
                urlParams: { systemId: system.id },
                body: { purpose: 'recover' },
            });
            // POC / mock: recovery share + server share → reconstruct (verified against the system address) →
            // re-split (new epoch); the new server share is uploaded first and the device share stored only once
            // the co-signer accepted it (a wrong recovery share never overwrites the good server share).
            let updatedEpoch: number | undefined;
            const result = await provider.recover({
                systemId: system.id,
                recoveryShare: parsedRecoveryShare,
                serverShare,
                newPassphrase,
                expectedAddress: system.address,
                uploadServerShare: async (newServerShare) => {
                    const updated = await reshare({
                        urlParams: { systemId: system.id },
                        body: { serverShare: newServerShare, mode: 'recover' },
                    });
                    updatedEpoch = updated.epoch;
                },
            });
            setNewEpoch(updatedEpoch);
            setRecoveryShareText(result.recoveryShareText);
            refreshDeviceShare();
        } catch (recoverError: unknown) {
            setError(recoverError);
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
                description={t('app.mpc.mpcRecoverDialog.description')}
                onClose={recoveryShareText == null ? handleClose : undefined}
                title={t('app.mpc.mpcRecoverDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                {recoveryShareText == null ? (
                    <>
                        <MpcMockBanner />
                        <AlertCard
                            message={t('app.mpc.mpcRecoverDialog.notice.title')}
                            variant="warning"
                        >
                            {t('app.mpc.mpcRecoverDialog.notice.description', {
                                epoch: system.epoch,
                            })}
                        </AlertCard>
                        <TextArea
                            helpText={t(
                                'app.mpc.mpcRecoverDialog.recoveryShare.helpText',
                            )}
                            placeholder="aragon-mpc-recovery:v1:..."
                            {...recoveryShareField}
                        />
                        <MpcPasswordInput
                            autoComplete="new-password"
                            helpText={t(
                                'app.mpc.mpcRecoverDialog.newPassphrase.helpText',
                                { min: MPC_PASSPHRASE_MIN_LENGTH },
                            )}
                            {...newPassphraseField}
                        />
                        <MpcPasswordInput
                            autoComplete="new-password"
                            {...confirmField}
                        />
                        <MpcErrorAlert error={error} />
                    </>
                ) : (
                    <>
                        <AlertCard
                            message={t('app.mpc.mpcRecoverDialog.done.title', {
                                epoch: newEpoch ?? system.epoch + 1,
                            })}
                            variant="success"
                        >
                            {t('app.mpc.mpcRecoverDialog.done.description')}
                        </AlertCard>
                        <MpcRecoveryShareCard
                            acknowledged={acknowledged}
                            alertMessage={
                                showAckError && !acknowledged
                                    ? t(
                                          'app.mpc.mpcRecoverDialog.errors.acknowledge',
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
                                  'app.mpc.mpcRecoverDialog.actions.submit',
                              ),
                              onClick: onSubmit,
                              isLoading: isProcessing,
                          }
                        : {
                              label: t('app.mpc.mpcRecoverDialog.actions.done'),
                              onClick: handleDone,
                              isLoading: isAcknowledging,
                          }
                }
                secondaryAction={
                    recoveryShareText == null
                        ? {
                              label: t(
                                  'app.mpc.mpcRecoverDialog.actions.cancel',
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
