import { useTranslations } from '@/shared/components/translationsProvider';
import { motion } from 'framer-motion';

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

export const XmaquinaActionText: React.FC<IXmaquinaActionTextProps> = (props) => {
    const { title, description, isHovered } = props;
    const { t } = useTranslations();

    return (
        <>
            {/* Static for small screens */}
            <div className="relative z-10 flex flex-col items-start gap-1 self-start pr-4 md:hidden md:pr-0">
                <p className="text-2xl leading-tight font-medium text-white">{t(title)}</p>
                <p className="text-lg leading-tight text-neutral-400 transition-colors duration-500 group-hover:text-black">
                    {t(description)}
                </p>
            </div>

            {/* Animated for md+ screens */}
            <motion.div
                initial={{ y: 0 }}
                animate={isHovered ? { y: -30 } : { y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="relative z-10 hidden w-full flex-col items-start gap-1 md:flex"
            >
                <p className="text-2xl leading-tight font-medium text-white">{t(title)}</p>
                <p className="text-lg leading-tight text-neutral-400 transition-colors duration-500 group-hover:text-black">
                    {t(description)}
                </p>
            </motion.div>
        </>
    );
};
