'use client';

import {
    addressUtils,
    Button,
    type ICompositeAddress,
    MemberAvatar,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface INavigationSidebarAccountProps {
    /**
     * Connected user, undefined while no wallet is connected.
     */
    user?: ICompositeAddress;
    /**
     * Opens the user dialog when connected, the connect-wallet dialog otherwise.
     */
    onClick: () => void;
}

/**
 * Wallet entry of the side navigation: a full-width account row once connected, a full-width connect button before.
 * The navigation bar keeps the gov-ui-kit `Wallet` pill, which is sized for a horizontal bar.
 */
export const NavigationSidebarAccount: React.FC<
    INavigationSidebarAccountProps
> = (props) => {
    const { user, onClick } = props;

    const { t } = useTranslations();

    if (user == null) {
        return (
            <Button
                className="w-full"
                onClick={onClick}
                size="md"
                variant="secondary"
            >
                {t('app.application.navigationSidebarAccount.connect')}
            </Button>
        );
    }

    const truncatedAddress = addressUtils.truncateAddress(user.address);

    return (
        <button
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-surface-default bg-surface-default p-2 text-left ring-accent-focus focus-ring transition-all hover:border-surface-hover active:bg-surface-active-control"
            onClick={onClick}
            type="button"
        >
            <MemberAvatar
                address={user.address}
                ensName={user.name}
                size="md"
            />
            <span className="flex min-w-0 grow flex-col leading-tight">
                <span className="truncate text-base text-surface-primary">
                    {user.name ?? truncatedAddress}
                </span>
                {user.name != null && (
                    <span className="truncate text-sm text-surface-secondary">
                        {truncatedAddress}
                    </span>
                )}
            </span>
        </button>
    );
};
