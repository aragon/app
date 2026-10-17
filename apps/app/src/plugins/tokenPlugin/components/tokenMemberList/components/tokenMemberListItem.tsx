import type { TokenVotingMemberDTO } from '@aragon/aragon-domain';
import { MemberDataListItem } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { useEnsAvatar, useEnsName } from '@/modules/ens';
import { daoMemberSourceUtils } from '@/modules/governance/utils/daoMemberSourceUtils';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { bigIntUtils } from '@/shared/utils/bigIntUtils';
import type { ITokenMemberListPluginSettings } from '../tokenMemberListBase';

export interface ITokenMemberListItemProps {
    /**
     * Member to display the information for.
     */
    member: TokenVotingMemberDTO;
    /**
     * ID of the DAO the user is member of.
     */
    daoId: string;
    /**
     * Plugin to display the member for.
     */
    plugin: IDaoPlugin<ITokenMemberListPluginSettings>;
    /**
     * Selected member source to preserve on the details route.
     */
    memberSourceId?: string;
    /**
     * Whether the member is the current user's delegate.
     */
    isDelegate?: boolean;
}

export const TokenMemberListItem: React.FC<ITokenMemberListItemProps> = (
    props,
) => {
    const { member, plugin, daoId, isDelegate, memberSourceId } = props;

    const tokenDecimals = plugin.settings.token.decimals;
    const parsedVotingPower = formatUnits(
        bigIntUtils.safeParse(member.votingPower),
        tokenDecimals,
    );
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { data: ensName } = useEnsName(member.address);
    const { data: ensAvatar } = useEnsAvatar(ensName);
    const { data: displayName } = useEnsName(member.address, {
        stripAragonRegistrySuffix: true,
    });

    return (
        <MemberDataListItem.Structure
            address={member.address}
            avatarSrc={ensAvatar ?? undefined}
            className="min-w-0"
            delegationCount={member.delegationCount}
            ensName={displayName ?? undefined}
            href={daoMemberSourceUtils.getMemberUrl(
                dao,
                member.address,
                memberSourceId,
            )}
            isDelegate={isDelegate}
            key={member.address}
            tokenAmount={parsedVotingPower}
        />
    );
};
