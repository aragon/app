import { keccak256, toBytes } from 'viem';

const truncatedHashPrefixLength = 6;
const truncatedHashSuffixLength = 4;

const permissionFriendlyNames: Record<string, string> = {
    ROOT_PERMISSION: 'Root',
    CREATE_PROPOSAL_PERMISSION: 'Create proposal',
    EXECUTE_PERMISSION: 'Execute',
    UPGRADE_PLUGIN_PERMISSION: 'Upgrade plugin',
    MANAGE_SELECTORS_PERMISSION: 'Manage selectors',
};

class PermissionNameUtils {
    // TODO(APP-954): replace/extend with the ticket-attached seed permission dictionary once the
    // Linear attachment is merged. Until then we only resolve the generic protocol permission ids.
    private permissionNamesByHash: Record<string, string> = Object.fromEntries(
        Object.entries(permissionFriendlyNames).map(
            ([permissionId, friendlyName]) => [
                keccak256(toBytes(permissionId)).toLowerCase(),
                friendlyName,
            ],
        ),
    );

    /**
     * Resolves a keccak256 permission-id hash to its friendly, human-readable name.
     *
     * @param permissionId The keccak256 hash of the permission identifier.
     * @returns The mapped friendly name, or a truncated `0x1234…abcd` form of the hash when unknown.
     */
    getPermissionName = (permissionId: string): string => {
        const normalisedId = permissionId.toLowerCase();
        const friendlyName = this.permissionNamesByHash[normalisedId];

        if (friendlyName != null) {
            return friendlyName;
        }

        return this.truncateHash(permissionId);
    };

    private truncateHash = (hash: string): string => {
        const prefix = hash.slice(0, truncatedHashPrefixLength);
        const suffix = hash.slice(-truncatedHashSuffixLength);

        return `${prefix}…${suffix}`;
    };
}

export const permissionNameUtils = new PermissionNameUtils();
