'use client';

import { useDao } from '@/shared/api/daoService';
import { AvatarIcon, DaoAvatar, IconType } from '@aragon/ods';
import classNames from 'classnames';
import { Navigation } from '../../navigation';
import { Wallet } from '../../wallet';
import { HeaderBase, type IHeaderBaseProps } from '../headerBase';
import { headerDaoRoutes } from './headerDaoRoutes';

export interface IHeaderDaoProps extends IHeaderBaseProps {
    /**
     * DAO slug to display the data for.
     */
    slug: string;
}

export const HeaderDao: React.FC<IHeaderDaoProps> = (props) => {
    const { slug, className, ...otherProps } = props;

    const urlParams = { slug };
    const { data: dao } = useDao({ urlParams });

    const routes = headerDaoRoutes(dao?.permalink);

    return (
        <HeaderBase containerClasses={classNames('flex flex-col gap-2 pt-5', className)} {...otherProps}>
            <div className="flex flex-row justify-between">
                <button className="flex flex-row items-center gap-3 p-1">
                    <DaoAvatar src={dao?.avatar ?? undefined} size="md" />
                    <p className="text-base leading-tight text-neutral-800">{dao?.name}</p>
                </button>
                <div className="flex flex-row gap-2">
                    <Wallet />
                    <button className="rounded-full border border-neutral-100 bg-neutral-0 p-1">
                        <AvatarIcon icon={IconType.MENU} size="lg" />
                    </button>
                </div>
            </div>
            <Navigation routes={routes} />
        </HeaderBase>
    );
};
