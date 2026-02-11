'use client';

import {
    Button,
    IconType,
    InputContainer,
    InputText,
    TextArea,
} from '@aragon/gov-ui-kit';
import { useRef } from 'react';
import { AssetInput } from '@/modules/finance/components/assetInput';
import type { ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import {
    type IResourcesInputResource,
    ResourcesInput,
} from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IAsset } from '../../../../modules/finance/api/financeService';

export interface ICapitalDistributorCreateCampaignActionCreateFormProps {
    /**
     * Prefix for form fields.
     */
    fieldPrefix: string;
    /**
     * DAO ID for asset selection.
     */
    daoId: string;
}

export interface ICapitalDistributorCreateCampaignFormData
    extends ICreateProposalEndDateForm {
    /**
     * Asset selected for campaign.
     */
    asset: IAsset;
    /**
     * Title of the campaign.
     */
    title: string;
    /**
     * Description of the campaign.
     */
    description?: string;
    /**
     * Resources related to the campaign.
     */
    resources: IResourcesInputResource[];
    /**
     * JSON file with addresses and amounts to distribute.
     */
    jsonFile: File;
}

const titleMaxLength = 128;
const descriptionMaxLength = 480;

export const CapitalDistributorCreateCampaignActionCreateForm: React.FC<
    ICapitalDistributorCreateCampaignActionCreateFormProps
> = (props) => {
    const { fieldPrefix, daoId } = props;
    const { t } = useTranslations();

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
        rules: { maxLength: descriptionMaxLength },
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

    // const startTimeFixed = useWatch({
    //     name: `${fieldPrefix}.startTimeFixed` as 'startTimeFixed',
    // });
    //
    // const minEndTime =
    //     startTimeFixed != null
    //         ? dateUtils.parseFixedDate(startTimeFixed)
    //         : DateTime.now();

    const selectedJsonFileName =
        jsonFileValue instanceof File ? jsonFileValue.name : undefined;

    return (
        <div className="flex w-full flex-col gap-10">
            <InputContainer
                helpText={t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.asset.helpText',
                )}
                id="campaignAsset"
                label={t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.asset.label',
                )}
                useCustomWrapper={true}
            >
                <AssetInput
                    fetchAssetsParams={{ queryParams: { daoId } }}
                    fieldPrefix={fieldPrefix}
                    hideAmount={true}
                />
            </InputContainer>

            <InputText
                maxLength={titleMaxLength}
                value={titleValue || ''}
                {...titleFieldRest}
            />
            <TextArea
                helpText={t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.description.helpText',
                )}
                isOptional={true}
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

            {/*<AdvancedDateInput*/}
            {/*    field={`${fieldPrefix}.startTime`}*/}
            {/*    helpText={t(*/}
            {/*        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.startTime.helpText',*/}
            {/*    )}*/}
            {/*    label={t(*/}
            {/*        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.startTime.label',*/}
            {/*    )}*/}
            {/*    minTime={DateTime.now()}*/}
            {/*/>*/}
            {/*<AdvancedDateInput*/}
            {/*    field={`${fieldPrefix}.endTime`}*/}
            {/*    helpText={t(*/}
            {/*        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.endTime.helpText',*/}
            {/*    )}*/}
            {/*    label={t(*/}
            {/*        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.endTime.label',*/}
            {/*    )}*/}
            {/*    minTime={minEndTime}*/}
            {/*    useDuration={true}*/}
            {/*/>*/}

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
                        iconLeft={IconType.PLUS}
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
