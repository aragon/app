'use client';

import {
    AlertCard,
    Clipboard,
    Dialog,
    invariant,
    TextArea,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Hex } from 'viem';
import { useMpcExportAuthorization } from '@/modules/mpc/api/mpcService';
import type { IMpcSystem } from '@/modules/mpc/api/mpcService/domain';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { MpcMockBanner } from '@/modules/mpc/components/mpcMockBanner';
import { MpcPasswordInput } from '@/modules/mpc/components/mpcPasswordInput';
import { useMpcProvider } from '@/modules/mpc/hooks/useMpcProvider';
import { parseRecoveryShare } from '@/modules/mpc/utils/recoveryShare';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export interface IMpcExportKeyDialogParams {
    /**
     * System to export the key of.
     */
    system: IMpcSystem;
}

export interface IMpcExportKeyDialogProps
    extends IDialogComponentProps<IMpcExportKeyDialogParams> {}

interface IMpcExportKeyFormData {
    passphrase: string;
    recoveryShare: string;
}

export const MpcExportKeyDialog: React.FC<IMpcExportKeyDialogProps> = (
    props,
) => {
    const { location } = props;
    invariant(
        location.params != null,
        'MpcExportKeyDialog: required parameters must be set.',
    );
    const { system } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const handleClose = () => close(location.id);

    const provider = useMpcProvider(system.providerId);
    const [privateKey, setPrivateKey] = useState<Hex>();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<unknown>();

    const { control, handleSubmit } = useForm<IMpcExportKeyFormData>({
        mode: 'onTouched',
        defaultValues: { passphrase: '', recoveryShare: '' },
    });

    const validateRecoveryShare = (value: string) => {
        try {
            const parsed = parseRecoveryShare(value, {
                systemId: system.id,
                epoch: system.epoch,
            });
            return parsed.systemId === system.id &&
                parsed.epoch === system.epoch
                ? true
                : 'app.mpc.mpcExportKeyDialog.errors.recoveryShareEpoch';
        } catch {
            return 'app.mpc.mpcExportKeyDialog.errors.recoveryShare';
        }
    };

    const passphraseField = useFormField<IMpcExportKeyFormData, 'passphrase'>(
        'passphrase',
        {
            control,
            label: t('app.mpc.mpcExportKeyDialog.passphrase.label'),
            rules: { required: true },
            sanitizeMode: 'none',
        },
    );
    const recoveryShareField = useFormField<
        IMpcExportKeyFormData,
        'recoveryShare'
    >('recoveryShare', {
        control,
        label: t('app.mpc.mpcExportKeyDialog.recoveryShare.label'),
        rules: { required: true, validate: validateRecoveryShare },
        trimOnBlur: true,
    });

    const { mutateAsync: authorizeExport } = useMpcExportAuthorization();

    const onSubmit = handleSubmit(async ({ passphrase, recoveryShare }) => {
        setIsProcessing(true);
        setError(undefined);
        try {
            const parsedRecoveryShare = parseRecoveryShare(recoveryShare, {
                systemId: system.id,
                epoch: system.epoch,
            });
            // POC / mock: device share + recovery share reconstruct the key locally, the server only logs the export.
            const key = await provider.exportKey({
                systemId: system.id,
                passphrase,
                recoveryShare: parsedRecoveryShare,
                expectedAddress: system.address,
            });
            await authorizeExport({ urlParams: { systemId: system.id } });
            setPrivateKey(key);
        } catch (exportError: unknown) {
            setError(exportError);
        } finally {
            setIsProcessing(false);
        }
    });

    return (
        <>
            <Dialog.Header
                description={t('app.mpc.mpcExportKeyDialog.description')}
                onClose={handleClose}
                title={t('app.mpc.mpcExportKeyDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <MpcMockBanner />
                <AlertCard
                    message={t('app.mpc.mpcExportKeyDialog.warning.title')}
                    variant="critical"
                >
                    {t('app.mpc.mpcExportKeyDialog.warning.description')}
                </AlertCard>
                {privateKey == null ? (
                    <>
                        <MpcPasswordInput
                            autoComplete="off"
                            {...passphraseField}
                        />
                        <TextArea
                            helpText={t(
                                'app.mpc.mpcExportKeyDialog.recoveryShare.helpText',
                            )}
                            placeholder="aragon-mpc-recovery:v1:..."
                            {...recoveryShareField}
                        />
                        <MpcErrorAlert error={error} />
                    </>
                ) : (
                    <div className="flex flex-col gap-2 rounded-xl border border-critical-300 bg-critical-100 p-4">
                        <p className="text-neutral-800 text-sm">
                            {t('app.mpc.mpcExportKeyDialog.result.label')}
                        </p>
                        <div className="flex items-start gap-2">
                            <code className="grow break-all font-mono text-neutral-800 text-sm">
                                {privateKey}
                            </code>
                            <Clipboard copyValue={privateKey} />
                        </div>
                        <p className="text-neutral-500 text-sm">
                            {t('app.mpc.mpcExportKeyDialog.result.description')}
                        </p>
                    </div>
                )}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={
                    privateKey == null
                        ? {
                              label: t(
                                  'app.mpc.mpcExportKeyDialog.actions.submit',
                              ),
                              onClick: onSubmit,
                              isLoading: isProcessing,
                          }
                        : {
                              label: t(
                                  'app.mpc.mpcExportKeyDialog.actions.close',
                              ),
                              onClick: handleClose,
                          }
                }
                secondaryAction={
                    privateKey == null
                        ? {
                              label: t(
                                  'app.mpc.mpcExportKeyDialog.actions.cancel',
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
