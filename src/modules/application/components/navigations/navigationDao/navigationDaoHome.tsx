import { DaoAvatar } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import type { IDao } from '@/shared/api/daoService';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

export interface INavigationDaoHome extends ComponentProps<'button'> {
    /**
     * DAO to display the home details for.
     */
    dao: IDao;
}

export const NavigationDaoHome: React.FC<INavigationDaoHome> = (props) => {
    const { dao, className, ...otherProps } = props;
    const daoDisplayName = dao.name || dao.address;

    const daoAvatar = ipfsUtils.cidToSrc(dao.avatar);

    const buttonClassName = classNames(
        'p-1 md:pr-4 cursor-pointer',
        'flex max-w-56 xl:max-w-68 items-center gap-3 rounded-full border border-neutral-100 bg-neutral-0 text-neutral-500 transition-all',
        'hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800 focus-ring-primary',
        className,
    );

    return (
        <button className={buttonClassName} {...otherProps}>
            <DaoAvatar name={daoDisplayName} size="lg" src={daoAvatar} />
            <p className="hidden truncate font-normal text-base text-neutral-800 leading-tight md:block">
                {daoDisplayName}
            </p>
        </button>
    );
};
