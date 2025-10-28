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
     * User's votes on this gauge from blockchain.
     */
    userVotes: number;
}

export const GaugeVoterGaugeDetailsDialogContent: React.FC<IGaugeVoterGaugeDetailsDialogContentProps> = (props) => {
    const { gauge, network, tokenSymbol, userVotes } = props;

    const { t } = useTranslations();

    const { buildEntityUrl } = useBlockExplorer({ chainId: networkDefinitions[network].id });
    const gaugeAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: gauge.address });

    const hasVoted = userVotes > 0;

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
                {gauge.links && gauge.links.length > 0 && (
                    <>
                        {gauge.links.map((link) => (
                            <DefinitionList.Item
                                key={link.url}
                                term={link.name}
                                link={{ href: link.url, isExternal: true }}
                            >
                                {link.url}
                            </DefinitionList.Item>
                        ))}
                    </>
                )}
                {/* TODO: Implement rewards calculation when backend/blockchain data is available */}
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
