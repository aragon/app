import type { IVersion } from '../utils/versionComparatorUtils';

export interface IContractVersionInfo extends IVersion {
    /**
     * Link to the release notes of the contract release.
     */
    releaseNotes: string;
    /**
     * Short summary of the contract version.
     */
    description: string;
}
