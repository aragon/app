'use client';

import { InputText, TextArea } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { validateChainIds } from '../mpcPolicyForm/mpcPolicyFormUtils';
import type { IMpcCreateSystemFormData } from './mpcCreateSystemForm.api';

export interface IMpcCreateSystemFormDetailsProps {
    /**
     * Locks the fields once the system has been created on the co-signer (ceremony started): later edits would
     * otherwise be silently dropped.
     */
    disabled?: boolean;
}

export const MpcCreateSystemFormDetails: React.FC<
    IMpcCreateSystemFormDetailsProps
> = (props) => {
    const { disabled } = props;
    const { t } = useTranslations();

    const nameField = useFormField<IMpcCreateSystemFormData, 'name'>('name', {
        label: t('app.mpc.mpcCreateSystemForm.details.name.label'),
        rules: { required: true, maxLength: 64 },
        trimOnBlur: true,
    });
    const descriptionField = useFormField<
        IMpcCreateSystemFormData,
        'description'
    >('description', {
        label: t('app.mpc.mpcCreateSystemForm.details.description.label'),
        rules: { maxLength: 280 },
        sanitizeMode: 'multiline',
    });
    const chainIdsField = useFormField<IMpcCreateSystemFormData, 'chainIds'>(
        'chainIds',
        {
            label: t('app.mpc.mpcCreateSystemForm.details.chainIds.label'),
            rules: { required: true, validate: validateChainIds },
            trimOnBlur: true,
        },
    );

    return (
        <div className="flex flex-col gap-6">
            <InputText
                disabled={disabled}
                maxLength={64}
                placeholder={t(
                    'app.mpc.mpcCreateSystemForm.details.name.placeholder',
                )}
                {...nameField}
            />
            <TextArea
                disabled={disabled}
                isOptional={true}
                maxLength={280}
                placeholder={t(
                    'app.mpc.mpcCreateSystemForm.details.description.placeholder',
                )}
                {...descriptionField}
            />
            <InputText
                disabled={disabled}
                helpText={t(
                    'app.mpc.mpcCreateSystemForm.details.chainIds.helpText',
                )}
                placeholder="11155111"
                {...chainIdsField}
            />
            {disabled && (
                <p className="text-neutral-500 text-sm">
                    {t('app.mpc.mpcCreateSystemForm.details.locked')}
                </p>
            )}
        </div>
    );
};
