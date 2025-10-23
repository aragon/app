import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { addressUtils, ChainEntityType, DefinitionList, Tag, useBlockExplorer } from '@aragon/gov-ui-kit';
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
    /**
     * Token symbol for voting power display.
     */
    tokenSymbol: string;
    /**
     * MOCK DATA - User's votes on this gauge (temporary).
     */
    userVotes: number;
}

export const GaugeVoterGaugeDetailsDialogContent: React.FC<IGaugeVoterGaugeDetailsDialogContentProps> = (props) => {
    const { gauge, network, tokenSymbol, userVotes } = props;

    const { t } = useTranslations();

    const { buildEntityUrl } = useBlockExplorer({ chainId: networkDefinitions[network].id });
    const gaugeAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: gauge.address });

    // Use mock user votes passed from parent
    const hasVoted = userVotes > 0;

    // MOCK rewards calculation
    const mockRewards = getMockRewardsData();
    const userRewards = mockRewards.getUserRewards(userVotes);

    return (
        <div className="flex flex-col gap-y-4">
            <DefinitionList.Container>
                <DefinitionList.Item
                    term={t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.contract')}
                    copyValue={gauge.address}
                    link={{ href: gaugeAddressLink, isExternal: true }}
                >
                    {addressUtils.truncateAddress(gauge.address)}
                </DefinitionList.Item>
                {/* TODO: Backend returns links as a string, need to parse or update backend to return array */}
                {gauge.links && (
                    <DefinitionList.Item
                        term={t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.links')}
                        link={{ href: gauge.links, isExternal: true }}
                    >
                        {gauge.links}
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item
                    term={t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.totalRewards')}
                >
                    {mockRewards.totalRewards.toLocaleString()} {tokenSymbol}
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.yourRewards')}
                    description={t(
                        'app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.yourRewardsDescription',
                    )}
                >
                    {userRewards} {tokenSymbol}
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.haveYouVotedFor')}
                >
                    {hasVoted ? (
                        <Tag
                            variant="success"
                            label={t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.votedYes')}
                            className="w-fit"
                        />
                    ) : (
                        <Tag
                            variant="neutral"
                            label={t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.votedNo')}
                            className="w-fit"
                        />
                    )}
                </DefinitionList.Item>
            </DefinitionList.Container>
        </div>
    );
};
