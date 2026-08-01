import {
    addressUtils,
    ChainEntityType,
    DefinitionList,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';

interface IPermissionAddressListItemProps {
    address: string;
    term: string;
    name?: string;
    chainId?: number;
}

export const PermissionAddressListItem: React.FC<
    IPermissionAddressListItemProps
> = ({ address, term, name, chainId }) => {
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const truncatedAddress = addressUtils.truncateAddress(address);
    const explorerUrl = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: address,
    });
    const description = name !== truncatedAddress ? name : undefined;

    return (
        <DefinitionList.Item
            copyValue={address}
            description={description}
            link={{ href: explorerUrl, isExternal: true }}
            term={term}
        >
            {truncatedAddress}
        </DefinitionList.Item>
    );
};
