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
     * URL of the DAO the user is member of.
     */
    daoUrl: string;
    /**
     * Plugin to display the member for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export const TokenMemberListItem: React.FC<ITokenMemberListItemProps> = (props) => {
    const { member, plugin, daoUrl } = props;

    const tokenDecimals = plugin.settings.token.decimals;
    const parsedVotingPower = formatUnits(BigInt(member.votingPower ?? '0'), tokenDecimals);

    return (
        <MemberDataListItem.Structure
            key={member.address}
            address={member.address}
            tokenAmount={parsedVotingPower}
            ensName={member.ens ?? undefined}
            className="min-w-0"
            href={`${daoUrl}/members/${member.address}`}
            delegationCount={member.metrics.delegateReceivedCount}
        />
    );
};
