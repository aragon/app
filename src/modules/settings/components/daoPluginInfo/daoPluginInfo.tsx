import { useTranslations } from '@/shared/components/translationsProvider';
import { Tabs } from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { DaoGovernanceInfo } from '../daoGovernanceInfo';
import { DaoMembersInfo } from '../daoMembersInfo';
import { DaoContractInfo } from './daoContractInfo';
import { DaoPluginDetails } from './daoPluginDetails';
import { DaoPluginInfoTabId, type IDaoPlugInfoProps } from './daoPluginInfo.api';

export const DaoPluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { plugin, daoId, isMembersPage } = props;

    const { t } = useTranslations();

    const { description, links } = plugin;

    const tabs = useMemo(
        () => [
            {
                id: DaoPluginInfoTabId.DESCRIPTION,
                title: t('app.settings.daoPluginInfo.tabs.description.title'),
                hidden: !description && !links?.length,
            },
            {
                id: DaoPluginInfoTabId.CONTRACT,
                title: t('app.settings.daoPluginInfo.tabs.contract.title'),
                hidden: false,
            },
            {
                id: DaoPluginInfoTabId.SETTINGS,
                title: t('app.settings.daoPluginInfo.tabs.settings.title'),
                hidden: false,
            },
        ],
        [description, links, t],
    );

    const visibleTabs = useMemo(() => tabs.filter((tab) => !tab.hidden), [tabs]);

    const [activeTab, setActiveTab] = useState(visibleTabs[0].id);

    // Update active tab if tabs prop changes
    useEffect(() => {
        setActiveTab(visibleTabs[0].id);
    }, [visibleTabs]);

    // Map the content for each tab
    const tabContent = useMemo(
        () => ({
            [DaoPluginInfoTabId.DESCRIPTION]: <DaoPluginDetails description={description} links={links} />,
            [DaoPluginInfoTabId.CONTRACT]: <DaoContractInfo plugin={plugin} daoId={daoId} />,
            [DaoPluginInfoTabId.SETTINGS]: isMembersPage ? (
                <DaoMembersInfo daoId={daoId} plugin={plugin} />
            ) : (
                <DaoGovernanceInfo daoId={daoId} plugin={plugin} />
            ),
        }),
        [description, links, plugin, daoId, isMembersPage],
    );

    return (
        <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as DaoPluginInfoTabId)}>
            <Tabs.List>
                {visibleTabs.map(({ id, title }) => (
                    <Tabs.Trigger key={id} label={title} value={id} />
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
