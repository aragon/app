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
    RadioCard,
    RadioGroup,
    TextArea,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { GaugeIncentiveType } from '../../types/enum/gaugeIncentiveType';
import { GaugeRegistrarActiveVotingAlert } from '../gaugeRegistrarActiveVotingAlert';

export interface IGaugeRegistrarRegisterGaugeActionCreateFormProps {
    /**
     * Prefix to prepend to all the form fields.
     */
    fieldPrefix: string;
}

export interface IGaugeRegistrarRegisterGaugeFormData {
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
    /**
     * The market's qiToken address.
     */
    qiTokenAddress?: ICompositeAddress;
    /**
     * The incentive type (0 for Supply, 1 for Borrow).
     */
    incentiveType?: GaugeIncentiveType;
    /**
     * The address of the associated reward controller contract.
     */
    rewardControllerAddress?: ICompositeAddress;
}

const nameMaxLength = 128;
const descriptionMaxLength = 480;
const maxAvatarFileSize = 1 * 1024 * 1024; // 1 MB in bytes
const maxAvatarDimension = 1024;

export const GaugeRegistrarRegisterGaugeActionCreateForm: React.FC<
    IGaugeRegistrarRegisterGaugeActionCreateFormProps
> = (props) => {
    const { fieldPrefix } = props;
    const { t } = useTranslations();

    const { value: nameValue, ...nameFieldRest } = useFormField<IGaugeRegistrarRegisterGaugeFormData, 'name'>('name', {
        label: t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.name.label'),
        fieldPrefix,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
    });

    const { value, ...avatarField } = useFormField<IGaugeRegistrarRegisterGaugeFormData, 'avatar'>('avatar', {
        label: t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.avatar.label'),
        fieldPrefix,
        rules: {
            validate: (value) =>
                value?.error
                    ? `app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.avatar.error.${value.error}`
                    : undefined,
        },
    });

    // Watch the avatar field to properly update the InputFileAvatar component when its value changes
    const avatarFieldName = `${fieldPrefix}.avatar`;
    const avatarValue = useWatch<Record<string, IGaugeRegistrarRegisterGaugeFormData['avatar']>>({
        name: avatarFieldName,
    });

    const { value: descriptionValue, ...descriptionFieldRest } = useFormField<
        IGaugeRegistrarRegisterGaugeFormData,
        'description'
    >('description', {
        label: t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.description.label'),
        fieldPrefix,
        rules: { required: true, maxLength: descriptionMaxLength },
        trimOnBlur: true,
    });

    const {
        onChange: onQiTokenAddressChange,
        value: qiTokenAddress,
        ...qiTokenAddressField
    } = useFormField<IGaugeRegistrarRegisterGaugeFormData, 'qiTokenAddress'>('qiTokenAddress', {
        label: t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.qiToken.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        fieldPrefix,
    });

    const [qiTokenAddressInput, setQiTokenAddressInput] = useState<string | undefined>(qiTokenAddress?.address);

    const {
        onChange: onIncentiveTypeChangeRaw,
        value: incentiveType,
        ...incentiveTypeField
    } = useFormField<IGaugeRegistrarRegisterGaugeFormData, 'incentiveType'>('incentiveType', {
        label: t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.incentive.label'),
        defaultValue: GaugeIncentiveType.SUPPLY,
    });

    // Convert string value from RadioGroup to numeric enum
    const onIncentiveTypeChange = (value: string) => {
        onIncentiveTypeChangeRaw(Number(value) as GaugeIncentiveType);
    };

    const {
        onChange: onRewardControllerAddressChange,
        value: rewardControllerAddress,
        ...rewardControllerAddressField
    } = useFormField<IGaugeRegistrarRegisterGaugeFormData, 'rewardControllerAddress'>('rewardControllerAddress', {
        label: t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.rewardController.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        fieldPrefix,
    });

    const [rewardControllerAddressInput, setRewardControllerAddressInput] = useState<string | undefined>(
        rewardControllerAddress?.address,
    );

    return (
        <div className="flex flex-col gap-10">
            <InputText
                maxLength={nameMaxLength}
                value={nameValue || ''} // explicit default because defaultValue didn't work (as per docs, it works only when form is initialized with useForm).
                helpText={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.name.helpText')}
                {...nameFieldRest}
            />
            <InputFileAvatar
                value={avatarValue}
                helpText={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.avatar.helpText')}
                maxDimension={maxAvatarDimension}
                maxFileSize={maxAvatarFileSize}
                isOptional={true}
                {...avatarField}
            />
            <TextArea
                helpText={t(
                    'app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.description.helpText',
                )}
                maxLength={descriptionMaxLength}
                value={descriptionValue || ''}
                {...descriptionFieldRest}
            />
            <ResourcesInput
                name="resources"
                fieldPrefix={fieldPrefix}
                helpText={t(
                    'app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.resources.helpText',
                )}
            />
            <AddressInput
                placeholder={t(
                    'app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.qiToken.placeholder',
                )}
                helpText={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.qiToken.helpText')}
                value={qiTokenAddressInput}
                onChange={setQiTokenAddressInput}
                onAccept={onQiTokenAddressChange}
                {...qiTokenAddressField}
            />
            <RadioGroup
                className="flex gap-4 md:!flex-row"
                onValueChange={onIncentiveTypeChange}
                value={incentiveType != null ? String(incentiveType) : undefined}
                helpText={t(
                    'app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.incentive.helpText',
                )}
                {...incentiveTypeField}
            >
                <RadioCard
                    className="min-w-0"
                    label={t(
                        'app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.incentive.supplyLabel',
                    )}
                    value={String(GaugeIncentiveType.SUPPLY)}
                />
                <RadioCard
                    className="min-w-0"
                    label={t(
                        'app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.incentive.borrowLabel',
                    )}
                    value={String(GaugeIncentiveType.BORROW)}
                />
            </RadioGroup>
            <AddressInput
                placeholder={t(
                    'app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.rewardController.placeholder',
                )}
                helpText={t(
                    'app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionCreateForm.rewardController.helpText',
                )}
                value={rewardControllerAddressInput}
                onChange={setRewardControllerAddressInput}
                onAccept={onRewardControllerAddressChange}
                {...rewardControllerAddressField}
            />
            <GaugeRegistrarActiveVotingAlert />
        </div>
    );
};
