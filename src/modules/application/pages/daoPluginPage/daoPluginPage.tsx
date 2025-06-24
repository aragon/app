import { daoOptions, type IDao } from '@/shared/api/daoService';
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

// The function retrieves the first plugin page slot component registered on the "application-plugin-page-[segments]"
// slot. During local development, an update to the server-side slot component or any of its sub-components will reset
// the plugin registry causing the page to fall back to the "not found" state. Adding a short delay and retrying allows
// the module system to properly reload the component.
const getPagePluginComponent = async (dao: IDao, segments: string[], retry?: boolean) => {
    const slotId = pluginRegistryUtils.getPageSlotId(ApplicationSlotId.APPLICATION_PLUGIN_PAGE, segments);
    const [Component] = dao.plugins.reduce<Array<PluginComponent | undefined>>((current, { subdomain }) => {
        const pluginComponent = pluginRegistryUtils.getSlotComponent({ slotId, pluginId: subdomain });

        return current.concat(pluginComponent ?? []);
    }, []);

    if (Component == null && retry) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return getPagePluginComponent(dao, segments);
    }

    return Component;
};

export const DaoPluginPage: React.FC<IDaoPluginPageProps> = async (props) => {
    const { params } = props;
    const { addressOrEns, network, segments } = await params;

    const queryClient = new QueryClient();

    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });
    const dao = await queryClient.fetchQuery(daoOptions({ urlParams: { id: daoId } }));

    const Component = await getPagePluginComponent(dao, segments, process.env.NEXT_PUBLIC_ENV === 'local');

    if (Component != null) {
        return <Component params={params} dao={dao} />;
    }

    return <NotFoundDao params={params} />;
};
