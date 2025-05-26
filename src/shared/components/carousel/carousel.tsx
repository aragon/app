import classNames from 'classnames';
import { animate, motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
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
     * Factor applied to the speed when hovering over the carousel.
     * Values lower than 1 will slow down the carousel. Values higher than 1 will speed up the carousel.
     * @default 1
     */
    speedOnHoverFactor?: number;
    /**
     * Delay in seconds before starting the animation.
     * @default 0
     */
    animationDelay?: number;
    /**
     * Enables manual dragging of the carousel content.
     * @default false
     */
    isDraggable?: boolean;
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
        speedOnHoverFactor = 1,
        animationDelay = 0,
        isDraggable = false,
        className,
    } = props;

    // animation `delay` is not working as expected in combination with the `speed` mutation, so we need to track the animation start manually!
    // issue observed in framer-motion version ^12.4.0
    const [hasAnimationStarted, setHasAnimationStarted] = useState(false);

    // useMeasure is used to get and track (on resize) the width of the carousel content in a performant way.
    const [ref, { width }] = useMeasure();
    const translation = useMotionValue(0);

    const contentSize = width + gap - initialOffset;
    const finalPosition = -contentSize / 2;

    const animationControlsRef = useRef<ReturnType<typeof animate> | null>(null);

    const updateAnimationSpeed = (value: number) => {
        if (animationControlsRef.current) {
            animationControlsRef.current.speed = value;
        }
    };

    useEffect(() => {
        const timeoutHandle = setTimeout(() => setHasAnimationStarted(true), animationDelay * 1000);

        return () => clearTimeout(timeoutHandle);
    }, [animationDelay]);

    useEffect(() => {
        // wait for animation delay and width to be calculated before starting the animation
        if (!hasAnimationStarted || finalPosition === 0) {
            return;
        }

        const distanceToTravel = Math.abs(finalPosition);
        const duration = distanceToTravel / speed;

        // speed is mutated directly on hover, but all other properties will trigger a new animation, causing position to reset!
        animationControlsRef.current?.stop();
        animationControlsRef.current = animate(translation, [0, finalPosition], {
            ease: 'linear',
            duration: duration,
            repeat: Infinity,
            repeatType: 'loop',
            repeatDelay: 0,
        });
    }, [speed, finalPosition, translation, hasAnimationStarted]);

    const containerStyle = { x: translation, gap: `${String(gap)}px`, paddingLeft: `${String(initialOffset)}px` };

    return (
        <div className={classNames('overflow-hidden', className)}>
            <motion.div
                className={classNames(
                    'flex w-max will-change-transform',
                    isDraggable && 'cursor-grab active:cursor-grabbing',
                )}
                style={containerStyle}
                ref={ref}
                drag={isDraggable ? 'x' : false}
                dragConstraints={isDraggable ? { left: finalPosition, right: 0 } : undefined}
                dragElastic={isDraggable ? 0.05 : false}
                onHoverStart={() => updateAnimationSpeed(speedOnHoverFactor)}
                onHoverEnd={() => updateAnimationSpeed(1)}
                onDragStart={() => isDraggable && animationControlsRef.current?.stop()}
                onDragEnd={() => {
                    if (!isDraggable) return;
                    const distanceToTravel = Math.abs(finalPosition);
                    const duration = distanceToTravel / speed;
                    animationControlsRef.current = animate(translation, [translation.get(), finalPosition], {
                        ease: 'linear',
                        duration,
                        repeat: Infinity,
                        repeatType: 'loop',
                    });
                }}
            >
                {children}
                {children}
            </motion.div>
        </div>
    );
};
