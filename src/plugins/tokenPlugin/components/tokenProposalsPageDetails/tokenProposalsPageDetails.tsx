import { useDao, useDaoSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
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
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';

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
    const { data: dao } = useDao({ urlParams: daoParams });

    const daoSettingsParams = { daoId };
    const { data: settings } = useDaoSettings<IDaoTokenSettings>({ urlParams: daoSettingsParams });

    const chainId = dao ? networkDefinitions[dao.network].chainId : undefined;
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    if (dao == null || settings == null) {
        return null;
    }

    const { supportThreshold, minParticipation, minProposerVotingPower } = settings.settings;
    const supportThresholdPercentage = tokenSettingsUtils.parsePercentageSetting(supportThreshold) / 100;
    const formattedSupportThresholdPercentage = formatterUtils.formatNumber(supportThresholdPercentage, {
        isPercentage: true,
        format: NumberFormat.PERCENTAGE_SHORT,
    });

    const minParticipationPercentage = tokenSettingsUtils.parsePercentageSetting(minParticipation) / 100;
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
                    href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: settings.pluginAddress })}
                    target="_blank"
                >
                    {daoUtils.formatPluginName(settings.pluginSubdomain)}
                </Link>
                <p className="text-neutral-500">{addressUtils.truncateAddress(settings.pluginAddress)}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.supportThreshold')}>
                <p className="text-neutral-500">{`> ${formattedSupportThresholdPercentage}`}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.minimumParticipation')}>
                <p className="text-neutral-500">{`≥ ${formattedMinParticipationPercentage}`}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.minimumDuration')}>
                <p className="text-neutral-500">
                    {formatterUtils.formatDate(Date.now() - settings.settings.minDuration * 1000, {
                        format: DateFormat.DURATION,
                    })}
                </p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.earlyExecution')}>
                <p className="text-neutral-500">
                    {t(
                        settings.settings.votingMode === DaoTokenVotingMode.EARLY_EXECUTION
                            ? 'app.plugins.token.tokenProposalsPageDetails.yes'
                            : 'app.plugins.token.tokenProposalsPageDetails.no',
                    )}
                </p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.voteChange')}>
                <p className="text-neutral-500">
                    {t(
                        settings.settings.votingMode === DaoTokenVotingMode.VOTE_REPLACEMENT
                            ? 'app.plugins.token.tokenProposalsPageDetails.yes'
                            : 'app.plugins.token.tokenProposalsPageDetails.no',
                    )}
                </p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProposalsPageDetails.proposalCreation')}>
                <p className="text-neutral-500">
                    {t('app.plugins.token.tokenProposalsPageDetails.proposalCreationAccess', {
                        balance: formattedMinBalance,
                    })}
                </p>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
