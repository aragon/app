import type {
    IPaginatedResponse,
    IPaginatedResponseMetadata,
} from '@/shared/api/aragonBackendService';
import type { IWorkspaceAsset } from './workspaceAsset';
import type { IWorkspaceCoverage } from './workspaceCoverage';

export interface IWorkspaceAssetListMetadata
    extends IPaginatedResponseMetadata {
    /**
     * Value in USD of the whole filtered selection, not just the current page.
     */
    totalAmountUsd?: string;
    /**
     * Number of spam-flagged tokens hidden from the response.
     */
    spamCount?: number;
}

export interface IWorkspaceAssetListResponse
    extends Omit<IPaginatedResponse<IWorkspaceAsset>, 'metadata'> {
    /**
     * Page metadata, extended with the totals of the whole selection.
     */
    metadata: IWorkspaceAssetListMetadata;
    /**
     * Per-account report of whether its source could be read. An empty page with a failed coverage entry means
     * "unknown", not "no assets".
     */
    coverage: IWorkspaceCoverage[];
    /**
     * True when any coverage entry is not available.
     */
    partial: boolean;
}
