'use client';

import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';
import { errorUtils } from '@/shared/utils/errorUtils';
import type { IGetGaugeListParams } from '../../api/gaugeVoterService';
import type { IGaugeVoterPlugin } from '../../types';
import { GaugeVoterGaugesPageContent } from './gaugeVoterGaugesPageContent';

export interface IGaugeVoterGaugesPageClientProps {
    /**
     * The DAO with the capital-distributor plugin installed.
     */
    dao: IDao;
    /**
     * Initial parameters for the campaign list query.
     */
    initialParams: IGetGaugeListParams;
}

export const GaugeVoterGaugesPageClient: React.FC<
    IGaugeVoterGaugesPageClientProps
> = (props) => {
    const { dao, initialParams } = props;

    // There are possible multiple gaugeVoter plugins, but we don't support it currently (so we display only the first one).
    const plugins = useDaoPlugins({
        daoId: dao.id,
        interfaceType: PluginInterfaceType.GAUGE_VOTER,
        includeLinkedAccounts: false,
    }) as IFilterComponentPlugin<IGaugeVoterPlugin>[] | undefined;
    const plugin = plugins?.[0];

    // Undefined only when the DAO carries no gauge voter plugin the app can render: the DAO
    // layout dehydrates the DAO into this tree, so the lookup is already resolved on the first
    // render. Render the not-found state instead of dereferencing a missing plugin.
    if (plugin == null) {
        const pluginNotFoundError = new AragonBackendServiceError(
            AragonBackendServiceError.pluginNotFoundCode,
            `GaugeVoterGaugesPageClient: no gauge voter plugin found for DAO ${dao.id}`,
            404,
        );

        return (
            <Page.Error
                actionLink={daoUtils.getDaoUrl(dao, 'dashboard')}
                error={errorUtils.serialize(pluginNotFoundError)}
                errorNamespace="app.plugins.gaugeVoter.gaugeVoterGaugesPage.error"
            />
        );
    }

    return (
        <GaugeVoterGaugesPageContent
            dao={dao}
            initialParams={initialParams}
            plugin={plugin}
        />
    );
};
