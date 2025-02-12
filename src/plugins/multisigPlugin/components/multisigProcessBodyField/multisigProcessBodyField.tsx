import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList } from '@aragon/gov-ui-kit';

export interface IMultisigProcessBody {
    /**
     * Members of the body.
     */
    members: string[];
    /**
     * Threshold of the body.
     */
    multisigThreshold: number;
}

export interface IMultisigProcessBodyFieldProps {
    /**
     * The field from the create process form.
     */
    field: IMultisigProcessBody;
}

export const MultisigProcessBodyField = (props: IMultisigProcessBodyFieldProps) => {
    const { t } = useTranslations();

    const { field } = props;
    const { members, multisigThreshold } = field;

    const baseTranslationKey = 'app.plugins.multisig.multisigProcessBodyField';

    return (
        <DefinitionList.Container className="w-full">
            <DefinitionList.Item term={t(`${baseTranslationKey}.membersTerm`)}>
                {t(`${baseTranslationKey}.membersDefinition`, { count: members.length })}
            </DefinitionList.Item>
            <DefinitionList.Item term={t(`${baseTranslationKey}.thresholdTerm`)}>
                {t(`${baseTranslationKey}.thresholdDefinition`, {
                    threshold: multisigThreshold,
                    count: members.length,
                })}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
