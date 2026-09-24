'use client';

import { addressUtils, DefinitionList } from '@aragon/gov-ui-kit';
import { useEnsName } from '@/modules/ens';
import { useSmartContractAbi } from '@/modules/governance/api/smartContractService';
import type { Network } from '@/shared/api/daoService';

export interface IPermissionEntityItemProps {
    /**
     * Term shown next to the entity, e.g. "Who" or "Where".
     */
    term: string;
    /**
     * Address the permission entry points at.
     */
    address: string;
    /**
     * Resolved name of the address, e.g. the DAO name, a plugin name or a sentinel.
     * Left out when the address resolves to nothing but itself.
     */
    label?: string;
    /**
     * Block-explorer link for the address.
     */
    href?: string;
    /**
     * Network the address lives on, used to look up its contract name.
     */
    network?: Network;
}

/**
 * Renders one address of a permission action: the ENS name or the address as the link,
 * and the resolved name or the contract name underneath. The address stays the copied
 * value so it can be checked as it will execute.
 */
export const PermissionEntityItem: React.FC<IPermissionEntityItemProps> = (
    props,
) => {
    const { term, address, label, href, network } = props;

    const { data: ensName } = useEnsName(address);
    const truncatedAddress = addressUtils.truncateAddress(address);
    const resolvedLabel = label !== truncatedAddress ? label : undefined;

    const { data: contractAbi } = useSmartContractAbi(
        { urlParams: { network: network as Network, address } },
        {
            enabled: resolvedLabel == null && network != null,
            retry: false,
        },
    );

    return (
        <DefinitionList.Item
            copyValue={address}
            description={resolvedLabel ?? contractAbi?.name}
            link={{ href, isExternal: true, isOnchainEntity: true }}
            term={term}
        >
            {ensName ?? address}
        </DefinitionList.Item>
    );
};
