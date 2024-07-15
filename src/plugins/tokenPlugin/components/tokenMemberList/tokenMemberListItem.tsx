import { MemberDataListItem } from '@aragon/ods';
import { formatEther } from 'viem';
import type { ITokenMember } from '../../types';

export interface ITokenMemberListItemProps {
    /**
     * Member to display the information for.
     */
    member: ITokenMember;
}

export const TokenMemberListItem: React.FC<ITokenMemberListItemProps> = (props) => {
    const { member } = props;

    // TODO: use DAO token decimals (APP-3323)
    const parsedVotingPower = member?.votingPower != null ? formatEther(BigInt(member.votingPower)) : undefined;

    return (
        <MemberDataListItem.Structure
            key={member.address}
            address={member.address}
            votingPower={parsedVotingPower}
            ensName={member.ens ?? undefined}
            className="min-w-0"
        />
    );
};
