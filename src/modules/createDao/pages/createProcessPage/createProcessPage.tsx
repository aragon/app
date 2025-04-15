import { Page } from '@/shared/components/page';
import { CreateProcessPageClient } from './createProcessPageClient';

export interface ICreateProcessPageParams {
    /**
     * ID of the DAO.
     */
    id: string;
    /**
     * Plugin address used to create a proposal for adding a new process.
     */
    pluginAddress: string;
}

export interface ICreateProcessPageProps {
    /**
     * Parameters of the create process page.
     */
    params: Promise<ICreateProcessPageParams>;
}

export const CreateProcessPage: React.FC<ICreateProcessPageProps> = async (props) => {
    const { params } = props;
    const { id, pluginAddress } = await params;

    return (
        <Page.Container>
            <CreateProcessPageClient daoId={id} pluginAddress={pluginAddress} />
        </Page.Container>
    );
};
