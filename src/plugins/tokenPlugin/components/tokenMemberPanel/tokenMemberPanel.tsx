'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Tabs } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { ITokenPlugin, ITokenPluginSettings } from '../../types';
import { TokenDelegationForm } from './components/tokenDelegationForm';
import { TokenLockForm } from './components/tokenLockForm';
import { TokenWrapForm } from './components/tokenWrapForm';

export interface ITokenMemberPanelProps {
    /**
     * DAO plugin to display the member panel for.
     */
    plugin: ITokenPlugin;
    /**
     * ID of the DAO with token-voting plugin.
     */
    daoId: string;
}

enum TokenMemberPanelTab {
    DELEGATE = 'DELEGATE',
    WRAP = 'WRAP',
    LOCK = 'LOCK',
}

const getTabsDefinitions = (settings: ITokenPluginSettings) => [
    { value: TokenMemberPanelTab.WRAP, hidden: settings.votingEscrow ?? settings.token.underlying == null },
    { value: TokenMemberPanelTab.LOCK, hidden: !settings.votingEscrow },
    { value: TokenMemberPanelTab.DELEGATE, hidden: !settings.token.hasDelegate },
];

export const TokenMemberPanel: React.FC<ITokenMemberPanelProps> = (props) => {
    const { plugin, daoId } = props;
    const { token } = plugin.settings;
    const { underlying } = token;

    const { t } = useTranslations();

    const initialSelectedTab = plugin.settings.votingEscrow
        ? TokenMemberPanelTab.LOCK
        : underlying != null
          ? TokenMemberPanelTab.WRAP
          : TokenMemberPanelTab.DELEGATE;

    const [selectedTab, setSelectedTab] = useState<string | undefined>(initialSelectedTab);

    const visibleTabs = getTabsDefinitions(plugin.settings).filter((tab) => !tab.hidden);

    // Remove the "g" and "Governance" prefixes from the token symbol / name
    const underlyingToken = {
        ...token,
        address: underlying!,
        symbol: token.symbol.substring(1),
        name: token.name.substring(11),
    };
    const titleToken = !plugin.settings.votingEscrow && underlying != null ? underlyingToken : token;
    const cardTitle = `${titleToken.name} (${titleToken.symbol})`;

    if (!visibleTabs.length) {
        return null;
    }

    return (
        <Page.AsideCard title={cardTitle}>
            <Tabs.Root value={selectedTab} onValueChange={setSelectedTab}>
                <Tabs.List className="pb-4">
                    {visibleTabs.map((tab) => (
                        <Tabs.Trigger
                            key={tab.value}
                            label={t(`app.plugins.token.tokenMemberPanel.tabs.${tab.value}`)}
                            value={tab.value}
                        />
                    ))}
                </Tabs.List>
                <Tabs.Content value={TokenMemberPanelTab.LOCK}>
                    <TokenLockForm daoId={daoId} plugin={plugin} />
                </Tabs.Content>
                <Tabs.Content value={TokenMemberPanelTab.WRAP}>
                    <TokenWrapForm daoId={daoId} plugin={plugin} underlyingToken={underlyingToken} />
                </Tabs.Content>
                <Tabs.Content value={TokenMemberPanelTab.DELEGATE}>
                    <TokenDelegationForm daoId={daoId} plugin={plugin} />
                </Tabs.Content>
            </Tabs.Root>
        </Page.AsideCard>
    );
};
