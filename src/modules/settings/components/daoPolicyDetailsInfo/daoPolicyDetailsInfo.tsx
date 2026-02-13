import {
    addressUtils,
    Button,
    ChainEntityType,
    DateFormat,
    DefinitionList,
    formatterUtils,
} from '@aragon/gov-ui-kit';
import {
    EventLogPluginType,
    type IGetLastPluginEventLogUrlParams,
    useLastPluginEventLog,
} from '@/modules/settings/api/settingsService';
import { SettingsDialogId } from '@/modules/settings/constants/settingsDialogId';
import type { IUninstallPluginAlertDialogParams } from '@/modules/settings/dialogs/uninstallPluginAlertDialog';
import type { IDao, IDaoPolicy } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoTargetUtils } from '@/shared/utils/daoTargetUtils';
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
    const { open } = useDialogContext();

    const { buildEntityUrl } = useDaoChain({ network: dao.network });
    const daoId = dao.id;

    const processPlugins =
        useDaoPlugins({ daoId, type: PluginType.PROCESS, hasExecute: true }) ??
        [];
    const hasGovernanceProcess = processPlugins.length > 0;

    const eventLogParams: IGetLastPluginEventLogUrlParams = {
        pluginAddress: policy.address,
        network: dao.network,
        event: EventLogPluginType.UNINSTALLATION_PREPARED,
    };
    const { data: uninstallationPreparedEventLog } = useLastPluginEventLog({
        urlParams: eventLogParams,
    });

    const policyName = daoPolicyDetailsClientUtils.getPolicyName(policy, t);
    const policyKey = policy.policyKey?.toUpperCase();

    const targetName =
        policy.daoAddress != null
            ? daoTargetUtils.findTargetDao({
                  dao,
                  targetAddress: policy.daoAddress,
              })?.name
            : undefined;

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

    const handleUninstallPolicy = () => {
        const params: IUninstallPluginAlertDialogParams = {
            daoId,
            uninstallPlugin: policy,
            uninstallationPreparedEventLog,
        };

        open(SettingsDialogId.UNINSTALL_PLUGIN_ALERT, { params });
    };

    return (
        <div className="flex flex-col gap-6">
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
            {hasGovernanceProcess && (
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={handleUninstallPolicy}
                        size="md"
                        variant="tertiary"
                    >
                        {t(
                            'app.settings.daoPolicyDetailsInfo.uninstall.action',
                        )}
                    </Button>
                    <p className="text-center font-normal text-neutral-500 text-sm leading-normal">
                        {t('app.settings.daoPolicyDetailsInfo.uninstall.info')}
                    </p>
                </div>
            )}
        </div>
    );
};
