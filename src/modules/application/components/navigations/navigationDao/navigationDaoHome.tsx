import type { IDao } from '@/shared/api/daoService';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoAvatar } from '@aragon/gov-ui-kit';
import classNames from 'classnames';

export interface IWalletProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * DAO to display the data for.
     */
    dao: IDao;
}

export const NavigationDaoHome: React.FC<IWalletProps> = (props) => {
    const { dao, className, ...otherProps } = props;

    const daoAvatar = ipfsUtils.cidToSrc(dao.avatar);

    const buttonClassName = classNames(
        'p-1 md:pr-4',
        'flex max-w-44 items-center gap-3 rounded-full border border-neutral-100 bg-neutral-0 text-neutral-500 transition-all',
        'hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800',
        'focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset',
        className,
    );

    return (
        <button className={buttonClassName} {...otherProps}>
            <DaoAvatar src={daoAvatar} name={dao.name} size="lg" />
            <p className="hidden truncate text-base leading-tight font-normal text-neutral-800 md:block">{dao.name}</p>
        </button>
    );
};
