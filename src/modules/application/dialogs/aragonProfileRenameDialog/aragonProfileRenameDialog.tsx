'use client';

import {
    Dialog,
    InputText,
    invariant,
    useDebouncedValue,
} from '@aragon/gov-ui-kit';
import { useForm } from 'react-hook-form';
import { useEnsAddress } from 'wagmi';
import { ensChainId, memberRegistrySubdomainSuffix } from '@/modules/ens';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { ApplicationDialogId } from '../../constants/applicationDialogId';

/** Maximum character length allowed for a subdomain label. */
const subdomainMaxLength = 50;
const subdomainMinLength = 3;

/**
 * Valid ENS label: lowercase alphanumeric and hyphens,
 * must not start or end with a hyphen.
 */
const ensLabelPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

interface IFormData {
    /** New ENS subdomain label, e.g. "alice". */
    subdomain: string;
}

export interface IAragonProfileRenameDialogParams {
    /** Current Aragon ENS name, e.g. "alice.aragonx.eth". */
    currentEnsName: string;
}

export interface IAragonProfileRenameDialogProps
    extends IDialogComponentProps<IAragonProfileRenameDialogParams> {}

export const AragonProfileRenameDialog: React.FC<
    IAragonProfileRenameDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'AragonProfileRenameDialog: required params must be set.',
    );
    const { currentEnsName } = location.params;
    const currentSubdomain = currentEnsName.replace(
        memberRegistrySubdomainSuffix,
        '',
    );

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    const { control, handleSubmit, watch } = useForm<IFormData>({
        mode: 'onTouched',
        defaultValues: { subdomain: '' },
    });

    const subdomain = watch('subdomain');
    const [subdomainDebounced] = useDebouncedValue(subdomain, { delay: 500 });

    const { alert: fieldAlert, ...fieldProps } = useFormField<
        IFormData,
        'subdomain'
    >('subdomain', {
        label: t(
            'app.application.aragonProfileRenameDialog.fields.subdomain.label',
        ),
        rules: {
            required: true,
            maxLength: subdomainMaxLength,
            minLength: subdomainMinLength,
            pattern: {
                value: ensLabelPattern,
                message: t(
                    'app.application.aragonProfileRenameDialog.fields.subdomain.error.invalidFormat',
                ),
            },
            validate: (value) =>
                value === currentSubdomain
                    ? t(
                          'app.application.aragonProfileRenameDialog.fields.subdomain.error.sameAsCurrent',
                      )
                    : true,
        },
        sanitizeOnBlur: true,
        trimOnBlur: true,
        control,
    });

    const isValidForCheck =
        subdomainDebounced.length >= subdomainMinLength &&
        ensLabelPattern.test(subdomainDebounced) &&
        subdomainDebounced !== currentSubdomain &&
        fieldAlert == null;

    const { data: ensAddress, isLoading: isCheckingAvailability } =
        useEnsAddress({
            name: isValidForCheck
                ? `${subdomainDebounced}${memberRegistrySubdomainSuffix}`
                : undefined,
            chainId: ensChainId,
            query: { enabled: isValidForCheck },
        });

    const isNameTaken = isValidForCheck && ensAddress != null;

    const availabilityAlert = isNameTaken
        ? {
              message: t(
                  'app.application.aragonProfileRenameDialog.fields.subdomain.error.nameTaken',
              ),
              variant: 'critical' as const,
          }
        : undefined;

    const composedAlert = fieldAlert ?? availabilityAlert;

    const handleCancel = () => close(location.id);

    const handleSubmitRename = handleSubmit(({ subdomain }) => {
        open(ApplicationDialogId.ARAGON_PROFILE_RENAME_TRANSACTION, {
            stack: true,
            params: { subdomain },
        });
    });

    const isSubmitDisabled = isNameTaken || isCheckingAvailability;

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.application.aragonProfileRenameDialog.description',
                )}
                onClose={handleCancel}
                title={t('app.application.aragonProfileRenameDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-3 px-6 pt-4 pb-6">
                <InputText
                    {...fieldProps}
                    addon={memberRegistrySubdomainSuffix}
                    addonPosition="right"
                    alert={composedAlert}
                    helpText={t(
                        'app.application.aragonProfileRenameDialog.fields.subdomain.helpText',
                    )}
                    maxLength={subdomainMaxLength}
                    placeholder={t(
                        'app.application.aragonProfileRenameDialog.fields.subdomain.placeholder',
                    )}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.application.aragonProfileRenameDialog.actions.submit',
                    ),
                    onClick: handleSubmitRename,
                    disabled: isSubmitDisabled,
                    isLoading: isCheckingAvailability,
                }}
                secondaryAction={{
                    label: t(
                        'app.application.aragonProfileRenameDialog.actions.cancel',
                    ),
                    onClick: handleCancel,
                }}
            />
        </>
    );
};
