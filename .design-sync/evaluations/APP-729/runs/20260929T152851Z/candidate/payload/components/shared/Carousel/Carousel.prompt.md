Carousel from @aragon/app. Source: `apps/app/src/shared/components/carousel/carousel.tsx`. Use via `window.GovUiKit.Carousel` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface CarouselProps {
  /** Children to render in the carousel. */
  children: React.ReactNode;
  /** Gap between the children elements in pixels, required to calculate the content size. */
  gap?: number;
  /** Offset to apply to the beginning of the carousel, left padding essentially. */
  initialOffset?: number;
  /** Speed of the carousel. */
  speed?: number;
  /** Factor applied to the speed when hovering over the carousel. Values lower than 1 will slow down the carousel. Values hig */
  speedOnHoverFactor?: number;
  /** Delay in seconds before starting the animation. */
  animationDelay?: number;
  /** Additional class name to apply to the component. */
  className?: string;
  /** When true, enables drag-to-scroll and disables auto-scroll animation. */
  isDraggable?: boolean;
}
```

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
