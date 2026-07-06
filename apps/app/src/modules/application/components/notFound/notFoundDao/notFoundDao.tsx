import type { IDaoPageParams } from '@/shared/types';
import { NotFoundDaoError } from './notFoundDaoError';

export interface INotFoundDaoProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
}

export const NotFoundDao: React.FC<INotFoundDaoProps> = async (props) => {
    const { params } = props;
    const { network, addressOrEns } = await params;

    const dashboardUrl = `/dao/${network}/${addressOrEns}/dashboard`;

    return (
        <div className="flex grow items-center justify-center">
            <NotFoundDaoError url={dashboardUrl} />
        </div>
    );
};
