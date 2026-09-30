Heading from @aragon/gov-ui-kit. Use via `window.GovUiKit.Heading` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface HeadingProps {
  /** Specifies the semantic level of the heading, affecting both the HTML element used (e.g., <h1>, <h2>) and its default sty */
  size?: "h1" | "h2" | "h3" | "h4" | "h5";
  /** Optionally overrides the HTML element type that is rendered in the DOM, independent of the heading's semantic level dete */
  as?: "h1" | "h2" | "h3" | "h4" | "h5";
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => <Heading size="h1">Aragon DAO Governance</Heading>
```

### Sizes

```jsx
() => (
    <div className="flex flex-col gap-4">
        <Heading size="h1">Treasury overview (h1)</Heading>
        <Heading size="h2">Active proposals (h2)</Heading>
        <Heading size="h3">Voting settings (h3)</Heading>
        <Heading size="h4">Members and delegates (h4)</Heading>
        <Heading size="h5">Execution details (h5)</Heading>
    </div>
)
```

### SemanticOverride

```jsx
() => (
    <div className="flex flex-col gap-4">
        <Heading as="h5" size="h1">
            Semantic h5 tag rendered at h1 size
        </Heading>
        <Heading as="h1" size="h5">
            Semantic h1 tag rendered at h5 size
        </Heading>
    </div>
)
```
