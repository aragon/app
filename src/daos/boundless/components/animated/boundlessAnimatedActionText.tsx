import { useTranslations } from '@/shared/components/translationsProvider';
import { motion } from 'framer-motion';

export interface IBoundlessAnimatedActionTextProps {
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

export const BoundlessAnimatedActionText: React.FC<IBoundlessAnimatedActionTextProps> = (props) => {
    const { title, description, isHovered } = props;

    const { t } = useTranslations();

    return (
        <motion.div
            initial={{ y: 0, scale: 1 }}
            animate={isHovered ? { y: -10, scale: 1.03 } : { y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className="flex flex-col items-start"
        >
            <p className="text-2xl leading-tight text-[#000000]">{t(title)}</p>
            <p className="text-nowrap text-lg leading-tight text-[#78716C]">{t(description)}</p>
        </motion.div>
    );
};
