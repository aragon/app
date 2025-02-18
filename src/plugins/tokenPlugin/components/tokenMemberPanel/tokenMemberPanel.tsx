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

export const TokenMemberPanel: React.FC<ITokenMemberPanelProps> = (props) => {
    const { plugin, daoId } = props;
    const { token } = plugin.settings;

    const { t } = useTranslations();

    // TODO: enable check
    // if (!token.features.delegation) {
    //     return null;
    // }

    return (
        <Page.Section title={`${token.name} (${token.symbol})`}>
            <Tabs.Root value="delegate">
                <Tabs.List>
                    <Tabs.Trigger label={t('app.plugins.token.tokenMemberPanel.tabs.delegate')} value="delegate" />
                </Tabs.List>
                <Tabs.Content value="delegate" className="pt-4">
                    <TokenDelegationForm daoId={daoId} plugin={plugin} />
                </Tabs.Content>
            </Tabs.Root>
        </Page.Section>
    );
};
