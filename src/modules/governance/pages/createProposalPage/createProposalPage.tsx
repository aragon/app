import { Page } from '@/shared/components/page';
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
    const { id, pluginAddress } = await params;

    return (
        <Page.Container>
            <CreateProposalPageClient daoId={id} pluginAddress={pluginAddress} />
        </Page.Container>
    );
};
