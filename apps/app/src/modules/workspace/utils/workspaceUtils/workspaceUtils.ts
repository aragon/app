import { addressUtils } from '@aragon/gov-ui-kit';
import { getAddress } from 'viem';
import type { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';

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

    /**
     * Validates the account resolved by the workspace accounts API, rejecting addresses that are neither an indexed
     * DAO nor a readable Safe.
     * @param accountInfo - Account as resolved by the API, undefined while the lookup is still pending.
     * @returns True when the account can be added to a workspace, otherwise the translation key of the error.
     */
    validateAccountInfo = (
        accountInfo: IWorkspaceAccountInfo | undefined,
    ): true | string => {
        const errorNamespace = 'app.workspace.createWorkspaceForm.error';

        // The lookup has not resolved yet, the field is revalidated once it does.
        if (accountInfo == null) {
            return true;
        }

        if (accountInfo.status === WorkspaceAccountInfoStatus.UNSUPPORTED) {
            return `${errorNamespace}.unsupportedAccount`;
        }

        // Transient source failure: the address may well be a Safe, we just cannot tell right now. Blocking the
        // form would be wrong, but so would storing an account whose type is unknown, so the user retries.
        if (accountInfo.status === WorkspaceAccountInfoStatus.UNAVAILABLE) {
            return `${errorNamespace}.unverifiedAccount`;
        }

        return true;
    };

    /**
     * Maps the type resolved by the workspace accounts API to the account type stored on the workspace.
     * @param accountInfo - Account as resolved by the API.
     * @returns The stored account type, or undefined when the API could not tell what the address is.
     */
    getAccountType = (
        accountInfo: IWorkspaceAccountInfo | undefined,
    ): WorkspaceAccountType | undefined => {
        if (accountInfo?.status !== WorkspaceAccountInfoStatus.AVAILABLE) {
            return undefined;
        }

        const typeMap: Partial<
            Record<WorkspaceAccountInfoType, WorkspaceAccountType>
        > = {
            [WorkspaceAccountInfoType.DAO]: WorkspaceAccountType.DAO,
            [WorkspaceAccountInfoType.SAFE]: WorkspaceAccountType.SAFE,
        };

        return typeMap[accountInfo.type];
    };

    /**
     * Returns the name of an account, or undefined when it has none.
     *
     * The metadata is what the workspace owner called this account, so it wins over the indexed DAO name.
     * @param account - Account as stored on the registry.
     * @param accountInfo - Account as resolved by the accounts API, undefined while the lookup is pending.
     * @returns The name of the account, or undefined when neither source has one.
     */
    getAccountName = (
        account: IWorkspaceAccount,
        accountInfo?: IWorkspaceAccountInfo,
    ): string | undefined =>
        account.metadata?.name ?? accountInfo?.name ?? undefined;

    /**
     * Returns how an account should be labelled, falling back to its truncated address when it has no name.
     * @param account - Account as stored on the registry.
     * @param accountInfo - Account as resolved by the accounts API, undefined while the lookup is pending.
     * @returns The label of the account.
     */
    getAccountLabel = (
        account: IWorkspaceAccount,
        accountInfo?: IWorkspaceAccountInfo,
    ): string =>
        this.getAccountName(account, accountInfo) ??
        addressUtils.truncateAddress(account.address);

    /**
     * Finds the account resolved by the API for the given network and address. The API removes duplicates and
     * checksums addresses, therefore the response cannot be matched by index.
     * @param accountInfos - Accounts as resolved by the API.
     * @param networkAddress - Network and address to look up.
     * @returns The matching account, or undefined when the API returned none for it.
     */
    findAccountInfo = (
        accountInfos: IWorkspaceAccountInfo[] | undefined,
        networkAddress: IWorkspaceNetworkAddress,
    ): IWorkspaceAccountInfo | undefined =>
        accountInfos?.find((accountInfo) =>
            this.isSameNetworkAddress(accountInfo, networkAddress),
        );
}

export const workspaceUtils = new WorkspaceUtils();
