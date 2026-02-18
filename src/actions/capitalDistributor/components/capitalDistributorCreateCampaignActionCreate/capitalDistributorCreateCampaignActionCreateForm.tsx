'use client';

import {
    AlertCard,
    Button,
    Clipboard,
    DefinitionList,
    IconType,
    InputContainer,
    InputText,
    TextArea,
} from '@aragon/gov-ui-kit';
import { useCallback, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import type { IAsset } from '@/modules/finance/api/financeService';
import { AssetInput } from '@/modules/finance/components/assetInput';
import { useDao } from '@/shared/api/daoService';
import {
    type IResourcesInputResource,
    ResourcesInput,
} from '@/shared/components/forms/resourcesInput';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { useCapitalDistributorCampaignUpload } from '../../hooks';
import { CapitalDistributorCampaignScheduleField } from './capitalDistributorCampaignScheduleField';

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

export enum CampaignScheduleType {
    OPEN_ENDED = 'open-ended',
    SCHEDULED = 'scheduled',
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
    /**
     * Schedule type of the campaign.
     */
    scheduleType?: CampaignScheduleType;
    /**
     * Start time mode for scheduled campaigns.
     */
    startTimeMode?: 'now' | 'fixed';
    /**
     * Start time fixed date for scheduled campaigns.
     */
    startTimeFixed?: { date: string; time: string };
    /**
     * End time mode for scheduled campaigns.
     */
    endTimeMode?: 'duration' | 'fixed';
    /**
     * End time duration for scheduled campaigns.
     */
    endTimeDuration?: { days: number; hours: number; minutes: number };
    /**
     * End time fixed date for scheduled campaigns.
     */
    endTimeFixed?: { date: string; time: string };
}

const titleMaxLength = 128;
const descriptionMaxLength = 480;

export const CapitalDistributorCreateCampaignActionCreateForm: React.FC<
    ICapitalDistributorCreateCampaignActionCreateFormProps
> = (props) => {
    const { fieldPrefix, daoId } = props;
    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const { data: dao } = useDao({ urlParams: { id: daoId } });

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

            {dao && (
                <PluginSingleComponent
                    dao={dao}
                    pluginId={dao.id}
                    slotId={
                        CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD
                    }
                />
            )}

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
                                'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.alert.successAlertTitle',
                            )}
                            variant="success"
                        >
                            <DefinitionList.Container>
                                <DefinitionList.Item
                                    term={t(
                                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.alert.fileNameTerm',
                                    )}
                                >
                                    {merkleTreeInfo.fileName}
                                </DefinitionList.Item>
                                <DefinitionList.Item
                                    term={t(
                                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.alert.totalMembersTerm',
                                    )}
                                >
                                    {t(
                                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.totalMembers',
                                        {
                                            totalMembers:
                                                merkleTreeInfo.totalMembers,
                                        },
                                    )}
                                </DefinitionList.Item>
                                <DefinitionList.Item
                                    term={t(
                                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.jsonUpload.alert.merkleRootTerm',
                                    )}
                                >
                                    <Clipboard
                                        copyValue={merkleTreeInfo.merkleRoot}
                                    >
                                        {`${merkleTreeInfo.merkleRoot.slice(0, 10)}...${merkleTreeInfo.merkleRoot.slice(-8)}`}
                                    </Clipboard>
                                </DefinitionList.Item>
                            </DefinitionList.Container>
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

            <CapitalDistributorCampaignScheduleField
                fieldPrefix={fieldPrefix}
            />
        </div>
    );
};
