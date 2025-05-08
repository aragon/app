import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { addressUtils, Button, clipboardUtils, Dialog, IconType, MemberAvatar } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { mainnet } from 'viem/chains';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';

export interface IUserDialogProps extends IDialogComponentProps {}

export const UserDialog: React.FC<IUserDialogProps> = (props) => {
    const { id } = props.location;

    const { close } = useDialogContext();
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

    const { data: ensName } = useEnsName({ address, query: { enabled: address != null }, chainId: mainnet.id });

    const formattedAddress = addressUtils.truncateAddress(address);
    const userName = ensName ?? formattedAddress;

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
        <Dialog.Content className="flex flex-row justify-between gap-2 pt-7 pb-6">
            <div className="flex min-w-0 flex-col gap-3 md:gap-4">
                <MemberAvatar address={address} size="lg" responsiveSize={{ md: 'xl' }} />
                <div className="flex flex-col gap-1 truncate leading-tight font-normal md:gap-1.5">
                    <p className="truncate text-xl text-neutral-800">{userName}</p>
                    {ensName != null && <p className="text-base text-neutral-500">{formattedAddress}</p>}
                </div>
            </div>
            <div className="flex flex-row gap-3">
                <Button
                    onClick={() => clipboardUtils.copy(address)}
                    iconLeft={IconType.COPY}
                    size="md"
                    variant="tertiary"
                    responsiveSize={{ md: 'lg' }}
                />
                <Button
                    onClick={() => disconnect()}
                    iconLeft={IconType.LOGOUT}
                    size="md"
                    variant="tertiary"
                    responsiveSize={{ md: 'lg' }}
                />
            </div>
        </Dialog.Content>
    );
};
