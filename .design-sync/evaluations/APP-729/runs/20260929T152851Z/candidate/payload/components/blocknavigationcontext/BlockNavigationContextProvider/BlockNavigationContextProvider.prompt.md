BlockNavigationContextProvider from @aragon/app. Source: `apps/app/src/shared/components/blockNavigationContext/blockNavigationContext.tsx`. Use via `window.GovUiKit.BlockNavigationContextProvider` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface BlockNavigationContextProviderProps {
  /** Children of the provider. */
  children: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
    <BlockNavigationContextProvider>
        <div className="flex w-full flex-col gap-2 rounded-xl border border-neutral-100 p-4">
            <p className="font-semibold text-neutral-800">
                Navigation-blocking context
            </p>
            <p className="text-neutral-500">
                Renderless provider. Wrap wizards and multi-step forms in it so
                unsaved-changes confirmation can intercept navigation.
            </p>
        </div>
    </BlockNavigationContextProvider>
)
```
