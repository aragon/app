import { useWhitelistValidation } from '@/plugins/lockToVotePlugin/hooks/useWhitelistValidation/useWhitelistValidation';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IPluginInfo } from '@/shared/types';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import { SetupBodyType, type ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogSelectProps {
    /**
     * Defines if the body is being setup as a sub-plugin or not.
     */
    isSubPlugin?: boolean;
}

export const externalPluginId = 'external';

export const SetupBodyDialogSelect: React.FC<ISetupBodyDialogSelectProps> = (props) => {
    const { isSubPlugin } = props;

    const { t } = useTranslations();

    const { address } = useAccount();

    const plugins = pluginRegistryUtils.getPlugins() as IPluginInfo[];
    const availablePlugins = plugins.filter((plugin) => plugin.setup != null);

    const { approvals } = useWhitelistValidation(availablePlugins, address);

    const enabledPlugins = availablePlugins.filter((plugin) => approvals[plugin.id]);
    const disabledPlugins = availablePlugins.filter((plugin) => !approvals[plugin.id]);

    const { onChange: onPluginChange, ...governanceTypeField } = useFormField<ISetupBodyForm, 'plugin'>('plugin', {
        label: t('app.createDao.setupBodyDialog.select.plugin.label'),
        defaultValue: enabledPlugins[0]?.id,
    });

    const { onChange: onTypeChange } = useFormField<ISetupBodyForm, 'type'>('type', {
        defaultValue: SetupBodyType.NEW,
    });

    const handlePluginChange = (value: string) => {
        const bodyType = value === externalPluginId ? SetupBodyType.EXTERNAL : SetupBodyType.NEW;
        onTypeChange(bodyType);
        onPluginChange(value);
    };

    return (
        <RadioGroup
            helpText={t('app.createDao.setupBodyDialog.select.plugin.helpText')}
            onValueChange={handlePluginChange}
            {...governanceTypeField}
        >
            {enabledPlugins.map((plugin) => (
                <RadioCard
                    key={plugin.id}
                    label={t(plugin.setup!.nameKey)}
                    description={t(plugin.setup!.descriptionKey)}
                    value={plugin.id}
                />
            ))}
            {isSubPlugin && (
                <RadioCard
                    label={t('app.createDao.setupBodyDialog.select.external.label')}
                    description={t('app.createDao.setupBodyDialog.select.external.description')}
                    value={externalPluginId}
                />
            )}
            {disabledPlugins.map((plugin) => (
                <RadioCard
                    key={plugin.id}
                    label={t(plugin.setup!.nameKey)}
                    description={t(plugin.setup!.descriptionKey)}
                    value={plugin.id}
                    disabled={true}
                    tag={{ variant: 'info', label: 'By request' }}
                />
            ))}
        </RadioGroup>
    );
};
