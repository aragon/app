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

    useEffect(() => {
        const contentSize = width + gap;
        const from = translation.get();
        const to = -contentSize / 2;

        const distanceToTravel = Math.abs(to - from);
        const duration = distanceToTravel / currentSpeed;

        const isInitialAnimation = !translation.isAnimating();

        const controls = animate(translation, [from, to], {
            ease: 'linear',
            duration: duration,
            delay: isInitialAnimation ? animationDelay : 0,
            repeat: Infinity,
            repeatType: 'loop',
            repeatDelay: 0,
            onRepeat: () => {
                translation.set(from);
            },
        });

        return controls.stop;
    }, [translation, currentSpeed, width, gap, animationDelay]);

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
