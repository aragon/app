import type { IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';

export interface IEagleOpsDashboardHeaderProps {
    /**
     * The DAO to display the header for.
     */
    dao: IDao;
}

export const AragonXDashboardHeader: React.FC<IEagleOpsDashboardHeaderProps> = (props) => {
    const { dao } = props;

    return (
        <Page.Header title={dao.name}>
            <div className="text-lg font-semibold text-critical-400">custom content</div>
        </Page.Header>
    );
};
