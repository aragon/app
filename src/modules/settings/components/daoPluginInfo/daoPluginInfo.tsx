import { useTranslations } from '@/shared/components/translationsProvider';
import { PluginType } from '@/shared/types';
import { Tabs } from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { DaoGovernanceInfo } from '../daoGovernanceInfo';
import { DaoMembersInfo } from '../daoMembersInfo';
import { DaoPluginInfoTabId, type IDaoPlugInfoProps, type IDaoPluginInfoTab } from './daoPluginInfo.api';
import { DaoPluginInfoContract } from './daoPluginInfoContract';
import { DaoPluginInfoMetadata } from './daoPluginInfoMetadata.tsx';

export const DaoPluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { plugin, daoId, type } = props;

    const { description, links } = plugin;

    const { t } = useTranslations();

    const tabs: IDaoPluginInfoTab[] = useMemo(
        () => [
            {
                id: DaoPluginInfoTabId.DESCRIPTION,
                label: t('app.settings.daoPluginInfo.tabs.description.label'),
                hidden: !description && !links?.length,
            },
            { id: DaoPluginInfoTabId.CONTRACT, label: t('app.settings.daoPluginInfo.tabs.contract.label') },
            { id: DaoPluginInfoTabId.SETTINGS, label: t('app.settings.daoPluginInfo.tabs.settings.label') },
        ],
        [description, links, t],
    );

    const visibleTabs: IDaoPluginInfoTab[] = useMemo(() => tabs.filter((tab) => !tab.hidden), [tabs]);

    const [activeTab, setActiveTab] = useState<DaoPluginInfoTabId>(visibleTabs[0].id);

    // Update active tab if tabs prop changes
    useEffect(() => {
        setActiveTab(visibleTabs[0].id);
    }, [visibleTabs]);

    // Map the tab content to each tab
    const tabContent = useMemo(
        () => ({
            [DaoPluginInfoTabId.DESCRIPTION]: <DaoPluginInfoMetadata description={description} links={links} />,
            [DaoPluginInfoTabId.CONTRACT]: <DaoPluginInfoContract plugin={plugin} daoId={daoId} />,
            [DaoPluginInfoTabId.SETTINGS]:
                type === PluginType.BODY ? (
                    <DaoMembersInfo daoId={daoId} plugin={plugin} />
                ) : (
                    <DaoGovernanceInfo daoId={daoId} plugin={plugin} />
                ),
        }),
        [description, links, plugin, daoId, type],
    );

    return (
        <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as DaoPluginInfoTabId)}>
            <Tabs.List>
                {visibleTabs.map(({ id, label }) => (
                    <Tabs.Trigger key={id} label={label} value={id} />
                ))}
            </Tabs.List>
            {visibleTabs.map(({ id }) => (
                <Tabs.Content key={id} value={id} className="pt-6">
                    {tabContent[id]}
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
};
