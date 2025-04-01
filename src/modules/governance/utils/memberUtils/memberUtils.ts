import { governanceService } from '@/modules/governance/api/governanceService';
import { daoService } from '@/shared/api/daoService';
import type { IMemberPageParams } from '@/shared/types';
import type { Metadata } from 'next';

export interface IGenerateMemberMetadataParams {
    /**
     * Path parameters of DAO pages.
     */
    params: Promise<IMemberPageParams>;
}

class MemberUtils {
    generateMetadata = async ({ params }: IGenerateMemberMetadataParams): Promise<Metadata> => {
        const { id, address } = await params;

        const memberParams = { urlParams: { address }, queryParams: { daoId: id } };
        const member = await governanceService.getMember(memberParams);

        const dao = await daoService.getDao({ urlParams: { id } });

        return {
            authors: [{ name: 'Aragon', url: 'https://app.aragon.org' }],
            title: `Member - ${member.ens ?? member.address}`,
            description: `${dao.name} - ${dao.description}`,
            openGraph: {
                title: `Member - ${member.ens ?? member.address}`,
                description: `${dao.name} - ${dao.description}`,
                type: 'article',
            },
            twitter: {
                card: 'summary',
                title: `Member - ${member.ens ?? member.address}`,
                description: `${dao.name} - ${dao.description}`,
            },
        };
    };
}

export const memberUtils = new MemberUtils();
