import { MultisigMemberInputRow } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormMultisigFlow/createProcessFormMemberInputRow/multisigMemberInputRow';
import { getMultisigMembersFieldArray } from '@/modules/governance/components/createProcessForm/utils/getMembersFields';
import { Button, IconType, InputContainer } from '@aragon/ods';

export interface ICreateProcessFormMultisigDetailsProps {
    stageName: string;
    stageIndex: number;
    bodyIndex: number;
}

export const CreateProcessFormMultisigDetails: React.FC<ICreateProcessFormMultisigDetailsProps> = (props) => {
    const { stageName, stageIndex, bodyIndex } = props;

    const { multisigMemberFields, appendMultisigMember, removeMultisigMember } = getMultisigMembersFieldArray(
        stageName,
        stageIndex,
        bodyIndex,
    );

    const handleAddMember = () => {
        appendMultisigMember({ address: '', tokenAmount: 1 });
    };

    const handleRemoveMember = (index: number) => {
        if (multisigMemberFields.length > 1) {
            removeMultisigMember(index);
        }
    };
    return (
        <>
            <InputContainer
                id="multisig-members"
                label="Multisig Members"
                helpText="Add the addresses that will be part of the multisig."
                useCustomWrapper={true}
            >
                {multisigMemberFields.map((member, index) => (
                    <MultisigMemberInputRow
                        key={index}
                        index={index}
                        fieldNamePrefix={`${stageName}.${stageIndex}.bodies.${bodyIndex}.members.${index}`}
                        handleRemoveMember={handleRemoveMember}
                        canRemove={multisigMemberFields.length > 1}
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
