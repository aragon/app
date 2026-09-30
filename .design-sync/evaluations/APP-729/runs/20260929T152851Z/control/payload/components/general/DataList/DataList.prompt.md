DataList from @aragon/gov-ui-kit. Use via `window.GovUiKit.DataList` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `DataList.Root`, `DataList.Filter`, `DataList.Container`, `DataList.Item`, `DataList.ActionItem`, `DataList.Pagination`. See the DS docs for composition — e.g. items like `DataList.Item` go inside `<DataList>`; containers like `DataList.Group` wrap multiple `<DataList>`s.

## Examples

### ProposalList

```jsx
() => (
    <DataList.Root
        entityLabel="Proposals"
        itemsCount={proposals.length}
        pageSize={3}
        state="idle"
    >
        <DataList.Filter
            activeSort="date_desc"
            onSearchValueChange={() => undefined}
            onSortChange={() => undefined}
            placeholder="Search proposals"
            sortItems={sortItems}
        />
        <DataList.Container>
            {proposals.map((proposal) => (
                <DataList.Item
                    className="flex flex-col gap-1 py-4"
                    key={proposal.id}
                >
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-normal text-base text-neutral-800 leading-tight">
                            {proposal.title}
                        </p>
                        <Tag
                            label={proposal.status}
                            variant={proposal.variant}
                        />
                    </div>
                    <p className="text-neutral-500 text-sm leading-normal">
                        {proposal.id} · {proposal.summary}
                    </p>
                </DataList.Item>
            ))}
        </DataList.Container>
        <DataList.Pagination />
    </DataList.Root>
);

const members = [
    { address: '0x4aB3…9f21', name: 'alice.eth', votingPower: '12,400 ARA' },
    { address: '0x88Cd…01ba', name: 'bob.eth', votingPower: '8,150 ARA' },
    { address: '0x1eF0…77c3', name: 'carol.eth', votingPower: '5,020 ARA' },
    { address: '0x9A02…d411', name: 'dan.eth', votingPower: '1,930 ARA' },
]
```

### MemberList

```jsx
() => (
    <DataList.Root
        entityLabel="Members"
        itemsCount={12}
        pageSize={4}
        state="idle"
    >
        <DataList.Container>
            {members.map((member) => (
                <DataList.Item
                    className="flex flex-row items-center gap-3 py-4"
                    key={member.address}
                >
                    <span className="size-8 shrink-0 rounded-full bg-primary-100" />
                    <div className="flex grow flex-col">
                        <p className="text-base text-neutral-800 leading-tight">
                            {member.name}
                        </p>
                        <p className="text-neutral-500 text-sm leading-normal">
                            {member.address}
                        </p>
                    </div>
                    <p className="text-neutral-500 text-sm leading-normal">
                        {member.votingPower}
                    </p>
                </DataList.Item>
            ))}
        </DataList.Container>
        <DataList.Pagination />
    </DataList.Root>
);

const ProposalSkeleton = () => (
    <DataList.Item className="flex flex-row items-center gap-3 py-4">
        <StateSkeletonCircular size="md" />
        <div className="flex grow flex-col gap-2">
            <StateSkeletonBar size="md" width="60%" />
            <StateSkeletonBar size="sm" width="35%" />
        </div>
    </DataList.Item>
)
```

### LoadingState

```jsx
() => (
    <DataList.Root entityLabel="Proposals" pageSize={3} state="initialLoading">
        <DataList.Container SkeletonElement={ProposalSkeleton} />
        <DataList.Pagination />
    </DataList.Root>
)
```

### EmptyFilteredState

```jsx
() => (
    <DataList.Root entityLabel="Proposals" itemsCount={0} state="filtered">
        <DataList.Filter
            activeSort="date_desc"
            onResetFiltersClick={() => undefined}
            onSearchValueChange={() => undefined}
            onSortChange={() => undefined}
            placeholder="Search proposals"
            searchValue="treasury swap"
            sortItems={sortItems}
        />
        <DataList.Container
            emptyFilteredState={{
                heading: 'No proposals found',
                description:
                    'Your filters did not match any proposals. Reset the filters and try again.',
            }}
        />
    </DataList.Root>
)
```

## Related

`DataList.Root`, `DataList.Filter`, `DataList.Container`, `DataList.Item`, `DataList.ActionItem`, `DataList.Pagination`
