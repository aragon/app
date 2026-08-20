import {
    addressUtils,
    ChainEntityType,
    Link,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';

export interface IWorkspaceAddressProps {
    /**
     * Address to display.
     */
    address: string;
    /**
     * Chain ID used to build the block explorer link.
     */
    chainId?: number;
}

export const WorkspaceAddress: React.FC<IWorkspaceAddressProps> = (props) => {
    const { address, chainId } = props;

    const { buildEntityUrl } = useBlockExplorer({ chainId });

    return (
        <Link
            className="w-fit shrink-0"
            href={buildEntityUrl({
                type: ChainEntityType.ADDRESS,
                id: address,
            })}
            isExternal={true}
        >
            {addressUtils.truncateAddress(address)}
        </Link>
    );
};
