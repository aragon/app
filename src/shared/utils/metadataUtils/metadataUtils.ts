import { governanceService } from '@/modules/governance/api/governanceService';
import { daoService } from '@/shared/api/daoService';
import type { IDaoPageParams, IMemberPageParams, IProposalPageParams } from '@/shared/types';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { Metadata } from 'next';

export interface IGenerateDaoMetadataParams {
    /**
     * Path parameters of DAO pages.
     */
    params: Promise<IDaoPageParams>;
}

export interface IGenerateMemberMetadataParams {
    /**
     * Path parameters of member pages.
     */
    params: Promise<IMemberPageParams>;
}

export interface IGenerateProposalMetadataParams {
    /**
     * Path parameters of proposal pages.
     */
    params: Promise<IProposalPageParams>;
}

class MetadataUtils {
    generateDaoMetadata = async ({ params }: IGenerateDaoMetadataParams): Promise<Metadata> => {
        const { id } = await params;
        const dao = await this.getDao(id);
        const daoAvatarUrl = ipfsUtils.cidToSrc(dao.avatar);

        return {
            title: dao.name,
            description: dao.description,
            openGraph: { images: daoAvatarUrl ? [daoAvatarUrl] : undefined },
        };
    };

    generateMemberMetadata = async ({ params }: IGenerateMemberMetadataParams): Promise<Metadata> => {
        const { id, address } = await params;
        const [member, dao] = await Promise.all([this.getMember(id, address), this.getDao(id)]);

        const title = `Member - ${member.ens ?? member.address}`;
        const description = `${dao.name} - ${dao.description}`;

        return {
            authors: [{ name: 'Aragon', url: 'https://app.aragon.org' }],
            title,
            description,
            openGraph: { title, description, type: 'article' },
            twitter: { card: 'summary', title, description },
        };
    };

    generateProposalMetadata = async ({ params }: IGenerateProposalMetadataParams): Promise<Metadata> => {
        const { proposalSlug, id } = await params;
        const proposal = await this.getProposal(id, proposalSlug);
        const title = `${proposalSlug} - ${proposal.title}`;
        const description = proposal.description ?? '';

        return {
            authors: [{ name: 'Aragon', url: 'https://app.aragon.org' }],
            title,
            description,
            openGraph: { title, description, type: 'article' },
            twitter: {
                card: 'summary',
                title,
                description,
                creator: 'Aragon',
                creatorId: '@AragonProject',
            },
        };
    };

    private async getDao(id: string) {
        return daoService.getDao({ urlParams: { id } });
    }

    private async getMember(daoId: string, address: string) {
        return governanceService.getMember({
            urlParams: { address },
            queryParams: { daoId },
        });
    }

    private async getProposal(daoId: string, slug: string) {
        return governanceService.getProposalBySlug({
            urlParams: { slug },
            queryParams: { daoId },
        });
    }
}

export const metadataUtils = new MetadataUtils();
