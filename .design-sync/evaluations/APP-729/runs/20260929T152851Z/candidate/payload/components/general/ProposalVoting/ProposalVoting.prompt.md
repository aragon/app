ProposalVoting from @aragon/gov-ui-kit. Use via `window.GovUiKit.ProposalVoting` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `ProposalVoting.BreakdownMultisig`, `ProposalVoting.BreakdownToken`, `ProposalVoting.Container`, `ProposalVoting.Details`, `ProposalVoting.StageContainer`, `ProposalVoting.Stage`, `ProposalVoting.Votes`, `ProposalVoting.BodySummary`, `ProposalVoting.BodySummaryList`, `ProposalVoting.BodySummaryListItem`, `ProposalVoting.BodyContent`. Compose only these listed members, following the examples below. The `<ProposalVoting>` root is callable; no unlisted `Item` or `Group` member is implied.

## Examples

### SimpleGovernance

```jsx
() => (
    <GukModulesProvider>
        <div style={{ width: '100%', maxWidth: 560 }}>
            <ProposalVoting.Container
                endDate={FUTURE_END}
                status={ProposalStatus.ACTIVE}
            >
                <ProposalVoting.BodyContent
                    name="0xc273…74C7"
                    status={ProposalStatus.ACTIVE}
                >
                    <TokenVotingContent />
                </ProposalVoting.BodyContent>
            </ProposalVoting.Container>
        </div>
    </GukModulesProvider>
)
```

### SingleStageMultisig

```jsx
() => (
    <GukModulesProvider>
        <div style={{ width: '100%', maxWidth: 560 }}>
            <ProposalVoting.StageContainer
                activeStage="0"
                onStageClick={() => undefined}
            >
                <ProposalVoting.Stage
                    name="Security Council Stage"
                    status={ProposalStatus.EXPIRED}
                >
                    <ProposalVoting.BodyContent
                        name="Security Council"
                        status={ProposalStatus.EXPIRED}
                    >
                        <MultisigContent />
                    </ProposalVoting.BodyContent>
                </ProposalVoting.Stage>
            </ProposalVoting.StageContainer>
        </div>
    </GukModulesProvider>
)
```

### MultiStage

```jsx
() => (
    <GukModulesProvider>
        <div style={{ width: '100%', maxWidth: 560 }}>
            <ProposalVoting.StageContainer
                activeStage="0"
                onStageClick={() => undefined}
            >
                <ProposalVoting.Stage
                    endDate={FUTURE_END}
                    name="Security Council Stage"
                    startDate={PAST_START}
                    status={ProposalStatus.ACTIVE}
                >
                    <ProposalVoting.BodyContent
                        name="Security Council"
                        status={ProposalStatus.ACTIVE}
                    >
                        <MultisigContent />
                    </ProposalVoting.BodyContent>
                </ProposalVoting.Stage>
                <ProposalVoting.Stage
                    name="Token Holders Stage"
                    status={ProposalStatus.PENDING}
                >
                    <ProposalVoting.BodyContent
                        name="Token Community"
                        status={ProposalStatus.PENDING}
                    >
                        <TokenVotingContent />
                    </ProposalVoting.BodyContent>
                </ProposalVoting.Stage>
                <ProposalVoting.Stage
                    name="Safe Stage"
                    status={ProposalStatus.PENDING}
                >
                    <ProposalVoting.BodyContent
                        bodyBrand={safeBrand}
                        name="0xd100…11E9"
                        status={ProposalStatus.PENDING}
                    >
                        <ExternalBodyContent />
                    </ProposalVoting.BodyContent>
                </ProposalVoting.Stage>
            </ProposalVoting.StageContainer>
        </div>
    </GukModulesProvider>
)
```

### MultiBody

```jsx
() => (
    <GukModulesProvider>
        <div style={{ width: '100%', maxWidth: 560 }}>
            <ProposalVoting.StageContainer
                activeStage="0"
                onStageClick={() => undefined}
            >
                <ProposalVoting.Stage
                    bodyList={['token', 'safe']}
                    endDate={FUTURE_END}
                    name="Community Stage"
                    startDate={PAST_START}
                    status={ProposalStatus.ACTIVE}
                >
                    <ProposalVoting.BodySummary>
                        <ProposalVoting.BodySummaryList>
                            <ProposalVoting.BodySummaryListItem id="token">
                                <div className="flex grow flex-col gap-3">
                                    <p className="text-neutral-800">
                                        Token Holders
                                    </p>
                                    <Progress
                                        thresholdIndicator={60}
                                        value={30}
                                        variant="neutral"
                                    />
                                    <p className="text-neutral-800">
                                        30 of 60 ARA
                                    </p>
                                </div>
                            </ProposalVoting.BodySummaryListItem>
                            <ProposalVoting.BodySummaryListItem
                                bodyBrand={safeBrand}
                                id="safe"
                            >
                                Founders Approval
                            </ProposalVoting.BodySummaryListItem>
                        </ProposalVoting.BodySummaryList>
                        <p className="text-center text-neutral-500 md:text-right">
                            <span className="text-neutral-800">1 body</span>{' '}
                            required to approve
                        </p>
                    </ProposalVoting.BodySummary>
                    <ProposalVoting.BodyContent
                        bodyId="token"
                        name="Token Holders"
                        status={ProposalStatus.ACTIVE}
                    >
                        <TokenVotingContent />
                    </ProposalVoting.BodyContent>
                    <ProposalVoting.BodyContent
                        bodyBrand={safeBrand}
                        bodyId="safe"
                        hideTabs={[ProposalVotingTab.VOTES]}
                        name="founders.safe.eth"
                        status={ProposalStatus.ACTIVE}
                    >
                        <ExternalBodyContent />
                    </ProposalVoting.BodyContent>
                </ProposalVoting.Stage>
            </ProposalVoting.StageContainer>
        </div>
    </GukModulesProvider>
)
```

## Related

`ProposalVotingProgress`, `ProposalVoting.BreakdownMultisig`, `ProposalVoting.BreakdownToken`, `ProposalVoting.Container`, `ProposalVoting.Details`, `ProposalVoting.StageContainer`, `ProposalVoting.Stage`, `ProposalVoting.Votes`, `ProposalVoting.BodySummary`, `ProposalVoting.BodySummaryList`, `ProposalVoting.BodySummaryListItem`, `ProposalVoting.BodyContent`
