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

export interface IRegisterGaugeFormProps {
    /**
     * Prefix to prepend to all the form fields.
     */
    fieldPrefix: string;
}

export interface IRegisterGaugeFormData {
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
     * The incentive type (0 for Supply, 1 for Borrow)
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

export const RegisterGaugeForm: React.FC<IRegisterGaugeFormProps> = (props) => {
    const { fieldPrefix } = props;
    const { t } = useTranslations();

    const { value: nameValue, ...nameFieldRest } = useFormField<IRegisterGaugeFormData, 'name'>('name', {
        label: t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.name.label'),
        fieldPrefix,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
        // defaultValue: '' - default value works only when form is initialized with useForm!
    });

    const { value, ...avatarField } = useFormField<IRegisterGaugeFormData, 'avatar'>('avatar', {
        label: t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.avatar.label'),
        fieldPrefix,
        rules: {
            validate: (value) =>
                value?.error
                    ? `app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.avatar.error.${value.error}`
                    : undefined,
        },
    });

    // Watch the avatar field to properly update the InputFileAvatar component when its value changes
    const avatarFieldName = fieldPrefix ? `${fieldPrefix}.avatar` : 'avatar';
    const avatarValue = useWatch<Record<string, IRegisterGaugeFormData['avatar']>>({ name: avatarFieldName });

    const { value: descriptionValue, ...descriptionFieldRest } = useFormField<IRegisterGaugeFormData, 'description'>(
        'description',
        {
            label: t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.description.label'),
            fieldPrefix,
            rules: { required: true, maxLength: descriptionMaxLength },
            trimOnBlur: true,
        },
    );

    const {
        onChange: onQiTokenAddressChange,
        value: qiTokenAddress,
        ...qiTokenAddressField
    } = useFormField<IRegisterGaugeFormData, 'qiTokenAddress'>('qiTokenAddress', {
        label: t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.qiToken.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        fieldPrefix,
    });

    const [qiTokenAddressInput, setQiTokenAddressInput] = useState<string | undefined>(qiTokenAddress?.address);

    const {
        onChange: onIncentiveTypeChangeRaw,
        value: incentiveType,
        ...incentiveTypeField
    } = useFormField<IRegisterGaugeFormData, 'incentiveType'>('incentiveType', {
        label: t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.incentive.label'),
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
    } = useFormField<IRegisterGaugeFormData, 'rewardControllerAddress'>('rewardControllerAddress', {
        label: t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.rewardController.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        fieldPrefix,
    });

    const [rewardControllerAddressInput, setRewardControllerAddressInput] = useState<string | undefined>(
        rewardControllerAddress?.address,
    );

    return (
        <div className="flex flex-col gap-10">
            <InputText maxLength={nameMaxLength} value={nameValue || ''} {...nameFieldRest} />
            <InputFileAvatar
                value={avatarValue}
                helpText={t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.avatar.helpText')}
                maxDimension={maxAvatarDimension}
                maxFileSize={maxAvatarFileSize}
                isOptional={true}
                {...avatarField}
            />
            <TextArea
                helpText={t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.description.helpText')}
                maxLength={descriptionMaxLength}
                value={descriptionValue || ''}
                {...descriptionFieldRest}
            />
            <ResourcesInput
                name="resources"
                fieldPrefix={fieldPrefix}
                helpText={t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.resources.helpText')}
            />
            <AddressInput
                placeholder={t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.qiToken.placeholder')}
                helpText={t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.qiToken.helpText')}
                value={qiTokenAddressInput}
                onChange={setQiTokenAddressInput}
                onAccept={onQiTokenAddressChange}
                {...qiTokenAddressField}
            />
            <RadioGroup
                className="flex gap-4 md:!flex-row"
                onValueChange={onIncentiveTypeChange}
                value={incentiveType != null ? String(incentiveType) : undefined}
                helpText={t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.incentive.helpText')}
                {...incentiveTypeField}
            >
                <RadioCard
                    className="min-w-0"
                    label={t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.incentive.supplyLabel')}
                    value={String(GaugeIncentiveType.SUPPLY)}
                />
                <RadioCard
                    className="min-w-0"
                    label={t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.incentive.borrowLabel')}
                    value={String(GaugeIncentiveType.BORROW)}
                />
            </RadioGroup>
            <AddressInput
                placeholder={t(
                    'app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.rewardController.placeholder',
                )}
                helpText={t('app.plugins.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.rewardController.helpText')}
                value={rewardControllerAddressInput}
                onChange={setRewardControllerAddressInput}
                onAccept={onRewardControllerAddressChange}
                {...rewardControllerAddressField}
            />
        </div>
    );
};
