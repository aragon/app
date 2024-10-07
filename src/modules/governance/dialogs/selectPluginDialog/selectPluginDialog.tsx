import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DataList, Dialog, invariant } from '@aragon/ods';
import classNames from 'classnames';
import { useState } from 'react';

export interface ISelectPluginDialogParams {
    /**
     * ID of the DAO to select the plugin for.
     */
    daoId: string;
    /**
     * Callback called on plugin selected.
     */
    onPluginSelected?: (plugin: IDaoPlugin) => void;
    /**
     * Callback used to build a link set on the confirm button when a plugin is selected.
     */
    buildSelectedPluginHref?: (plugin: IDaoPlugin) => string;
}

export interface ISelectPluginDialogProps extends IDialogComponentProps<ISelectPluginDialogParams> {}

export const SelectPluginDialog: React.FC<ISelectPluginDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'SelectPluginDialog: params must be set for the dialog to work correctly');
    const { daoId, onPluginSelected, buildSelectedPluginHref } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const daoPlugins = useDaoPlugins({ daoId, type: PluginType.PROCESS })!;

    const [selectedPlugin, setSelectedPlugin] = useState<ITabComponentPlugin<IDaoPlugin>>();

    const selectPluginHref = selectedPlugin ? buildSelectedPluginHref?.(selectedPlugin.meta) : undefined;

    const handleConfirm = () => {
        close();
        onPluginSelected?.(selectedPlugin!.meta);
    };

    return (
        <>
            <Dialog.Header
                title={t('app.governance.selectPluginDialog.title')}
                description={t('app.governance.selectPluginDialog.description')}
            />
            <Dialog.Content className="flex flex-col gap-2 py-6">
                {daoPlugins.map((plugin) => (
                    <DataList.Item
                        key={plugin.uniqueId}
                        onClick={() => setSelectedPlugin(plugin)}
                        className={classNames({
                            'border-primary-400 shadow-primary hover:border-primary-400 hover:shadow-primary':
                                plugin.uniqueId === selectedPlugin?.uniqueId,
                        })}
                    >
                        {daoUtils.formatPluginName(plugin.meta.subdomain)}
                    </DataList.Item>
                ))}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.governance.selectPluginDialog.action.select'),
                    onClick: handleConfirm,
                    href: selectPluginHref,
                    disabled: selectedPlugin == null,
                }}
                secondaryAction={{ label: t('app.governance.selectPluginDialog.action.cancel'), onClick: close }}
            />
        </>
    );
};
