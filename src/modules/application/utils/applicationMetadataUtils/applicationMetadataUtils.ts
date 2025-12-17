import type { Metadata } from 'next';
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
    generateDaoMetadata = async ({ params }: IGenerateDaoMetadataParams): Promise<Metadata> => {
        try {
            const daoPageParams = await params;

            if (!networkUtils.isValidNetwork(daoPageParams.network)) {
                monitoringUtils.logMessage('Invalid DAO URL', {
                    context: {
                        network: daoPageParams.network,
                        addressOrEns: daoPageParams.addressOrEns,
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
            monitoringUtils.logError(error);

            return metadataUtils.buildMetadata({
                title: 'DAO not found',
                description: 'The requested DAO could not be found.',
            });
        }
    };
}

export const applicationMetadataUtils = new ApplicationMetadataUtils();
