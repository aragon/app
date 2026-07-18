import { IconType, Tabs } from '@aragon/gov-ui-kit';

export const Default = () => (
    <Tabs.Root defaultValue="proposals" className="w-full">
        <Tabs.List>
            <Tabs.Trigger label="Proposals" value="proposals" />
            <Tabs.Trigger label="Members" value="members" />
            <Tabs.Trigger label="Treasury" value="treasury" />
        </Tabs.List>
        <Tabs.Content value="proposals">
            <p className="pt-4 text-neutral-500">3 active proposals are open for voting.</p>
        </Tabs.Content>
        <Tabs.Content value="members">
            <p className="pt-4 text-neutral-500">128 members hold voting power.</p>
        </Tabs.Content>
        <Tabs.Content value="treasury">
            <p className="pt-4 text-neutral-500">The treasury holds 5 assets.</p>
        </Tabs.Content>
    </Tabs.Root>
);

export const Underlined = () => (
    <Tabs.Root defaultValue="votes" isUnderlined={true} className="w-full">
        <Tabs.List>
            <Tabs.Trigger label="Votes" value="votes" />
            <Tabs.Trigger label="Actions" value="actions" />
            <Tabs.Trigger label="Details" value="details" />
        </Tabs.List>
        <Tabs.Content value="votes">
            <p className="pt-4 text-neutral-500">84 votes cast so far — 72% in favor.</p>
        </Tabs.Content>
        <Tabs.Content value="actions">
            <p className="pt-4 text-neutral-500">2 on-chain actions will execute if the proposal passes.</p>
        </Tabs.Content>
        <Tabs.Content value="details">
            <p className="pt-4 text-neutral-500">Created by 0xba9E...aF27 on July 12, 2026.</p>
        </Tabs.Content>
    </Tabs.Root>
);

export const WithIconsAndDisabled = () => (
    <Tabs.Root defaultValue="assets" className="w-full">
        <Tabs.List>
            <Tabs.Trigger iconRight={IconType.APP_ASSETS} label="Assets" value="assets" />
            <Tabs.Trigger iconRight={IconType.APP_TRANSACTIONS} label="Transactions" value="transactions" />
            <Tabs.Trigger disabled={true} label="Streams" value="streams" />
        </Tabs.List>
        <Tabs.Content value="assets">
            <p className="pt-4 text-neutral-500">ETH, USDC and ANT held by the DAO.</p>
        </Tabs.Content>
        <Tabs.Content value="transactions">
            <p className="pt-4 text-neutral-500">Latest deposit: 2.4 ETH on July 14, 2026.</p>
        </Tabs.Content>
    </Tabs.Root>
);
