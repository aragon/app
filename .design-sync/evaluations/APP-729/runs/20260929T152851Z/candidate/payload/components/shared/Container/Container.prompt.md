Container from @aragon/app. Source: `apps/app/src/shared/components/container/container.tsx`. Use via `window.GovUiKit.Container` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ContainerProps {
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
    <div className="w-full bg-neutral-50 py-6">
        <Container>
            <div className="rounded-xl border border-neutral-200 border-dashed bg-neutral-0 p-6">
                <p className="font-semibold text-base text-neutral-800">
                    Page content
                </p>
                <p className="text-neutral-500 text-sm">
                    Centered with a max width of screen-xl and responsive
                    horizontal padding.
                </p>
            </div>
        </Container>
    </div>
)
```

### PageSection

```jsx
() => (
    <div className="w-full bg-neutral-0 py-6">
        <Container className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg text-neutral-800">
                Proposals
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-neutral-100 p-4">
                    <p className="font-semibold text-neutral-800 text-sm">
                        AIP-42: Fund the Q3 grants program
                    </p>
                    <p className="text-neutral-500 text-sm">
                        Active · ends in 2 days
                    </p>
                </div>
                <div className="rounded-xl border border-neutral-100 p-4">
                    <p className="font-semibold text-neutral-800 text-sm">
                        AIP-41: Update voting duration
                    </p>
                    <p className="text-neutral-500 text-sm">
                        Executed · July 2, 2026
                    </p>
                </div>
            </div>
        </Container>
    </div>
)
```
