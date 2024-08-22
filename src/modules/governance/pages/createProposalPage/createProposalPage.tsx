import { Page } from '@/shared/components/page';
import { CreateProposalPageClient } from './createProposalPageClient';

export interface ICreateProposalPageProps {}

export const CreateProposalPage: React.FC<ICreateProposalPageProps> = () => {
    return (
        <Page.Container>
            <CreateProposalPageClient />
        </Page.Container>
    );
};
