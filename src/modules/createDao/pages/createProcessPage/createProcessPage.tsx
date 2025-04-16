import { Page } from '@/shared/components/page';
import type { ICreateProcessPageParams } from '../../types';
import { CreateProcessPageClient } from './createProcessPageClient';

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
