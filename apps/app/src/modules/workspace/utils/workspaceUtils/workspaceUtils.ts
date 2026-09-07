import { addressUtils } from '@aragon/gov-ui-kit';
import { getAddress } from 'viem';
import type { Network } from '@/shared/api/daoService';

/**
 * A network and address pair, i.e. what identifies a workspace account or target.
 */
export interface IWorkspaceNetworkAddress {
    /**
     * Network the address lives on.
     */
    network: Network;
    /**
     * Address of the account or target.
     */
    address: string;
}

/**
 * Fallback used when the workspace name contains no slug-safe character.
 */
const fallbackWorkspaceSlug = 'workspace';

class WorkspaceUtils {
    /**
     * Builds the ID of a workspace account, matching the backend `daoId` format for DAO accounts. The address is
     * checksummed so that the same account always resolves to the same ID.
     * @param params - Network and address of the account.
     * @returns The account ID in the `{network}-{address}` format.
     */
    buildAccountId = (params: IWorkspaceNetworkAddress): string => {
        const { network, address } = params;

        return `${network}-${getAddress(address)}`;
    };

    /**
     * Slugifies the given value into a URL-safe workspace ID candidate.
     * @param value - Value to slugify, e.g. the workspace name.
     * @returns The slugified value, or a generic fallback when the value has no slug-safe character.
     */
    slugify = (value: string): string => {
        const slug = value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        return slug === '' ? fallbackWorkspaceSlug : slug;
    };

    /**
     * Builds the ID of a workspace from its name, suffixing it to avoid collisions with the existing workspaces.
     * @param name - Name of the workspace.
     * @param existingIds - IDs of the workspaces already stored on the registry.
     * @returns An ID not present on the given existing IDs.
     */
    buildWorkspaceId = (name: string, existingIds: string[] = []): string => {
        const slug = this.slugify(name);

        if (!existingIds.includes(slug)) {
            return slug;
        }

        let suffix = 2;
        while (existingIds.includes(`${slug}-${suffix.toString()}`)) {
            suffix += 1;
        }

        return `${slug}-${suffix.toString()}`;
    };

    /**
     * Checks if two entries point to the same address on the same network.
     * @param addressA - First entry to compare.
     * @param addressB - Second entry to compare.
     * @returns True when both the network and the address match.
     */
    isSameNetworkAddress = (
        addressA: IWorkspaceNetworkAddress,
        addressB: IWorkspaceNetworkAddress,
    ): boolean =>
        addressA.network === addressB.network &&
        addressUtils.isAddressEqual(addressA.address, addressB.address);

    /**
     * Validates the entry at the given index, rejecting invalid addresses and addresses already used on the same
     * network by a previous entry of the list.
     *
     * The list is read from the live form state by the field validator, so it may be missing or shorter than
     * expected while rows are being added, removed or re-mounted. Those states are treated as an invalid address
     * rather than throwing.
     * @param networkAddresses - Complete list of entries the validated one belongs to, if already set.
     * @param index - Index of the entry being validated.
     * @returns True when valid, otherwise the translation key of the validation error.
     */
    validateNetworkAddress = (
        networkAddresses: IWorkspaceNetworkAddress[] | undefined,
        index: number,
    ): true | string => {
        const errorNamespace = 'app.workspace.createWorkspaceForm.error';

        if (networkAddresses == null) {
            return `${errorNamespace}.invalidAddress`;
        }

        const entry = networkAddresses[index];

        if (entry == null || !addressUtils.isAddress(entry.address)) {
            return `${errorNamespace}.invalidAddress`;
        }

        const isDuplicate = networkAddresses
            .slice(0, index)
            .some(
                (current) =>
                    current != null &&
                    this.isSameNetworkAddress(current, entry),
            );

        return isDuplicate ? `${errorNamespace}.duplicateAddress` : true;
    };
}

export const workspaceUtils = new WorkspaceUtils();
