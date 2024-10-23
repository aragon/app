import type { IDaoPlugin } from '@/shared/api/daoService';
import { MemberDataListItem } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type { ITokenMember, ITokenPluginSettings } from '../../types';

export interface ITokenMemberListItemProps {
    /**
     * Member to display the information for.
     */
    member: ITokenMember;
    /**
     * ID of the DAO the user is member of.
     */
    daoId: string;
    /**
     * Plugin to display the member for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export const TokenMemberListItem: React.FC<ITokenMemberListItemProps> = (props) => {
    const { member, plugin, daoId } = props;

    const tokenDecimals = plugin.settings.token.decimals;
    const parsedVotingPower = formatUnits(BigInt(member.votingPower ?? '0'), tokenDecimals);

    return (
        <MemberDataListItem.Structure
            key={member.address}
            address={member.address}
            tokenAmount={parsedVotingPower}
            ensName={member.ens ?? undefined}
            className="min-w-0"
            href={`/dao/${daoId}/members/${member.address}`}
            delegationCount={member.metrics.delegateReceivedCount}
        />
    );
};
