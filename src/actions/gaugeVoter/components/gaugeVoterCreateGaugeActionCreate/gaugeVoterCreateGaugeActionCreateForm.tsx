'use client';

import { type IResourcesInputResource, ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    AddressInput,
    addressUtils,
    type ICompositeAddress,
    type IInputFileAvatarValue,
    InputFileAvatar,
    InputText,
    TextArea,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';

export interface IGaugeVoterCreateGaugeActionCreateFormProps {
    /**
     * Prefix to prepend to all the form fields.
     */
    fieldPrefix: string;
    /**
     * Chain id used for contextual block explorer links.
     */
    chainId?: number;
}

export interface IGaugeVoterCreateGaugeFormData {
    /**
     * Address of the gauge to create.
     */
    gaugeAddress?: ICompositeAddress;
    /**
     * Name of the gauge.
     */
    name: string;
    /**
     * Avatar of the gauge.
     */
    avatar?: IInputFileAvatarValue;
    /**
     * Description of the gauge.
     */
    description: string;
    /**
     * Resources related to the gauge.
     */
    resources: IResourcesInputResource[];
}

const nameMaxLength = 128;
const descriptionMaxLength = 480;
const maxAvatarFileSize = 1 * 1024 * 1024; // 1 MB in bytes
const maxAvatarDimension = 1024;

export const GaugeVoterCreateGaugeActionCreateForm: React.FC<IGaugeVoterCreateGaugeActionCreateFormProps> = (props) => {
    const { fieldPrefix, chainId } = props;
    const { t } = useTranslations();

    const {
        onChange: onGaugeAddressChange,
        value: gaugeAddress,
        ...gaugeAddressField
    } = useFormField<IGaugeVoterCreateGaugeFormData, 'gaugeAddress'>('gaugeAddress', {
        label: t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.gaugeAddress.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        fieldPrefix,
    });

    const [gaugeAddressInput, setGaugeAddressInput] = useState<string | undefined>(gaugeAddress?.address);

    const { value: nameValue, ...nameFieldRest } = useFormField<IGaugeVoterCreateGaugeFormData, 'name'>('name', {
        label: t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.name.label'),
        fieldPrefix,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
    });

    const { value, ...avatarField } = useFormField<IGaugeVoterCreateGaugeFormData, 'avatar'>('avatar', {
        label: t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.avatar.label'),
        fieldPrefix,
        rules: {
            validate: (value) =>
                value?.error
                    ? `app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.avatar.error.${value.error}`
                    : undefined,
        },
    });

    // Watch the avatar field to properly update the InputFileAvatar component when its value changes
    const avatarFieldName = `${fieldPrefix}.avatar`;
    const avatarValue = useWatch<Record<string, IGaugeVoterCreateGaugeFormData['avatar']>>({
        name: avatarFieldName,
    });

    const { value: descriptionValue, ...descriptionFieldRest } = useFormField<
        IGaugeVoterCreateGaugeFormData,
        'description'
    >('description', {
        label: t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.description.label'),
        fieldPrefix,
        rules: { required: true, maxLength: descriptionMaxLength },
        trimOnBlur: true,
    });

    return (
        <div className="flex flex-col gap-10">
            <AddressInput
                placeholder={t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.gaugeAddress.placeholder')}
                helpText={t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.gaugeAddress.helpText')}
                value={gaugeAddressInput}
                onChange={setGaugeAddressInput}
                onAccept={onGaugeAddressChange}
                chainId={chainId}
                {...gaugeAddressField}
            />
            <InputText
                maxLength={nameMaxLength}
                value={nameValue || ''}
                helpText={t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.name.helpText')}
                {...nameFieldRest}
            />
            <InputFileAvatar
                value={avatarValue}
                helpText={t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.avatar.helpText')}
                maxDimension={maxAvatarDimension}
                maxFileSize={maxAvatarFileSize}
                isOptional={true}
                {...avatarField}
            />
            <TextArea
                helpText={t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.description.helpText')}
                maxLength={descriptionMaxLength}
                value={descriptionValue || ''}
                {...descriptionFieldRest}
            />
            <ResourcesInput
                name="resources"
                fieldPrefix={fieldPrefix}
                helpText={t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.resources.helpText')}
            />
        </div>
    );
};
