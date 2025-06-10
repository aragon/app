import { Icon, IconType } from '@aragon/gov-ui-kit';
import { motion } from 'framer-motion';

export interface IBoundlessActionAvatarIconProps {
    /**
     * Whether the parent action item is hovered.
     */
    isHovered: boolean;
}

export const BoundlessActionAvatarIcon: React.FC<IBoundlessActionAvatarIconProps> = (props) => {
    const { isHovered } = props;

    return (
        <>
            {/* Static for small screens */}
            <div className="absolute bottom-0 left-0 md:hidden">
                <div className="inline-flex max-w-fit items-center justify-center rounded-full bg-gradient-to-r from-[#C9C9C9] via-[#C9C9C9] to-[#FFFFFF] p-[1px]">
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#EFEEE7] backdrop-blur-sm">
                        <Icon icon={IconType.LINK_EXTERNAL} size="md" className="text-[#537263]" />
                    </div>
                </div>
            </div>

            {/* Animated for md+ screens */}
            <motion.div
                initial={{ opacity: 0, x: -8, y: 8 }}
                animate={isHovered ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -8, y: 8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute bottom-0 left-0 hidden md:block"
            >
                <div className="inline-flex max-w-fit items-center justify-center rounded-full bg-gradient-to-r from-[#C9C9C9] via-[#C9C9C9] to-[#FFFFFF] p-[1px]">
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#EFEEE7] backdrop-blur-sm">
                        <Icon icon={IconType.LINK_EXTERNAL} size="md" className="text-[#537263]" />
                    </div>
                </div>
            </motion.div>
        </>
    );
};
