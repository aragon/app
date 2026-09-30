AvatarInput from @aragon/gov-ui-kit. Use via `window.GovUiKit.AvatarInput` (bundle loaded from the root `_ds_bundle.js`).

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
