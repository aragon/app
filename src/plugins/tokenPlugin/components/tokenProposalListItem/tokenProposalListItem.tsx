import type { IDaoProposalListDefaultItemProps } from '@/modules/governance/components/daoProposalList';
import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import type { ITokenProposal } from '@/plugins/tokenPlugin/types';
import { tokenProposalUtils } from '@/plugins/tokenPlugin/utils/tokenProposalUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ProposalDataListItem } from '@aragon/gov-ui-kit';

export interface ITokenProposalListItemProps extends IDaoProposalListDefaultItemProps<ITokenProposal> {}

export const TokenProposalListItem: React.FC<ITokenProposalListItemProps> = (props) => {
    const { proposal, dao, proposalSlug } = props;

    const { id, title, summary, executed, endDate, creator } = proposal;

    const userVote = useUserVote({ proposal });
    const proposalDate = (executed.blockTimestamp ?? endDate) * 1000;

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={id}
            title={title}
            summary={summary}
            date={proposalDate}
            href={daoUtils.getDaoUrl(dao, `proposals/${proposalSlug}`)}
            status={tokenProposalUtils.getProposalStatus(proposal)}
            voted={userVote != null}
            publisher={{
                address: creator.address,
                link: `members/${creator.address}`,
                name: creator.ens ?? undefined,
            }}
        />
    );
};
