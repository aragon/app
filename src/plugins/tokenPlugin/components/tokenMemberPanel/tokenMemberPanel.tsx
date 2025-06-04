import { TokenLockForm } from '@/plugins/tokenPlugin/components/tokenMemberPanel/components/tokenLockForm';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Tabs } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { ITokenPluginSettings } from '../../types';
import { TokenDelegationForm } from './components/tokenDelegationForm';
import { TokenWrapForm } from './components/tokenWrapForm';
import { generateToken } from '@/modules/finance/testUtils';

export interface ITokenMemberPanelProps {
    /**
     * DAO plugin to display the member panel for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
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

const dummyToken = generateToken({ symbol: 'DUMMY', totalSupply: '10000' });

const getTabsDefinitions = (settings: ITokenPluginSettings) => [
    // { value: TokenMemberPanelTab.WRAP, hidden: settings.votingEscrow ?? settings.token.underlying == null },
    // { value: TokenMemberPanelTab.LOCK, hidden: !settings.votingEscrow },
    { value: TokenMemberPanelTab.WRAP, hidden: true },
    { value: TokenMemberPanelTab.LOCK, hidden: false },
    //{ value: TokenMemberPanelTab.DELEGATE, hidden: !settings.token.hasDelegate },
    { value: TokenMemberPanelTab.DELEGATE, hidden: false },
];

export const TokenMemberPanel: React.FC<ITokenMemberPanelProps> = (props) => {
    const { plugin, daoId } = props;

    const token = { ...dummyToken, underlying: null, hasDelegate: true };
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
    const titleToken = underlying != null ? underlyingToken : token;
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
