import { QueryClient } from '@tanstack/react-query';
import { type ILayoutWizardProps, LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import { daoOptions, type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { ICreateProposalPageParams } from '../../types';

export interface ILayoutWizardCreateProposalProps {
    /**
     * URL parameters of the create proposal page.
     */
    params: Promise<ICreateProposalPageParams>;
}

const getWizardName = (dao: IDao, pluginAddress: string): ILayoutWizardProps['name'] => {
    const processes = daoUtils.getDaoPlugins(dao, { type: PluginType.PROCESS, includeSubPlugins: false })!;

    const processPlugin = processes.find(({ address }) => address.toLowerCase() === pluginAddress.toLowerCase())!;
    const pluginName = daoUtils.getPluginName(processPlugin);

    const nameSuffix = processes.length > 1 ? 'namePlugin' : 'name';
    const wizardName: ILayoutWizardProps['name'] = [`app.governance.layoutWizardCreateProposal.${nameSuffix}`, { plugin: pluginName }];

    return wizardName;
};

export const LayoutWizardCreateProposal: React.FC<ILayoutWizardCreateProposalProps> = async (props) => {
    const { params } = props;
    const { addressOrEns, network, pluginAddress } = await params;

    const queryClient = new QueryClient();
    let wizardName: ILayoutWizardProps['name'] = '';

    const proposalsPageUrl = `/dao/${network}/${addressOrEns}/proposals/`;

    try {
        const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });
        const dao = await queryClient.fetchQuery(daoOptions({ urlParams: { id: daoId } }));
        wizardName = getWizardName(dao, pluginAddress);
    } catch (error: unknown) {
        const parsedError = JSON.parse(JSON.stringify(error)) as unknown;
        const errorNamespace = 'app.governance.layoutWizardCreateProposal.error';

        return <Page.Error actionLink={proposalsPageUrl} error={parsedError} errorNamespace={errorNamespace} />;
    }

    return <LayoutWizard exitPath={proposalsPageUrl} name={wizardName} {...props} />;
};
