import { ITokenVotingMember } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { TokenVotingMemberInputRow } from '@/modules/governance/components/createProcessForm/tokenVotingMemberInputRow/tokenVottingMemberInputRow';
import { Button, IconType, InputContainer, InputText } from '@aragon/ods';

export interface ICreateProcessFormTokenVotingDetailsProps {
    tokenNameField: any;
    tokenSymbolField: any;
    members: ITokenVotingMember[];
    setMembers: React.Dispatch<React.SetStateAction<ITokenVotingMember[]>>;
    memberAddressInputValues: string[];
    setMemberAddressInputValues: React.Dispatch<React.SetStateAction<string[]>>;
    handleAddMember: () => void;
    handleRemoveMember: (index: number) => void;
}

export const CreateProcessFormTokenVotingDetails: React.FC<ICreateProcessFormTokenVotingDetailsProps> = ({
    tokenNameField,
    tokenSymbolField,
    members,
    setMembers,
    memberAddressInputValues,
    setMemberAddressInputValues,
    handleAddMember,
    handleRemoveMember,
}) => {
    return (
        <>
            <InputText
                placeholder="Enter a name"
                helpText="The full name of the token. For example: Uniswap"
                {...tokenNameField}
            />
            <InputText
                maxLength={10}
                placeholder="Enter a symbol"
                helpText="The abbreviation of the token. For example: UNI"
                {...tokenSymbolField}
            />
            <InputContainer
                id="distribute"
                label="Distribute Tokens"
                helpText="Add the wallets you’d like to distribute tokens to."
                useCustomWrapper={true}
                alert={
                    members.length === 0 ||
                    (members.length >= 1 && !members.every((member) => member.address && member.tokenAmount))
                        ? { message: 'Please add a valid address or ENS', variant: 'critical' }
                        : undefined
                }
            >
                {members.map((member, index) => (
                    <TokenVotingMemberInputRow
                        key={index}
                        index={index}
                        member={member}
                        memberAddressInputValues={memberAddressInputValues}
                        setMemberAddressInputValues={setMemberAddressInputValues}
                        setMembers={setMembers}
                        tokenSymbol={tokenSymbolField.value}
                        handleRemoveMember={handleRemoveMember}
                    />
                ))}
            </InputContainer>
            <div className="flex w-full justify-between">
                <Button size="md" variant="tertiary" iconLeft={IconType.PLUS} onClick={handleAddMember}>
                    Add
                </Button>
            </div>
        </>
    );
};
