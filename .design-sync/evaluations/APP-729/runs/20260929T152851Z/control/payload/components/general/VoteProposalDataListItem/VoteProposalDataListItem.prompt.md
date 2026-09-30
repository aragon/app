VoteProposalDataListItem from @aragon/gov-ui-kit. Use via `window.GovUiKit.VoteProposalDataListItem` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `VoteProposalDataListItem.Structure`, `VoteProposalDataListItem.Skeleton`. See the DS docs for composition — e.g. items like `VoteProposalDataListItem.Item` go inside `<VoteProposalDataListItem>`; containers like `VoteProposalDataListItem.Group` wrap multiple `<VoteProposalDataListItem>`s.

## Examples

### Default

```jsx
() => (
    <GukModulesProvider>
        <VoteProposalDataListItem.Structure
            date={1_698_000_000_000}
            proposalId="PIP-24"
            proposalTitle="Fund the Q3 grants program"
            voteIndicator="yes"
        />
    </GukModulesProvider>
)
```

### VotingHistory

```jsx
() => (
    <GukModulesProvider>
        <div className="flex w-full flex-col gap-3">
            <VoteProposalDataListItem.Structure
                date={1_698_000_000_000}
                proposalId="PIP-23"
                proposalTitle="Upgrade the token voting plugin"
                voteIndicator="yes"
            />
            <VoteProposalDataListItem.Structure
                date={1_696_000_000_000}
                proposalId="PIP-22"
                proposalTitle="Increase quorum to 20%"
                voteIndicator="no"
            />
            <VoteProposalDataListItem.Structure
                date={1_694_000_000_000}
                proposalId="PIP-21"
                proposalTitle="Renew the security audit retainer"
                voteIndicator="abstain"
            />
        </div>
    </GukModulesProvider>
)
```

### VetoVote

```jsx
() => (
    <GukModulesProvider>
        <VoteProposalDataListItem.Structure
            date={1_697_000_000_000}
            isVeto={true}
            proposalId="OP-7"
            proposalTitle="Emergency treasury reallocation"
            voteIndicator="veto"
            voteIndicatorDescription="optimistic stage"
        />
    </GukModulesProvider>
)
```

### Loading

```jsx
() => (
    <GukModulesProvider>
        <VoteProposalDataListItem.Skeleton />
    </GukModulesProvider>
)
```

## Related

`VoteProposalDataListItem.Structure`, `VoteProposalDataListItem.Skeleton`
