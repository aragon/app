import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, RadioCard, RadioGroup, TextArea, TextAreaRichText } from '@aragon/ods';
import { CreateProposalAddActionValue } from '../createProposalFormUtils';

export interface ICreateProposalFormMetadataProps {}

export const CreateProposalFormMetadata: React.FC<ICreateProposalFormMetadataProps> = () => {
    const titleField = useFormField('title', { label: 'Title', rules: { required: true }, defaultValue: '' });
    const summaryField = useFormField('summary', { label: 'Summary', rules: { required: true } });
    const { ref, ...bodyField } = useFormField('body', { label: 'Body' });
    const addActionsField = useFormField('addActions', { defaultValue: CreateProposalAddActionValue.YES });

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
                {...bodyField}
            />
            <RadioGroup onValueChange={addActionsField.onChange} {...addActionsField}>
                <RadioCard
                    description="Actions are added and will execute once the governance parameters are met."
                    label="Yes"
                    value={CreateProposalAddActionValue.YES}
                />
                <RadioCard
                    description="It's a signalling proposal and won't have any binding onchain actions"
                    label="No"
                    value={CreateProposalAddActionValue.NO}
                />
            </RadioGroup>
        </div>
    );
};
