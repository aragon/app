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
                let isInternalLink = false;

                try {
                    const refererHost = new URL(referer).hostname.toLowerCase();
                    isInternalLink =
                        refererHost === 'aragon.org' ||
                        refererHost.endsWith('.aragon.org');
                } catch {
                    isInternalLink = false;
                }

                monitoringUtils.logMessage('Invalid DAO URL', {
                    level: isInternalLink ? 'warning' : 'info',
                    noiseClass: isInternalLink
                        ? 'internal-broken-link'
                        : 'security-probe',
                    context: {
                        network: daoPageParams.network,
                        addressOrEns: daoPageParams.addressOrEns,
                        referer,
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
            // Suppress the errors that mean the URL points at nothing: the address/ENS comes
            // straight from the URL, so a rejected identifier means an arbitrary URL (bots,
            // stale links, malformed addresses) — not a bug, and would flood Sentry. A refused
            // request (401/403/429) is a different story and still gets reported.
            if (
                !AragonBackendServiceError.isExpectedNotFoundError(error) &&
                !AragonBackendServiceError.isUnresolvableResourceError(error)
            ) {
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
