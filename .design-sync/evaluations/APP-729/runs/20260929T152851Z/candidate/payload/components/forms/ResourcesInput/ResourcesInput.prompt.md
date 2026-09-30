ResourcesInput from @aragon/app. Source: `apps/app/src/shared/components/forms/resourcesInput/resourcesInput.tsx`. Use via `window.GovUiKit.ResourcesInput` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ResourcesInputProps {
  /** The name of the field in the form. */
  name: string;
  /** The name of the field in the form. */
  helpText: string;
  /** The prefix of the field in the form. */
  fieldPrefix?: string;
  /** Optional default value to init field with. */
  defaultValue?: IResource[];
}
```

## Examples

### Default

```jsx
() => (
    <AppForm>
        <ResourcesInput
            helpText="Link the discussions, docs or forum posts that give this proposal context."
            name="resources"
        />
    </AppForm>
)
```

### Filled

```jsx
() => (
    <AppForm
        defaultValues={{
            resources: [
                {
                    name: 'Forum discussion',
                    url: 'https://forum.aragon.org/t/treasury-diversification/412',
                },
                {
                    name: 'Governance docs',
                    url: 'https://docs.aragon.org/governance',
                },
            ],
        }}
    >
        <ResourcesInput
            helpText="Add links so members can review the full context before voting."
            name="resources"
        />
    </AppForm>
)
```
