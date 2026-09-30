NumberProgressInput from @aragon/gov-ui-kit. Use via `window.GovUiKit.NumberProgressInput` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### Default

```jsx
() => (
    <AppForm>
        <NumberProgressInput
            defaultValue={3}
            fieldName="requiredApprovals"
            helpText="How many bodies must approve before the stage advances."
            label="Required approvals"
            min={0}
            total={5}
            totalLabel="of 5 bodies"
            valueLabel="3"
        />
    </AppForm>
)
```

### WithThresholdAndTags

```jsx
() => (
    <AppForm>
        <NumberProgressInput
            defaultValue={67}
            fieldName="supportThreshold"
            helpText="Share of voting power that must vote yes for a proposal to pass."
            label="Support threshold"
            min={0}
            suffix="%"
            tags={[
                { label: 'No', variant: 'critical' },
                { label: 'Yes', variant: 'success' },
            ]}
            thresholdIndicator={50}
            total={100}
            valueLabel="67%"
        />
    </AppForm>
)
```

### WithAlert

```jsx
() => (
    <AppForm>
        <NumberProgressInput
            alert={{
                message:
                    'A veto threshold above 50% makes proposals very hard to block.',
                variant: 'warning',
            }}
            defaultValue={60}
            fieldName="vetoThreshold"
            helpText="Share of voting power required to veto this stage."
            label="Veto threshold"
            min={0}
            suffix="%"
            thresholdIndicator={50}
            total={100}
            valueLabel="60%"
        />
    </AppForm>
)
```
