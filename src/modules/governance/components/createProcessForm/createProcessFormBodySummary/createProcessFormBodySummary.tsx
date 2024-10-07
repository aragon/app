/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ICreateProcessFormBodySummaryProps } from '@/modules/governance/components/createProcessForm/createProcessFormBodySummary/createProcessFormBodySummary.api';
import type {
    IMultisigVotingMember,
    ITokenVotingMember,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
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
import { useWatch } from 'react-hook-form';

export const CreateProcessFormBodySummary: React.FC<ICreateProcessFormBodySummaryProps> = (props) => {
    const { stageName, stageIndex, removeBody, formattedAddressWithBlockExplorer, onEditBody } = props;

    const bodyNamePrefix = `${stageName}.${stageIndex}.bodies`;

    const bodyFieldsArray = useWatch({ name: `${stageName}.${stageIndex}.bodies` });

    return (
        <div className="flex flex-col gap-3 md:gap-2">
            {bodyFieldsArray.map((field: any, index: number) => (
                <Card key={`${bodyNamePrefix}.${index}`} className="overflow-hidden border border-neutral-100">
                    <Accordion.Container isMulti={true}>
                        <Accordion.Item value={bodyNamePrefix}>
                            <Accordion.ItemHeader>
                                <Heading size="h4">{field.bodyNameField}</Heading>
                            </Accordion.ItemHeader>
                            <Accordion.ItemContent>
                                <DefinitionList.Container className="w-full">
                                    {field.bodyGovernanceTypeField === 'tokenVoting' && (
                                        <>
                                            <DefinitionList.Item term="Token">
                                                {field.tokenNameField} (${field.tokenSymbolField})
                                            </DefinitionList.Item>
                                            <DefinitionList.Item term="Distribution">
                                                {field.members?.length}{' '}
                                                {field.members?.length > 1 ? 'token holders' : 'token holder'}
                                                <ul className="flex flex-col gap-y-2 px-4 py-2">
                                                    {field.members?.map(
                                                        (member: ITokenVotingMember, memberIndex: number) => (
                                                            <li key={memberIndex}>
                                                                {formattedAddressWithBlockExplorer(member)}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </DefinitionList.Item>
                                            <DefinitionList.Item term="Supply">
                                                {formatterUtils.formatNumber(
                                                    field.members?.reduce(
                                                        (sum: number, member: ITokenVotingMember) =>
                                                            sum + Number(member.tokenAmount),
                                                        0,
                                                    ),
                                                    { format: NumberFormat.TOKEN_AMOUNT_LONG },
                                                )}{' '}
                                                ${field.tokenSymbolField}
                                            </DefinitionList.Item>
                                            <DefinitionList.Item term="Approval threshold">
                                                {field.supportThresholdField}%
                                            </DefinitionList.Item>
                                            <DefinitionList.Item term="Minimum participation">
                                                {field.minimumParticipationField}%
                                            </DefinitionList.Item>
                                            <DefinitionList.Item term="Voting change">
                                                <Tag
                                                    label={field.voteChangeField ? 'Yes' : 'No'}
                                                    variant={field.voteChangeField ? 'primary' : 'neutral'}
                                                    className="max-w-fit"
                                                />
                                            </DefinitionList.Item>
                                        </>
                                    )}

                                    {field.bodyGovernanceTypeField === 'multisig' && (
                                        <>
                                            <DefinitionList.Item term="Multisig Members">
                                                {field.members?.length}{' '}
                                                {field.members?.length > 1 ? 'members' : 'member'}
                                                <ul className="flex flex-col gap-y-2 px-4 py-2">
                                                    {field.members?.map(
                                                        (member: IMultisigVotingMember, memberIndex: number) => (
                                                            <li key={memberIndex}>
                                                                {formattedAddressWithBlockExplorer(member)}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </DefinitionList.Item>
                                            <DefinitionList.Item term="Multisig Threshold">
                                                {field.multisigThresholdField} of {field.members?.length}
                                            </DefinitionList.Item>
                                        </>
                                    )}
                                </DefinitionList.Container>
                                <div className="flex w-full grow justify-between">
                                    <Button
                                        className="justify-end"
                                        variant="secondary"
                                        size="md"
                                        onClick={() => onEditBody(index)}
                                    >
                                        Edit
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
