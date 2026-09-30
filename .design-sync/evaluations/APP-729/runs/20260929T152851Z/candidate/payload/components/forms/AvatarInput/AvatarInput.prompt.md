AvatarInput from @aragon/app. Source: `apps/app/src/shared/components/forms/avatarInput/avatarInput.tsx`. Use via `window.GovUiKit.AvatarInput` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface AvatarInputProps {
  /** The name of the field in the form. */
  name: string;
  /** Label for the input. Defaults to the shared avatar label translation. */
  label?: string;
  /** Help text to display below the input. */
  helpText?: string;
  /** The prefix of the field in the form. */
  fieldPrefix?: string;
  /** Maximum file size in bytes. */
  maxFileSize?: number;
  /** Maximum dimension (width/height) in pixels. */
  maxDimension?: number;
  /** Whether the field is optional. */
  isOptional?: boolean;
  /** Optional default value to init field with. */
  defaultValue?: IInputFileAvatarValue;
}
```

## Examples

### Default

```jsx
() => (
    <AppForm>
        <AvatarInput name="avatar" />
    </AppForm>
)
```

### WithValue

```jsx
() => (
    <AppForm>
        <AvatarInput
            defaultValue={{ url: daoLogoUrl }}
            helpText="Square images of at least 256×256px work best."
            label="DAO logo"
            name="avatar"
        />
    </AppForm>
)
```

### Required

```jsx
() => (
    <AppForm>
        <AvatarInput
            helpText="JPG, PNG or SVG of max. 1MiB."
            isOptional={false}
            label="Token icon"
            name="tokenIcon"
        />
    </AppForm>
)
```
