NumberProgressInput from @aragon/app. Source: `apps/app/src/shared/components/forms/numberProgressInput/numberProgressInput.tsx`. Use via `window.GovUiKit.NumberProgressInput` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface NumberProgressInputProps {
  /** Name of the form field. */
  fieldName: string;
  /** Label displayed above the input and used in validation messages. */
  label: string;
  /** Label displayed above the progress component. */
  valueLabel?: string;
  /** Default value for the form field. */
  defaultValue?: number;
  /** Value used for normalising the value and display it on the progress. */
  total: number;
  /** Label displayed below the progress component. */
  totalLabel?: string;
  /** Alert displayed below the input component. */
  alert?: Pick<IAlertInlineProps, "variant" | "message">;
  /** Threshold indicator for the progress component */
  thresholdIndicator?: number;
  /** Optional tags to be displayed to the left and right of the progress component. The first tag will be displayed to the le */
  tags?: [ITagProps, ITagProps];
  children?: React.ReactNode;
  id?: string;
  /** Variant of the input. */
  variant?: "warning" | "default" | "critical";
  /** Help text displayed above the input. */
  helpText?: string;
  /** Displays the optional tag when set to true. */
  isOptional?: boolean;
  /** Displays the input as disabled when set to true. */
  disabled?: boolean;
  /** Classes for the component. */
  className?: string;
  /** Classes for the input wrapper. */
  wrapperClassName?: string;
  /** Upper bound of the input. Values above it are clamped to it, so render an out-of-range error state through the `alert` p */
  max?: number;
  /** Lower bound of the input. A committed value below it is raised to it, but partial input is not blocked (typing `5` on th */
  min?: number;
  /** Specifies the granularity of the intervals for the input value. */
  step?: number;
  style?: CSSProperties;
  /** Optional string prepended to the input value. */
  prefix?: string;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  /** Classes for the input element. */
  inputClassName?: string;
  /** Optional string appended to the input value. */
  suffix?: string;
}
```

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
