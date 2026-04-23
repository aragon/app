import classNames from 'classnames';
import { useMemo } from 'react';

export interface IFlowBlockieAvatarProps {
    address: string;
    size?: number;
    className?: string;
}

const hashFn = (seed: string) => {
    let x = 1_779_033_703 ^ seed.length;
    for (let i = 0; i < seed.length; i += 1) {
        x = Math.imul(x ^ seed.charCodeAt(i), 3_432_918_353);
        x = (x << 13) | (x >>> 19);
    }
    return () => {
        x = Math.imul(x ^ (x >>> 16), 2_246_822_507);
        x = Math.imul(x ^ (x >>> 13), 3_266_489_909);
        x ^= x >>> 16;
        return (x >>> 0) / 4_294_967_296;
    };
};

const pickColor = (rand: () => number): string => {
    const hues = [210, 24, 140, 280, 190, 340, 44, 100, 260];
    const hue = hues[Math.floor(rand() * hues.length)];
    const lightness = 55 + Math.floor(rand() * 15);
    return `hsl(${hue}, 55%, ${lightness}%)`;
};

export const FlowBlockieAvatar: React.FC<IFlowBlockieAvatarProps> = (props) => {
    const { address, size = 24, className } = props;

    const rects = useMemo(() => {
        const rand = hashFn(address);
        const primary = pickColor(rand);
        const secondary = pickColor(rand);
        const pixels: { x: number; y: number; color: string }[] = [];
        for (let y = 0; y < 5; y += 1) {
            for (let x = 0; x < 3; x += 1) {
                const on = rand() > 0.5;
                const color = on ? primary : secondary;
                pixels.push({ x, y, color });
                if (x < 2) {
                    pixels.push({ x: 4 - x, y, color });
                }
            }
        }
        return pixels;
    }, [address]);

    return (
        <svg
            aria-hidden={true}
            className={classNames(
                'shrink-0 overflow-hidden rounded-full',
                className,
            )}
            height={size}
            viewBox="0 0 20 20"
            width={size}
            xmlns="http://www.w3.org/2000/svg"
        >
            {rects.map((pixel) => (
                <rect
                    fill={pixel.color}
                    height={4}
                    key={`${pixel.x}-${pixel.y}`}
                    width={4}
                    x={pixel.x * 4}
                    y={pixel.y * 4}
                />
            ))}
        </svg>
    );
};
