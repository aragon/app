import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { DaoSettingsPageClient } from './daoSettingsPageClient';

export interface IDaoSettingsPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
}

export const DaoSettingsPage: React.FC<IDaoSettingsPageProps> = async (props) => {
    const { params } = props;
    const { id: daoId } = await params;

    return (
        <Page.Container>
            <Page.Content>
                <DaoSettingsPageClient daoId={daoId} />
            </Page.Content>
        </Page.Container>
    );
};
