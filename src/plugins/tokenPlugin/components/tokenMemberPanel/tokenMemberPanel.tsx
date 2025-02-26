import type { IDaoPlugin } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Tabs } from '@aragon/gov-ui-kit';
import type { ITokenPluginSettings } from '../../types';
import { TokenDelegationForm } from '../tokenDelegationForm';

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
}

export const TokenMemberPanel: React.FC<ITokenMemberPanelProps> = (props) => {
    const { plugin, daoId } = props;
    const { token } = plugin.settings;

    const { t } = useTranslations();

    if (!token.hasDelegate) {
        return null;
    }

    return (
        <Page.AsideCard title={`${token.name} (${token.symbol})`}>
            <Tabs.Root value={TokenMemberPanelTab.DELEGATE}>
                <Tabs.List className="pb-4">
                    <Tabs.Trigger
                        label={t(`app.plugins.token.tokenMemberPanel.tabs.${TokenMemberPanelTab.DELEGATE}`)}
                        value={TokenMemberPanelTab.DELEGATE}
                    />
                </Tabs.List>
                <Tabs.Content value={TokenMemberPanelTab.DELEGATE}>
                    <TokenDelegationForm daoId={daoId} plugin={plugin} />
                </Tabs.Content>
            </Tabs.Root>
        </Page.AsideCard>
    );
};
