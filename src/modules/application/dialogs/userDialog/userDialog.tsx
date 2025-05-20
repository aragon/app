import { NavigationLinksItem } from '@/modules/application/components/navigations/navigation/navigationLinks/navigationLinksItem';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import {
    addressUtils,
    ChainEntityType,
    Dialog,
    IconType,
    Link,
    MemberAvatar,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { mainnet } from 'viem/chains';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';

export interface IUserDialogProps extends IDialogComponentProps {}

export const UserDialog: React.FC<IUserDialogProps> = (props) => {
    const { id } = props.location;

    const { close } = useDialogContext();
    const { address, chainId } = useAccount();
    const { disconnect } = useDisconnect();

    const { data: ensName } = useEnsName({ address, query: { enabled: address != null }, chainId: mainnet.id });

    const formattedAddress = addressUtils.truncateAddress(address);
    const userName = ensName ?? formattedAddress;

    const { buildEntityUrl } = useBlockExplorer();
    const addressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address, chainId });

    // Close dialog if user disconnects
    useEffect(() => {
        if (address == null) {
            close(id);
        }
    }, [address, id, close]);

    if (address == null) {
        return null;
    }

    return (
        <Dialog.Content className="flex flex-col gap-4 px-4 py-7">
            <div className="flex flex-col gap-3 px-4">
                <MemberAvatar address={address} size="lg" responsiveSize={{ sm: 'xl' }} />
                <div className="flex flex-col gap-1.5 font-normal leading-tight">
                    {ensName != null && <p className="text-base text-neutral-500">{formattedAddress}</p>}
                    <Link
                        href={addressLink}
                        target="_blank"
                        iconRight={IconType.LINK_EXTERNAL}
                        className="truncate text-lg text-neutral-800 sm:text-xl"
                    >
                        {userName}
                    </Link>
                </div>
            </div>
            <NavigationLinksItem onClick={() => disconnect()} icon={IconType.LOGOUT} variant="column">
                Disconnect
            </NavigationLinksItem>
        </Dialog.Content>
    );
};
