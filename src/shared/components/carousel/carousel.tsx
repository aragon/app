import classNames from 'classnames';
import { animate, motion, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';
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
    const { children, gap = 16, speed = 100, speedOnHover = speed, animationDelay = 0, className } = props;

    const [currentSpeed, setCurrentSpeed] = useState(speed);
    const [ref, { width }] = useMeasure();
    const translation = useMotionValue(0);

    // Each time we change any of the animation properties, we need to first animate from the current position to the
    // end (with new props), and then we start a new infinite animation.
    const [shouldScheduleTransitionAnimation, setShouldScheduleTransitionAnimation] = useState(false);

    useEffect(() => {
        const contentSize = width + gap;
        const finalPosition = -contentSize / 2;

        if (shouldScheduleTransitionAnimation) {
            // animate until the end of the current cycle
            const currentPosition = translation.get();
            const remainingDistance = Math.abs(currentPosition - finalPosition);
            const transitionDuration = remainingDistance / currentSpeed;

            const animationControls = animate(translation, [currentPosition, finalPosition], {
                ease: 'linear',
                duration: transitionDuration,
                onComplete: () => {
                    setShouldScheduleTransitionAnimation(false);
                },
            });

            return animationControls.stop;
        }

        // start of the cycle - schedule new infinite animation
        const distanceToTravel = Math.abs(finalPosition);
        const duration = distanceToTravel / currentSpeed;
        const animationControls = animate(translation, [0, finalPosition], {
            ease: 'linear',
            duration: duration,
            delay: animationDelay,
            repeat: Infinity,
            repeatType: 'loop',
            repeatDelay: 0,
        });

        return animationControls.stop;
    }, [animationDelay, currentSpeed, gap, shouldScheduleTransitionAnimation, translation, width]);

    useEffect(() => {
        if (translation.get() === 0) {
            // if the carousel is at the start, we don't need to schedule the transition animation!
            return;
        }

        // schedule the transition animation when any of the relevant props change
        setShouldScheduleTransitionAnimation(true);
    }, [animationDelay, currentSpeed, gap, translation, width]);

    return (
        // overflow-visible is used to prevent the carousel from being clipped by the parent container, but some of the
        // containers above may need to have overflow-hidden to prevent the carousel from overflowing the whole page.
        <div className={classNames('overflow-visible', className)}>
            <motion.div
                className="flex w-max will-change-transform"
                style={{
                    x: translation,
                    gap: `${String(gap)}px`,
                }}
                ref={ref}
                onHoverStart={() => {
                    setCurrentSpeed(speedOnHover);
                }}
                onHoverEnd={() => {
                    setCurrentSpeed(speed);
                }}
            >
                {children}
                {children}
            </motion.div>
        </div>
    );
};
