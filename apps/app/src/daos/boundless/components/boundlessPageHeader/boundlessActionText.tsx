import { motion } from 'framer-motion';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IBoundlessActionTextProps {
    /**
     * Title of the action text.
     */
    title: string;
    /**
     * Description of the action text.
     */
    description: string;
    /**
     * Whether the parent action item is hovered.
     */
    isHovered: boolean;
}

export const BoundlessActionText: React.FC<IBoundlessActionTextProps> = (
    props,
) => {
    const { title, description, isHovered } = props;

    const { t } = useTranslations();

    return (
        <>
            {/* Static for small screens */}
            <div className="flex flex-col items-start md:hidden">
                <p className="type-title-group--dao-header-action-compact text-[#000000]">
                    {t(title)}
                </p>
                <p className="type-supporting--dao-header-action-compact text-nowrap text-[#78716C]">
                    {t(description)}
                </p>
            </div>

            {/* Animated for md+ screens */}
            <motion.div
                animate={
                    isHovered ? { y: -10, scale: 1.03 } : { y: 0, scale: 1 }
                }
                className="hidden flex-col items-start md:flex"
                initial={{ y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 250, damping: 18 }}
            >
                <p className="type-title-group--dao-header-action-compact text-[#000000]">
                    {t(title)}
                </p>
                <p className="type-supporting--dao-header-action-compact text-nowrap text-[#78716C]">
                    {t(description)}
                </p>
            </motion.div>
        </>
    );
};
