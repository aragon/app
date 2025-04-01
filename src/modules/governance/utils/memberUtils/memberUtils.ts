import { governanceService } from '@/modules/governance/api/governanceService';
import { daoService } from '@/shared/api/daoService';
import type { IMemberPageParams } from '@/shared/types';
import { addressUtils } from '@aragon/gov-ui-kit';
import type { Metadata } from 'next';

export interface IGenerateMemberMetadataParams {
    /**
     * Path parameters of DAO pages.
     */
    params: Promise<IMemberPageParams>;
}

class ProposalUtils {
    generateMetadata = async ({ params }: IGenerateMemberMetadataParams): Promise<Metadata> => {
        const { id, address } = await params;

        const memberParams = { urlParams: { address }, queryParams: { daoId: id } };
        const member = await governanceService.getMember(memberParams);

        const dao = await daoService.getDao({ urlParams: { id } });

        return {
            authors: [{ name: 'Aragon', url: 'https://app.aragon.org' }],
            title: `Member - ${member.ens ?? addressUtils.truncateAddress(member.address)}`,
            description: `A ${dao.name} collaborator.`,

            openGraph: {
                title: `Member - ${member.ens ?? addressUtils.truncateAddress(member.address)}`,
                description: `A ${dao.name} collaborator.`,
                type: 'article',
            },
            twitter: {
                card: 'summary',
                title: `Member - ${member.ens ?? addressUtils.truncateAddress(member.address)}`,
                description: `A ${dao.name} collaborator.`,
            },
        };
    };
}

export const proposalUtils = new ProposalUtils();
