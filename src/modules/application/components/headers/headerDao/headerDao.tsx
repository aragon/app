import { AvatarIcon, DaoAvatar, type IconType } from '@aragon/ods';
import { Navigation } from '../../navigation';
import { Wallet } from '../../wallet';
import { HeaderBase } from '../headerBase';
import { headerDaoRoutes } from './headerDaoRoutes';

export interface IHeaderDaoProps {}

export const HeaderDao: React.FC<IHeaderDaoProps> = () => {
    const daoSlug = 'patito-dao';
    const routes = headerDaoRoutes(daoSlug);

    return (
        <HeaderBase className="flex flex-col gap-2 pt-5">
            <div className="flex flex-row justify-between">
                <button className="flex flex-row items-center gap-3 p-1">
                    <DaoAvatar
                        src="https://seeklogo.com/images/E/ethereum-logo-EC6CDBA45B-seeklogo.com.png"
                        size="md"
                    />
                    <p className="text-base leading-tight text-neutral-800">Patito DAO</p>
                </button>
                <div className="flex flex-row gap-2">
                    <Wallet />
                    <button className="rounded-full border border-neutral-100 bg-neutral-0 p-1">
                        <AvatarIcon icon={'MENU' as IconType} size="lg" />
                    </button>
                </div>
            </div>
            <Navigation routes={routes} />
        </HeaderBase>
    );
};
