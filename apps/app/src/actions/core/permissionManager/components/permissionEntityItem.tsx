'use client';

import { addressUtils, DefinitionList, Tooltip } from '@aragon/gov-ui-kit';
import { useEnsName } from '@/modules/ens';

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
     * Explains what the address is for, shown when nothing more specific resolves.
     */
    helpText?: string;
}

/**
 * Renders one address of a permission action. The address stays the value so it can be
 * read and copied as it will execute; the resolved name is supporting detail, never a
 * replacement for it.
 */
export const PermissionEntityItem: React.FC<IPermissionEntityItemProps> = (
    props,
) => {
    const { term, address, label, href, helpText } = props;

    const { data: ensName } = useEnsName(address);
    const truncatedAddress = addressUtils.truncateAddress(address);
    const resolvedLabel = label !== truncatedAddress ? label : undefined;

    return (
        <DefinitionList.Item
            copyValue={address}
            description={resolvedLabel ?? ensName ?? helpText}
            link={href != null ? { href, isOnchainEntity: true } : undefined}
            term={term}
        >
            <Tooltip content={address} triggerAsChild={true}>
                <span>{truncatedAddress}</span>
            </Tooltip>
        </DefinitionList.Item>
    );
};
