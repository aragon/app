import { addressUtils } from '@aragon/gov-ui-kit';
import { keccak256, toBytes } from 'viem';

/**
 * Canonical list of Aragon OSx, plugin, and AccessControl permission names.
 *
 * Mirrors the ticket's `permissions-dictionary.ts` seed (APP-954). Each entry is
 * hashed with `keccak256(toBytes(name))` to build the hash → name lookup used by
 * the permissions page.
 */
const permissionNames: string[] = [
    // OSx DAO core
    'ROOT_PERMISSION',
    'EXECUTE_PERMISSION',
    'UPGRADE_DAO_PERMISSION',
    'SET_METADATA_PERMISSION',
    'SET_TRUSTED_FORWARDER_PERMISSION',
    'SET_SIGNATURE_VALIDATOR_PERMISSION',
    'VALIDATE_SIGNATURE_PERMISSION',
    'REGISTER_STANDARD_CALLBACK_PERMISSION',

    // OSx plugin framework
    'UPGRADE_PLUGIN_PERMISSION',
    'MAINTAINER_PERMISSION',
    'UPGRADE_REPO_PERMISSION',
    'APPLY_INSTALLATION_PERMISSION',
    'APPLY_UPDATE_PERMISSION',
    'APPLY_UNINSTALLATION_PERMISSION',
    'REGISTER_DAO_PERMISSION',
    'REGISTER_ENS_SUBDOMAIN_PERMISSION',
    'REGISTER_PLUGIN_REPO_PERMISSION',
    'UPGRADE_REGISTRY_PERMISSION',
    'UPGRADE_REGISTRAR_PERMISSION',

    // Proposal lifecycle
    'CREATE_PROPOSAL_PERMISSION',
    'EXECUTE_PROPOSAL_PERMISSION',
    'PROPOSER_PERMISSION',
    'CANCEL_PERMISSION',
    'ADVANCE_PERMISSION',
    'EDIT_PERMISSION',

    // Multisig
    'UPDATE_MULTISIG_SETTINGS_PERMISSION',
    'SET_SECONDARY_METADATA_PERMISSION',

    // Token voting / majority voting
    'UPDATE_VOTING_SETTINGS_PERMISSION',
    'UPDATE_ADDRESSES_PERMISSION',
    'UPDATE_PROPOSAL_VALIDATOR_PERMISSION',
    'UPDATE_RULES_PERMISSION',
    'UPDATE_SETTINGS_PERMISSION',

    // Lock-to-vote
    'LOCK_MANAGER_PERMISSION',

    // Membership / Geo
    'EDITOR_PERMISSION',
    'MEMBER_PERMISSION',

    // Optimistic governance / L2 veto / multichain voting
    'UPDATE_OPTIMISTIC_GOVERNANCE_SETTINGS_PERMISSION',
    'UPDATE_L2_VETO_RECEIVER_PERMISSION',
    'SET_TRUSTED_L2_AGGREGATOR_PERMISSION',
    'UPDATE_BRIDGE_SETTINGS_PERMISSION',

    // Staged proposal processor (SPP)
    'UPDATE_STAGES_PERMISSION',

    // Signer list (delegation/attestation plugins)
    'UPDATE_SIGNER_LIST_PERMISSION',
    'UPDATE_SIGNER_LIST_SETTINGS_PERMISSION',

    // Target / execution routing
    'SET_TARGET_CONFIG_PERMISSION',
    'AUTHORIZED_FUNC_PERMISSION',
    'MANAGE_SELECTORS_PERMISSION',
    'DISPATCH_PERMISSION',
    'ID_GATED_ACTION_PERMISSION',

    // Capital distribution / Merkle campaigns
    'CAMPAIGN_MANAGER_PERMISSION',
    'CHANGE_DISTRIBUTOR_PERMISSION',
    'MERKLE_MINT_PERMISSION',

    // ERC-20 / token
    'MINT_PERMISSION',
    'BURN_PERMISSION',

    // Misc
    'MANAGER_PERMISSION',
    'REGISTER_PERMISSION',
    'PREPARE_PERMISSION',
    'STORE_PERMISSION',
    'STORE_ACCOUNT_PERMISSION',
    'STORE_NUMBER_PERMISSION',
    'PAUSE_PERMISSION',
    'GRANT_PERMISSION',
    'GREET_PERMISSION',
    'MULTIPLY_PERMISSION',
    'DO_SOMETHING_PERMISSION',
    'ADMIN_EXECUTE_PERMISSION',
    'MOCK_PERMISSION',
    'TEST_PERMISSION',
    'TEST_PERMISSION_1',
    'TEST_PERMISSION_2',

    // OpenZeppelin AccessControl roles used by Aragon plugins
    'SWEEPER_ROLE',
    // Legacy aragonOS ACL roles
    'CREATE_PERMISSIONS_ROLE',
];

class PermissionNameUtils {
    private permissionNamesByHash: Record<string, string> = Object.fromEntries(
        permissionNames.map((name) => [
            keccak256(toBytes(name)).toLowerCase(),
            name,
        ]),
    );

    /**
     * Resolves a keccak256 permission-id hash to its raw permission name string.
     *
     * @param permissionId The keccak256 hash of the permission identifier. Matched
     * case-insensitively and tolerant of a missing `0x` prefix.
     * @returns The raw UPPER_SNAKE permission name (e.g. `ROOT_PERMISSION`), or a
     * truncated `0x1234…abcd` form of the hash when unknown.
     */
    getPermissionName = (permissionId: string): string => {
        const normalisedId = this.normaliseHash(permissionId);
        const name = this.permissionNamesByHash[normalisedId];

        if (name != null) {
            return name;
        }

        return addressUtils.truncateHash(this.normaliseHash(permissionId));
    };

    /**
     * Returns the keccak256 permission-id hash for a raw permission name. Inverse
     * of {@link getPermissionName}; the {@link permissionNames} list is the single
     * source of truth for both directions.
     */
    getPermissionId = (permissionName: string): string =>
        keccak256(toBytes(permissionName));

    private normaliseHash = (hash: string): string => {
        const lowerCased = hash.toLowerCase();

        return lowerCased.startsWith('0x') ? lowerCased : `0x${lowerCased}`;
    };
}

export const permissionNameUtils = new PermissionNameUtils();
