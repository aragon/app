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
    isHovered: boolean;
}

export const CryptexActionText: React.FC<ICryptexActionTextProps> = (props) => {
    const { title, description, isHovered } = props;

    const { t } = useTranslations();

    return (
        <motion.div
            animate={isHovered ? { y: -4, scale: 1.02 } : { y: 0, scale: 1 }}
            className="flex flex-col items-start gap-1"
            initial={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
            <p className="text-[#1A1540] text-xl leading-tight md:text-2xl">
                {t(title)}
            </p>
            <p className="text-[#2E2950]/75 text-sm leading-snug md:text-base">
                {t(description)}
            </p>
        </motion.div>
    );
};
