import { useDao, useDaoSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ChainEntityType, DefinitionList, IconType, Link, addressUtils, useBlockExplorer } from '@aragon/ods';
import { type IDaoMultisigSettings } from '../../types/daoMultisigSettings';

export interface IMultisigProposalsPageDetailsProps {
    /**
     * ID of the DAO to fetch the settings for.
     */
    daoId: string;
}

export const MultisigProposalsPageDetails: React.FC<IMultisigProposalsPageDetailsProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const daoParams = { id: daoId };
    const { data: dao } = useDao({
        urlParams: daoParams,
    });

    const daoSettingsParams = { daoId };
    const { data: settings } = useDaoSettings<IDaoMultisigSettings>({
        urlParams: daoSettingsParams,
    });

    const { getChainEntityUrl } = useBlockExplorer();

    if (dao == null || settings == null) {
        return null;
    }

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.plugins.multisig.multisigProposalsPageDetails.contract')}>
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
            <DefinitionList.Item term={t('app.plugins.multisig.multisigProposalsPageDetails.minimumApproval')}>
                <p>
                    {t('app.plugins.multisig.multisigProposalsPageDetails.minimumApprovalMembers', {
                        count: settings.settings.minApprovals,
                        total: dao.metrics.members,
                    })}
                </p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.multisig.multisigProposalsPageDetails.proposalCreation')}>
                <p>{t('app.plugins.multisig.multisigProposalsPageDetails.members')}</p>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
