import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Avatar, Dialog, Heading, IconType, Link, Spinner } from '@aragon/gov-ui-kit';
import type { IProposalAction } from '../../api/governanceService';
import type { IAppMetadata } from '../../api/walletConnectService';

export interface IWalletConnectActionDialogListenerProps {
    /**
     * Metadata of the connected dApp.
     */
    appMetadata: IAppMetadata;
    /**
     * Actions collected through the wallet-connect listener.
     */
    actions: IProposalAction[];
    /**
     * Callback called on add actions click.
     */
    onAddActionsClick: (actions: IProposalAction[]) => void;
}

export const WalletConnectActionDialogListener: React.FC<IWalletConnectActionDialogListenerProps> = (props) => {
    const { appMetadata, actions, onAddActionsClick } = props;

    const { close } = useDialogContext();
    const { t } = useTranslations();

    const { name, icons, url } = appMetadata;
    const hasActions = actions.length > 0;

    const handleAddActions = () => {
        onAddActionsClick(actions);
        close();
    };

    const primaryActionLink = {
        label: t('app.governance.walletConnectActionDialog.listener.action.open'),
        href: url,
        iconRight: IconType.LINK_EXTERNAL,
        target: '_blank',
    };

    const primaryActionButton = {
        label: t('app.governance.walletConnectActionDialog.listener.action.addActions', { count: actions.length }),
        onClick: handleAddActions,
    };

    return (
        <>
            <Dialog.Content className="flex flex-col gap-4 py-4 md:gap-6 md:pt-6">
                <div className="flex flex-col gap-2 md:gap-3">
                    <Avatar src={icons[0]} size="md" />
                    <Heading size="h3">{name}</Heading>
                    <div className="flex flex-row gap-3">
                        <p className="text-base font-normal leading-tight text-primary-400">
                            {t('app.governance.walletConnectActionDialog.listener.progress')}
                        </p>
                        <Spinner variant="primary" size="md" />
                    </div>
                </div>
                <div className="h-[1px] w-full bg-neutral-100" />
                <div className="flex flex-col gap-3 md:gap-4">
                    <p className="text-balance font-normal leading-normal text-neutral-500">
                        <span>{t('app.governance.walletConnectActionDialog.listener.info_1')}</span>
                        <span className="text-primary-400">{name} </span>
                        <span>{t('app.governance.walletConnectActionDialog.listener.info_2')}</span>
                    </p>
                    <Link
                        href="https://www.aragon.org/how-to/dapp-connect"
                        target="_blank"
                        variant="neutral"
                        iconRight={IconType.LINK_EXTERNAL}
                    >
                        {t('app.governance.walletConnectActionDialog.listener.helpLink')}
                    </Link>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={hasActions ? primaryActionButton : primaryActionLink}
                secondaryAction={{
                    label: t('app.governance.walletConnectActionDialog.listener.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
