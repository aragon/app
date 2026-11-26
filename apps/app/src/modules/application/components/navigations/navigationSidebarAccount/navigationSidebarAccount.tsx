'use client';

import {
    AddressOutput,
    addressUtils,
    Button,
    type ICompositeAddress,
    Icon,
    IconType,
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

    // A user with a profile name shows it and the plain short address below: resolving that address would repeat the
    // name. Without one, the address alone, named by the address book. Inside a button, so it reveals on hover only.
    return (
        <button
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-2 text-left transition-all focus-ring-primary hover:border-neutral-200 active:bg-neutral-50"
            onClick={onClick}
            type="button"
        >
            <MemberAvatar address={user.address} size="md" />
            <span className="flex min-w-0 grow flex-col leading-tight">
                <span className="truncate text-base text-neutral-800">
                    {user.name ?? (
                        <AddressOutput
                            address={user.address}
                            copy={false}
                            hasInteractiveAncestor={true}
                        />
                    )}
                </span>
                {user.name != null && (
                    <span className="truncate text-sm text-neutral-500">
                        {addressUtils.truncateAddress(user.address)}
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
