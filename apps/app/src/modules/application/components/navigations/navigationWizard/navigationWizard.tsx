'use client';

import {
    AddressOutput,
    addressUtils,
    DaoAvatar,
    Icon,
    IconType,
    Wallet,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { Route } from 'next';
import { useSearchParams } from 'next/navigation';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { useWalletConnected } from '@/modules/application/hooks/useWalletConnected';
import { useEnsName } from '@/modules/ens';
import type { IDao, ILinkedAccountSummary } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Link } from '@/shared/components/link';
import {
    type INavigationContainerProps,
    Navigation,
} from '@/shared/components/navigation';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { ITFuncOptions } from '@/shared/utils/translationsUtils';
import { useWalletAccount } from '../../../hooks/useWalletAccount';
import { SupportChatTrigger } from '../../supportChat';

export interface INavigationWizardProps extends INavigationContainerProps {
    /**
     * Key and parameters of the wizard name displayed on the navigation.
     */
    name: string | [string, ITFuncOptions];
    /**
     * DAO to display the data for.
     */
    dao?: IDao;
    /**
     * Target DAO address to display instead of the parent DAO.
     * Used when a plugin targets a linked account.
     */
    targetDaoAddress?: string;
    /**
     * Exit path to redirect to when exiting the wizard, unless the URL carries a `returnTo` path (see
     * `wizardReturnToParam`).
     */
    exitPath: Route;
    /**
     * Called on a click of the close link; `preventDefault` cancels the exit navigation.
     */
    onExit?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Query parameter naming the page a wizard was opened from, so its exit returns there, e.g. the workspace a new one is
 * created from.
 */
export const wizardReturnToParam = 'returnTo';

// Only paths inside the app are honoured.
// URL parsing rejects protocol-relative paths and backslashes.
const isAppPath = (path: string | null): path is Route => {
    if (path == null || !path.startsWith('/')) {
        return false;
    }

    return new URL(path, 'https://app.local').origin === 'https://app.local';
};
/**
 * Resolves the display DAO info based on target address.
 * Returns the linked account if targeting a linked account, otherwise returns the parent DAO.
 */
const resolveDisplayDao = (
    dao?: IDao,
    targetDaoAddress?: string,
):
    | Pick<IDao | ILinkedAccountSummary, 'address' | 'name' | 'avatar'>
    | undefined => {
    if (dao == null) {
        return undefined;
    }

    // If no target address specified or it matches parent DAO, show parent
    if (
        targetDaoAddress == null ||
        addressUtils.isAddressEqual(dao.address, targetDaoAddress)
    ) {
        return dao;
    }

    // Find matching linked account
    const matchingLinkedAccount = dao.linkedAccounts?.find((linkedAccount) =>
        addressUtils.isAddressEqual(linkedAccount.address, targetDaoAddress),
    );

    return matchingLinkedAccount ?? dao;
};

export const NavigationWizard: React.FC<INavigationWizardProps> = (props) => {
    const { name, dao, targetDaoAddress, exitPath, onExit } = props;

    const returnTo = useSearchParams().get(wizardReturnToParam);
    const exitHref = isAppPath(returnTo) ? returnTo : exitPath;

    const { address } = useWalletAccount();
    const { data: displayName } = useEnsName(address, {
        stripAragonRegistrySuffix: true,
    });
    const isConnected = useWalletConnected();
    const isMounted = useIsMounted();
    const effectiveIsConnected = isMounted && isConnected && address != null;
    const { t } = useTranslations();
    const { open } = useDialogContext();

    const handleWalletClick = () => {
        const dialog = effectiveIsConnected
            ? ApplicationDialogId.USER
            : ApplicationDialogId.CONNECT_WALLET;
        open(dialog);
    };

    const walletUser =
        isMounted && address != null
            ? { address, name: displayName ?? undefined }
            : undefined;
    const displayDao = resolveDisplayDao(dao, targetDaoAddress);
    const displayDaoName =
        displayDao != null ? daoUtils.getDaoDisplayName(displayDao) : undefined;
    const daoAvatar = ipfsUtils.cidToSrc(displayDao?.avatar);

    const linkClassName = classNames(
        'items-center gap-3 rounded-full border border-surface-default p-4 text-surface-default-wizard transition-all',
        'ring-accent-focus focus-ring hover:border-surface-hover active:bg-surface-active-control active:text-surface-active',
    );

    const wizardName = typeof name === 'string' ? t(name) : t(...name);

    return (
        <Navigation.Container
            containerClasses="flex flex-row items-center gap-x-6 justify-between py-5"
            trailing={<SupportChatTrigger />}
        >
            <div className="flex min-w-0 grow items-center gap-x-3 md:gap-x-4">
                <Link
                    className={linkClassName}
                    href={exitHref}
                    onClick={onExit}
                >
                    <Icon icon={IconType.CLOSE} size="md" />
                </Link>
                <div className="flex min-w-0 flex-col gap-y-0.5">
                    <p className="text-base leading-tight text-nowrap text-surface-primary">
                        {wizardName}
                    </p>
                    {displayDao != null && (
                        <div className="flex items-center gap-x-2">
                            <AddressOutput
                                address={displayDao.address}
                                className="text-sm leading-tight text-nowrap text-surface-secondary"
                                copy={false}
                                label={displayDao.name?.trim() || undefined}
                            />
                            <DaoAvatar
                                name={displayDaoName}
                                size="sm"
                                src={daoAvatar}
                            />
                        </div>
                    )}
                </div>
            </div>
            <Wallet onClick={handleWalletClick} user={walletUser} />
        </Navigation.Container>
    );
};
