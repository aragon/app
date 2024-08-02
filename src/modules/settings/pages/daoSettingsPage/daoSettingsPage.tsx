import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { DaoSettingsPageClient } from './daoSettingsPageClient';

export interface IDaoSettingsPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

export const DaoSettingsPage: React.FC<IDaoSettingsPageProps> = async (props) => {
    const { params } = props;
    return (
        <Page.Container>
            <Page.Content>
                <DaoSettingsPageClient daoId={params.id} />
            </Page.Content>
        </Page.Container>
    );
};
