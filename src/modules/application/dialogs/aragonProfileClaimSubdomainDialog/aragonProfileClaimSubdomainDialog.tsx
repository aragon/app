'use client';

import { Dialog, InputText, useDebouncedValue } from '@aragon/gov-ui-kit';
import { useForm } from 'react-hook-form';
import { useEnsAddress } from 'wagmi';
import { ensChainId } from '@/modules/ens';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { ApplicationDialogId } from '../../constants/applicationDialogId';
import { ensSubdomainSuffix } from '../../constants/aragonProfile';

/** Maximum character length allowed for a subdomain label. */
const subdomainMaxLength = 80;

/**
 * Valid ENS label: lowercase alphanumeric and hyphens,
 * must not start or end with a hyphen.
 */
const ensLabelPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

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
    const { open, close } = useDialogContext();

    const { control, handleSubmit, watch } = useForm<IFormData>({
        mode: 'onTouched',
        defaultValues: { subdomain: '' },
    });

    const subdomain = watch('subdomain');
    const [subdomainDebounced] = useDebouncedValue(subdomain, {
        delay: 500,
    });

    const { alert: fieldAlert, ...fieldProps } = useFormField<
        IFormData,
        'subdomain'
    >('subdomain', {
        label: t(
            'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.label',
        ),
        rules: {
            required: true,
            maxLength: subdomainMaxLength,
            pattern: {
                value: ensLabelPattern,
                message: t(
                    'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.error.invalidFormat',
                ),
            },
        },
        sanitizeOnBlur: true,
        trimOnBlur: true,
        control,
    });

    const isValidForCheck =
        subdomainDebounced.length > 0 &&
        ensLabelPattern.test(subdomainDebounced) &&
        fieldAlert == null;

    const { data: ensAddress, isLoading: isCheckingAvailability } =
        useEnsAddress({
            name: isValidForCheck
                ? `${subdomainDebounced}${ensSubdomainSuffix}`
                : undefined,
            chainId: ensChainId,
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

    const handleCancel = () => close(id);

    const handleClaim = handleSubmit(({ subdomain: subdomainValue }) => {
        open(ApplicationDialogId.ARAGON_PROFILE_CLAIM_SUBDOMAIN_TRANSACTION, {
            stack: true,
            params: { subdomain: subdomainValue },
        });
    });

    const isSubmitDisabled = isNameTaken || isCheckingAvailability;

    return (
        <>
            <Dialog.Header
                onClose={handleCancel}
                title={t(
                    'app.application.aragonProfileClaimSubdomainDialog.title',
                )}
            />
            <Dialog.Content className="flex flex-col gap-3 px-6 pt-4 pb-6">
                <InputText
                    {...fieldProps}
                    addon={ensSubdomainSuffix}
                    addonPosition="right"
                    alert={composedAlert}
                    helpText={t(
                        'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.helpText',
                    )}
                    maxLength={subdomainMaxLength}
                    placeholder={t(
                        'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.placeholder',
                    )}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.application.aragonProfileClaimSubdomainDialog.actions.claim',
                    ),
                    onClick: handleClaim,
                    disabled: isSubmitDisabled,
                    isLoading: isCheckingAvailability,
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
