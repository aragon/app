'use client';

import { useDao } from '@/shared/api/daoService';
import { AvatarIcon, DaoAvatar, IconType } from '@aragon/ods';
import classNames from 'classnames';
import { NavigationLinks } from '../../navigationLinks';
import { Wallet } from '../../wallet';
import { NavigationBase, type INavigationBaseProps } from '../navigationBase';
import { navigationDaoLinks } from './navigationDaoLinks';

export interface INavigationDaoProps extends INavigationBaseProps {
    /**
     * DAO slug to display the data for.
     */
    slug: string;
}

export const NavigationDao: React.FC<INavigationDaoProps> = (props) => {
    const { slug, containerClasses, ...otherProps } = props;

    const urlParams = { slug };
    const { data: dao } = useDao({ urlParams });

    const links = navigationDaoLinks(dao?.permalink);

    return (
        <NavigationBase containerClasses={classNames('flex flex-col gap-2 pt-5', containerClasses)} {...otherProps}>
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
            <NavigationLinks links={links} />
        </NavigationBase>
    );
};
