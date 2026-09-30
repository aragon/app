AdvancedDateInput from @aragon/app. Source: `apps/app/src/shared/components/forms/advancedDateInput/advancedDateInput.tsx`. Use via `window.GovUiKit.AdvancedDateInput` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface AdvancedDateInputProps {
  /** Renders a duration field instead of the "now" selector when set to true. */
  useDuration?: boolean;
  /** Name of the field set on the form context. */
  field: string;
  /** Label of the date input. */
  label: string;
  /** Info text for the input. */
  infoText?: string;
  /** Defines how the info text is displayed. */
  infoDisplay?: "inline" | "card";
  /** Minimum (recommended) duration added to the minTime for the input. */
  minDuration?: IDateDuration;
  /** Minimum time for fixed input. */
  minTime: DateTime<boolean>;
  /** Validates that the selected date is valid usign the minDuration property when set to true. */
  validateMinDuration?: boolean;
  /** Help text displayed above the input. */
  helpText?: string;
}
```

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
