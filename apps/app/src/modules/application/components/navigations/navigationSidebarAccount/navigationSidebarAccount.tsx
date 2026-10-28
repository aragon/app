'use client';

import {
    addressUtils,
    Button,
    Icon,
    IconType,
    MemberAvatar,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface INavigationSidebarAccountProps {
    /**
     * Connected user, undefined while no wallet is connected.
     */
    user?: { address: string; name?: string };
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
            className="focus-ring-primary flex w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-2 text-left transition-all hover:border-neutral-200 active:bg-neutral-50"
            onClick={onClick}
            type="button"
        >
            <MemberAvatar
                address={user.address}
                ensName={user.name}
                size="md"
            />
            <span className="flex min-w-0 grow flex-col leading-tight">
                <span className="truncate text-base text-neutral-800">
                    {user.name ?? truncatedAddress}
                </span>
                {user.name != null && (
                    <span className="truncate text-neutral-500 text-sm">
                        {truncatedAddress}
                    </span>
                )}
            </span>
            <Icon
                className="shrink-0 text-neutral-400"
                icon={IconType.CHEVRON_RIGHT}
                size="md"
            />
        </button>
    );
};
