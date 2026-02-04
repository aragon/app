import {
    addressUtils,
    ChainEntityType,
    DateFormat,
    DefinitionList,
    formatterUtils,
} from '@aragon/gov-ui-kit';
import type { IDao, IDaoPolicy } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoPolicyDetailsClientUtils } from '../../pages/daoPolicyDetailsPage/daoPolicyDetailsClientUtils';

export interface IDaoPolicyDetailsInfoProps {
    /**
     * The DAO policy associated with the policy details.
     */
    policy: IDaoPolicy;
    /**
     * The DAO associated with the policy details.
     */
    dao: IDao;
}

export const DaoPolicyDetailsInfo: React.FC<IDaoPolicyDetailsInfoProps> = (
    props,
) => {
    const { policy, dao } = props;

    const { t } = useTranslations();

    const { buildEntityUrl } = useDaoChain({ network: dao.network });

    const policyName = daoPolicyDetailsClientUtils.getPolicyName(policy, t);
    const policyKey = policy.policyKey?.toUpperCase();

    // Determine target name based on policy.daoAddress
    const getTargetName = (): string | undefined => {
        if (!policy.daoAddress) {
            return undefined;
        }

        // Check if it's the current DAO
        if (policy.daoAddress.toLowerCase() === dao.address.toLowerCase()) {
            return dao.name;
        }

        // Check if it's a known subDAO
        const subDao = dao.subDaos?.find(
            (sub) =>
                sub.address.toLowerCase() === policy.daoAddress?.toLowerCase(),
        );
        if (subDao) {
            return subDao.name;
        }

        return undefined;
    };

    const targetName = getTargetName();

    const pluginLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: policy.address,
    });

    const policyLaunchedAt = formatterUtils.formatDate(
        policy.blockTimestamp * 1000,
        { format: DateFormat.YEAR_MONTH },
    )!;

    const policyCreationLink = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: policy.transactionHash,
    });

    return (
        <DefinitionList.Container>
            {/* Name */}
            <DefinitionList.Item
                term={t('app.settings.daoPolicyDetailsInfo.name')}
            >
                {policyName}
            </DefinitionList.Item>

            {/* Key */}
            {policyKey && (
                <DefinitionList.Item
                    term={t('app.settings.daoPolicyDetailsInfo.key')}
                >
                    {policyKey}
                </DefinitionList.Item>
            )}

            {/* Plugin address */}
            <DefinitionList.Item
                copyValue={policy.address}
                description={`${policyName} v${policy.release}.${policy.build}`}
                link={{ href: pluginLink, isExternal: true }}
                term={t('app.settings.daoPolicyDetailsInfo.pluginAddress')}
            >
                {addressUtils.truncateAddress(policy.address)}
            </DefinitionList.Item>

            {/* Target */}
            {policy.daoAddress && (
                <DefinitionList.Item
                    copyValue={policy.daoAddress}
                    description={targetName}
                    link={{
                        href: buildEntityUrl({
                            type: ChainEntityType.ADDRESS,
                            id: policy.daoAddress,
                        }),
                        isExternal: true,
                    }}
                    term={t('app.settings.daoPolicyDetailsInfo.target')}
                >
                    {addressUtils.truncateAddress(policy.daoAddress)}
                </DefinitionList.Item>
            )}

            {/* Launched */}
            <DefinitionList.Item
                link={{ href: policyCreationLink, isExternal: true }}
                term={t('app.settings.daoPolicyDetailsInfo.launched')}
            >
                {policyLaunchedAt}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
