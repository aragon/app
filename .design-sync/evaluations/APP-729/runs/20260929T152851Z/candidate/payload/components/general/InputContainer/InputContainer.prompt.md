InputContainer from @aragon/gov-ui-kit. Use via `window.GovUiKit.InputContainer` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface InputContainerProps {
  /** Label of the input. */
  label?: React.ReactNode;
  style?: React.CSSProperties;
  /** Classes for the component. */
  className?: string;
  /** Id of the input field. */
  id: string;
  /** Children of the component. */
  children?: React.ReactNode;
  /** Displays the input as disabled when set to true. */
  disabled?: boolean;
  /** Variant of the input. */
  variant?: "default" | "warning" | "critical";
  /** Help text displayed above the input. */
  helpText?: string;
  /** Displays the optional tag when set to true. */
  isOptional?: boolean;
  /** Alert displayed below the input. */
  alert?: IInputContainerAlert;
  /** Displays an input length counter when set. */
  maxLength?: number;
  /** Current input length displayed when maxLength property is set. */
  inputLength?: number;
  /** Classes for the input wrapper. */
  wrapperClassName?: string;
  /** Does not render the default input wrapper when set to true, to be used for using the base input container properties (la */
  useCustomWrapper?: boolean;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```
