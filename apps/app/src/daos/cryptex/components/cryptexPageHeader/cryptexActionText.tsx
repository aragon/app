import { motion } from 'framer-motion';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface ICryptexActionTextProps {
    /**
     * Title of the action text.
     */
    title: string;
    /**
     * Description of the action text.
     */
    description: string;
    /**
     * Whether the parent action item is currently hovered.
     */
    isHovered: boolean;
    /**
     * Whether the header is rendered in light mode.
     */
    isLightMode?: boolean;
}

export const CryptexActionText: React.FC<ICryptexActionTextProps> = (props) => {
    const { title, description, isHovered, isLightMode } = props;

    const { t } = useTranslations();

    return (
        <motion.div
            animate={isHovered ? { y: -4, scale: 1.02 } : { y: 0, scale: 1 }}
            className="flex flex-col items-start gap-1"
            initial={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
            <p
                className={
                    isLightMode
                        ? 'text-xl leading-tight text-[#1A1540] md:text-2xl'
                        : 'text-xl leading-tight text-white md:text-2xl'
                }
            >
                {t(title)}
            </p>
            <p
                className={
                    isLightMode
                        ? 'text-sm leading-snug text-[#2E2950]/75 md:text-base'
                        : 'text-sm leading-snug text-white/50 md:text-base'
                }
            >
                {t(description)}
            </p>
        </motion.div>
    );
};
