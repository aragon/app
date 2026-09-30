InputFileAvatar from @aragon/gov-ui-kit. Use via `window.GovUiKit.InputFileAvatar` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface InputFileAvatarProps {
  /** Function that is called when a file is selected. If the file is rejected, the function is not called. If the file is acc */
  onChange: (value?: IInputFileAvatarValue) => void;
  /** The current value of the input. */
  value?: IInputFileAvatarValue;
  /** Allowed file extensions, it must be an object with the keys set to the MIME type and the values an array of file extensi */
  acceptedFileTypes?: Accept;
  /** Maximum file size in bytes (e.g. 2097152 bytes | 2 * 1024 ** 2 = 2MiB). */
  maxFileSize?: number;
  /** Minimum dimension of the image in pixels. */
  minDimension?: number;
  /** Maximum dimension of the image in pixels. */
  maxDimension?: number;
  /** If true, only square images are accepted. */
  onlySquare?: boolean;
  /** Optional ID for the file avatar input. */
  id?: string;
  /** Label of the input. */
  label?: React.ReactNode;
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
}
```

## Examples

### Default

```jsx
() => (
    <InputFileAvatar
        helpText="JPG, PNG or SVG of max. 2MiB"
        label="DAO logo"
        maxFileSize={2 * 1024 ** 2}
        onChange={noop}
    />
)
```

### WithValue

```jsx
() => (
    <InputFileAvatar
        helpText="Square images work best."
        label="DAO logo"
        onChange={noop}
        value={{ url: daoLogoUrl }}
    />
)
```

### Critical

```jsx
() => (
    <InputFileAvatar
        alert={{
            message: 'The selected file exceeds the 2MiB size limit.',
            variant: 'critical',
        }}
        label="Proposal cover image"
        onChange={noop}
        variant="critical"
    />
)
```

### Disabled

```jsx
() => (
    <InputFileAvatar
        disabled={true}
        helpText="Managed by the token contract metadata."
        label="Token icon"
        onChange={noop}
    />
)
```
