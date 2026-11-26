import {
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
    const explorerUrl = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: address,
    });

    return (
        <DefinitionList.Item
            description={name}
            link={{
                href: explorerUrl,
                isExternal: true,
                isOnchainEntity: true,
            }}
            term={term}
        >
            {address}
        </DefinitionList.Item>
    );
};
