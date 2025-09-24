import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginInfo } from '@/shared/hooks/useDaoPluginInfo';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Button, DefinitionList } from '@aragon/gov-ui-kit';
import { SettingsDialogId } from '../../constants/settingsDialogId';
import type { IGovernanceProcessRequiredDialogParams } from '../../dialogs/governanceProcessRequiredDialog';
import type { IUninstallProcessDialogParams } from '../../dialogs/uninstallProcessDialog';

export interface IDaoProcessDetailsInfoProps {
    /**
     * The DAO plugin associated with the process details.
     */
    plugin: IDaoPlugin;
    /**
     * The DAO associated with the process details.
     */
    dao: IDao;
}

export const DaoProcessDetailsInfo: React.FC<IDaoProcessDetailsInfoProps> = (props) => {
    const { plugin, dao } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const pluginInfoSettings = [
        { term: t('app.settings.daoProcessDetailsInfo.pluginName'), definition: daoUtils.getPluginName(plugin) },
        { term: t('app.settings.daoProcessDetailsInfo.processKey'), definition: plugin.slug.toUpperCase() },
    ];

    const { id: daoId } = dao;
    const settings = useDaoPluginInfo({ daoId, address: plugin.address, settings: pluginInfoSettings });
    const processPlugins = useDaoPlugins({ daoId, type: PluginType.PROCESS, hasExecute: true })!;

    const [pluginDefinition, launchedAtDefinition, ...customSettings] = settings;
    const orderedSettings = [...customSettings, pluginDefinition, launchedAtDefinition];

    const handleUninstallProcess = () => {
        if (processPlugins.length > 1) {
            const params: IUninstallProcessDialogParams = { daoId, plugin };
            open(SettingsDialogId.UNINSTALL_PROCESS, { params });
        } else {
            const dialogTitle = t('app.settings.daoProcessDetailsInfo.fallbackDialogTitle');
            const params: IGovernanceProcessRequiredDialogParams = { daoId, plugin, title: dialogTitle };
            open(SettingsDialogId.GOVERNANCE_PROCESS_REQUIRED, { params });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <DefinitionList.Container>
                {orderedSettings.map(({ term, definition, ...setting }) => (
                    <DefinitionList.Item key={term} term={term} {...setting}>
                        {definition}
                    </DefinitionList.Item>
                ))}
            </DefinitionList.Container>
            <div className="flex flex-col gap-3">
                <Button variant="tertiary" size="md" onClick={handleUninstallProcess}>
                    {t('app.settings.daoProcessDetailsInfo.uninstall.action')}
                </Button>
                <p className="text-center text-sm leading-normal font-normal text-neutral-500">
                    {t('app.settings.daoProcessDetailsInfo.uninstall.info')}
                </p>
            </div>
        </div>
    );
};
