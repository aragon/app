'use client';

import { Dialog, InputText } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import { useEnsAddress, useSendTransaction } from 'wagmi';
import { ENS_CHAIN_ID, memberRegistryAddress } from '@/modules/ens';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

/** ENS suffix appended to member subdomains in the UI and for availability checks. */
const ENS_SUBDOMAIN_SUFFIX = '.member.dao.eth';

/** Maximum character length allowed for a subdomain label. */
const SUBDOMAIN_MAX_LENGTH = 80;

/** Debounce delay in ms before triggering the ENS availability check. */
const AVAILABILITY_DEBOUNCE_MS = 500;

/**
 * Valid ENS label: lowercase alphanumeric and hyphens,
 * must not start or end with a hyphen.
 */
const ENS_LABEL_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

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

interface IFormData {
    /** ENS subdomain label to claim, e.g. "alice". */
    subdomain: string;
}

/** Required params for {@link AragonProfileClaimSubdomainDialog}. */
export interface IAragonProfileClaimSubdomainDialogParams {}

/** Props for {@link AragonProfileClaimSubdomainDialog}. */
export interface IAragonProfileClaimSubdomainDialogProps
    extends IDialogComponentProps<IAragonProfileClaimSubdomainDialogParams> {}

export const AragonProfileClaimSubdomainDialog: React.FC<
    IAragonProfileClaimSubdomainDialogProps
> = (props) => {
    const { location } = props;
    const { id } = location;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const [debouncedSubdomain, setDebouncedSubdomain] = useState('');
    const [txError, setTxError] = useState<string | undefined>();

    const { control, handleSubmit, watch } = useForm<IFormData>({
        mode: 'onTouched',
        defaultValues: { subdomain: '' },
    });

    const subdomain = watch('subdomain');

    useEffect(() => {
        const timer = setTimeout(
            () => setDebouncedSubdomain(subdomain),
            AVAILABILITY_DEBOUNCE_MS,
        );
        return () => clearTimeout(timer);
    }, [subdomain]);

    const {
        label: _label,
        alert: fieldAlert,
        ...fieldProps
    } = useFormField<IFormData, 'subdomain'>('subdomain', {
        label: t(
            'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.label',
        ),
        rules: {
            required: true,
            maxLength: SUBDOMAIN_MAX_LENGTH,
            pattern: {
                value: ENS_LABEL_PATTERN,
                message: t(
                    'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.error.invalidFormat',
                ),
            },
        },
        sanitizeMode: 'none',
        trimOnBlur: true,
        control,
    });

    const isValidForCheck =
        debouncedSubdomain.length > 0 &&
        ENS_LABEL_PATTERN.test(debouncedSubdomain) &&
        fieldAlert == null;

    const { data: ensAddress, isLoading: isCheckingAvailability } =
        useEnsAddress({
            name: isValidForCheck
                ? `${debouncedSubdomain}${ENS_SUBDOMAIN_SUFFIX}`
                : undefined,
            chainId: ENS_CHAIN_ID,
            query: { enabled: isValidForCheck },
        });

    const isNameTaken = isValidForCheck && ensAddress != null;

    const availabilityAlert = isNameTaken
        ? {
              message: t(
                  'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.error.nameTaken',
              ),
              variant: 'critical' as const,
          }
        : undefined;

    const composedAlert = fieldAlert ?? availabilityAlert;

    const { sendTransactionAsync, isPending } = useSendTransaction();

    const handleCancel = () => close(id);

    const onSubmit = handleSubmit(async ({ subdomain: subdomainValue }) => {
        if (isNameTaken) {
            return;
        }

        setTxError(undefined);

        try {
            const data = encodeFunctionData({
                abi: memberRegistryAbi,
                functionName: 'register',
                args: [subdomainValue],
            });

            await sendTransactionAsync({ to: memberRegistryAddress, data });

            close(id);
        } catch {
            setTxError(
                t(
                    'app.application.aragonProfileClaimSubdomainDialog.error.transactionFailed',
                ),
            );
        }
    });

    const isSubmitDisabled = isNameTaken || isPending;

    return (
        <>
            <Dialog.Header
                onClose={handleCancel}
                title={t(
                    'app.application.aragonProfileClaimSubdomainDialog.title',
                )}
            />
            <Dialog.Content className="flex flex-col gap-3 px-6 pt-4 pb-6">
                <div className="flex flex-col gap-1">
                    <p className="font-normal text-lg text-neutral-800 leading-tight">
                        {t(
                            'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.label',
                        )}
                    </p>
                    <p className="font-normal text-base text-neutral-500 leading-normal">
                        {t(
                            'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.helpText',
                        )}
                    </p>
                </div>
                <InputText
                    {...fieldProps}
                    addon={ENS_SUBDOMAIN_SUFFIX}
                    addonPosition="right"
                    alert={composedAlert}
                    id="aragon-profile-subdomain"
                    maxLength={SUBDOMAIN_MAX_LENGTH}
                    placeholder={t(
                        'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.placeholder',
                    )}
                />
                {txError != null && (
                    <p className="font-normal text-critical-800 text-sm leading-normal">
                        {txError}
                    </p>
                )}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.application.aragonProfileClaimSubdomainDialog.actions.claim',
                    ),
                    onClick: onSubmit,
                    disabled: isSubmitDisabled,
                    isLoading: isCheckingAvailability || isPending,
                }}
                secondaryAction={{
                    label: t(
                        'app.application.aragonProfileClaimSubdomainDialog.actions.cancel',
                    ),
                    onClick: handleCancel,
                }}
            />
        </>
    );
};
