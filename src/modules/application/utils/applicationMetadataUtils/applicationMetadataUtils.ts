import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { daoService } from '@/shared/api/daoService';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { metadataUtils } from '@/shared/utils/metadataUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { networkUtils } from '@/shared/utils/networkUtils';

export interface IGenerateDaoMetadataParams {
    /**
     * Path parameters of DAO pages.
     */
    params: Promise<IDaoPageParams>;
}

class ApplicationMetadataUtils {
    generateDaoMetadata = async ({
        params,
    }: IGenerateDaoMetadataParams): Promise<Metadata> => {
        try {
            const daoPageParams = await params;

            if (!networkUtils.isValidNetwork(daoPageParams.network)) {
                // A bad network param is almost always external bot/scanner traffic, but
                // when the referer is our own app it signals a broken internal link worth
                // fixing. Tag both via `noise_class` so they route out of the default alert
                // stream (internal-broken-link → triage, security-probe → security review).
                const referer = (await headers()).get('referer') ?? '';
                const isInternalLink = referer.includes('aragon.org');

                monitoringUtils.logMessage('Invalid DAO URL', {
                    level: isInternalLink ? 'warning' : 'info',
                    context: {
                        network: daoPageParams.network,
                        addressOrEns: daoPageParams.addressOrEns,
                        referer,
                        noise_class: isInternalLink
                            ? 'internal-broken-link'
                            : 'security-probe',
                    },
                });

                return metadataUtils.buildMetadata({
                    title: 'Invalid DAO URL',
                    description: 'We don’t support DAOs on that network.',
                });
            }

            const daoId = await daoUtils.resolveDaoId(daoPageParams);
            const dao = await daoService.getDao({ urlParams: { id: daoId } });

            const image = ipfsUtils.cidToSrc(dao.avatar);
            const title = dao.name;
            const description = dao.description;
            const siteName = `${dao.name} | Governed on Aragon`;

            return metadataUtils.buildMetadata({
                title,
                description,
                siteName,
                image,
            });
        } catch (error: unknown) {
            // Suppress notFound / pluginNotFound: the page renders an empty/404 state
            // for arbitrary URLs (bots, stale links to removed plugins) — not bugs, and
            // would flood Sentry.
            if (!AragonBackendServiceError.isExpectedNotFoundError(error)) {
                monitoringUtils.logError(error);
            }

            return metadataUtils.buildMetadata({
                title: 'DAO not found',
                description: 'The requested DAO could not be found.',
            });
        }
    };
}

export const applicationMetadataUtils = new ApplicationMetadataUtils();
