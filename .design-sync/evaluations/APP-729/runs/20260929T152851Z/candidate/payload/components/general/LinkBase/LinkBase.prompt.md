LinkBase from @aragon/gov-ui-kit. Use via `window.GovUiKit.LinkBase` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface LinkBaseProps {
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```
