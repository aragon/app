import { ITokenVotingMember } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { AddressInput, Button, Dropdown, IconType } from '@aragon/ods';
import { useCallback } from 'react';

interface IMultisigMemberInputRowProps {
    index: number;
    member: ITokenVotingMember;
    memberAddressInputValues: string[];
    setMemberAddressInputValues: React.Dispatch<React.SetStateAction<string[]>>;
    setMembers: React.Dispatch<React.SetStateAction<ITokenVotingMember[]>>;
    handleRemoveMember: (index: number) => void;
}

export const MultisigMemberInputRow: React.FC<IMultisigMemberInputRowProps> = ({
    index,
    member,
    memberAddressInputValues,
    setMemberAddressInputValues,
    setMembers,
    handleRemoveMember,
}) => {
    const onChange = useCallback(
        (value?: string) => {
            setMemberAddressInputValues((prev) => {
                const newInputValues = [...prev];
                newInputValues[index] = value ?? '';
                return newInputValues;
            });
        },
        [index, setMemberAddressInputValues],
    );

    const onAccept = useCallback(
        (value?: { address?: string; name?: string }) => {
            setMembers((prev) => {
                const newMembers = [...prev];
                newMembers[index].address = value?.address ?? '';
                return newMembers;
            });
        },
        [index, setMembers],
    );

    return (
        <div className="flex items-center gap-4 rounded-xl border border-neutral-100 p-6">
            <AddressInput
                className="grow"
                label="Address"
                placeholder="ENS or 0x…"
                chainId={1}
                value={memberAddressInputValues[index] ?? ''}
                onChange={onChange}
                onAccept={onAccept}
            />
            <Dropdown.Container
                customTrigger={<Button variant="tertiary" iconLeft={IconType.DOTS_VERTICAL} className="self-end" />}
            >
                <Dropdown.Item onClick={() => handleRemoveMember(index)}>Remove</Dropdown.Item>
            </Dropdown.Container>
        </div>
    );
};
