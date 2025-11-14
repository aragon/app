import { Page } from '@/shared/components/page';
import { CreatePolicyPageClient } from './createPolicyPageClient';

export interface ICreatePolicyPageProps {}

export const CreatePolicyPage: React.FC<ICreatePolicyPageProps> = () => {
    return (
        <Page.Container>
            <CreatePolicyPageClient />
        </Page.Container>
    );
};
