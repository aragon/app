import { Icon, IconType } from '@aragon/gov-ui-kit';
import { motion } from 'framer-motion';

export interface ICryptexActionAvatarIconProps {
    /**
     * Whether the parent action item is hovered.
     */
    isHovered: boolean;
    /**
     * Whether the header is rendered in light mode.
     */
    isLightMode?: boolean;
}

export const CryptexActionAvatarIcon: React.FC<
    ICryptexActionAvatarIconProps
> = (props) => {
    const { isHovered, isLightMode } = props;

    return (
        <motion.div
            animate={
                isHovered
                    ? { opacity: 1, x: 0, y: 0, scale: 1 }
                    : { opacity: 0, x: 6, y: -6, scale: 0.8 }
            }
            className="absolute top-3 right-3 md:top-4 md:right-4"
            initial={{ opacity: 0, x: 6, y: -6, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        >
            <div
                className={
                    isLightMode
                        ? 'flex size-7 items-center justify-center rounded-full bg-[#2F2547]/12'
                        : 'flex size-7 items-center justify-center rounded-full bg-white/10'
                }
            >
                <Icon
                    className={
                        isLightMode ? 'text-[#2A2142]/70' : 'text-white/70'
                    }
                    icon={IconType.LINK_EXTERNAL}
                    size="sm"
                />
            </div>
        </motion.div>
    );
};
