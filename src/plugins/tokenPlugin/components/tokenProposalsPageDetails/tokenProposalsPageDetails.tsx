import { useDao, useDaoSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { percentageDecimals } from '@/shared/constants/decimals';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    ChainEntityType,
    DateFormat,
    DefinitionList,
    IconType,
    Link,
    NumberFormat,
    addressUtils,
    formatterUtils,
    useBlockExplorer,
} from '@aragon/ods';
import { formatUnits } from 'viem';
import { DaoTokenVotingMode, type IDaoTokenSettings } from '../../types';

export interface ITokenProposalsPageDetailsProps {
    /**
     * ID of the DAO to fetch the settings for.
     */
    daoId: string;
}

export const TokenProposalsPageDetails: React.FC<ITokenProposalsPageDetailsProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const daoParams = { id: daoId };
    const { data: dao } = useDao({
        urlParams: daoParams,
    });

    const daoSettingsParams = { daoId };
    const settingsQuery = useDaoSettings<IDaoTokenSettings>({
        urlParams: daoSettingsParams,
    });
    const { data: settings } = settingsQuery;

    const { getChainEntityUrl } = useBlockExplorer();

    if (dao == null || settings == null) {
        return null;
    }

    const { supportThreshold, minParticipation, minProposerVotingPower } = settings.settings;
    const supportThresholdPercentage = formatUnits(BigInt(supportThreshold), percentageDecimals);
    const formattedSupportThresholdPercentage = formatterUtils.formatNumber(supportThresholdPercentage, {
        isPercentage: true,
        format: NumberFormat.PERCENTAGE_SHORT,
    });

    const minParticipationPercentage = formatUnits(BigInt(minParticipation), percentageDecimals);
    const formattedMinParticipationPercentage = formatterUtils.formatNumber(minParticipationPercentage, {
        isPercentage: true,
        format: NumberFormat.PERCENTAGE_SHORT,
    });

    const { token } = settings;
    const minProposerAmount = formatUnits(BigInt(Number(minProposerVotingPower)), token.decimals);
    const formattedMinBalance = `${formatterUtils.formatNumber(minProposerAmount)} $${token.symbol}`;

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.contract')}>
                <Link
                    iconRight={IconType.LINK_EXTERNAL}
                    href={getChainEntityUrl({
                        type: ChainEntityType.ADDRESS,
                        chainId: networkDefinitions[dao.network].chainId,
                        id: settings.pluginAddress,
                    })}
                >
                    {daoUtils.formatPluginName(settings.pluginSubdomain)}
                </Link>
                <p>{addressUtils.truncateAddress(settings.pluginAddress)}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.supportThreshold')}>
                {`> ${formattedSupportThresholdPercentage}`}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.minimumParticipation')}>
                {`≥ ${formattedMinParticipationPercentage}`}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.minimumDuration')}>
                <p>
                    {formatterUtils.formatDate(Date.now() - settings.settings.minDuration * 1000, {
                        format: DateFormat.DURATION,
                    })}
                </p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.earlyExecution')}>
                <p>
                    {t(
                        settings.settings.votingMode === DaoTokenVotingMode.EARLY_EXECUTION
                            ? 'app.plugins.token.tokenProposalsPageDetails.yes'
                            : 'app.plugins.token.tokenProposalsPageDetails.no',
                    )}
                </p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.voteChange')}>
                <p>
                    {t(
                        settings.settings.votingMode === DaoTokenVotingMode.VOTE_REPLACEMENT
                            ? 'app.plugins.token.tokenProposalsPageDetails.yes'
                            : 'app.plugins.token.tokenProposalsPageDetails.no',
                    )}
                </p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.proposalCreation')}>
                {t('app.plugins.token.tokenProposalsPageDetails.proposalCreationAccess', {
                    balance: formattedMinBalance,
                })}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
