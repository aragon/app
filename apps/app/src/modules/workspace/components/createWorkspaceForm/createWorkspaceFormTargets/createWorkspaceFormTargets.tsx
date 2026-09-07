import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useFieldArray } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    createWorkspaceFormEmptyNetworkAddress,
    type ICreateWorkspaceFormNetworkAddress,
} from '../createWorkspaceFormDefinitions';
import { CreateWorkspaceFormTargetsItem } from './createWorkspaceFormTargetsItem';

export interface ICreateWorkspaceFormTargetsProps {
    /**
     * Prefix to prepend to the targets form field.
     */
    fieldPrefix?: string;
}

export type CreateWorkspaceFormTargetsBaseForm = Record<
    string,
    ICreateWorkspaceFormNetworkAddress[]
>;

const fieldName = 'targets';

export const CreateWorkspaceFormTargets: React.FC<
    ICreateWorkspaceFormTargetsProps
> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();

    const targetsFieldName = fieldPrefix
        ? `${fieldPrefix}.${fieldName}`
        : fieldName;

    const { fields, append, remove } =
        useFieldArray<CreateWorkspaceFormTargetsBaseForm>({
            name: targetsFieldName,
        });

    // The list starts empty, see `createWorkspaceFormDefaultValues`.
    const handleAddTarget = () =>
        append(createWorkspaceFormEmptyNetworkAddress);

    return (
        <div className="flex flex-col gap-3">
            <InputContainer
                className="gap-3"
                helpText={t(
                    'app.workspace.createWorkspaceForm.targets.helpText',
                )}
                id="workspaceTargets"
                isOptional={true}
                label={t('app.workspace.createWorkspaceForm.targets.label')}
                useCustomWrapper={true}
            >
                {fields.map((field, index) => (
                    <CreateWorkspaceFormTargetsItem
                        index={index}
                        key={field.id}
                        name={targetsFieldName}
                        remove={remove}
                    />
                ))}
            </InputContainer>
            <Button
                className="w-fit"
                iconLeft={IconType.PLUS}
                onClick={handleAddTarget}
                size="md"
                variant="tertiary"
            >
                {t('app.workspace.createWorkspaceForm.targets.add')}
            </Button>
        </div>
    );
};
