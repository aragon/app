import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { addressUtils, ChainEntityType, Collapsible, DefinitionList, Tag, useBlockExplorer } from '@aragon/gov-ui-kit';
import type { IGauge } from '../../../api/gaugeVoterService/domain';

export interface IGaugeVoterGaugeDetailsDialogContentProps {
    /**
     * The gauge to display details for.
     */
    gauge: IGauge;
    /**
     * Network of the DAO.
     */
    network: Network;
}

export const GaugeVoterGaugeDetailsDialogContent: React.FC<IGaugeVoterGaugeDetailsDialogContentProps> = (props) => {
    const { gauge, network } = props;

    const { t } = useTranslations();

    const { buildEntityUrl } = useBlockExplorer({ chainId: networkDefinitions[network].id });
    const gaugeAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: gauge.address });

    const votedFor = Math.random() > 0.5;

    return (
        <div className="flex flex-col gap-y-4">
            <Collapsible collapsedLines={2} buttonLabelOpened="Read less" buttonLabelClosed="Read more">
                <p className="text-neutral-500">{gauge.description}</p>
            </Collapsible>
            <DefinitionList.Container>
                <DefinitionList.Item
                    term={t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.contract')}
                    copyValue={gauge.address}
                    link={{ href: gaugeAddressLink, isExternal: true }}
                >
                    {addressUtils.truncateAddress(gauge.address)}
                </DefinitionList.Item>
                {gauge.resources.map((item) => (
                    <DefinitionList.Item key={item.url} term={item.name} link={{ href: item.url, isExternal: true }}>
                        {item.url}
                    </DefinitionList.Item>
                ))}
                <DefinitionList.Item
                    term={t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.totalRewards')}
                >
                    420.69k PDT
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.yourRewards')}
                    description={t(
                        'app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.yourRewardsDescription',
                    )}
                >
                    120 PDT
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.haveYouVotedFor')}
                >
                    <Tag
                        variant={votedFor ? 'success' : 'neutral'}
                        label={
                            votedFor
                                ? t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.votedYes')
                                : t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.votedNo')
                        }
                        className="w-fit"
                    />
                </DefinitionList.Item>
            </DefinitionList.Container>
        </div>
    );
};
