import { addressUtils, ChainEntityType, Clipboard, Dialog, IconType, Link, MemberAvatar, useBlockExplorer } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { mainnet } from 'viem/chains';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { Navigation } from '@/shared/components/navigation';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IUserDialogProps extends IDialogComponentProps {}

export const UserDialog: React.FC<IUserDialogProps> = (props) => {
    const { id } = props.location;

    const { t } = useTranslations();

    const { close } = useDialogContext();
    const { address, chainId } = useAccount();
    const { disconnect } = useDisconnect();

    const { data: ensName } = useEnsName({ address, query: { enabled: address != null }, chainId: mainnet.id });

    const formattedAddress = addressUtils.truncateAddress(address);

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
        <Dialog.Content className="flex flex-col gap-4 pt-8 pb-4" noInset={true}>
            <div className="flex flex-col gap-3 px-8">
                <MemberAvatar address={address} responsiveSize={{ sm: 'xl' }} size="lg" />
                <div className="flex flex-col gap-1.5 font-normal leading-tight">
                    {ensName != null && <p className="text-lg text-neutral-800 md:text-xl">{ensName}</p>}
                    <Clipboard copyValue={address}>
                        <Link className="truncate text-sm md:text-base" href={addressLink} isExternal={true}>
                            {formattedAddress}
                        </Link>
                    </Clipboard>
                </div>
            </div>
            <div className="flex flex-col gap-1 px-4">
                <Navigation.Item icon={IconType.LOGOUT} onClick={() => disconnect()} variant="column">
                    {t('app.application.userDialog.disconnect')}
                </Navigation.Item>
            </div>
        </Dialog.Content>
    );
};
