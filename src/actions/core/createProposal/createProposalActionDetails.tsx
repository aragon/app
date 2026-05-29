'use client';

import {
    Collapsible,
    DateFormat,
    DefinitionList,
    formatterUtils,
    InputContainer,
    type IProposalAction,
    type IProposalActionComponentProps,
    Link,
} from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { NestedActionsList } from '@/modules/governance/components/nestedActionsList';
import { SafeDocumentParser } from '@/shared/components/SafeDocumentParser';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ICoreActionCreateProposal } from '../types/coreActionCreateProposal';

export interface ICreateProposalActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

export const CreateProposalActionDetails: React.FC<
    ICreateProposalActionDetailsProps
> = (props) => {
    const { action, chainId } = props;
    const { inputData } = action as unknown as ICoreActionCreateProposal;

    const { t } = useTranslations();

    const parameters = inputData.parameters ?? [];
    const metadata = inputData.proposalMetadata;

    const startDateParam = parameters.find(
        (param) => param.name === '_startDate',
    );
    const endDateParam = parameters.find((param) => param.name === '_endDate');

    const formattedStartDate = startDateParam
        ? startDateParam.value === '0'
            ? t('app.actions.core.createProposalActionDetails.startTimeNotSet')
            : formatterUtils.formatDate(Number(startDateParam.value) * 1000, {
                  format: DateFormat.YEAR_MONTH_DAY_TIME,
              })
        : undefined;

    const formattedEndDate = endDateParam
        ? endDateParam.value === '0'
            ? t('app.actions.core.createProposalActionDetails.endTimeNotSet')
            : formatterUtils.formatDate(Number(endDateParam.value) * 1000, {
                  format: DateFormat.YEAR_MONTH_DAY_TIME,
              })
        : undefined;

    return (
        <div className="flex w-full flex-col gap-y-6">
            <DefinitionList.Container>
                {metadata != null && (
                    <>
                        <DefinitionList.Item
                            term={t(
                                'app.actions.core.createProposalActionDetails.metadataTitle',
                            )}
                        >
                            {metadata.title}
                        </DefinitionList.Item>
                        <DefinitionList.Item
                            term={t(
                                'app.actions.core.createProposalActionDetails.metadataSummary',
                            )}
                        >
                            {metadata.summary}
                        </DefinitionList.Item>
                        {metadata.description != null && (
                            <DefinitionList.Item
                                term={t(
                                    'app.actions.core.createProposalActionDetails.metadataDescription',
                                )}
                            >
                                <Collapsible
                                    buttonLabelClosed={t(
                                        'app.actions.core.createProposalActionDetails.readMore',
                                    )}
                                    buttonLabelOpened={t(
                                        'app.actions.core.createProposalActionDetails.readLess',
                                    )}
                                    collapsedPixels={120}
                                >
                                    <SafeDocumentParser
                                        document={metadata.description}
                                        immediatelyRender={false}
                                    />
                                </Collapsible>
                            </DefinitionList.Item>
                        )}
                        {metadata.resources != null &&
                            metadata.resources.length > 0 && (
                                <DefinitionList.Item
                                    term={t(
                                        'app.actions.core.createProposalActionDetails.metadataResources',
                                    )}
                                >
                                    <div className="flex flex-col gap-3">
                                        {metadata.resources.map((resource) => (
                                            <Link
                                                href={resource.url}
                                                isExternal={true}
                                                key={resource.url}
                                                showUrl={true}
                                            >
                                                {resource.name}
                                            </Link>
                                        ))}
                                    </div>
                                </DefinitionList.Item>
                            )}
                    </>
                )}
                <DefinitionList.Item
                    term={t(
                        'app.actions.core.createProposalActionDetails.startTimeTerm',
                    )}
                >
                    {formattedStartDate}
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t(
                        'app.actions.core.createProposalActionDetails.endTimeTerm',
                    )}
                >
                    {formattedEndDate}
                </DefinitionList.Item>
            </DefinitionList.Container>
            <InputContainer
                helpText={t(
                    'app.actions.core.createProposalActionDetails.actionsHelpText',
                )}
                id="createProposalActions"
                label={t(
                    'app.actions.core.createProposalActionDetails.actionsLabel',
                )}
                useCustomWrapper={true}
            >
                <NestedActionsList
                    chainId={chainId}
                    daoId={action.daoId}
                    outerParams={parameters}
                    rawActions={inputData?.actions}
                />
            </InputContainer>
        </div>
    );
};
