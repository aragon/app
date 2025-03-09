import classNames from 'classnames';
import { animate, motion, useMotionValue } from 'motion/react';
import { useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';

export interface IDaoCarouselProps {
    children: React.ReactNode;
    gap?: number;
    speed?: number;
    speedOnHover?: number;
    reverse?: boolean;
    className?: string;
}
// https://motion-primitives.com/docs/infinite-slider
// https://www.ui-layouts.com/components/framer-carousel
export const DaoCarousel: React.FC<IDaoCarouselProps> = (props) => {
    const { children, gap = 16, speed = 100, speedOnHover, reverse = false, className } = props;

    const [currentSpeed, setCurrentSpeed] = useState(speed);
    const [ref, { width, height }] = useMeasure();
    const translation = useMotionValue(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [key, setKey] = useState(0);

    useEffect(() => {
        let controls;
        const size = width;
        const contentSize = size + gap;
        const from = reverse ? -contentSize / 2 : 0;
        const to = reverse ? 0 : -contentSize / 2;

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
    }, [key, translation, currentSpeed, width, height, gap, isTransitioning, reverse]);

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
                drag="x"
                whileDrag={{ scale: 0.95 }}
                onClick={(e) => {
                    console.log('ekjekjek', e);
                }}
                onDragEnd={(e) => {
                    console.log('END', translation.get());
                    setIsTransitioning(true);
                }}
                // onPanEnd={( ) =>{
                //
                // }}
                //
                dragElastic={0.9}
                dragConstraints={{ right: 0, left: -2 * width }}
                // dragTransition={{ bounceDamping: 30 }}
                className="flex w-max cursor-grab will-change-transform active:cursor-grabbing"
                style={{
                    x: translation,
                    gap: `${String(gap)}px`,
                    flexDirection: 'row',
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
