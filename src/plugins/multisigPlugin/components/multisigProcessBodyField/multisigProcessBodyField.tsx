import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList } from '@aragon/gov-ui-kit';

export interface IMultisigProcessBodyField {
    /**
     * Members of the multisig.
     */
    members: string[];
    /**
     * Threshold of the multisig.
     */
    multisigThreshold: number;
}

export interface IMultisigProcessBodyFieldProps {
    /**
     * The field to display.
     */
    field: IMultisigProcessBodyField;
}

export const MultisigProcessBodyField = (props: IMultisigProcessBodyFieldProps) => {
    const { field } = props;
    const { members, multisigThreshold } = field;

    const { t } = useTranslations();

    return (
        <DefinitionList.Container className="w-full">
            <DefinitionList.Item term={t('app.plugins.multisig.multisigProcessBodyField.members')}>
                {members.length}
                {members.length > 1
                    ? t('app.plugins.multisig.multisigProcessBodyField.plural')
                    : t('app.plugins.multisig.multisigProcessBodyField.single')}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.multisig.multisigProcessBodyField.threshold')}>
                {multisigThreshold} of {members.length}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
