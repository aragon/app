import { type ILayoutWizardProps, LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import { daoOptions, type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { QueryClient } from '@tanstack/react-query';
import { type Route } from 'next';
import type { ICreateProposalPageParams } from '../../types';

export interface ILayoutWizardCreateProposalProps {
    /**
     * URL parameters of the create proposal page.
     */
    params: ICreateProposalPageParams;
}

const getWizardName = (dao: IDao, pluginAddress: string): ILayoutWizardProps['name'] => {
    const processes = daoUtils.getDaoPlugins(dao, { type: PluginType.PROCESS, includeSubPlugins: false })!;

    const processPlugin = processes.find(({ address }) => address.toLowerCase() === pluginAddress.toLowerCase())!;
    const pluginName = daoUtils.getPluginName(processPlugin);

    const nameSuffix = processes.length > 1 ? 'namePlugin' : 'name';
    const wizardName: ILayoutWizardProps['name'] = [
        `app.governance.layoutWizardCreateProposal.${nameSuffix}`,
        { plugin: pluginName },
    ];

    return wizardName;
};

export const LayoutWizardCreateProposal: React.FC<ILayoutWizardCreateProposalProps> = async (props) => {
    const { params } = props;

    const queryClient = new QueryClient();
    let wizardName: ILayoutWizardProps['name'] = '';

    try {
        const { id, pluginAddress } = params;
        const dao = await queryClient.fetchQuery(daoOptions({ urlParams: { id } }));
        wizardName = getWizardName(dao, pluginAddress);
    } catch (error: unknown) {
        return (
            <Page.Error
                error={JSON.parse(JSON.stringify(error))}
                actionLink={`/dao/${props.params?.id}/proposals/`}
                notFoundNamespace="app.application.layoutWizard"
            />
        );
    }

    return <LayoutWizard name={wizardName} exitPath={`/dao/${props.params?.id}/proposals/` as Route} {...props} />;
};
