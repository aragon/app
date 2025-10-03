import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { ProcessDataListItem } from '@/shared/components/processDataListItem';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useState } from 'react';

export interface ISelectPluginDialogParams {
    /**
     * ID of the DAO to select the plugin for.
     */
    daoId: string;
    /**
     * Array of plugin IDs to filter out from the selection list.
     */
    excludePluginIds?: string[];
    /**
     * Callback called on plugin selected.
     */
    onPluginSelected?: (plugin: IDaoPlugin) => void;
    /**
     * Plugin to preselect.
     */
    initialPlugin?: IFilterComponentPlugin<IDaoPlugin>;
    /**
     * Variant of the dialog. Used to customize labels.
     */
    variant?: 'proposal' | 'process';
    /**
     * Only allow plugins with full execute permissions.
     */
    fullExecuteOnly?: boolean;
}

export interface ISelectPluginDialogProps extends IDialogComponentProps<ISelectPluginDialogParams> {}

export const SelectPluginDialog: React.FC<ISelectPluginDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'SelectPluginDialog: params must be set for the dialog to work correctly');
    const {
        daoId,
        excludePluginIds,
        onPluginSelected,
        initialPlugin,
        variant = 'proposal',
        fullExecuteOnly,
    } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const daoPlugins = useDaoPlugins({
        daoId,
        type: PluginType.PROCESS,
        includeSubPlugins: false,
        hasExecute: fullExecuteOnly,
    })!;

    const processedDaoPlugins = daoPlugins.filter((plugin) => !excludePluginIds?.includes(plugin.uniqueId));

    const [selectedPlugin, setSelectedPlugin] = useState(initialPlugin);

    const handleConfirm = () => {
        close();
        onPluginSelected?.(selectedPlugin!.meta);
    };

    return (
        <>
            <Dialog.Header title={t(`app.governance.selectPluginDialog.${variant}.title`)} onClose={close} />
            <Dialog.Content description={t(`app.governance.selectPluginDialog.${variant}.description`)}>
                <div className="flex flex-col gap-2 py-2">
                    {processedDaoPlugins.map((plugin) => (
                        <ProcessDataListItem
                            key={plugin.uniqueId}
                            process={plugin.meta}
                            isActive={plugin.uniqueId === selectedPlugin?.uniqueId}
                            onClick={() => setSelectedPlugin(plugin)}
                        />
                    ))}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.governance.selectPluginDialog.action.select'),
                    onClick: handleConfirm,
                    disabled: selectedPlugin == null,
                }}
                secondaryAction={{
                    label: t('app.governance.selectPluginDialog.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
