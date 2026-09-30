Page from @aragon/app. Source: `.design-sync/app-entry.ts`. Use via `window.GovUiKit.Page` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `Page.Container`, `Page.Header`, `Page.Content`, `Page.Main`, `Page.Aside`, `Page.MainSection`, `Page.AsideCard`. Compose only these listed members, following the examples below. `Page` is a namespace, not a callable root; no unlisted `Item` or `Group` member is implied.

## Examples

### Default

```jsx
() => (
    <AppProviders>
        <div className="h-full">
            <Page.Header
                breadcrumbs={[
                    { href: '/', label: 'Explore' },
                    { label: 'Builders Collective' },
                ]}
                description="A collective of independent builders funding open-source public goods through onchain governance."
                stats={[
                    { label: 'Proposals', value: 128 },
                    { label: 'Members', value: '2.4K' },
                    { label: 'Treasury', value: '3.2M', suffix: 'USD' },
                ]}
                title="Builders Collective"
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection
                        description="Latest governance activity across all processes."
                        title="Proposals"
                    >
                        <Card className="flex flex-col gap-1 p-6">
                            <p className="text-neutral-800">
                                Fund the Q3 grants program
                            </p>
                            <p className="text-neutral-500 text-sm">
                                Active — ends in 3 days
                            </p>
                        </Card>
                    </Page.MainSection>
                </Page.Main>
            </Page.Content>
        </div>
    </AppProviders>
);

// Main + aside split: main sections beside aside detail cards (stacks into a
// column below the lg breakpoint, as at the capture viewport).
```

### WithAside

```jsx
() => (
    <AppProviders>
        <div className="h-full">
            <Page.Content className="pb-6">
                <Page.Main>
                    <Page.MainSection title="Members">
                        <Card className="flex flex-col gap-1 p-6">
                            <p className="text-neutral-800">
                                2,412 token holders
                            </p>
                            <p className="text-neutral-500 text-sm">
                                Voting power delegated to 148 addresses
                            </p>
                        </Card>
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard title="Details">
                        <DefinitionList.Container>
                            <DefinitionList.Item term="Network">
                                Ethereum Mainnet
                            </DefinitionList.Item>
                            <DefinitionList.Item term="ENS">
                                builders.dao.eth
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                        <Link href="https://forum.aragon.org" isExternal={true}>
                            Governance forum
                        </Link>
                    </Page.AsideCard>
                </Page.Aside>
            </Page.Content>
        </div>
    </AppProviders>
);

// Header-less listing page: Page.Main carries the title and primary action,
// rendered as a full-width layout.
```

### MainWithAction

```jsx
() => (
    <AppProviders>
        <div className="h-full">
            <Page.Content>
                <Page.Main
                    action={{ label: 'Create proposal' }}
                    fullWidth={true}
                    title="Proposals"
                >
                    <Page.MainSection inset={false} title="All proposals">
                        <div className="flex flex-col gap-3 pt-4">
                            <Card className="flex flex-col gap-1 p-6">
                                <p className="text-neutral-800">
                                    Fund the Q3 grants program
                                </p>
                                <p className="text-neutral-500 text-sm">
                                    Active — 64% approval
                                </p>
                            </Card>
                            <Card className="flex flex-col gap-1 p-6">
                                <p className="text-neutral-800">
                                    Add security council body
                                </p>
                                <p className="text-neutral-500 text-sm">
                                    Pending — starts tomorrow
                                </p>
                            </Card>
                        </div>
                    </Page.MainSection>
                </Page.Main>
            </Page.Content>
        </div>
    </AppProviders>
)
```

## Related

`Page.Container`, `Page.Header`, `Page.Content`, `Page.Main`, `Page.Aside`, `Page.MainSection`, `Page.AsideCard`
