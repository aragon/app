import type { IDaoProposalListDefaultItemProps } from '@/modules/governance/components/daoProposalList';
import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import { type IMultisigProposal } from '@/plugins/multisigPlugin/types';
import { multisigProposalUtils } from '@/plugins/multisigPlugin/utils/multisigProposalUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ProposalDataListItem } from '@aragon/gov-ui-kit';

export interface IMultisigProposalListItemProps extends IDaoProposalListDefaultItemProps<IMultisigProposal> {}

export const MultisigProposalListItem: React.FC<IMultisigProposalListItemProps> = (props) => {
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
            status={multisigProposalUtils.getProposalStatus(proposal)}
            voted={userVote != null}
            publisher={{
                address: creator.address,
                name: creator.ens ?? undefined,
                link: `members/${creator.address}`,
            }}
        />
    );
};
