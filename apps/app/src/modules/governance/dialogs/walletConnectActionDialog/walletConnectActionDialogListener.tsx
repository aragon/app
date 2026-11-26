import {
    Avatar,
    Dialog,
    Heading,
    IconType,
    Link,
    Spinner,
} from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
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
    onAddActionsClick: () => void;
    /**
     * Callback called on dialog close.
     */
    onClose: () => void;
}

export const WalletConnectActionDialogListener: React.FC<
    IWalletConnectActionDialogListenerProps
> = (props) => {
    const { appMetadata, actions, onAddActionsClick, onClose } = props;

    const { t } = useTranslations();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const { updateOptions } = useDialogContext();

    const { name, icons, url } = appMetadata;
    const hasActions = actions.length > 0;

    const primaryActionLink = {
        label: t(
            'app.governance.walletConnectActionDialog.listener.action.open',
        ),
        href: url,
        iconRight: IconType.LINK_EXTERNAL,
        target: '_blank',
    };

    const primaryActionButton = {
        label: t(
            'app.governance.walletConnectActionDialog.listener.action.addActions',
            { count: actions.length },
        ),
        onClick: onAddActionsClick,
    };

    // Update the default close dialog handler to use the onClose property and cleanup the WalletConnect session.
    useEffect(() => {
        updateOptions({ onClose });
    }, [updateOptions, onClose]);

    return (
        <>
            <Dialog.Content className="flex flex-col gap-group-stepped pt-inset-surface pb-inset-surface-flat--fixed-16">
                <div className="flex flex-col gap-related--8-12">
                    <Avatar size="md" src={icons[0]} />
                    <Heading as="h3" typeClassName="type-title-group">
                        {name}
                    </Heading>
                    <div className="flex flex-row gap-related">
                        <p className="type-supporting--detail-value text-accent-primary">
                            {t(
                                'app.governance.walletConnectActionDialog.listener.progress',
                            )}
                        </p>
                        <Spinner size="md" variant="primary" />
                    </div>
                </div>
                <div className="h-[1px] w-full bg-surface-tertiary" />
                <div className="flex flex-col gap-group--12-16">
                    <p className="type-body--unstepped text-balance text-surface-secondary">
                        <span>
                            {t(
                                'app.governance.walletConnectActionDialog.listener.info_1',
                            )}
                        </span>
                        <span className="text-accent-primary">{name} </span>
                        <span>
                            {t(
                                'app.governance.walletConnectActionDialog.listener.info_2',
                            )}
                        </span>
                    </p>
                    <Link
                        href="https://www.aragon.org/how-to/dapp-connect"
                        isExternal={true}
                        variant="neutral"
                    >
                        {t(
                            'app.governance.walletConnectActionDialog.listener.helpLink',
                        )}
                    </Link>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={
                    hasActions ? primaryActionButton : primaryActionLink
                }
                secondaryAction={{
                    label: t(
                        'app.governance.walletConnectActionDialog.listener.action.cancel',
                    ),
                    onClick: onClose,
                }}
            />
        </>
    );
};
