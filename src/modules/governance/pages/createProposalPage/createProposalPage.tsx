import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { CreateProposalPageClient } from './createProposalPageClient';

export interface ICreateProposalPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

export const CreateProposalPage: React.FC<ICreateProposalPageProps> = (props) => {
    const { id } = props.params;

    return (
        <Page.Container>
            <CreateProposalPageClient daoId={id} />
        </Page.Container>
    );
};
