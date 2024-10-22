import type { ICreateProcessFormBody } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { MultisigMemberInputRow } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormMultisigFlow/createProcessFormMemberInputRow/multisigMemberInputRow';
import { Button, IconType, InputContainer } from '@aragon/ods';
import { useFieldArray } from 'react-hook-form';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormMultisigDistroProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormMultisigDistro: React.FC<ICreateProcessFormMultisigDistroProps> = (props) => {
    const { fieldPrefix } = props;

    const membersFieldName = `${fieldPrefix}.members`;
    const { fields, append, remove } = useFieldArray<Record<string, ICreateProcessFormBody['members']>>({
        name: membersFieldName,
    });

    const handleAddMember = () => append({ address: '' });

    return (
        <>
            <InputContainer
                id="multisig-members"
                label="Multisig Members"
                helpText="Add the addresses that will be part of the multisig."
                useCustomWrapper={true}
            >
                {fields.map((member, index) => (
                    <MultisigMemberInputRow
                        key={member.id}
                        index={index}
                        fieldNamePrefix={`${fieldPrefix}.members.${index}`}
                        handleRemoveMember={() => remove(index)}
                        canRemove={fields.length > 0}
                    />
                ))}
            </InputContainer>
            <div className="flex w-full justify-between">
                <Button size="md" variant="tertiary" iconLeft={IconType.PLUS} onClick={handleAddMember}>
                    Add Member
                </Button>
            </div>
        </>
    );
};
