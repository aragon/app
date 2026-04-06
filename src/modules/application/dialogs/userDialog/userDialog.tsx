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
import { useConnection, useDisconnect } from 'wagmi';
import { useEnsAvatar, useEnsName } from '@/modules/ens';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { Navigation } from '@/shared/components/navigation';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ApplicationDialogId } from '../../constants/applicationDialogId';

export interface IUserDialogProps extends IDialogComponentProps {}

export const UserDialog: React.FC<IUserDialogProps> = (props) => {
    const { id } = props.location;

    const { t } = useTranslations();

    const { close, open } = useDialogContext();
    const { address, chainId } = useConnection();
    const disconnect = useDisconnect();

    const { data: ensName } = useEnsName(address);
    const { data: ensAvatar } = useEnsAvatar(ensName);

    const formattedAddress = addressUtils.truncateAddress(address);

    const { buildEntityUrl } = useBlockExplorer();
    const addressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: address,
        chainId,
    });

    const handleEditAragonProfile = () =>
        open(ApplicationDialogId.ARAGON_PROFILE);

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
        <Dialog.Content
            className="flex flex-col gap-4 pt-8 pb-4"
            noInset={true}
        >
            <div className="flex flex-col gap-3 px-8">
                <MemberAvatar
                    address={address}
                    avatarSrc={ensAvatar ?? undefined}
                    ensName={ensName ?? undefined}
                    responsiveSize={{ sm: 'xl' }}
                    size="lg"
                />
                <div className="flex flex-col gap-1.5 font-normal leading-tight">
                    {ensName != null && (
                        <p className="text-lg text-neutral-800 md:text-xl">
                            {ensName}
                        </p>
                    )}
                    <Clipboard copyValue={address}>
                        <Link
                            className="truncate text-sm md:text-base"
                            href={addressLink}
                            isExternal={true}
                        >
                            {formattedAddress}
                        </Link>
                    </Clipboard>
                </div>
            </div>
            <div className="flex flex-col gap-1 px-4">
                {ensName != null && (
                    <Navigation.Item
                        icon={IconType.PERSON}
                        onClick={handleEditAragonProfile}
                        variant="column"
                    >
                        {t('app.application.userDialog.editAragonProfile')}
                    </Navigation.Item>
                )}
                <Navigation.Item
                    icon={IconType.LOGOUT}
                    onClick={() => disconnect.mutate()}
                    variant="column"
                >
                    {t('app.application.userDialog.disconnect')}
                </Navigation.Item>
            </div>
        </Dialog.Content>
    );
};
