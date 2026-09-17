'use client';

import { addressUtils, DefinitionList, Tooltip } from '@aragon/gov-ui-kit';

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
}

/**
 * Renders one address of a permission action. The address stays the value so it can be
 * read and copied as it will execute; the resolved name is supporting detail, never a
 * replacement for it.
 */
export const PermissionEntityItem: React.FC<IPermissionEntityItemProps> = (
    props,
) => {
    const { term, address, label, href } = props;

    const truncatedAddress = addressUtils.truncateAddress(address);

    return (
        <DefinitionList.Item
            copyValue={address}
            description={label !== truncatedAddress ? label : undefined}
            link={href != null ? { href, isOnchainEntity: true } : undefined}
            term={term}
        >
            <Tooltip content={address} triggerAsChild={true}>
                <span>{truncatedAddress}</span>
            </Tooltip>
        </DefinitionList.Item>
    );
};
