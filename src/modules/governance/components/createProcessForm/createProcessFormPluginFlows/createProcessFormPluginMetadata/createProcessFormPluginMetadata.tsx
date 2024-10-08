import type { ICreateProcessFormBodyNameProps } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useBodyFields } from '@/modules/governance/components/createProcessForm/hooks/useBodyFields';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { InputText, TextArea } from '@aragon/ods';

export interface ICreateProcessFormPluginMetadataProps extends ICreateProcessFormBodyNameProps {}

export const CreateProcessFormPluginMetadata: React.FC<ICreateProcessFormPluginMetadataProps> = (props) => {
    const { stageName, stageIndex, bodyIndex } = props;

    const { bodyNameField, bodySummaryField } = useBodyFields(stageName, stageIndex, bodyIndex);

    return (
        <>
            <InputText id={bodyNameField.name} label="Body name" placeholder="Type a name" {...bodyNameField} />
            <TextArea
                helpText="Summarize your stage body in 2-3 sentences. This gives your members a sense of what the body will be responsible for."
                placeholder="Type a summary"
                isOptional={true}
                maxLength={480}
                {...bodySummaryField}
            />
            <ResourcesInput
                name={`${stageName}.${stageIndex}.bodies.${bodyIndex}.resources`}
                helpText="Add any additional external resources that help members understand the purpose of this body."
            />
        </>
    );
};
