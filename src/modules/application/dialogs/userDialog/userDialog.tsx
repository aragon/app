import {
    addressUtils,
    Button,
    ChainEntityType,
    Clipboard,
    Dialog,
    IconType,
    Link,
    MemberAvatar,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useConnection, useDisconnect } from 'wagmi';
import { useEnsAvatar, useEnsName } from '@/modules/ens';
import { exploreDaoFilterParam } from '@/modules/explore/components/exploreDaos/exploreDaos';
import { exploreDaosSectionId } from '@/modules/explore/pages/exploreDaosPage';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
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

    const router = useRouter();

    const handleCreateAragonProfile = () =>
        open(ApplicationDialogId.ARAGON_PROFILE_INTRO, {
            stack: true,
            params: { mode: 'create' },
        });

    const handleEditAragonProfile = () =>
        open(ApplicationDialogId.ARAGON_PROFILE_INTRO, {
            stack: true,
            params: { mode: 'edit' },
        });

    const handleDisconnect = () => disconnect.mutate();

    const handleMyDaosClick = () => {
        router.push(
            `/?${exploreDaoFilterParam}=member#${exploreDaosSectionId}`,
        );
        close(id);
    };

    // Close dialog if user disconnects
    useEffect(() => {
        if (address == null) {
            close(id);
        }
    }, [address, id, close]);

    if (address == null) {
        return null;
    }

    const hasAragonProfile = ensName != null;

    return (
        <Dialog.Content
            className="flex flex-col gap-6 pt-8 pb-4"
            noInset={true}
        >
            <div className="flex flex-col gap-3 px-8">
                <div className="flex items-start justify-between">
                    <MemberAvatar
                        address={address}
                        avatarSrc={ensAvatar ?? undefined}
                        ensName={ensName ?? undefined}
                        responsiveSize={{ sm: 'xl' }}
                        size="lg"
                    />
                    <div className="flex gap-2">
                        {hasAragonProfile && (
                            <Button
                                iconLeft={IconType.PEN}
                                onClick={handleEditAragonProfile}
                                size="md"
                                variant="tertiary"
                            />
                        )}
                        <Button
                            iconLeft={IconType.LOGOUT}
                            onClick={handleDisconnect}
                            size="md"
                            variant="tertiary"
                        />
                    </div>
                </div>
                {hasAragonProfile ? (
                    <div className="flex flex-col gap-1">
                        <p className="font-normal text-neutral-800 text-xl leading-tight">
                            {ensName}
                        </p>
                        <Clipboard copyValue={address}>
                            <Link
                                className="truncate text-base"
                                href={addressLink}
                                isExternal={true}
                            >
                                {formattedAddress}
                            </Link>
                        </Clipboard>
                    </div>
                ) : (
                    <Clipboard copyValue={address}>
                        <span className="truncate text-neutral-800 text-xl">
                            {formattedAddress}
                        </span>
                    </Clipboard>
                )}
            </div>
            <div className="flex flex-col gap-3 px-8">
                <div className="flex flex-col gap-3">
                    <Button
                        className="w-full"
                        iconRight={IconType.LINK_EXTERNAL}
                        onClick={handleMyDaosClick}
                        size="md"
                        variant="tertiary"
                    >
                        {t('app.application.userDialog.myDaos')}
                    </Button>
                    {!hasAragonProfile && (
                        <Button
                            className="w-full"
                            onClick={handleCreateAragonProfile}
                            size="md"
                            variant="primary"
                        >
                            {t(
                                'app.application.userDialog.createAragonProfile',
                            )}
                        </Button>
                    )}
                </div>
                {!hasAragonProfile && (
                    <p className="text-center font-normal text-neutral-500 text-sm leading-normal">
                        {t('app.application.userDialog.description')}
                    </p>
                )}
            </div>
        </Dialog.Content>
    );
};
