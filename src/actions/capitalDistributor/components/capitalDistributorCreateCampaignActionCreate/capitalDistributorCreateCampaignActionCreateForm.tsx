'use client';

import {
    AlertCard,
    Button,
    Clipboard,
    IconType,
    InputContainer,
    InputText,
    TextArea,
} from '@aragon/gov-ui-kit';
import { useCallback, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { IAsset } from '@/modules/finance/api/financeService';
import { AssetInput } from '@/modules/finance/components/assetInput';
import {
    type IResourcesInputResource,
    ResourcesInput,
} from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { useCapitalDistributorCampaignUpload } from '../../hooks';

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

export interface ICapitalDistributorCreateCampaignFormData {
    /**
     * Asset selected for a campaign.
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
     * Merkle tree information generated from the uploaded distribution file.
     */
    merkleTreeInfo: {
        merkleRoot: string;
        totalMembers: number;
        fileName: string;
    };
}

const titleMaxLength = 128;
const descriptionMaxLength = 480;

export const CapitalDistributorCreateCampaignActionCreateForm: React.FC<
    ICapitalDistributorCreateCampaignActionCreateFormProps
> = (props) => {
    const { fieldPrefix, daoId } = props;
    const { t } = useTranslations();
    const { setValue } = useFormContext();

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

    const { alert: merkleTreeInfoAlert } = useFormField<
        ICapitalDistributorCreateCampaignFormData,
        'merkleTreeInfo'
    >('merkleTreeInfo', {
        label: t(
            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.label',
        ),
        fieldPrefix,
        rules: { required: true },
    });

    const merkleTreeInfo = useWatch({
        name: `${fieldPrefix}.merkleTreeInfo`,
    });

    const handleUploadComplete = useCallback(
        (info: {
            merkleRoot: string;
            totalMembers: number;
            fileName: string;
        }) => {
            setValue(`${fieldPrefix}.merkleTreeInfo`, info, {
                shouldValidate: true,
            });
        },
        [fieldPrefix, setValue],
    );

    const { upload } = useCapitalDistributorCampaignUpload({
        daoId,
        onComplete: handleUploadComplete,
    });

    const fileUploadInputRef = useRef<HTMLInputElement | null>(null);

    const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            upload(file);
        }

        event.target.value = '';
    };

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

            <InputContainer
                alert={merkleTreeInfo == null ? merkleTreeInfoAlert : undefined}
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
                        variant={
                            merkleTreeInfo == null && merkleTreeInfoAlert
                                ? 'critical'
                                : 'tertiary'
                        }
                    >
                        {t(
                            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.button',
                        )}
                    </Button>
                    {merkleTreeInfo != null && (
                        <AlertCard
                            message={t(
                                'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.successAlertTitle',
                            )}
                            variant="success"
                        >
                            <div className="flex flex-col gap-1 font-normal text-neutral-500 text-sm leading-tight">
                                <p>{merkleTreeInfo.fileName}</p>
                                <p>
                                    {t(
                                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.totalMembers',
                                        {
                                            totalMembers:
                                                merkleTreeInfo.totalMembers,
                                        },
                                    )}
                                </p>
                                <Clipboard
                                    copyValue={merkleTreeInfo.merkleRoot}
                                >
                                    <p>
                                        {t(
                                            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.merkleRoot',
                                            {
                                                merkleRoot:
                                                    merkleTreeInfo.merkleRoot,
                                            },
                                        )}
                                    </p>
                                </Clipboard>
                            </div>
                        </AlertCard>
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
