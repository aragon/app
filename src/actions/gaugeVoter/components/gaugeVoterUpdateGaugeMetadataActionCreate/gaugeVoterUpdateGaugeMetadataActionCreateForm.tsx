'use client';

import type { IGauge } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { AvatarInput } from '@/shared/components/forms/avatarInput';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { InputText, TextArea } from '@aragon/gov-ui-kit';
import type { IGaugeVoterCreateGaugeFormData } from '../gaugeVoterCreateGaugeActionCreate';
import { GaugeVoterGaugeListItem } from '../gaugeVoterGaugeListItem';

export interface IGaugeVoterUpdateGaugeMetadataActionCreateFormProps {
    /**
     * Prefix to prepend to all the form fields.
     */
    fieldPrefix: string;
    /**
     * The gauge to update metadata for.
     */
    gauge: IGauge;
    /**
     * Callback to remove the selected gauge.
     */
    onRemoveGauge: () => void;
    /**
     * Chain id used for contextual block explorer links.
     */
    chainId?: number;
}

export interface IGaugeVoterUpdateGaugeMetadataFormData
    extends Pick<IGaugeVoterCreateGaugeFormData, 'name' | 'description' | 'avatar' | 'resources'> {}

const nameMaxLength = 128;
const descriptionMaxLength = 480;

export const GaugeVoterUpdateGaugeMetadataActionCreateForm: React.FC<
    IGaugeVoterUpdateGaugeMetadataActionCreateFormProps
> = (props) => {
    const { fieldPrefix, gauge, onRemoveGauge } = props;
    const { t } = useTranslations();

    const { name, description, avatar, links: resources } = gauge;
    const existingAvatar = { url: ipfsUtils.cidToSrc(avatar) };

    const { value: nameValue, ...nameFieldRest } = useFormField<IGaugeVoterUpdateGaugeMetadataFormData, 'name'>(
        'name',
        {
            label: t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionCreateForm.name.label'),
            fieldPrefix,
            rules: { required: true, maxLength: nameMaxLength },
            trimOnBlur: true,
            defaultValue: name ?? '',
        },
    );

    const { value: descriptionValue, ...descriptionFieldRest } = useFormField<
        IGaugeVoterUpdateGaugeMetadataFormData,
        'description'
    >('description', {
        label: t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionCreateForm.description.label'),
        fieldPrefix,
        rules: { required: true, maxLength: descriptionMaxLength },
        trimOnBlur: true,
        defaultValue: description ?? '',
    });

    return (
        <div className="flex flex-col gap-10">
            <GaugeVoterGaugeListItem gauge={gauge} onRemove={onRemoveGauge} />
            <InputText
                maxLength={nameMaxLength}
                value={nameValue || ''}
                helpText={t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionCreateForm.name.helpText')}
                {...nameFieldRest}
            />
            <AvatarInput name="avatar" fieldPrefix={fieldPrefix} defaultValue={existingAvatar} />
            <TextArea
                helpText={t(
                    'app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionCreateForm.description.helpText',
                )}
                maxLength={descriptionMaxLength}
                value={descriptionValue || ''}
                {...descriptionFieldRest}
            />
            <ResourcesInput
                name="resources"
                fieldPrefix={fieldPrefix}
                helpText={t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionCreateForm.resources.helpText')}
                defaultValue={resources}
            />
        </div>
    );
};
