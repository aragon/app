import type React from 'react';
import {
    AddressOutput,
    AvatarIcon,
    addressUtils,
    DataList,
    Heading,
    Icon,
    IconType,
    type IDataListItemProps,
} from '../../../../../core';
import { DaoAvatar } from '../../daoAvatar';

export type IDaoDataListItemStructureProps = IDataListItemProps & {
    /**
     * The name of the DAO.
     */
    name?: string;
    /**
     * The source of the logo for the DAO.
     */
    logoSrc?: string;
    /**
     * The description of the DAO.
     */
    description?: string;
    /**
     * The address of the DAO.
     */
    address?: string;
    /**
     * The ENS (Ethereum Name Service) address of the DAO.
     */
    ens?: string;
    /**
     * The network on which the DAO operates.
     */
    network?: string;
    /**
     * Displays an external link icon and updates the information shown when set to true.
     */
    isExternal?: boolean;
};

export const DaoDataListItemStructure: React.FC<IDaoDataListItemStructureProps> = (props) => {
    const { name, logoSrc, description, network, address, ens, isExternal, ...otherProps } = props;

    const truncatedAddress = addressUtils.truncateAddress(address);
    const addressLine = ens ?? truncatedAddress;

    return (
        <DataList.Item className="grid gap-y-3 py-4 md:gap-y-4 md:py-6" {...otherProps}>
            <div className="flex w-full justify-between gap-2">
                <div className="grid shrink items-center gap-y-1.5 text-surface-primary">
                    <Heading as="h2" className="truncate" size="h3">
                        {name}
                    </Heading>
                    {!!addressLine && (
                        <Heading as="h3" className="truncate" size="h5">
                            {address == null ? (
                                addressLine
                            ) : (
                                <AddressOutput address={address} className="truncate" label={addressLine} />
                            )}
                        </Heading>
                    )}
                </div>
                <DaoAvatar name={name} responsiveSize={{ md: 'lg' }} size="md" src={logoSrc} />
            </div>
            <p className="line-clamp-2 text-base leading-normal text-surface-secondary md:text-lg">{description}</p>
            <div className="flex flex-row justify-between">
                <div className="mt-1 flex items-center gap-x-1 text-surface-tertiary md:mt-0 md:gap-x-2">
                    <span className="text-sm leading-tight capitalize md:text-base">{network}</span>
                    <Icon icon={IconType.BLOCKCHAIN_BLOCKCHAIN} responsiveSize={{ md: 'md' }} size="sm" />
                </div>
                {isExternal && <AvatarIcon icon={IconType.LINK_EXTERNAL} size="sm" variant="primary" />}
            </div>
        </DataList.Item>
    );
};
