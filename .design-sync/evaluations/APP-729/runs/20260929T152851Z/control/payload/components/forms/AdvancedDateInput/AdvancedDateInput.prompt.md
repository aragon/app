AdvancedDateInput from @aragon/gov-ui-kit. Use via `window.GovUiKit.AdvancedDateInput` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### Default

```jsx
() => (
    <AppForm>
        <AdvancedDateInput
            field="startTime"
            helpText="Define when the proposal opens for voting."
            label="Start time"
            minTime={unusedMinTime}
        />
    </AppForm>
)
```

### Duration

```jsx
() => (
    <AppForm>
        <AdvancedDateInput
            field="votingPeriod"
            helpText="Members can vote until the period ends."
            label="Voting period"
            minDuration={{ days: 7, hours: 0, minutes: 0 }}
            minTime={unusedMinTime}
            useDuration={true}
        />
    </AppForm>
)
```

### DurationWithInfo

```jsx
() => (
    <AppForm>
        <AdvancedDateInput
            field="stageExpiration"
            helpText="How long this stage stays open for approvals."
            infoText="The stage advances as soon as the approval threshold is met."
            label="Stage expiration"
            minDuration={{ days: 3, hours: 0, minutes: 0 }}
            minTime={unusedMinTime}
            useDuration={true}
        />
    </AppForm>
)
```
