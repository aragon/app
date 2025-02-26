import { useTranslations } from '@/shared/components/translationsProvider';
import { PluginType } from '@/shared/types';
import { Tabs } from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { DaoGovernanceInfo } from '../daoGovernanceInfo';
import { DaoMembersInfo } from '../daoMembersInfo';
import { DaoPluginInfoTabId, type IDaoPlugInfoProps } from './daoPluginInfo.api';
import { DaoPluginInfoContract } from './daoPluginInfoContract';
import { DaoPluginInfoMetadata } from './daoPluginInfoMetadata.tsx';

export const DaoPluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { plugin, daoId, type } = props;

    const { description, links } = plugin;

    const { t } = useTranslations();

    const tabs = useMemo(
        () => [
            { id: DaoPluginInfoTabId.DESCRIPTION, hidden: !description && !links?.length },
            { id: DaoPluginInfoTabId.CONTRACT },
            { id: DaoPluginInfoTabId.SETTINGS },
        ],
        [description, links],
    );

    const visibleTabs = useMemo(() => tabs.filter((tab) => !tab.hidden), [tabs]);
    const [activeTab, setActiveTab] = useState(visibleTabs[0].id);

    // Update active tab if tabs prop changes
    useEffect(() => setActiveTab(visibleTabs[0].id), [visibleTabs]);

    return (
        <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as DaoPluginInfoTabId)}>
            <Tabs.List className="pb-6">
                {visibleTabs.map(({ id }) => (
                    <Tabs.Trigger key={id} label={t(`app.settings.daoPluginInfo.tabs.${id}`)} value={id} />
                ))}
            </Tabs.List>
            <Tabs.Content value={DaoPluginInfoTabId.DESCRIPTION}>
                <DaoPluginInfoMetadata description={description} links={links} />
            </Tabs.Content>
            <Tabs.Content value={DaoPluginInfoTabId.CONTRACT}>
                <DaoPluginInfoContract plugin={plugin} daoId={daoId} />
            </Tabs.Content>
            <Tabs.Content value={DaoPluginInfoTabId.SETTINGS}>
                {type === PluginType.BODY && <DaoMembersInfo daoId={daoId} plugin={plugin} />}
                {type === PluginType.PROCESS && <DaoGovernanceInfo daoId={daoId} plugin={plugin} />}
            </Tabs.Content>
        </Tabs.Root>
    );
};
