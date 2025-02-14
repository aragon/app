import type { IDaoPlugin } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { Tabs } from '@aragon/gov-ui-kit';
import type { ITokenPluginSettings } from '../../types';
import { TokenDelegationForm } from '../tokenDelegationForm';

export interface ITokenMemberPanelProps {
    /**
     * DAO plugin to display the member panel for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export const TokenMemberPanel: React.FC<ITokenMemberPanelProps> = (props) => {
    const { plugin } = props;

    const { token } = plugin.settings;

    return (
        <Page.Section title={`${token.name} (${token.symbol})`}>
            <Tabs.Root value="delegate">
                <Tabs.List>
                    <Tabs.Trigger label="Delegate" value="delegate" />
                </Tabs.List>
                <Tabs.Content value="delegate" className="pt-4">
                    <TokenDelegationForm onSubmit={() => null} />
                </Tabs.Content>
            </Tabs.Root>
        </Page.Section>
    );
};
