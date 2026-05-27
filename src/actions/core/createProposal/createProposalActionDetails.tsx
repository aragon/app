'use client';

import {
    Avatar,
    DateFormat,
    DefinitionList,
    formatterUtils,
    type IProposalActionComponentProps,
    Link,
} from '@aragon/gov-ui-kit';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { NestedActionsList } from '@/modules/governance/components/nestedActionsList';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface ICreateProposalActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

const skippedParameterNames = new Set(['_actions', '_metadata']);

const voteOptionLabels: Record<string, string> = {
    '0': 'app.governance.daoProposalDetailsPage.main.actions.nested.createProposal.voteOptionNone',
    '1': 'app.governance.daoProposalDetailsPage.main.actions.nested.createProposal.voteOptionAbstain',
    '2': 'app.governance.daoProposalDetailsPage.main.actions.nested.createProposal.voteOptionYes',
    '3': 'app.governance.daoProposalDetailsPage.main.actions.nested.createProposal.voteOptionNo',
};

const isDateParameter = (name: string) =>
    name === '_startDate' || name === '_endDate';

const isBooleanParameter = (name: string) =>
    name === '_tryEarlyExecution' ||
    name === '_tryExecution' ||
    name === '_approveProposal';

export const CreateProposalActionDetails: React.FC<
    ICreateProposalActionDetailsProps
> = (props) => {
    const { action, chainId } = props;
    const { t } = useTranslations();

    const inputData = action.inputData;
    const parameters = inputData?.parameters ?? [];
    const metadata = action.metadata || {
        name: 'Test Proposal',
        description: 'Test Description',
        avatar: 'https://example.com/avatar.png',
        links: [{ href: 'https://example.com', label: 'Example Link' }],
    };
    console.log('inputData', inputData);
    const renderParameterValue = (name: string, value: unknown) => {
        const rawValue = value?.toString() ?? '';
        console.log('PARAMS', name, value);
        if (isDateParameter(name) && rawValue !== '') {
            return formatterUtils.formatDate(Number(rawValue) * 1000, {
                format: DateFormat.YEAR_MONTH_DAY,
            });
        }

        if (isBooleanParameter(name)) {
            const isTrue = rawValue === 'true' || rawValue === '1';
            return t(
                isTrue
                    ? 'app.governance.daoProposalDetailsPage.main.actions.nested.createProposal.yes'
                    : 'app.governance.daoProposalDetailsPage.main.actions.nested.createProposal.no',
            );
        }

        if (name === '_voteOption') {
            const labelKey = voteOptionLabels[rawValue];
            return labelKey ? t(labelKey) : rawValue;
        }

        return rawValue;
    };

    const labelKeyFor = (name: string) =>
        `app.governance.daoProposalDetailsPage.main.actions.nested.createProposal.${name.replace(/^_/, '')}`;

    return (
        <div className="flex w-full flex-col gap-y-6">
            <DefinitionList.Container>
                {metadata != null && (
                    <>
                        <DefinitionList.Item
                            term={t(
                                'app.governance.daoProposalDetailsPage.main.actions.nested.createProposal.metadataName',
                            )}
                        >
                            {metadata.name}
                        </DefinitionList.Item>
                        {metadata.avatar != null && (
                            <DefinitionList.Item
                                term={t(
                                    'app.governance.daoProposalDetailsPage.main.actions.nested.createProposal.metadataAvatar',
                                )}
                            >
                                <Avatar size="md" src={metadata.avatar} />
                            </DefinitionList.Item>
                        )}
                        <DefinitionList.Item
                            term={t(
                                'app.governance.daoProposalDetailsPage.main.actions.nested.createProposal.metadataDescription',
                            )}
                        >
                            {metadata.description}
                        </DefinitionList.Item>
                        {metadata.links.length > 0 && (
                            <DefinitionList.Item
                                term={t(
                                    'app.governance.daoProposalDetailsPage.main.actions.nested.createProposal.metadataLinks',
                                )}
                            >
                                <div className="flex flex-col gap-3">
                                    {metadata.links.map((link) => (
                                        <Link
                                            href={link.href}
                                            isExternal={true}
                                            key={link.href}
                                            showUrl={true}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </DefinitionList.Item>
                        )}
                    </>
                )}
                {parameters
                    .filter((param) => !skippedParameterNames.has(param.name))
                    .map((param) => (
                        <DefinitionList.Item
                            key={param.name}
                            term={t(labelKeyFor(param.name))}
                        >
                            {renderParameterValue(param.name, param.value)}
                        </DefinitionList.Item>
                    ))}
            </DefinitionList.Container>
            <NestedActionsList
                chainId={chainId}
                daoId={action.daoId}
                outerParams={parameters}
                rawActions={inputData?.actions}
            />
        </div>
    );
};
