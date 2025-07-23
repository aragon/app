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
    DELEGATE = 'delegate',
    WRAP = 'wrap',
    LOCK = 'lock',
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

    const sanitizedSymbol = symbol || 'UNKNOWN';
    const sanitizedName = name || 'Unknown';

    const sanitizedToken = { ...token, symbol: sanitizedSymbol, name: sanitizedName };
    const sanitizedPlugin = { ...plugin, settings: { ...plugin.settings, token: sanitizedToken } };

    const { t } = useTranslations();

    const visibleTabs = getTabsDefinitions(plugin.settings).filter((tab) => !tab.hidden);

    const { LOCK, WRAP, DELEGATE } = TokenMemberPanelTab;
    const initialSelectedTab = votingEscrow ? LOCK : underlying != null ? WRAP : DELEGATE;
    const [selectedTab, setSelectedTab] = useFilterUrlParam({
        name: tokenMemberPanelFilterParam,
        fallbackValue: initialSelectedTab,
        validValues: visibleTabs.map((tab) => tab.value),
    });

    // Remove the "g" and "Governance" prefixes from the token symbol / name if present
    const underlyingToken = {
        ...sanitizedToken,
        address: underlying!,
        symbol: sanitizedSymbol.startsWith('g') ? sanitizedSymbol.substring(1) : sanitizedSymbol,
        name: sanitizedName.startsWith('Governance') ? sanitizedName.substring(11) : sanitizedName,
    };
    const titleToken = !votingEscrow && underlying != null ? underlyingToken : sanitizedToken;
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
                        <TokenLockForm daoId={daoId} plugin={sanitizedPlugin} />
                    </Tabs.Content>
                )}
                <Tabs.Content value={TokenMemberPanelTab.WRAP}>
                    <TokenWrapForm daoId={daoId} plugin={sanitizedPlugin} underlyingToken={underlyingToken} />
                </Tabs.Content>
                <Tabs.Content value={TokenMemberPanelTab.DELEGATE}>
                    <TokenDelegationForm daoId={daoId} plugin={sanitizedPlugin} />
                </Tabs.Content>
            </Tabs.Root>
        </Page.AsideCard>
    );
};
