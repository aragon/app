import { Page } from '@/shared/components/page';
import { daoUtils } from '../../../../shared/utils/daoUtils';
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
    const { addressOrEns, network, pluginAddress } = await params;
    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });

    return (
        <Page.Container>
            <CreateProcessPageClient daoId={daoId} pluginAddress={pluginAddress} />
        </Page.Container>
    );
};
