import type { IGetDaoListParams } from '../../api/daoExplorerService';
import { DaoList } from '../../components/daoList';

export interface IExploreDaosPageClientProps {
    /**
     * Initial parameters to use to fetch the list of DAOs.
     */
    initialParams: IGetDaoListParams;
}

export const ExploreDaosPageClient: React.FC<IExploreDaosPageClientProps> = (props) => {
    const { initialParams } = props;

    return <DaoList initialParams={initialParams} />;
};
