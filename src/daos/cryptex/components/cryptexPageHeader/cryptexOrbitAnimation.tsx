'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import TokenLogo from '../../assets/cryptex-token-logo.png';
import { TOKEN_ICONS } from '../../assets/icons/tokenIcons';
import { CRYPTEX40_TOKENS } from '../../constants/tokens';

export const ORBIT_SIZE = 640;
const COIN_SIZE = 240;
const OUTER_RADIUS = 285;
const INNER_RADIUS = 210;
const OUTER_TOKEN_SIZE = 32;
const INNER_TOKEN_SIZE = 27;
const OUTER_SPEED = '120s';
const INNER_SPEED = '80s';

const OUTER_TOKENS = CRYPTEX40_TOKENS.slice(0, 25);
const INNER_TOKENS = CRYPTEX40_TOKENS.slice(25);

interface IOrbitRingProps {
    tokens: readonly string[];
    radius: number;
    tokenSize: number;
    speed: string;
    reverse?: boolean;
}

const OrbitRing: React.FC<IOrbitRingProps> = ({
    tokens,
    radius,
    tokenSize,
    speed,
    reverse,
}) => (
    <div
        className="absolute inset-0 animate-spin"
        style={{
            animationDuration: speed,
            animationDirection: reverse ? 'reverse' : 'normal',
        }}
    >
        {tokens.map((symbol, i) => {
            const angle = (i / tokens.length) * 2 * Math.PI - Math.PI / 2;
            const cx = Math.round(
                ORBIT_SIZE / 2 + radius * Math.cos(angle) - tokenSize / 2,
            );
            const cy = Math.round(
                ORBIT_SIZE / 2 + radius * Math.sin(angle) - tokenSize / 2,
            );
            const icon = TOKEN_ICONS[symbol];

            if (!icon) {
                return null;
            }

            return (
                <div
                    className="pointer-events-none absolute animate-spin"
                    key={symbol}
                    style={{
                        left: `${cx}px`,
                        top: `${cy}px`,
                        width: `${tokenSize}px`,
                        height: `${tokenSize}px`,
                        animationDuration: speed,
                        animationDirection: reverse ? 'normal' : 'reverse',
                    }}
                >
                    <Image
                        alt={symbol}
                        className="rounded-full shadow-sm ring-1 ring-white/15"
                        height={tokenSize}
                        src={icon}
                        width={tokenSize}
                    />
                </div>
            );
        })}
    </div>
);

export const CryptexOrbitAnimation: React.FC = () => {
    const center = ORBIT_SIZE / 2;

    return (
        <div
            className="relative"
            style={{ width: ORBIT_SIZE, height: ORBIT_SIZE }}
        >
            {/* Ambient glow */}
            <div
                className="absolute rounded-full bg-purple-500/10 blur-3xl"
                style={{
                    width: '280%',
                    height: '150%',
                    top: '-8%',
                    left: '-92%',
                    transform: 'rotate(-25deg)',
                }}
            />

            {/* SVG orbital path rings with draw-on entrance */}
            <div className="pointer-events-none absolute inset-0">
                <svg
                    aria-hidden="true"
                    className="absolute inset-0"
                    focusable="false"
                    height={ORBIT_SIZE}
                    width={ORBIT_SIZE}
                >
                    <motion.circle
                        animate={{ pathLength: 1 }}
                        className="stroke-purple-500/10"
                        cx={center}
                        cy={center}
                        fill="none"
                        initial={{ pathLength: 0 }}
                        r={OUTER_RADIUS}
                        strokeWidth={1}
                        transition={{
                            delay: 0.3,
                            duration: 2,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.circle
                        animate={{ pathLength: 1 }}
                        className="stroke-purple-400/[0.08]"
                        cx={center}
                        cy={center}
                        fill="none"
                        initial={{ pathLength: 0 }}
                        r={INNER_RADIUS}
                        strokeWidth={1}
                        transition={{
                            delay: 0.6,
                            duration: 1.8,
                            ease: 'easeInOut',
                        }}
                    />
                </svg>
            </div>

            {/* Conic gradient milky-way sweep */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{ opacity: 0.2 }}
                    className="animate-spin rounded-full blur-[2px]"
                    initial={{ opacity: 0 }}
                    style={{
                        width: ORBIT_SIZE * 5,
                        height: ORBIT_SIZE * 5,
                        background:
                            'conic-gradient(from 0deg, transparent 0%, rgba(168,85,247,0.12) 15%, rgba(168,85,247,0.06) 30%, transparent 50%, rgba(168,85,247,0.08) 70%, transparent 85%)',
                        animationDuration: OUTER_SPEED,
                        WebkitMaskImage:
                            'radial-gradient(circle, black 44%, rgba(0,0,0,0.72) 72%, transparent 100%)',
                        maskImage:
                            'radial-gradient(circle, black 44%, rgba(0,0,0,0.72) 72%, transparent 100%)',
                    }}
                    transition={{ delay: 0.45, duration: 1.1 }}
                />
            </div>

            {/* Outer orbit — 25 tokens, clockwise */}
            <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0 }}
                transition={{
                    delay: 0.8,
                    duration: 1.5,
                    ease: [0.21, 0.47, 0.32, 0.98],
                }}
            >
                <OrbitRing
                    radius={OUTER_RADIUS}
                    speed={OUTER_SPEED}
                    tokenSize={OUTER_TOKEN_SIZE}
                    tokens={OUTER_TOKENS}
                />
            </motion.div>

            {/* Inner orbit — 15 tokens, counter-clockwise */}
            <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0 }}
                transition={{
                    delay: 1.0,
                    duration: 1.5,
                    ease: [0.21, 0.47, 0.32, 0.98],
                }}
            >
                <OrbitRing
                    radius={INNER_RADIUS}
                    reverse={true}
                    speed={INNER_SPEED}
                    tokenSize={INNER_TOKEN_SIZE}
                    tokens={INNER_TOKENS}
                />
            </motion.div>

            {/* Central CTX logo */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    transition={{
                        delay: 0.2,
                        duration: 0.8,
                        ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 scale-150 rounded-full bg-purple-500/20 blur-2xl" />
                        <Image
                            alt="Cryptex"
                            className="relative drop-shadow-2xl"
                            height={COIN_SIZE}
                            priority={true}
                            src={TokenLogo}
                            width={COIN_SIZE}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
