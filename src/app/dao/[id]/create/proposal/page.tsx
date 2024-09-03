import { CreateProposalPage } from '@/modules/governance/pages/createProposalPage';
import { type IDaoPageParams } from '@/shared/types';

export interface ICreateProposalPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

const CreateProposal: React.FC<ICreateProposalPageProps> = (props) => {
    const { params } = props;
    return <CreateProposalPage params={params} />;
};

export default CreateProposal;
