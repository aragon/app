import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { daoService } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IDaoProcessDetailsPageParams } from '../../types';
import { DaoProcessDetailsPageClient } from './daoProcessDetailsPageClient';

export interface IDaoProcessDetailsPageProps {
    /**
     * DAO member page parameters.
     */
    params: Promise<IDaoProcessDetailsPageParams>;
}

export const DaoProcessDetailsPage: React.FC<IDaoProcessDetailsPageProps> = async (props) => {
    const { params } = props;
    const { slug, addressOrEns, network } = await params;

    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });
    const dao = await daoService.getDao({ urlParams: { id: daoId } });

    const plugins = daoUtils.getDaoPlugins(dao, {
        slug: slug.toLowerCase(),
        type: PluginType.PROCESS,
        includeSubPlugins: true,
    });

    if (!plugins || plugins.length === 0) {
        const error = new AragonBackendServiceError(AragonBackendServiceError.notFoundCode, 'Process not found', 404);
        const parsedError = JSON.parse(JSON.stringify(error)) as unknown;
        const errorNamespace = 'app.settings.daoProcessDetailsPage.error';
        const actionLink = `/dao/${network}/${addressOrEns}/settings`;

        return <Page.Error error={parsedError} actionLink={actionLink} errorNamespace={errorNamespace} />;
    }

    return (
        <Page.Container>
            <DaoProcessDetailsPageClient slug={slug} daoId={daoId} />
        </Page.Container>
    );
};
