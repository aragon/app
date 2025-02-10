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
    const { field } = props;
    const { members, multisigThreshold } = field;

    const { t } = useTranslations();

    const baseTranslationKey = 'app.plugins.multisig.multisigProcessBodyField';

    const membersDefinition =
        members.length > 1 ? t(`${baseTranslationKey}.plural`) : t(`${baseTranslationKey}.single`);

    return (
        <DefinitionList.Container className="w-full">
            <DefinitionList.Item term={t(`${baseTranslationKey}.members`)}>
                {members.length}
                {membersDefinition}
            </DefinitionList.Item>
            <DefinitionList.Item term={t(`${baseTranslationKey}.threshold`)}>
                {multisigThreshold} of {members.length}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
