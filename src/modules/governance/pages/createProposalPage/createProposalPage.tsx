import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ActionsProvider } from '../../components/createProposalForm/actionsProvider';
import type { ICreateProposalPageParams } from '../../types';
import { CreateProposalPageClient } from './createProposalPageClient';

export interface ICreateProposalPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<ICreateProposalPageParams>;
}

export const CreateProposalPage: React.FC<ICreateProposalPageProps> = async (props) => {
    const { params } = props;
    const { addressOrEns, network, pluginAddress } = await params;
    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });

    return (
        <Page.Container>
            <ActionsProvider>
                <CreateProposalPageClient daoId={daoId} pluginAddress={pluginAddress} />
            </ActionsProvider>
        </Page.Container>
    );
};
