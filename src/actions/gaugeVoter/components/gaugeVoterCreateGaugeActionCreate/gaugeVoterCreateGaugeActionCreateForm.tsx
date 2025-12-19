'use client';

import {
    AddressInput,
    addressUtils,
    type ICompositeAddress,
    type IInputFileAvatarValue,
    InputText,
    TextArea,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { AvatarInput } from '@/shared/components/forms/avatarInput';
import {
    type IResourcesInputResource,
    ResourcesInput,
} from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

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

export const GaugeVoterCreateGaugeActionCreateForm: React.FC<
    IGaugeVoterCreateGaugeActionCreateFormProps
> = (props) => {
    const { fieldPrefix, chainId } = props;
    const { t } = useTranslations();

    const {
        onChange: onGaugeAddressChange,
        value: gaugeAddress,
        ...gaugeAddressField
    } = useFormField<IGaugeVoterCreateGaugeFormData, 'gaugeAddress'>(
        'gaugeAddress',
        {
            label: t(
                'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.gaugeAddress.label',
            ),
            rules: {
                required: true,
                validate: (value) => addressUtils.isAddress(value?.address),
            },
            fieldPrefix,
        },
    );

    const [gaugeAddressInput, setGaugeAddressInput] = useState<
        string | undefined
    >(gaugeAddress?.address);

    const { value: nameValue, ...nameFieldRest } = useFormField<
        IGaugeVoterCreateGaugeFormData,
        'name'
    >('name', {
        label: t(
            'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.name.label',
        ),
        fieldPrefix,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
    });

    const { value: descriptionValue, ...descriptionFieldRest } = useFormField<
        IGaugeVoterCreateGaugeFormData,
        'description'
    >('description', {
        label: t(
            'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.description.label',
        ),
        fieldPrefix,
        rules: { required: true, maxLength: descriptionMaxLength },
        trimOnBlur: true,
    });

    return (
        <div className="flex flex-col gap-10">
            <AddressInput
                chainId={chainId}
                helpText={t(
                    'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.gaugeAddress.helpText',
                )}
                onAccept={onGaugeAddressChange}
                onChange={setGaugeAddressInput}
                placeholder={t(
                    'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.gaugeAddress.placeholder',
                )}
                value={gaugeAddressInput}
                {...gaugeAddressField}
            />
            <InputText
                helpText={t(
                    'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.name.helpText',
                )}
                maxLength={nameMaxLength}
                value={nameValue || ''}
                {...nameFieldRest}
            />
            <AvatarInput fieldPrefix={fieldPrefix} name="avatar" />
            <TextArea
                helpText={t(
                    'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.description.helpText',
                )}
                maxLength={descriptionMaxLength}
                value={descriptionValue || ''}
                {...descriptionFieldRest}
            />
            <ResourcesInput
                fieldPrefix={fieldPrefix}
                helpText={t(
                    'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionCreateForm.resources.helpText',
                )}
                name="resources"
            />
        </div>
    );
};
