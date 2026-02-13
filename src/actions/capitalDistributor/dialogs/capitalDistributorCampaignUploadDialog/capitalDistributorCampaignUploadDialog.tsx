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
            urlParams: { network },
            body: {
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
        urlParams: { network },
        queryParams: {
            capitalDistributorAddress,
            campaignId: campaignId ?? '',
        },
    };

    const prepareStatusQuery = useCampaignPrepareStatus(prepareStatusParams, {
        enabled: campaignId != null,
        refetchInterval: (query) =>
            query.state.data?.merkleRoot != null ? false : 2000,
    });

    const merkleRoot = prepareStatusQuery.data?.merkleRoot ?? null;
    const totalMembers = prepareStatusQuery.data?.totalMembers ?? 0;
    const isComplete = merkleRoot != null;
    const hasError = uploadMutation.isError || prepareStatusQuery.isError;

    // Call onComplete when merkle tree is ready
    useEffect(() => {
        if (isComplete && !onCompleteCalledRef.current) {
            onCompleteCalledRef.current = true;
            onComplete({ merkleRoot, totalMembers, fileName: file.name });
        }
    }, [isComplete, merkleRoot, totalMembers, onComplete, file.name]);

    const uploadStepState = useMemo(() => {
        return match(uploadMutation)
            .with({ isError: true }, () => 'error' as const)
            .with({ isSuccess: true }, () => 'success' as const)
            .with({ isPending: true }, () => 'pending' as const)
            .otherwise(() => 'idle' as const);
    }, [uploadMutation]);

    const merkleStepState = useMemo(() => {
        if (uploadMutation.isError) {
            return 'idle' as const;
        }
        if (prepareStatusQuery.isError) {
            return 'error' as const;
        }
        if (isComplete) {
            return 'success' as const;
        }
        if (campaignId != null) {
            return 'pending' as const;
        }
        return 'idle' as const;
    }, [
        uploadMutation.isError,
        prepareStatusQuery.isError,
        isComplete,
        campaignId,
    ]);

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
