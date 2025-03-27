import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IPluginInfo } from '@/shared/types';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogSelectProps {}

export const SetupBodyDialogSelect: React.FC<ISetupBodyDialogSelectProps> = () => {
    const { t } = useTranslations();

    const plugins = pluginRegistryUtils.getPlugins() as IPluginInfo[];
    const availablePlugins = plugins.filter((plugin) => plugin.setup != null);

    const { onChange, ...governanceTypeField } = useFormField<ISetupBodyForm, 'plugin'>('plugin', {
        label: t('app.createDao.setupBodyDialog.select.plugin.label'),
        defaultValue: availablePlugins[0].id,
    });

    return (
        <RadioGroup
            className="flex gap-4"
            helpText={t('app.createDao.setupBodyDialog.select.plugin.helpText')}
            onValueChange={onChange}
            {...governanceTypeField}
        >
            {availablePlugins.map((plugin) => (
                <RadioCard
                    key={plugin.id}
                    className="w-full"
                    label={t(plugin.setup!.nameKey)}
                    description={t(plugin.setup!.descriptionKey)}
                    value={plugin.id}
                />
            ))}
        </RadioGroup>
    );
};
