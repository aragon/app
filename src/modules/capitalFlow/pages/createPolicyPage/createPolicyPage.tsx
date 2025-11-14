import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { CreatePolicyPageClient } from './createPolicyPageClient';

export interface ICreatePolicyPageParams extends IDaoPageParams {
    /**
     * Plugin address used to create a proposal for adding a new process.
     */
    pluginAddress: string;
}

export interface ICreatePolicyPageProps {
    /**
     * Parameters of the create policy page.
     */
    params: Promise<ICreatePolicyPageParams>;
}

export const CreatePolicyPage: React.FC<ICreatePolicyPageProps> = async (props) => {
    const { params } = props;
    const { addressOrEns, network, pluginAddress } = await params;
    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });

    return (
        <Page.Container>
            <CreatePolicyPageClient daoId={daoId} pluginAddress={pluginAddress} />
        </Page.Container>
    );
};
