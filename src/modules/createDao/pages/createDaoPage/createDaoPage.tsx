import { Page } from '@/shared/components/page';
import { CreateDaoPageClient } from './createDaoPageClient';

export interface ICreateDaoPageProps {}

export const CreateDaoPage: React.FC<ICreateDaoPageProps> = () => {
    return (
        <Page.Container>
            <CreateDaoPageClient />
        </Page.Container>
    );
};
