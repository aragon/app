import { Page } from '@/shared/components/page';
import { type IDaoMemberPageParams } from '../../types';
import { DaoMemberPageClient } from './daoMemberPageClient';

export interface IDaoMemberPageProps {
    /**
     * DAO member page parameters.
     */
    params: IDaoMemberPageParams;
}

export const DaoMemberPage: React.FC<IDaoMemberPageProps> = async (props) => {
    const { params } = props;

    return (
        <Page.Container>
            <DaoMemberPageClient address={params.address} daoId={params.id} />
        </Page.Container>
    );
};
