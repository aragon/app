import { Page } from '@/shared/components/page';
import { CreateDaoPageClient } from './createDaoPageClient';

export interface ICreateDaoPageProps {}

export const CreateDaoPage: React.FC<ICreateDaoPageProps> = () => (
    <Page.Container>
        <CreateDaoPageClient />
    </Page.Container>
);
