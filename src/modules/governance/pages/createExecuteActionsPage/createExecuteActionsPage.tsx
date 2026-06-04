import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { CreateExecuteActionsPageClient } from './createExecuteActionsPageClient';

export interface ICreateExecuteActionsPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
}

export const CreateExecuteActionsPage: React.FC<
    ICreateExecuteActionsPageProps
> = async (props) => {
    const { params } = props;
    const { addressOrEns, network } = await params;
    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });

    return (
        <Page.Container>
            <CreateExecuteActionsPageClient daoId={daoId} />
        </Page.Container>
    );
};
