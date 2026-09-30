Rerender from @aragon/gov-ui-kit. Use via `window.GovUiKit.Rerender` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface RerenderProps {
  /** The duration in milliseconds between each rerender. */
  intervalDuration?: number;
  /** Time-sensitive content to render. */
  children: (currentTime: number) => ReactNode;
}
```
