import { QueryClient } from '@tanstack/react-query';
import {
    type ILayoutWizardProps,
    LayoutWizard,
} from '@/modules/application/components/layouts/layoutWizard';
import { daoOptions, type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { errorUtils } from '@/shared/utils/errorUtils';
import type { ICreateProposalPageParams } from '../../types';

export interface ILayoutWizardCreateProposalProps {
    /**
     * URL parameters of the create proposal page.
     */
    params: Promise<ICreateProposalPageParams>;
}

interface IWizardConfig {
    name: ILayoutWizardProps['name'];
    targetDaoAddress?: string;
}

const getWizardConfig = (dao: IDao, pluginAddress: string): IWizardConfig => {
    const processes = daoUtils.getDaoPlugins(dao, {
        type: PluginType.PROCESS,
        includeSubPlugins: false,
    })!;

    const processPlugin = processes.find(
        ({ address }) => address.toLowerCase() === pluginAddress.toLowerCase(),
    );

    const pluginName = processPlugin
        ? daoUtils.getPluginName(processPlugin)
        : '';

    const nameSuffix = processes.length > 1 ? 'namePlugin' : 'name';
    const wizardName: ILayoutWizardProps['name'] = [
        `app.governance.layoutWizardCreateProposal.${nameSuffix}`,
        { plugin: pluginName },
    ];

    // Get target DAO address from plugin (for subDAO targeting).
    // If plugin has daoAddress, it's installed on a subDAO; otherwise it's on main DAO.
    const targetDaoAddress = processPlugin?.daoAddress ?? dao.address;

    return { name: wizardName, targetDaoAddress };
};

export const LayoutWizardCreateProposal: React.FC<
    ILayoutWizardCreateProposalProps
> = async (props) => {
    const { params } = props;
    const { addressOrEns, network, pluginAddress } = await params;

    const queryClient = new QueryClient();
    let wizardConfig: IWizardConfig = { name: '' };

    const proposalsPageUrl = `/dao/${network}/${addressOrEns}/proposals/`;

    try {
        const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });
        const dao = await queryClient.fetchQuery(
            daoOptions({ urlParams: { id: daoId } }),
        );
        wizardConfig = getWizardConfig(dao, pluginAddress);
    } catch (error: unknown) {
        const parsedError = errorUtils.serialize(error);
        const errorNamespace =
            'app.governance.layoutWizardCreateProposal.error';

        return (
            <Page.Error
                actionLink={proposalsPageUrl}
                error={parsedError}
                errorNamespace={errorNamespace}
            />
        );
    }

    return (
        <LayoutWizard
            exitPath={proposalsPageUrl}
            name={wizardConfig.name}
            targetDaoAddress={wizardConfig.targetDaoAddress}
            {...props}
        />
    );
};
