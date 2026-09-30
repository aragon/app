Carousel from @aragon/gov-ui-kit. Use via `window.GovUiKit.Carousel` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### Default

```jsx
() => (
    <div className="w-full">
        <Carousel gap={16} initialOffset={0} isDraggable={true}>
            {featuredDaos.map((dao) => (
                <DaoCard key={dao.name} {...dao} />
            ))}
        </Carousel>
    </div>
)
```

### Marquee

```jsx
() => (
    <div className="w-full">
        <Carousel gap={16} speed={40} speedOnHoverFactor={0.2}>
            {featuredDaos.slice(0, 4).map((dao) => (
                <DaoCard key={dao.name} {...dao} />
            ))}
        </Carousel>
    </div>
)
```
