import type { UseMutateAsyncFunction } from '@tanstack/react-query';
import { encodeFunctionData, type Hex } from 'viem';
import type { IPinFileParams, IPinJsonParams } from '@/shared/api/ipfsService';
import type { IPinResult } from '@/shared/api/ipfsService/domain';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import type { IProposalAction } from '../../api/governanceService';
import type { IIpfsMetadata } from '../../components/createProposalForm';
import { setMetadataAbi } from '../../constants/setMetadataAbi';

/**
 * Constraint for proposedMetadata - must have these core fields.
 * Fields are optional to accommodate different metadata structures.
 * Avatar can be either a string URL or an object with file/url properties.
 */
export interface IMetadataFields {
    name?: string;
    description?: string;
    resources?: unknown[];
    avatar?: string | { file?: File; url?: string };
}

/**
 * Base interface for metadata actions with generic proposedMetadata type.
 */
export interface IMetadataAction<
    TProposedMetadata extends IMetadataFields = IMetadataFields,
> extends IProposalAction {
    /**
     * The proposed metadata to be updated.
     */
    proposedMetadata: TProposedMetadata;
    /**
     * Optional existing metadata (for plugin updates).
     */
    existingMetadata?: Record<string, unknown> | unknown;
    /**
     * Optional IPFS metadata from background pinning.
     */
    ipfsMetadata?: IIpfsMetadata;
}

export interface IPinMetadataActionParams<
    TProposedMetadata extends IMetadataFields = IMetadataFields,
> {
    /**
     * The metadata action to pin with typed proposedMetadata.
     */
    action: IMetadataAction<TProposedMetadata>;
    /**
     * Mutation function for pinning JSON data to IPFS.
     */
    pinJson: UseMutateAsyncFunction<
        IPinResult,
        unknown,
        IPinJsonParams,
        unknown
    >;
    /**
     * Mutation function for pinning file data to IPFS.
     */
    pinFile: UseMutateAsyncFunction<
        IPinResult,
        unknown,
        IPinFileParams,
        unknown
    >;
}

export interface IPinMetadataActionResult {
    /**
     * IPFS CID of the pinned metadata JSON.
     */
    metadataCid: string;
    /**
     * IPFS CID of the pinned avatar file, if applicable.
     */
    avatarCid?: string;
    /**
     * Hex-encoded transaction data for the setMetadata function call.
     */
    encodedData: Hex;
    /**
     * Hash of the source action data for change detection.
     */
    sourceHash: string;
}

class MetadataActionPinUtils {
    /**
     * Creates a hash of the action data for change detection.
     */
    hashActionData = <
        TProposedMetadata extends IMetadataFields = IMetadataFields,
    >(
        action: IMetadataAction<TProposedMetadata>,
    ): string => {
        const dataToHash = {
            type: action.type,
            proposedMetadata: action.proposedMetadata,
        };

        return JSON.stringify(dataToHash);
    };

    /**
     * Determines if an action needs to be re-pinned to IPFS.
     */
    needsRepinning = <
        TProposedMetadata extends IMetadataFields = IMetadataFields,
    >(
        action: IMetadataAction<TProposedMetadata>,
        currentHash: string,
    ): boolean => {
        if (!action.ipfsMetadata) {
            return true;
        }

        return action.ipfsMetadata.sourceHash !== currentHash;
    };

    /**
     * Pins DAO metadata to IPFS and encodes the transaction data.
     */
    pinDaoMetadataAction = async <
        TProposedMetadata extends IMetadataFields = IMetadataFields,
    >(
        params: IPinMetadataActionParams<TProposedMetadata>,
    ): Promise<IPinMetadataActionResult> => {
        const { action, pinJson, pinFile } = params;

        const { name, description, resources, avatar } =
            action.proposedMetadata;

        const proposedMetadata = {
            name,
            description,
            links: resources,
        };

        let daoAvatar: string | undefined;
        let avatarCid: string | undefined;

        if (typeof avatar === 'object' && avatar?.file != null) {
            const avatarResult = await pinFile({ body: avatar.file });
            avatarCid = avatarResult.IpfsHash;
            daoAvatar = ipfsUtils.cidToUri(avatarCid);
        } else if (typeof avatar === 'object' && avatar?.url) {
            daoAvatar = ipfsUtils.srcToUri(avatar.url);
        } else if (typeof avatar === 'string') {
            daoAvatar = ipfsUtils.srcToUri(avatar);
        }

        const metadata = daoAvatar
            ? { ...proposedMetadata, avatar: daoAvatar }
            : proposedMetadata;

        const ipfsResult = await pinJson({ body: metadata });
        const metadataCid = ipfsResult.IpfsHash;

        const hexResult = transactionUtils.stringToMetadataHex(metadataCid);

        const encodedData = encodeFunctionData({
            abi: [setMetadataAbi],
            args: [hexResult],
        });

        const sourceHash = this.hashActionData(action);

        return {
            metadataCid,
            avatarCid,
            encodedData,
            sourceHash,
        };
    };

    /**
     * Pins plugin metadata to IPFS and encodes the transaction data.
     */
    pinPluginMetadataAction = async <
        TProposedMetadata extends IMetadataFields = IMetadataFields,
    >(
        params: IPinMetadataActionParams<TProposedMetadata>,
    ): Promise<IPinMetadataActionResult> => {
        const { action, pinJson } = params;

        const { proposedMetadata, existingMetadata } = action;
        const { name, description, resources } = proposedMetadata;

        const pluginMetadata = {
            ...(existingMetadata as Record<string, unknown>),
            name,
            description,
            links: resources,
        };

        const ipfsResult = await pinJson({ body: pluginMetadata });
        const metadataCid = ipfsResult.IpfsHash;

        const hexResult = transactionUtils.stringToMetadataHex(metadataCid);

        const encodedData = encodeFunctionData({
            abi: [setMetadataAbi],
            args: [hexResult],
        });

        const sourceHash = this.hashActionData(action);

        return {
            metadataCid,
            encodedData,
            sourceHash,
        };
    };
}

export const metadataActionPinUtils = new MetadataActionPinUtils();
