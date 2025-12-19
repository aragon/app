import {
    addressUtils,
    ChainEntityType,
    DefinitionList,
    Tag,
} from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
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
     * User's votes on this gauge from blockchain.
     */
    userVotes: number;
}

export const GaugeVoterGaugeDetailsDialogContent: React.FC<
    IGaugeVoterGaugeDetailsDialogContentProps
> = (props) => {
    const { gauge, network, userVotes } = props;

    const { t } = useTranslations();

    const { buildEntityUrl } = useDaoChain({ network });
    const gaugeAddressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: gauge.address,
    });

    const hasVoted = userVotes > 0;

    return (
        <div className="flex flex-col gap-y-4">
            <DefinitionList.Container>
                <DefinitionList.Item
                    copyValue={gauge.address}
                    link={{ href: gaugeAddressLink, isExternal: true }}
                    term={t(
                        'app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.contract',
                    )}
                >
                    {addressUtils.truncateAddress(gauge.address)}
                </DefinitionList.Item>
                {gauge.links &&
                    gauge.links.length > 0 &&
                    gauge.links.map((link) => (
                        <DefinitionList.Item
                            key={link.url}
                            link={{ href: link.url, isExternal: true }}
                            term={link.name}
                        >
                            {link.name}
                        </DefinitionList.Item>
                    ))}
                {/* TODO: Implement rewards calculation when backend/blockchain data is available */}
                <DefinitionList.Item
                    term={t(
                        'app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.haveYouVotedFor',
                    )}
                >
                    {hasVoted ? (
                        <Tag
                            className="w-fit"
                            label={t(
                                'app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.votedYes',
                            )}
                            variant="success"
                        />
                    ) : (
                        <Tag
                            className="w-fit"
                            label={t(
                                'app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.content.votedNo',
                            )}
                            variant="neutral"
                        />
                    )}
                </DefinitionList.Item>
            </DefinitionList.Container>
        </div>
    );
};
