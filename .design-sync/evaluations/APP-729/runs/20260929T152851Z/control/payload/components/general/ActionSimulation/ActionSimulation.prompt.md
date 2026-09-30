ActionSimulation from @aragon/gov-ui-kit. Use via `window.GovUiKit.ActionSimulation` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ActionSimulationProps {
  /** Total number of actions in the proposal. */
  totalActions: number;
  /** Last simulation data including timestamp, URL, and status. */
  lastSimulation?: IActionSimulationRun;
  /** Whether simulation is currently running. */
  isLoading?: boolean;
  /** Whether the proposal can be simulated. */
  isEnabled?: boolean;
  /** Callback when simulate again button is clicked. */
  onSimulate?: () => void;
  /** Additional class names applied to the wrapper div. */
  className?: string;
  /** Optional error message to display. */
  error?: string;
}
```

## Examples

### Success

```jsx
() => (
    <GukModulesProvider>
        <ActionSimulation
            className="flex-1"
            lastSimulation={{
                timestamp: 1_698_000_000_000,
                url: 'https://dashboard.tenderly.co/simulation/12345',
                status: 'success',
            }}
            totalActions={3}
        />
    </GukModulesProvider>
)
```

### Failed

```jsx
() => (
    <GukModulesProvider>
        <ActionSimulation
            className="flex-1"
            lastSimulation={{
                timestamp: 1_698_000_000_000,
                url: 'https://dashboard.tenderly.co/simulation/12345',
                status: 'failed',
            }}
            totalActions={2}
        />
    </GukModulesProvider>
)
```

### Loading

```jsx
() => (
    <GukModulesProvider>
        <ActionSimulation
            className="flex-1"
            isLoading={true}
            totalActions={5}
        />
    </GukModulesProvider>
)
```

### NoPreviousSimulation

```jsx
() => (
    <GukModulesProvider>
        <ActionSimulation className="flex-1" totalActions={1} />
    </GukModulesProvider>
)
```
