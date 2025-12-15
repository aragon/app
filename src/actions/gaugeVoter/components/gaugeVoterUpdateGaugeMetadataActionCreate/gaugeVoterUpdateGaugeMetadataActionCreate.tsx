'use client';

import { type IProposalAction } from '@/modules/governance/api/governanceService';
import {
    type IProposalActionData,
    useCreateProposalFormContext,
} from '@/modules/governance/components/createProposalForm';
import type { IGauge } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { useDao } from '@/shared/api/daoService';
import { usePinFile, usePinJson } from '@/shared/api/ipfsService/mutations';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import {
    AlertInline,
    CardEmptyState,
    IconType,
    invariant,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import { updateGaugeMetadataAbi } from '../../constants/addressGaugeVoterAbi';
import { GaugeVoterDialogId } from '../../constants/gaugeVoterDialogId';
import type { IGaugeVoterSelectGaugeDialogParams } from '../../dialogs/gaugeVoterSelectGaugeDialog';
import { GaugeVoterActionType } from '../../types/enum/gaugeVoterActionType';
import type { IGaugeVoterActionUpdateGaugeMetadata } from '../../types/gaugeVoterActionUpdateGaugeMetadata';
import { GaugeVoterUpdateGaugeMetadataActionCreateForm } from './gaugeVoterUpdateGaugeMetadataActionCreateForm';

export interface IGaugeVoterUpdateGaugeMetadataActionCreateProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, unknown>> {}

export const GaugeVoterUpdateGaugeMetadataActionCreate: React.FC<IGaugeVoterUpdateGaugeMetadataActionCreateProps> = (
    props,
) => {
    const { action, index, chainId } = props;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { setValue } = useFormContext();

    const { data: dao } = useDao({ urlParams: { id: action.daoId } });

    const { mutateAsync: pinJsonAsync } = usePinJson();
    const { mutateAsync: pinFileAsync } = usePinFile();
    const { addPrepareAction } = useCreateProposalFormContext<IGaugeVoterActionUpdateGaugeMetadata>();

    // We use form to keep the state, so we can prevent wizard progressing if action state is invalid.
    const actionFieldName = `actions.[${index.toString()}]`;
    const selectedGaugeFieldName = `${actionFieldName}.gaugeToUpdate`;

    const setSelectedGauge = (gauge?: IGauge) => {
        setValue(selectedGaugeFieldName, gauge);
    };

    const { value: selectedGauge, alert } = useFormField<Record<string, IGauge | undefined>, string>(
        selectedGaugeFieldName,
        {
            label: t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionCreate.emptyCard.heading'),
            rules: {
                required: true,
            },
        },
    );

    const handleOpenGaugeSelectDialog = () => {
        const params: IGaugeVoterSelectGaugeDialogParams = {
            dao: dao!,
            pluginAddress: action.to,
            onGaugeSelected: setSelectedGauge,
        };

        open(GaugeVoterDialogId.SELECT_GAUGE, { params });
    };

    const prepareAction = useCallback(
        async (action: IGaugeVoterActionUpdateGaugeMetadata) => {
            invariant(
                action.gaugeToUpdate != null,
                'GaugeVoterUpdateGaugeMetadataAction: gauge to update not selected.',
            );
            invariant(
                action.gaugeDetails != null,
                'GaugeVoterUpdateGaugeMetadataAction: gaugeDetails expected to be initialized by the form.',
            );

            const { name, description, resources, avatar } = action.gaugeDetails;
            const proposedMetadata = { name, description, links: resources };

            let gaugeAvatar: string | undefined;

            if (avatar?.file != null) {
                // Pin the avatar set on the form when the file property is set, meaning that the user changed the gauge avatar
                const avatarResult = await pinFileAsync({ body: avatar.file });
                gaugeAvatar = ipfsUtils.cidToUri(avatarResult.IpfsHash);
            } else if (avatar?.url) {
                // Set previous avatar URL if user did not change the gauge avatar and gauge already has an avatar
                gaugeAvatar = ipfsUtils.srcToUri(avatar.url);
            }

            const metadata = gaugeAvatar ? { ...proposedMetadata, avatar: gaugeAvatar } : proposedMetadata;

            const ipfsResult = await pinJsonAsync({ body: metadata });
            const ipfsHexResult = transactionUtils.stringToMetadataHex(ipfsResult.IpfsHash);

            const data = encodeFunctionData({
                abi: [updateGaugeMetadataAbi],
                functionName: 'updateGaugeMetadata',
                args: [action.gaugeToUpdate.address, ipfsHexResult],
            });

            return data;
        },
        [pinFileAsync, pinJsonAsync],
    );

    useEffect(() => {
        addPrepareAction(GaugeVoterActionType.UPDATE_GAUGE_METADATA, prepareAction);
    }, [addPrepareAction, prepareAction]);

    if (selectedGauge) {
        return (
            <GaugeVoterUpdateGaugeMetadataActionCreateForm
                fieldPrefix={`${actionFieldName}.gaugeDetails`}
                gauge={selectedGauge}
                onRemoveGauge={() => setSelectedGauge(undefined)}
                chainId={chainId}
            />
        );
    }

    return (
        <>
            <CardEmptyState
                heading={t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionCreate.emptyCard.heading')}
                description={t(
                    'app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionCreate.emptyCard.description',
                )}
                objectIllustration={{ object: 'SETTINGS' }}
                secondaryButton={{
                    label: t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionCreate.emptyCard.action'),
                    onClick: handleOpenGaugeSelectDialog,
                    iconLeft: IconType.PLUS,
                }}
                isStacked={false}
                className="border border-neutral-100"
            />
            {alert && <AlertInline message={alert.message} variant={alert.variant} />}
        </>
    );
};
