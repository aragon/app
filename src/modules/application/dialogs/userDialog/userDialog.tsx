import { NavigationLinksItem } from '@/modules/application/components/navigations/navigation/navigationLinks/navigationLinksItem';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    addressUtils,
    ChainEntityType,
    Clipboard,
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
        <Dialog.Content noInset={true} className="flex flex-col gap-4 pt-8 pb-4">
            <div className="flex flex-col gap-3 px-8">
                <MemberAvatar address={address} size="lg" responsiveSize={{ sm: 'xl' }} />
                <div className="flex flex-col gap-1.5 leading-tight font-normal">
                    {ensName != null && <p className="text-lg text-neutral-500 md:text-xl">{ensName}</p>}
                    <Clipboard copyValue={address}>
                        <Link href={addressLink} isExternal={true} className="truncate text-sm md:text-base">
                            {formattedAddress}
                        </Link>
                    </Clipboard>
                </div>
            </div>
            <div className="flex flex-col gap-1 px-4">
                <NavigationLinksItem onClick={() => disconnect()} icon={IconType.LOGOUT} variant="column">
                    {t('app.application.userDialog.disconnect')}
                </NavigationLinksItem>
            </div>
        </Dialog.Content>
    );
};
