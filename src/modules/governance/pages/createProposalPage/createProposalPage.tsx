import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { CreateProposalPageClient } from './createProposalPageClient';

export interface ICreateProposalPageParams extends IDaoPageParams {
    /**
     * Address of the plugin to create the proposal for.
     */
    pluginAddress: string;
}

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
