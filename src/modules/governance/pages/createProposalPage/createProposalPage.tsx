import { Page } from '@/shared/components/page';
import { CreateProposalPageClient } from './createProposalPageClient';

export interface ICreateProposalPageProps {
    /**
     * The DAO ID.
     */
    daoId: string;
}

export const CreateProposalPage: React.FC<ICreateProposalPageProps> = ({ daoId }) => {
    return (
        <Page.Container>
            <CreateProposalPageClient daoId={daoId} />
        </Page.Container>
    );
};
