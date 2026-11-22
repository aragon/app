import { motion } from 'framer-motion';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IXmaquinaActionTextProps {
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

export const XmaquinaActionText: React.FC<IXmaquinaActionTextProps> = (
    props,
) => {
    const { title, description, isHovered } = props;
    const { t } = useTranslations();

    return (
        <>
            {/* Static for small screens */}
            <div className="relative z-10 mr-group flex flex-col items-start gap-tight self-start md:hidden">
                <p className="text-xl leading-tight font-medium text-white md:text-2xl">
                    {t(title)}
                </p>
                <p className="text-base leading-tight text-neutral-400 transition-colors duration-500 group-hover:text-black md:text-lg">
                    {t(description)}
                </p>
            </div>

            {/* Animated for md+ screens */}
            <motion.div
                animate={isHovered ? { y: -30 } : { y: 0 }}
                className="relative z-10 hidden w-full flex-col items-start gap-tight md:flex"
                initial={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
                <p className="text-2xl leading-tight font-medium text-white">
                    {t(title)}
                </p>
                <p className="text-lg leading-tight text-neutral-400 transition-colors duration-500 group-hover:text-black">
                    {t(description)}
                </p>
            </motion.div>
        </>
    );
};
