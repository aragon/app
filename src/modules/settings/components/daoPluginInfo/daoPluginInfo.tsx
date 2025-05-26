import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginInfo } from '@/shared/hooks/useDaoPluginInfo';
import { PluginType } from '@/shared/types';
import { DefinitionList, Tabs } from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { DaoGovernanceInfo } from '../daoGovernanceInfo';
import { DaoMembersInfo } from '../daoMembersInfo';
import { DaoPluginInfoTabId, type IDaoPlugInfoProps } from './daoPluginInfo.api';
import { DaoPluginInfoMetadata } from './daoPluginInfoMetadata';

export const DaoPluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { plugin, daoId, type } = props;

    const { description, links = [] } = plugin;

    const { t } = useTranslations();
    const pluginInfo = useDaoPluginInfo({ daoId, address: plugin.address });

    const tabs = useMemo(
        () => [
            { id: DaoPluginInfoTabId.DESCRIPTION, hidden: description == null && links.length === 0 },
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
                <DefinitionList.Container>
                    {pluginInfo.map(({ term, definition, ...other }) => (
                        <DefinitionList.Item key={term} term={term} {...other}>
                            {definition}
                        </DefinitionList.Item>
                    ))}
                </DefinitionList.Container>
            </Tabs.Content>
            <Tabs.Content value={DaoPluginInfoTabId.SETTINGS}>
                {type === PluginType.BODY && <DaoMembersInfo daoId={daoId} plugin={plugin} />}
                {type === PluginType.PROCESS && <DaoGovernanceInfo daoId={daoId} plugin={plugin} />}
            </Tabs.Content>
        </Tabs.Root>
    );
};
