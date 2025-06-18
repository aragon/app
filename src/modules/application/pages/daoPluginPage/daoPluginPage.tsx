import { daoOptions } from '@/shared/api/daoService';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { type PluginComponent, pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { QueryClient } from '@tanstack/react-query';
import { NotFoundDao } from '../../components/notFound/notFoundDao';
import { ApplicationSlotId } from '../../constants/moduleSlots';

export interface IPluginPageParams extends IDaoPageParams {
    /**
     * URL segments of the DAO page.
     */
    segments: string[];
}

export interface IDaoPluginPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IPluginPageParams>;
}

export const DaoPluginPage: React.FC<IDaoPluginPageProps> = async (props) => {
    const { params } = props;
    const { addressOrEns, network, segments } = await params;

    const queryClient = new QueryClient();

    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });
    const daoParams = { urlParams: { id: daoId } };
    const dao = await queryClient.fetchQuery(daoOptions(daoParams));

    const slotId = pluginRegistryUtils.getPageSlotId(ApplicationSlotId.APPLICATION_PLUGIN_PAGE, segments);
    const [Component] = dao.plugins.reduce<Array<PluginComponent | undefined>>((current, plugin) => {
        const pluginComponent = pluginRegistryUtils.getSlotComponent({ slotId, pluginId: plugin.subdomain });
        return current.concat(pluginComponent ?? []);
    }, []);

    if (Component != null) {
        return <Component params={params} />;
    }

    return <NotFoundDao params={params} />;
};
