import classNames from 'classnames';
import { animate, motion, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';

export interface IDaoCarouselProps {
    /**
     * Children to render in the carousel. DaoCarouselCard used in the explore page.
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
     * Additional class name to apply to the component.
     */
    className?: string;
}

export const DaoCarousel: React.FC<IDaoCarouselProps> = (props) => {
    const { children, gap = 16, speed = 100, speedOnHover, className } = props;

    const [currentSpeed, setCurrentSpeed] = useState(speed);
    const [ref, { width, height }] = useMeasure();
    const translation = useMotionValue(0);

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [key, setKey] = useState(0);

    useEffect(() => {
        let controls;

        const size = width;
        const contentSize = size + gap;
        const from = 0;
        const to = -contentSize / 2;

        const distanceToTravel = Math.abs(to - from);
        const duration = distanceToTravel / currentSpeed;

        if (isTransitioning) {
            const remainingDistance = Math.abs(translation.get() - to);
            const transitionDuration = remainingDistance / currentSpeed;

            controls = animate(translation, [translation.get(), to], {
                ease: 'linear',
                duration: transitionDuration,
                onComplete: () => {
                    setIsTransitioning(false);
                    setKey((prevKey) => prevKey + 1);
                },
            });
        } else {
            controls = animate(translation, [from, to], {
                ease: 'linear',
                duration: duration,
                repeat: Infinity,
                repeatType: 'loop',
                repeatDelay: 0,
                onRepeat: () => {
                    translation.set(from);
                },
            });
        }

        return controls.stop;
    }, [key, translation, currentSpeed, width, height, gap, isTransitioning]);

    const hoverProps = speedOnHover
        ? {
              onHoverStart: () => {
                  setIsTransitioning(true);
                  setCurrentSpeed(speedOnHover);
              },
              onHoverEnd: () => {
                  setIsTransitioning(true);
                  setCurrentSpeed(speed);
              },
          }
        : {};

    return (
        <div className={classNames('overflow-hidden', className)}>
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
