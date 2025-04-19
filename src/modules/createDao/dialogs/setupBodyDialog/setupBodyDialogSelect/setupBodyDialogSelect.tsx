import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IPluginInfo } from '@/shared/types';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
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

    const plugins = pluginRegistryUtils.getPlugins() as IPluginInfo[];
    const availablePlugins = plugins.filter((plugin) => plugin.setup != null);

    const { onChange: onPluginChange, ...governanceTypeField } = useFormField<ISetupBodyForm, 'plugin'>('plugin', {
        label: t('app.createDao.setupBodyDialog.select.plugin.label'),
        defaultValue: availablePlugins[0]?.id,
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
            {availablePlugins.map((plugin) => (
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
        </RadioGroup>
    );
};
