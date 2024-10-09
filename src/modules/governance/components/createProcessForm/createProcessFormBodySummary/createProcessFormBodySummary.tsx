/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ICreateProcessFormBodySummaryProps } from '@/modules/governance/components/createProcessForm/createProcessFormBodySummary/createProcessFormBodySummary.api';
import type { ITokenVotingMember } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useTranslations } from '@/shared/components/translationsProvider';
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
    const { stageName, stageIndex, removeBody, onEditBody } = props;

    const { t } = useTranslations();

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
                                            <DefinitionList.Item
                                                term={t(
                                                    'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.token',
                                                )}
                                            >
                                                {field.tokenNameField} (${field.tokenSymbolField})
                                            </DefinitionList.Item>
                                            <DefinitionList.Item
                                                term={t(
                                                    'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.distribution',
                                                )}
                                            >
                                                {field.members?.length}{' '}
                                                {field.members?.length > 1
                                                    ? t(
                                                          'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.plural',
                                                      )
                                                    : t(
                                                          'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.single',
                                                      )}
                                            </DefinitionList.Item>
                                            <DefinitionList.Item
                                                term={t(
                                                    'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.supply',
                                                )}
                                            >
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
                                            <DefinitionList.Item
                                                term={t(
                                                    'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.support',
                                                )}
                                            >
                                                {`> ${field.supportThresholdField}%`}
                                            </DefinitionList.Item>
                                            <DefinitionList.Item
                                                term={t(
                                                    'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.minimum',
                                                )}
                                            >
                                                {`≥ ${field.minimumParticipationField}%`}
                                            </DefinitionList.Item>
                                            <DefinitionList.Item
                                                term={t(
                                                    'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.voteChange',
                                                )}
                                            >
                                                <Tag
                                                    label={
                                                        field.voteChangeField
                                                            ? t(
                                                                  'app.governance.createProcessForm.stage.bodies.summary.no',
                                                              )
                                                            : t(
                                                                  'app.governance.createProcessForm.stage.bodies.summary.no',
                                                              )
                                                    }
                                                    variant={field.voteChangeField ? 'primary' : 'neutral'}
                                                    className="max-w-fit"
                                                />
                                            </DefinitionList.Item>
                                        </>
                                    )}

                                    {field.bodyGovernanceTypeField === 'multisig' && (
                                        <>
                                            <DefinitionList.Item
                                                term={t(
                                                    'app.governance.createProcessForm.stage.bodies.summary.multisig.members',
                                                )}
                                            >
                                                {field.members?.length}{' '}
                                                {field.members?.length > 1
                                                    ? t(
                                                          'app.governance.createProcessForm.stage.bodies.summary.multisig.plural',
                                                      )
                                                    : t(
                                                          'app.governance.createProcessForm.stage.bodies.summary.multisig.single',
                                                      )}
                                            </DefinitionList.Item>
                                            <DefinitionList.Item
                                                term={t(
                                                    'app.governance.createProcessForm.stage.bodies.summary.multisig.threshold',
                                                )}
                                            >
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
                                        {t('app.governance.createProcessForm.stage.bodies.summary.edit')}
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
                                                {t('app.governance.createProcessForm.stage.bodies.summary.more')}
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
