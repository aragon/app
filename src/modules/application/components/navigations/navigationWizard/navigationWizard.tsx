'use client';

import {
    addressUtils,
    DaoAvatar,
    Icon,
    IconType,
    Wallet,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { Route } from 'next';
import { useAccount } from 'wagmi';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import type { IDao, ISubDaoSummary } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Link } from '@/shared/components/link';
import {
    type INavigationContainerProps,
    Navigation,
} from '@/shared/components/navigation';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { ITFuncOptions } from '@/shared/utils/translationsUtils';

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
     * Used when a plugin targets a subDAO.
     */
    targetDaoAddress?: string;
    /**
     * Exit path to redirect to when exiting the wizard.
     */
    exitPath: Route;
}

/**
 * Resolves the display DAO info based on target address.
 * Returns the subDAO if targeting a subDAO, otherwise returns the parent DAO.
 */
const resolveDisplayDao = (
    dao?: IDao,
    targetDaoAddress?: string,
): Pick<IDao | ISubDaoSummary, 'address' | 'name' | 'avatar'> | undefined => {
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

    // Find matching subDAO
    const matchingSubDao = dao.subDaos?.find((subDao) =>
        addressUtils.isAddressEqual(subDao.address, targetDaoAddress),
    );

    return matchingSubDao ?? dao;
};

export const NavigationWizard: React.FC<INavigationWizardProps> = (props) => {
    const { name, dao, targetDaoAddress, exitPath } = props;

    const { address, isConnected } = useAccount();
    const isMounted = useIsMounted();
    const effectiveIsConnected = isMounted && isConnected;
    const { t } = useTranslations();
    const { open } = useDialogContext();

    const handleWalletClick = () => {
        const dialog = effectiveIsConnected
            ? ApplicationDialogId.USER
            : ApplicationDialogId.CONNECT_WALLET;
        open(dialog);
    };

    const walletUser = isMounted && address != null ? { address } : undefined;
    const displayDao = resolveDisplayDao(dao, targetDaoAddress);
    const displayDaoName =
        displayDao != null
            ? displayDao.name ||
              addressUtils.truncateAddress(displayDao.address)
            : undefined;
    const daoAvatar = ipfsUtils.cidToSrc(displayDao?.avatar);

    const linkClassName = classNames(
        'items-center gap-3 rounded-full border border-neutral-100 p-4 text-neutral-300 transition-all',
        'hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800 focus-ring-primary',
    );

    const wizardName = typeof name === 'string' ? t(name) : t(...name);

    return (
        <Navigation.Container containerClasses="flex flex-row items-center gap-x-6 justify-between py-5">
            <div className="flex min-w-0 grow items-center gap-x-3 md:gap-x-4">
                <Link className={linkClassName} href={exitPath}>
                    <Icon icon={IconType.CLOSE} size="md" />
                </Link>
                <div className="flex min-w-0 flex-col gap-y-0.5">
                    <p className="text-nowrap text-base text-neutral-800 leading-tight">
                        {wizardName}
                    </p>
                    {displayDao != null && (
                        <div className="flex items-center gap-x-2">
                            <p className="truncate text-nowrap text-neutral-500 text-sm leading-tight">
                                {displayDaoName}
                            </p>
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
