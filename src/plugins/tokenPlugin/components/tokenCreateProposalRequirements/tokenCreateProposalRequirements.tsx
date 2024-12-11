import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { IUsePluginMemberStatsParams } from '@/modules/governance/types';
import { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { type ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { DefinitionList } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';

export interface ITokenCreateProposalParams {
    /**
     * Name of the multisig.
     */
    plugin: ITabComponentPlugin<IDaoPlugin<ITokenPluginSettings>>;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface ITokenCreateProposalProps extends ITokenCreateProposalParams {}

export const TokenCreateProposalRequirements: React.FC<ITokenCreateProposalProps> = (props) => {
    const { plugin } = props;
    const { address } = useAccount();

    const { data: dao } = useDao({ urlParams: { id: props.daoId } });

    const memberStatsParams = { daoId: dao!.id, address: address as string, plugin: plugin };
    const pluginStats = useSlotSingleFunction<IUsePluginMemberStatsParams, IPageHeaderStat[]>({
        params: memberStatsParams,
        slotId: GovernanceSlotId.GOVERNANCE_MEMBER_STATS,
        pluginId: dao?.plugins[0]?.subdomain ?? '',
    });

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term="Name">{plugin.meta.name ?? dao?.name}</DefinitionList.Item>
            <DefinitionList.Item term="Proposal creation">
                {plugin.meta.settings.minParticipation} {plugin.meta.settings.token.symbol}
            </DefinitionList.Item>
            <DefinitionList.Item term="Voting power">{plugin.meta.settings.token.symbol}</DefinitionList.Item>
            <DefinitionList.Item term="Token balance">{plugin.meta.settings.token.symbol}</DefinitionList.Item>
        </DefinitionList.Container>
    );
};
