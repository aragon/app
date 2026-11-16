import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { CreateExecuteActionsPageClient } from './createExecuteActionsPageClient';

export interface ICreateExecuteActionsPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
    /**
     * Redirect target when the wallet lacks the execute permission. Defaults to the transactions of the DAO.
     */
    exitPath?: string;
}

export const CreateExecuteActionsPage: React.FC<
    ICreateExecuteActionsPageProps
> = async (props) => {
    const { params, exitPath } = props;
    const { addressOrEns, network } = await params;
    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });

    return (
        <Page.Container>
            <CreateExecuteActionsPageClient daoId={daoId} exitPath={exitPath} />
        </Page.Container>
    );
};
