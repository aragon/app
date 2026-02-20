'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useRef, useState } from 'react';
import { match } from 'ts-pattern';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import {
    type ITransactionStatusStepMeta,
    TransactionStatus,
} from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import type {
    IGetCampaignPrepareStatusParams,
    IUploadCampaignMembersParams,
} from '../../api';
import { useCampaignPrepareStatus, useUploadCampaignMembers } from '../../api';
import { CapitalDistributorDialogId } from '../../constants/capitalDistributorDialogId';

const StepState = {
    Idle: 'idle',
    Pending: 'pending',
    Success: 'success',
    Error: 'error',
} as const;

type StepState = (typeof StepState)[keyof typeof StepState];

const StepName = {
    Upload: 'upload',
    Merkle: 'merkle',
} as const;

type StepName = (typeof StepName)[keyof typeof StepName];

type StepStates = Record<StepName, StepState>;

export interface ICapitalDistributorCampaignUploadDialogParams {
    file: File;
    network: Network;
    daoAddress: string;
    capitalDistributorAddress: string;
    onComplete: (info: {
        merkleRoot: string;
        totalMembers: number;
        fileName: string;
    }) => void;
}

export interface ICapitalDistributorCampaignUploadDialogProps
    extends IDialogComponentProps<ICapitalDistributorCampaignUploadDialogParams> {}

export const CapitalDistributorCampaignUploadDialog: React.FC<
    ICapitalDistributorCampaignUploadDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'CapitalDistributorCampaignUploadDialog: params must be defined',
    );

    const { file, network, daoAddress, capitalDistributorAddress, onComplete } =
        location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const [campaignId, setCampaignId] = useState<string>();
    const onCompleteCalledRef = useRef(false);

    const uploadMutation = useUploadCampaignMembers();

    // biome-ignore lint/correctness/useExhaustiveDependencies: Trigger upload on mount
    useEffect(() => {
        const uploadParams: IUploadCampaignMembersParams = {
            urlParams: {},
            body: {
                network,
                daoAddress,
                capitalDistributorAddress,
                membersFile: file,
            },
        };

        uploadMutation.mutate(uploadParams, {
            onSuccess: (result) => setCampaignId(result.campaignId),
        });
    }, []);

    const prepareStatusParams: IGetCampaignPrepareStatusParams = {
        urlParams: {},
        queryParams: {
            network,
            capitalDistributorAddress,
            campaignId: campaignId ?? '',
        },
    };

    const prepareStatusQuery = useCampaignPrepareStatus(prepareStatusParams, {
        enabled: campaignId != null,
        refetchInterval: (query) =>
            query.state.status === 'error' ||
            query.state.data?.merkleRoot != null
                ? false
                : 2000,
    });

    const merkleRoot = prepareStatusQuery.data?.merkleRoot ?? null;
    const totalMembers = prepareStatusQuery.data?.totalMembers ?? 0;
    const isComplete = merkleRoot != null;
    const hasError = uploadMutation.isError || prepareStatusQuery.isError;

    useEffect(() => {
        if (isComplete && !onCompleteCalledRef.current) {
            onCompleteCalledRef.current = true;
            onComplete({ merkleRoot, totalMembers, fileName: file.name });
        }
    }, [isComplete, merkleRoot, totalMembers, onComplete, file.name]);

    const stepStates = useMemo<StepStates>(() => {
        const ctx = {
            uploadError: uploadMutation.isError,
            uploadSuccess: uploadMutation.isSuccess,
            uploadPending: uploadMutation.isPending,
            prepareError: prepareStatusQuery.isError,
            isComplete,
            hasCampaignId: campaignId != null,
        } as const;

        const upload: StepState = match(ctx)
            .with({ uploadError: true }, () => StepState.Error)
            .with({ uploadSuccess: true }, () => StepState.Success)
            .with({ uploadPending: true }, () => StepState.Pending)
            .otherwise(() => StepState.Idle);

        const merkle: StepState = match(ctx)
            .with({ uploadError: true }, () => StepState.Idle)
            .with({ prepareError: true }, () => StepState.Error)
            .with({ isComplete: true }, () => StepState.Success)
            .with({ hasCampaignId: true }, () => StepState.Pending)
            .otherwise(() => StepState.Idle);
        return {
            [StepName.Upload]: upload,
            [StepName.Merkle]: merkle,
        };
    }, [
        uploadMutation.isError,
        uploadMutation.isSuccess,
        uploadMutation.isPending,
        prepareStatusQuery.isError,
        isComplete,
        campaignId,
    ]);
    const uploadStepState = stepStates[StepName.Upload];
    const merkleStepState = stepStates[StepName.Merkle];

    const steps: IStepperStep<ITransactionStatusStepMeta>[] = [
        {
            id: 'upload',
            order: 0,
            meta: {
                label: t(
                    'app.actions.capitalDistributor.capitalDistributorCampaignUploadDialog.step.upload',
                ),
                state: uploadStepState,
                errorLabel: t(
                    'app.actions.capitalDistributor.capitalDistributorCampaignUploadDialog.step.uploadError',
                ),
            },
        },
        {
            id: 'merkleTree',
            order: 1,
            meta: {
                label: t(
                    'app.actions.capitalDistributor.capitalDistributorCampaignUploadDialog.step.merkleTree',
                ),
                state: merkleStepState,
                errorLabel: t(
                    'app.actions.capitalDistributor.capitalDistributorCampaignUploadDialog.step.merkleTreeError',
                ),
            },
        },
    ];

    const handleClose = () => {
        close(CapitalDistributorDialogId.CAMPAIGN_UPLOAD_STATUS);
    };

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.actions.capitalDistributor.capitalDistributorCampaignUploadDialog.description',
                )}
                title={t(
                    'app.actions.capitalDistributor.capitalDistributorCampaignUploadDialog.title',
                )}
            />
            <Dialog.Content>
                <div className="flex flex-col gap-3 py-2">
                    <TransactionStatus.Container steps={steps}>
                        {steps.map((step) => (
                            <TransactionStatus.Step key={step.id} {...step} />
                        ))}
                    </TransactionStatus.Container>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.actions.capitalDistributor.capitalDistributorCampaignUploadDialog.done',
                    ),
                    onClick: handleClose,
                    disabled: !isComplete && !hasError,
                }}
            />
        </>
    );
};
