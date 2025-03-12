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
     * Gap between the children elements.
     */
    gap?: number; // it's passed as prop because it's used in the calculation of the content size!
    /**
     * Speed of the carousel.
     */
    speed?: number;
    /**
     * Speed of the carousel when hovering. We slow down the carousel when hovering.
     */
    speedOnHover?: number;
    /**
     * Delay before starting the animation. In seconds.
     */
    animationDelay?: number;
    /**
     * Additional class name to apply to the component.
     */
    className?: string;
}

export const Carousel: React.FC<ICarouselProps> = (props) => {
    const { children, gap = 16, speed = 100, speedOnHover, animationDelay, className } = props;

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
    }, [translation, currentSpeed, width, gap]);

    const hoverProps = speedOnHover
        ? {
              onHoverStart: () => {
                  setCurrentSpeed(speedOnHover);
              },
              onHoverEnd: () => {
                  setCurrentSpeed(speed);
              },
          }
        : {};

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
                {...hoverProps}
            >
                {children}
                {children}
            </motion.div>
        </div>
    );
};
