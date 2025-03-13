import classNames from 'classnames';
import { animate, motion, useMotionValue } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import useMeasure from 'react-use-measure';

export interface ICarouselProps {
    /**
     * Children to render in the carousel.
     */
    children: React.ReactNode;
    /**
     * Gap between the children elements in pixels, required to calculate the content size.
     * @default 16
     */
    gap?: number;
    /**
     * Offset to apply to the beginning of the carousel, left padding essentially.
     * @default gap
     */
    initialOffset?: number;
    /**
     * Speed of the carousel.
     * @default 100
     */
    speed?: number;
    /**
     * Speed of the carousel when hovering. We slow down the carousel when hovering.
     * @default speed
     */
    speedOnHover?: number;
    /**
     * Delay in seconds before starting the animation.
     * @default 0
     */
    animationDelay?: number;
    /**
     * Additional class name to apply to the component.
     */
    className?: string;
}

export const Carousel: React.FC<ICarouselProps> = (props) => {
    const {
        children,
        gap = 16,
        initialOffset = gap,
        speed = 100,
        speedOnHover = speed,
        animationDelay = 0,
        className,
    } = props;

    const [currentSpeed, setCurrentSpeed] = useState(speed);
    // useMeasure is used to get and track (on resize) the width of the carousel content in a performant way.
    const [ref, { width }] = useMeasure();
    const translation = useMotionValue(0);

    const contentSize = width + gap - initialOffset;
    const finalPosition = -contentSize / 2;

    const animationControlsRef = useRef<ReturnType<typeof animate> | null>(null);

    /**
     * Animates the carousel infinitely with the current params.
     *
     * Each time we change any of the animation properties, we need to first animate from the current position to the
     * end (with new props), and then we start a new infinite animation.
     */
    const startInfiniteAnimation = useCallback(() => {
        const distanceToTravel = Math.abs(finalPosition);
        const duration = distanceToTravel / currentSpeed;

        animationControlsRef.current?.stop();
        animationControlsRef.current = animate(translation, [0, finalPosition], {
            ease: 'linear',
            duration: duration,
            repeat: Infinity,
            repeatType: 'loop',
            repeatDelay: 0,
        });
    }, [animationDelay, currentSpeed, finalPosition, translation]);

    /**
     * Animate the carousel with the current params until the end of the current cycle.
     */
    const startTransitionAnimation = useCallback(() => {
        const currentPosition = translation.get();
        const remainingDistance = Math.abs(currentPosition - finalPosition);
        const transitionDuration = remainingDistance / currentSpeed;

        animationControlsRef.current?.stop();
        animationControlsRef.current = animate(translation, [currentPosition, finalPosition], {
            ease: 'linear',
            duration: transitionDuration,
            delay: currentPosition === 0 ? animationDelay : 0,
            onComplete: startInfiniteAnimation,
        });
    }, [currentSpeed, finalPosition, startInfiniteAnimation, translation]);

    useEffect(() => {
        // Trigger the transition animation when the component mounts and when any of the relevant animation properties change.
        // Infinite animation is always started through the transition animation's `onComplete` to avoid potential race conditions and sudden jumps to the start.
        startTransitionAnimation();
    }, [animationDelay, currentSpeed, gap, startTransitionAnimation, translation, width]);

    return (
        <div className={classNames('overflow-hidden', className)}>
            <motion.div
                className="flex w-max will-change-transform"
                style={{
                    x: translation,
                    gap: `${String(gap)}px`,
                    paddingLeft: `${String(initialOffset)}px`,
                }}
                ref={ref}
                onHoverStart={() => setCurrentSpeed(speedOnHover)}
                onHoverEnd={() => setCurrentSpeed(speed)}
            >
                {children}
                {children}
            </motion.div>
        </div>
    );
};
