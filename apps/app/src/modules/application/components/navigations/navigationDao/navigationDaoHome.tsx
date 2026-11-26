import {
    AddressOutput,
    DaoAvatar,
    InteractiveAncestorContext,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import type { IDao } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

export interface INavigationDaoHome extends ComponentProps<'button'> {
    /**
     * DAO to display the home details for.
     */
    dao: IDao;
}

export const NavigationDaoHome: React.FC<INavigationDaoHome> = (props) => {
    const { dao, className, ...otherProps } = props;
    const daoDisplayName = daoUtils.getDaoDisplayName(dao);
    const daoName = dao.name?.trim();

    const daoAvatar = ipfsUtils.cidToSrc(dao.avatar);

    const buttonClassName = classNames(
        'cursor-pointer p-1 md:pr-4',
        'flex max-w-56 items-center gap-3 rounded-full border border-surface-default bg-surface-default text-surface-default transition-all xl:max-w-68',
        'ring-accent-focus focus-ring hover:border-surface-hover active:bg-surface-active-control active:text-surface-active',
        className,
    );

    return (
        <button className={buttonClassName} {...otherProps}>
            <InteractiveAncestorContext.Provider value={true}>
                <DaoAvatar name={daoDisplayName} size="lg" src={daoAvatar} />
                <p className="hidden grow truncate text-left text-base leading-tight font-normal text-surface-primary md:block">
                    <AddressOutput
                        address={dao.address}
                        label={daoName || undefined}
                    />
                </p>
            </InteractiveAncestorContext.Provider>
        </button>
    );
};
