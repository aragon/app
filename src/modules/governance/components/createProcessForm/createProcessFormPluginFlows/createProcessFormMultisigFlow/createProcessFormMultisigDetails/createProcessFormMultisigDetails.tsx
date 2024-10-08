import type { ICreateProcessFormBodyNameProps } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { MultisigMemberInputRow } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormMultisigFlow/createProcessFormMemberInputRow/multisigMemberInputRow';
import { useMembersFieldArray } from '@/modules/governance/components/createProcessForm/hooks/useMembersFieldArray';
import { Button, IconType, InputContainer } from '@aragon/ods';

export interface ICreateProcessFormMultisigDetailsProps extends ICreateProcessFormBodyNameProps {}

export const CreateProcessFormMultisigDetails: React.FC<ICreateProcessFormMultisigDetailsProps> = (props) => {
    const { stageName, stageIndex, bodyIndex } = props;

    const { membersFieldArray, appendMember, removeMember } = useMembersFieldArray(stageName, stageIndex, bodyIndex);

    const handleAddMember = () => {
        appendMember({});
    };

    const handleRemoveMember = (index: number) => {
        if (membersFieldArray.length > 1) {
            removeMember(index);
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
                {membersFieldArray.map((member, index) => (
                    <MultisigMemberInputRow
                        key={index}
                        index={index}
                        fieldNamePrefix={`${stageName}.${stageIndex}.bodies.${bodyIndex}.members.${index}`}
                        handleRemoveMember={handleRemoveMember}
                        canRemove={membersFieldArray.length > 1}
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
