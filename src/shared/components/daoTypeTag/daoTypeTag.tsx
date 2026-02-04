import { Tag, type TagVariant } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export type DaoType = 'main' | 'sub';

export interface IDaoTypeTagProps {
    /**
     * Type of DAO to display.
     */
    type: DaoType;
}

const daoTypeConfig: Record<
    DaoType,
    { labelKey: string; variant: TagVariant }
> = {
    main: {
        labelKey: 'app.shared.daoTypeTag.mainLabel',
        variant: 'primary',
    },
    sub: {
        labelKey: 'app.shared.daoTypeTag.subLabel',
        variant: 'neutral',
    },
};

/**
 * Unified component for displaying Main DAO / SubDAO tags with consistent styling.
 * - Main DAO: primary variant (blue)
 * - SubDAO: neutral variant (gray)
 */
export const DaoTypeTag: React.FC<IDaoTypeTagProps> = (props) => {
    const { type } = props;

    const { t } = useTranslations();

    const config = daoTypeConfig[type];

    return <Tag label={t(config.labelKey)} variant={config.variant} />;
};
