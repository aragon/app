import classNames from 'classnames';
import { animate, motion, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';

export interface IDaoCarouselProps {
    children: React.ReactNode;
    gap?: number;
    speed?: number;
    className?: string;
}
// https://motion-primitives.com/docs/infinite-slider
// https://www.ui-layouts.com/components/framer-carousel
export const DaoCarousel: React.FC<IDaoCarouselProps> = (props) => {
    const { children, gap = 16, speed = 100, className } = props;

    const [currentSpeed, setCurrentSpeed] = useState(speed);
    const [ref, { width, height }] = useMeasure();
    const translation = useMotionValue(0);

    const [isDragging, setIsDragging] = useState(false); // state to check if the user is dragging the carousel

    useEffect(() => {
        if (isDragging) {
            // don't animate if the user is dragging the carousel
            return;
        }

        const size = width;
        const contentSize = size + gap;
        // Use the current position as starting point (to support dragging)
        const currentPosition = translation.get();
        const from = currentPosition;
        const to = -contentSize / 2;

        const distanceToTravel = Math.abs(to - from);
        const duration = distanceToTravel / currentSpeed;

        const controls = animate(translation, [from, to], {
            ease: 'linear',
            duration: duration,
            repeat: Infinity,
            repeatType: 'loop',
            repeatDelay: 0,
            onRepeat: () => {
                translation.set(from);
            },
        });

        return controls.stop;
    }, [translation, currentSpeed, width, height, gap, isDragging]);

    return (
        <div className={classNames('overflow-hidden', className)}>
            <motion.div
                drag="x"
                whileDrag={{ scale: 0.95 }}
                dragElastic={0}
                dragConstraints={{ right: 0, left: -width / 2 }}
                dragTransition={{ bounceDamping: 30 }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => {
                    setIsDragging(false);
                }}
                className="flex w-max cursor-grab will-change-transform active:cursor-grabbing"
                style={{
                    x: translation,
                    gap: `${String(gap)}px`,
                    flexDirection: 'row',
                }}
                ref={ref}
            >
                {children}
                {children}
            </motion.div>
        </div>
    );
};
