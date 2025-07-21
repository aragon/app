'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { Tabs } from '@aragon/gov-ui-kit';
import type { ITokenPlugin, ITokenPluginSettings } from '../../types';
import { TokenDelegationForm } from './tokenDelegation';
import { TokenLockForm } from './tokenLock';
import { TokenWrapForm } from './tokenWrap';

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

const getTabsDefinitions = ({ votingEscrow, token }: ITokenPluginSettings) => [
    { value: TokenMemberPanelTab.WRAP, hidden: votingEscrow != null || token.underlying == null },
    { value: TokenMemberPanelTab.LOCK, hidden: votingEscrow == null },
    { value: TokenMemberPanelTab.DELEGATE, hidden: !token.hasDelegate },
];

export const tokenMemberPanelFilterParam = 'memberPanel';

export const TokenMemberPanel: React.FC<ITokenMemberPanelProps> = (props) => {
    const { plugin, daoId } = props;

    const { token, votingEscrow } = plugin.settings;
    const { underlying, symbol, name } = token;

    const { t } = useTranslations();

    const visibleTabs = getTabsDefinitions(plugin.settings).filter((tab) => !tab.hidden);

    const { LOCK, WRAP, DELEGATE } = TokenMemberPanelTab;
    const initialSelectedTab = votingEscrow ? LOCK : underlying != null ? WRAP : DELEGATE;
    const [selectedTab, setSelectedTab] = useFilterUrlParam({
        name: tokenMemberPanelFilterParam,
        fallbackValue: initialSelectedTab,
        validValues: visibleTabs.map((tab) => tab.value),
    });

    // Remove the "g" and "Governance" prefixes from the token symbol / name
    const underlyingToken = { ...token, address: underlying!, symbol: symbol.substring(1), name: name.substring(11) };

    const titleToken = !votingEscrow && underlying != null ? underlyingToken : token;
    const cardTitle = `${titleToken.name} (${titleToken.symbol})`;

    if (!visibleTabs.length) {
        return null;
    }

    return (
        <Page.AsideCard title={cardTitle}>
            <Tabs.Root value={selectedTab} onValueChange={setSelectedTab}>
                <Tabs.List className="pb-4">
                    {visibleTabs.map(({ value }) => (
                        <Tabs.Trigger
                            key={value}
                            label={t(`app.plugins.token.tokenMemberPanel.tabs.${value}`)}
                            value={value}
                        />
                    ))}
                </Tabs.List>
                {votingEscrow != null && (
                    <Tabs.Content value={TokenMemberPanelTab.LOCK}>
                        <TokenLockForm daoId={daoId} plugin={plugin} />
                    </Tabs.Content>
                )}
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
