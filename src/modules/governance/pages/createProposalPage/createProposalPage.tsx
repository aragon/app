import { Page } from '@/shared/components/page';
import type { ICreateProposalPageParams } from '../../types';
import { CreateProposalPageClient } from './createProposalPageClient';

export interface ICreateProposalPageProps {
    /**
     * DAO page parameters.
     */
    params: ICreateProposalPageParams;
}

export const CreateProposalPage: React.FC<ICreateProposalPageProps> = (props) => {
    const { id, pluginAddress } = props.params;

    return (
        <Page.Container>
            <CreateProposalPageClient daoId={id} pluginAddress={pluginAddress} />
        </Page.Container>
    );
};
