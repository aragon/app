import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, Switch, TextArea, TextAreaRichText } from '@aragon/ods';

export interface ICreateProposalFormMetadataProps {}

export const CreateProposalFormMetadata: React.FC<ICreateProposalFormMetadataProps> = () => {
    const titleField = useFormField('title', { label: 'Title', rules: { required: true }, defaultValue: '' });
    const summaryField = useFormField('summary', { label: 'Summary', rules: { required: true } });

    const { ref: bodyRef, ...bodyField } = useFormField('body', { label: 'Body' });
    const { ref: addActionsRef, ...addActionsField } = useFormField('addActions', {
        label: 'Would you like to add actions to this proposal?',
        defaultValue: true,
    });

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText="Give your proposal a title. This will appear in the proposal overview."
                placeholder="Title"
                {...titleField}
            />
            <TextArea
                helpText="Describe your proposal in 2-3 sentences. This gives your voters a sense of the proposal and will appear in the proposal overview."
                placeholder="Summary"
                {...summaryField}
            />
            <TextAreaRichText
                helpText="Write the body of the proposal"
                placeholder="Type a proposal body"
                isOptional={true}
                immediatelyRender={false}
                {...bodyField}
            />
            <Switch
                helpText="If enabled, this proposal will have binding on-chain actions, which will be executed as soon as the governance parameters are met."
                inlineLabel="Binding onchain actions"
                onCheckedChanged={addActionsField.onChange}
                checked={addActionsField.value}
                {...addActionsField}
            />
        </div>
    );
};
