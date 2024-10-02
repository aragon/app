import { ITokenVotingMember } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import {
    Accordion,
    Button,
    Card,
    DefinitionList,
    Dropdown,
    formatterUtils,
    Heading,
    IconType,
    NumberFormat,
    Tag,
} from '@aragon/ods';

interface CreateProcessBodyFieldProps {
    bodyFields: any[];
    setSelectedBodyIndex: (index: number) => void;
    setIsBodyDialogOpen: (isOpen: boolean) => void;
    removeBody: (index: number) => void;
    formattedAddressWithBlockExplorer: (address: string) => React.ReactNode;
}

export const CreateProcessFormBodyField: React.FC<CreateProcessBodyFieldProps> = ({
    bodyFields,
    setSelectedBodyIndex,
    setIsBodyDialogOpen,
    removeBody,
    formattedAddressWithBlockExplorer,
}) => {
    return (
        <div className="flex flex-col gap-3 md:gap-2">
            {bodyFields.map((field: any, index) => (
                <Card key={field.id} className="overflow-hidden border border-neutral-100">
                    <Accordion.Container isMulti={true}>
                        <Accordion.Item value={field.id}>
                            <Accordion.ItemHeader>
                                <Heading size="h4">{field.bodyName}</Heading>
                            </Accordion.ItemHeader>
                            <Accordion.ItemContent>
                                <DefinitionList.Container className="w-full">
                                    {field.governanceType === 'tokenVoting' && (
                                        <>
                                            <DefinitionList.Item term="Token">
                                                {field.tokenName} (${field.tokenSymbol})
                                            </DefinitionList.Item>
                                            <DefinitionList.Item term="Distribution">
                                                {field.members?.length} token holders
                                                <ul className="flex flex-col gap-y-2 px-4 py-2">
                                                    {field.members.map(
                                                        (member: ITokenVotingMember, memberIndex: number) => (
                                                            <li key={memberIndex}>
                                                                {formattedAddressWithBlockExplorer(member.address)}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </DefinitionList.Item>
                                            <DefinitionList.Item term="Supply">
                                                {formatterUtils.formatNumber(
                                                    field.members.reduce(
                                                        (sum: number, member: ITokenVotingMember) =>
                                                            sum + Number(member.tokenAmount),
                                                        0,
                                                    ),
                                                    { format: NumberFormat.TOKEN_AMOUNT_LONG },
                                                )}{' '}
                                                ${field.tokenSymbol}
                                            </DefinitionList.Item>
                                            <DefinitionList.Item term="Approval threshold">
                                                {field.supportThresholdPercentage}%
                                            </DefinitionList.Item>
                                            <DefinitionList.Item term="Minimum participation">
                                                {field.minimumParticipationPercentage}%
                                            </DefinitionList.Item>
                                            <DefinitionList.Item term="Voting change">
                                                <Tag
                                                    label={field.voteChange ? 'Yes' : 'No'}
                                                    variant={field.voteChange ? 'primary' : 'neutral'}
                                                    className="max-w-fit"
                                                />
                                            </DefinitionList.Item>
                                        </>
                                    )}

                                    {field.governanceType === 'multisig' && (
                                        <>
                                            <DefinitionList.Item term="Multisig Members">
                                                {field.members?.length} members
                                                <ul className="flex flex-col gap-y-2 px-4 py-2">
                                                    {field.members.map(
                                                        (member: ITokenVotingMember, memberIndex: number) => (
                                                            <li key={memberIndex}>
                                                                {formattedAddressWithBlockExplorer(member.address)}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </DefinitionList.Item>
                                            <DefinitionList.Item term="Multisig Threshold">
                                                {field.multisigThreshold} of {field.members.length}
                                            </DefinitionList.Item>
                                        </>
                                    )}
                                </DefinitionList.Container>

                                <div className="flex w-full grow justify-between">
                                    <Button
                                        className="justify-end"
                                        variant="secondary"
                                        size="md"
                                        onClick={() => {
                                            setSelectedBodyIndex(index);
                                            setIsBodyDialogOpen(true);
                                        }}
                                    >
                                        Edit body
                                    </Button>
                                    <Dropdown.Container
                                        constrainContentWidth={false}
                                        size="md"
                                        customTrigger={
                                            <Button
                                                className="w-fit"
                                                variant="tertiary"
                                                size="md"
                                                iconRight={IconType.DOTS_VERTICAL}
                                            >
                                                More
                                            </Button>
                                        }
                                    >
                                        <Dropdown.Item onClick={() => removeBody(index)}>Remove body</Dropdown.Item>
                                    </Dropdown.Container>
                                </div>
                            </Accordion.ItemContent>
                        </Accordion.Item>
                    </Accordion.Container>
                </Card>
            ))}
        </div>
    );
};
