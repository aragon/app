import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { CreateProcessPageClient } from './createProcessPageClient';

export interface ICreateProcessPageProps {
    /**
     * Parameters of the create process page.
     */
    params: Promise<IDaoPageParams>;
}

export const CreateProcessPage: React.FC<ICreateProcessPageProps> = async (props) => {
    const { params } = props;
    const { id } = await params;

    return (
        <Page.Container>
            <CreateProcessPageClient daoId={id} />
        </Page.Container>
    );
};
