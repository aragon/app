import { MemberDataListItem } from '@aragon/ods';
import { formatEther } from 'viem';
import type { ITokenMember } from '../../types/tokenMember';

export interface ITokenMemberListItemProps {
    /**
     * Member to display the information for.
     */
    member: ITokenMember;
}

export const TokenMemberListItem: React.FC<ITokenMemberListItemProps> = (props) => {
    const { member } = props;

    // TODO: use DAO token decimals
    const formattedVotingPower = formatEther(BigInt(member.votingPower));

    return (
        <MemberDataListItem.Structure
            key={member.address}
            address={member.address}
            // TODO: update member data list item component to support string
            votingPower={Number(formattedVotingPower)}
            ensName={member.ens ?? undefined}
            className="min-w-0"
        />
    );
};
