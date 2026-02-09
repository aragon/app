'use client';

import {
    Button,
    IconType,
    InputContainer,
    InputText,
    type IProposalAction,
    type IProposalActionComponentProps,
    TextArea,
} from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { useRef } from 'react';
import { useWatch } from 'react-hook-form';
import {
    AssetInput,
    type IAssetInputFormData,
} from '@/modules/finance/components/assetInput';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import { AdvancedDateInput } from '@/shared/components/forms/advancedDateInput';
import {
    type IResourcesInputResource,
    ResourcesInput,
} from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils } from '@/shared/utils/dateUtils';

export interface ICapitalDistributorCreateCampaignActionCreateProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, unknown>
    > {}

export interface ICapitalDistributorCreateCampaignFormData
    extends Pick<IAssetInputFormData, 'asset'>,
        ICreateProposalEndDateForm {
    /**
     * Title of the campaign.
     */
    title: string;
    /**
     * Description of the campaign.
     */
    description: string;
    /**
     * Resources related to the campaign.
     */
    resources: IResourcesInputResource[];
    /**
     * JSON file with campaign configuration.
     */
    jsonFile?: File;
}

const titleMaxLength = 128;
const descriptionMaxLength = 480;

export const CapitalDistributorCreateCampaignActionCreate: React.FC<
    ICapitalDistributorCreateCampaignActionCreateProps
> = (props) => {
    const { index } = props;
    const { t } = useTranslations();

    const fieldPrefix = `actions.[${index.toString()}].campaignDetails`;

    const daoId = useWatch({
        name: `actions.[${index.toString()}].daoId`,
    }) as string | undefined;

    const fetchAssetsParams = daoId ? { queryParams: { daoId } } : undefined;

    const { value: titleValue, ...titleFieldRest } = useFormField<
        ICapitalDistributorCreateCampaignFormData,
        'title'
    >('title', {
        label: t(
            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.title.label',
        ),
        fieldPrefix,
        rules: { required: true, maxLength: titleMaxLength },
        trimOnBlur: true,
    });

    const { value: descriptionValue, ...descriptionFieldRest } = useFormField<
        ICapitalDistributorCreateCampaignFormData,
        'description'
    >('description', {
        label: t(
            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.description.label',
        ),
        fieldPrefix,
        rules: { required: true, maxLength: descriptionMaxLength },
        trimOnBlur: true,
    });

    const {
        onChange: onJsonFileChange,
        value: jsonFileValue,
        alert: jsonFileAlert,
    } = useFormField<ICapitalDistributorCreateCampaignFormData, 'jsonFile'>(
        'jsonFile',
        {
            label: t(
                'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.label',
            ),
            fieldPrefix,
            rules: { required: true },
            sanitizeOnBlur: false,
        },
    );

    const fileUploadInputRef = useRef<HTMLInputElement | null>(null);

    const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onJsonFileChange(file);
        }

        event.target.value = '';
    };

    const startTimeFixed = useWatch<
        ICreateProposalEndDateForm,
        'startTimeFixed'
    >({ name: `${fieldPrefix}.startTimeFixed` });

    const minEndTime = startTimeFixed
        ? dateUtils.parseFixedDate(startTimeFixed)
        : DateTime.now();

    const selectedJsonFileName =
        jsonFileValue instanceof File ? jsonFileValue.name : undefined;

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-0.5 md:gap-1">
                    <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">
                        {t(
                            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.asset.label',
                        )}
                    </p>
                    <p className="font-normal text-neutral-500 text-sm leading-normal md:text-base">
                        {t(
                            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.asset.helpText',
                        )}
                    </p>
                </div>

                <AssetInput
                    fetchAssetsParams={fetchAssetsParams}
                    fieldPrefix={fieldPrefix}
                    hideAmount={true}
                />
            </div>

            <div className="flex flex-col gap-6">
                <InputText
                    helpText={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.title.helpText',
                    )}
                    maxLength={titleMaxLength}
                    value={titleValue || ''}
                    {...titleFieldRest}
                />
                <TextArea
                    helpText={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.description.helpText',
                    )}
                    maxLength={descriptionMaxLength}
                    value={descriptionValue || ''}
                    {...descriptionFieldRest}
                />
                <ResourcesInput
                    fieldPrefix={fieldPrefix}
                    helpText={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.resources.helpText',
                    )}
                    name="resources"
                />
            </div>

            <div className="flex flex-col gap-6 md:gap-12">
                <AdvancedDateInput
                    field={`${fieldPrefix}.startTime`}
                    helpText={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.startTime.helpText',
                    )}
                    label={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.startTime.label',
                    )}
                    minTime={DateTime.now()}
                />
                <AdvancedDateInput
                    field={`${fieldPrefix}.endTime`}
                    helpText={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.endTime.helpText',
                    )}
                    label={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.endTime.label',
                    )}
                    minTime={minEndTime}
                    useDuration={true}
                />
            </div>

            <InputContainer
                alert={jsonFileAlert}
                helpText={t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.helpText',
                )}
                id="capitalDistributorCampaignJsonUpload"
                label={t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.label',
                )}
                useCustomWrapper={true}
            >
                <div className="flex flex-col gap-3">
                    <Button
                        className="w-fit"
                        iconLeft={IconType.UPLOAD}
                        onClick={() => fileUploadInputRef.current?.click()}
                        size="md"
                        variant={jsonFileAlert ? 'critical' : 'tertiary'}
                    >
                        {t(
                            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.button',
                        )}
                    </Button>
                    {selectedJsonFileName && (
                        <p className="font-normal text-neutral-500 text-sm leading-tight">
                            {t(
                                'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.selected',
                                { fileName: selectedJsonFileName },
                            )}
                        </p>
                    )}
                </div>
                <input
                    accept=".json"
                    className="hidden"
                    onChange={handleJsonUpload}
                    ref={fileUploadInputRef}
                    type="file"
                />
            </InputContainer>
        </div>
    );
};
