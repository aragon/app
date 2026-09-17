import { QueryClient } from '@tanstack/react-query';
import type { Route } from 'next';
import { unstable_rethrow } from 'next/navigation-server';
import { LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import { daoOptions, type Network } from '@/shared/api/daoService';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';

export interface ICreatePolicyPageParams {
    addressOrEns: string;
    network: Network;
    pluginAddress: string;
}

export interface ILayoutWizardCreatePolicyProps {
    /**
     * URL parameters of the create policy page.
     */
    params: Promise<ICreatePolicyPageParams>;
}

export const LayoutWizardCreatePolicy: React.FC<
    ILayoutWizardCreatePolicyProps
> = async (props) => {
    const { params } = props;
    const { addressOrEns, network, pluginAddress } = await params;

    const queryClient = new QueryClient();
    let targetDaoAddress: string | undefined;

    try {
        const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });
        const dao = await queryClient.fetchQuery(
            daoOptions({ urlParams: { id: daoId } }),
        );

        const processes = daoUtils.getDaoPlugins(dao, {
            type: PluginType.PROCESS,
            includeSubPlugins: false,
            includeLinkedAccounts: true,
        });

        const processPlugin = processes?.find(
            ({ address }) =>
                address.toLowerCase() === pluginAddress.toLowerCase(),
        );

        targetDaoAddress = processPlugin?.daoAddress ?? dao.address;
    } catch (error: unknown) {
        // A malformed DAO URL ends in notFound() inside resolveDaoId; let Next render the 404
        // page. Any other fetch failure leaves targetDaoAddress undefined and LayoutWizard
        // falls back to the main DAO.
        unstable_rethrow(error);
    }

    return (
        <LayoutWizard
            exitPath={`/dao/${network}/${addressOrEns}/settings` as Route}
            name="app.capitalFlow.layoutWizardCreatePolicy.name"
            targetDaoAddress={targetDaoAddress}
            {...props}
        />
    );
};
