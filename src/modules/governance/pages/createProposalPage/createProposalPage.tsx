import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
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
    const { id, network, pluginAddress } = await params;
    const daoId = await daoUtils.resolveDaoId({ id, network });

    return (
        <Page.Container>
            <CreateProposalPageClient daoId={daoId} pluginAddress={pluginAddress} />
        </Page.Container>
    );
};
