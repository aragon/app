import type { IDao } from '@/shared/api/daoService';
import { NavigationAppLinksLegacy } from './navigationAppLinksLegacy';

export interface INavigationAppLinksProps {
    /**
     * The DAO to enable us to navigate to the correct dao dashboard in the legacy app.
     */
    dao?: IDao;
}

export const NavigationAppLinks: React.FC<INavigationAppLinksProps> = (props) => {
    const { dao } = props;

    return (
        <div className="flex items-center gap-2">
            <NavigationAppLinksLegacy dao={dao} />
        </div>
    );
};
