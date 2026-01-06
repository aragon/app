import {
    AlertInline,
    Button,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { encodeFunctionData } from 'viem';
import {
    CreateDaoForm,
    type ICreateDaoFormMetadataData,
} from '@/modules/createDao/components/createDaoForm';
import {
    type IProposalActionUpdateMetadata,
    ProposalActionType,
} from '@/modules/governance/api/governanceService';
import { setMetadataAbi } from '@/modules/governance/constants/setMetadataAbi';
import { useMetadataActionPin } from '@/modules/governance/hooks/useMetadataActionPin';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { usePinFile } from '@/shared/api/ipfsService/mutations/usePinFile';
import { useFormField } from '@/shared/hooks/useFormField';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import type {
    IIpfsMetadata,
    IProposalActionData,
} from '../../../createProposalFormDefinitions';
import { useCreateProposalFormContext } from '../../../createProposalFormProvider';

export interface IUpdateDaoMetadataAction
    extends Omit<IProposalActionUpdateMetadata, 'proposedMetadata' | 'data'> {
    /**
     * Metadata proposed on the action.
     */
    proposedMetadata: ICreateDaoFormMetadataData;
    /**
     * The encoded transaction data (populated by background pinning).
     */
    data?: string;
    /**
     * IPFS metadata for the action (optional).
     * Contains pinning state and encoded transaction data.
     */
    ipfsMetadata?: IIpfsMetadata;
}

export interface IUpdateDaoMetadaActionProps
    extends IProposalActionComponentProps<IProposalActionData> {}

export const UpdateDaoMetadataAction: React.FC<IUpdateDaoMetadaActionProps> = (
    props,
) => {
    const { index } = props;

    const { mutateAsync: pinJsonAsync } = usePinJson();
    const { mutateAsync: pinFileAsync } = usePinFile();
    // Type assertion needed because IUpdateDaoMetadataAction has optional data (before pinning)
    // but prepareAction callback will populate it, satisfying IProposalCreateAction requirements
    const { addPrepareAction } = useCreateProposalFormContext<
        IUpdateDaoMetadataAction & { data: string }
    >();

    const fieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(
        fieldName,
    );

    // Auto-pin metadata in background with debouncing
    const { pinError, triggerPin, clearError } = useMetadataActionPin({
        actionIndex: index,
        actionType: ProposalActionType.METADATA_UPDATE,
        enabled: true,
    });

    const prepareAction = useCallback(
        async (action: IUpdateDaoMetadataAction) => {
            // If background pinning already populated the data field, use it instead of re-pinning
            if (
                action.data &&
                action.data !== '0x' &&
                action.ipfsMetadata?.pinnedData
            ) {
                return action.ipfsMetadata.pinnedData;
            }

            // Otherwise, perform fresh IPFS pinning (fallback for edge cases or if background pinning failed)
            const { name, description, resources, avatar } =
                action.proposedMetadata;
            const proposedMetadata = { name, description, links: resources };

            let daoAvatar: string | undefined;

            if (avatar?.file != null) {
                // Pin the avatar set on the form when the file property is set, meaning that the user changed the DAO avatar
                const avatarResult = await pinFileAsync({ body: avatar.file });
                daoAvatar = ipfsUtils.cidToUri(avatarResult.IpfsHash);
            } else if (avatar?.url) {
                // Set previous avatar URL if user did not change the DAO avatar and DAO already has an avatar
                daoAvatar = ipfsUtils.srcToUri(avatar.url);
            }

            const metadata = daoAvatar
                ? { ...proposedMetadata, avatar: daoAvatar }
                : proposedMetadata;

            const ipfsResult = await pinJsonAsync({ body: metadata });
            const hexResult = transactionUtils.stringToMetadataHex(
                ipfsResult.IpfsHash,
            );
            const data = encodeFunctionData({
                abi: [setMetadataAbi],
                args: [hexResult],
            });

            return data;
        },
        [pinFileAsync, pinJsonAsync],
    );

    useEffect(() => {
        addPrepareAction(ProposalActionType.METADATA_UPDATE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    return (
        <div className="flex flex-col gap-4">
            {pinError && (
                <AlertInline
                    message={`Failed to prepare action: ${pinError.message}`}
                    variant="critical"
                >
                    <Button onClick={triggerPin} size="sm" variant="tertiary">
                        Retry
                    </Button>
                    <Button onClick={clearError} size="sm" variant="tertiary">
                        Dismiss
                    </Button>
                </AlertInline>
            )}

            <CreateDaoForm.Metadata
                fieldPrefix={`${fieldName}.proposedMetadata`}
            />
        </div>
    );
};
