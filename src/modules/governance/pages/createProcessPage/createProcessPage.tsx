import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { CreateProcessPageClient } from './createProcessPageClient';

export interface ICreateProcessPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

export const CreateProcessPage: React.FC<ICreateProcessPageProps> = (props) => {
    const { id } = props.params;

    return (
        <Page.Container>
            <CreateProcessPageClient daoId={id} />
        </Page.Container>
    );
};
