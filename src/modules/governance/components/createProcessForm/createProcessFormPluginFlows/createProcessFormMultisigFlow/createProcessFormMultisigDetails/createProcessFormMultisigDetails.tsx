import { ITokenVotingMember } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { MultisigMemberInputRow } from '@/modules/governance/components/createProcessForm/multisigMemberInputRow/multisigMemberInputRow';
import { Button, IconType, InputContainer } from '@aragon/ods';

export interface ICreateProcessFormMultisigDetailsProps {
    members: ITokenVotingMember[];
    setMembers: React.Dispatch<React.SetStateAction<ITokenVotingMember[]>>;
    memberAddressInputValues: string[];
    setMemberAddressInputValues: React.Dispatch<React.SetStateAction<string[]>>;
    handleAddMember: () => void;
    handleRemoveMember: (index: number) => void;
}

export const CreateProcessFormMultisigDetails: React.FC<ICreateProcessFormMultisigDetailsProps> = (props) => {
    const {
        members,
        setMembers,
        memberAddressInputValues,
        setMemberAddressInputValues,
        handleAddMember,
        handleRemoveMember,
    } = props;
    return (
        <>
            <InputContainer
                id="multisig-members"
                label="Multisig Members"
                helpText="Add the addresses that will be part of the multisig."
                useCustomWrapper={true}
                alert={
                    members.length === 0 || (members.length >= 1 && !members.every((member) => member.address))
                        ? { message: 'Please add a valid address or ENS', variant: 'critical' }
                        : undefined
                }
            >
                {members.map((member, index) => (
                    <MultisigMemberInputRow
                        key={index}
                        index={index}
                        member={member}
                        memberAddressInputValues={memberAddressInputValues}
                        setMemberAddressInputValues={setMemberAddressInputValues}
                        setMembers={setMembers}
                        handleRemoveMember={handleRemoveMember}
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
