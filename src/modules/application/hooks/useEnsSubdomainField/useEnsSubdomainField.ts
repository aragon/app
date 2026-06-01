import { useDebouncedValue } from '@aragon/gov-ui-kit';
import {
    type Control,
    type FieldPath,
    type FieldValues,
    useWatch,
} from 'react-hook-form';
import { useEnsAddress } from 'wagmi';
import { ensChainId, memberRegistrySubdomainSuffix } from '@/modules/ens';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IUseFormFieldReturn } from '@/shared/hooks/useFormField/useFormField.api';

/** Minimum length for an ENS subdomain label. */
export const ensSubdomainMinLength = 3;
/** Maximum length for an ENS subdomain label. */
export const ensSubdomainMaxLength = 50;

/**
 * Valid ENS label: lowercase alphanumeric and hyphens, must not start or end
 * with a hyphen.
 */
const ensLabelPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
/** Allowed characters for an ENS label, ignoring position constraints. */
const ensLabelAllowedCharsPattern = /^[a-z0-9-]+$/;

export interface IUseEnsSubdomainFieldParams<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> {
    /** react-hook-form control owning the field. */
    control: Control<TFieldValues>;
    /** Form field name. */
    name: TName;
    /** Label shown on the input and used in default validation messages. */
    label: string;
    /**
     * Existing subdomain to reject (used on rename to disallow a no-op
     * submission). Omit to skip the sameAsCurrent check.
     */
    currentSubdomain?: string;
    /**
     * External gate for the availability query (e.g. while a pre-check is
     * loading). Defaults to true.
     */
    availabilityCheckEnabled?: boolean;
}

export interface IUseEnsSubdomainFieldReturn<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> {
    /**
     * Props to spread onto `InputText`. Includes the composed alert
     * (form-validation error or availability error).
     */
    fieldProps: IUseFormFieldReturn<TFieldValues, TName> & {
        addon: string;
        addonPosition: 'right';
        maxLength: number;
    };
    /** True while the availability query is in flight. */
    isCheckingAvailability: boolean;
    /** True when the debounced value resolves to an existing ENS record. */
    isNameTaken: boolean;
}

/**
 * Shared validation + availability orchestration for the Aragon ENS subdomain
 * input. Used by the claim and rename dialogs. Owns the format rules, the
 * debounced ENS resolution check, and the composed alert; callers provide the
 * display copy (label / placeholder / helpText).
 */
export const useEnsSubdomainField = <
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>(
    params: IUseEnsSubdomainFieldParams<TFieldValues, TName>,
): IUseEnsSubdomainFieldReturn<TFieldValues, TName> => {
    const {
        control,
        name,
        label,
        currentSubdomain,
        availabilityCheckEnabled = true,
    } = params;

    const { t } = useTranslations();

    const { alert: fieldAlert, ...fieldProps } = useFormField<
        TFieldValues,
        TName
    >(name, {
        label,
        rules: {
            required: true,
            minLength: ensSubdomainMinLength,
            maxLength: ensSubdomainMaxLength,
            validate: (value) => {
                if (!ensLabelAllowedCharsPattern.test(value)) {
                    return 'app.application.ensSubdomainField.error.invalidChars';
                }

                if (!ensLabelPattern.test(value)) {
                    return 'app.application.ensSubdomainField.error.invalidBoundary';
                }

                if (currentSubdomain != null && value === currentSubdomain) {
                    return 'app.application.ensSubdomainField.error.sameAsCurrent';
                }

                return true;
            },
        },
        sanitizeOnBlur: true,
        trimOnBlur: true,
        control,
    });

    const subdomain = useWatch({ control, name });
    const [subdomainDebounced] = useDebouncedValue(subdomain ?? '', {
        delay: 500,
    });

    const isValidForCheck =
        subdomainDebounced.length >= ensSubdomainMinLength &&
        ensLabelPattern.test(subdomainDebounced) &&
        subdomainDebounced !== currentSubdomain &&
        fieldAlert == null;

    const { data: ensAddress, isLoading: isCheckingAvailability } =
        useEnsAddress({
            name: isValidForCheck
                ? `${subdomainDebounced}${memberRegistrySubdomainSuffix}`
                : undefined,
            chainId: ensChainId,
            query: { enabled: isValidForCheck && availabilityCheckEnabled },
        });

    const isNameTaken = isValidForCheck && ensAddress != null;

    const availabilityAlert = isNameTaken
        ? {
              message: t('app.application.ensSubdomainField.error.nameTaken'),
              variant: 'critical' as const,
          }
        : undefined;

    return {
        fieldProps: {
            ...fieldProps,
            alert: fieldAlert ?? availabilityAlert,
            addon: memberRegistrySubdomainSuffix,
            addonPosition: 'right',
            maxLength: ensSubdomainMaxLength,
        },
        isCheckingAvailability,
        isNameTaken,
    };
};
