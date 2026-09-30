import * as React from 'react';

/**
 * Carousel — from @aragon/app@1.39.1 (apps/app/src/shared/components/carousel/carousel.tsx).
 */
export interface CarouselProps {
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

export declare const Carousel: React.ComponentType<CarouselProps>;
