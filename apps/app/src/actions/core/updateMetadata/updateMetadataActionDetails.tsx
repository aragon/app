'use client';

import {
    Avatar,
    DefinitionList,
    type IProposalAction,
    type IProposalActionComponentProps,
    Link,
    Toggle,
    ToggleGroup,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import {
    type IProposalActionUpdateMetadata,
    type IProposalActionUpdatePluginMetadata,
    type IProposalActionUpdatePluginMetadataObject,
    ProposalActionType,
} from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

export interface IUpdateMetadataActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

/**
 * Metadata rendered when the action carries none, so the view shows empty fields instead of crashing.
 */
const emptyMetadata: IProposalActionUpdatePluginMetadataObject = {};

export const UpdateMetadataActionDetails: React.FC<
    IUpdateMetadataActionDetailsProps
> = (props) => {
    const { action } = props;

    const { t } = useTranslations();

    const [toggleValue, setToggleValue] = useState<
        'proposedMetadata' | 'existingMetadata'
    >('proposedMetadata');

    // Clicking the selected toggle emits an empty value, keep the current selection instead of clearing it.
    const handleToggleChange = (value?: string) => {
        if (value === 'proposedMetadata' || value === 'existingMetadata') {
            setToggleValue(value);
        }
    };

    const metadataAction = action as unknown as
        | IProposalActionUpdateMetadata
        | IProposalActionUpdatePluginMetadata;

    const { type } = metadataAction;
    const proposedMetadata = metadataAction.proposedMetadata ?? emptyMetadata;
    const existingMetadata = metadataAction.existingMetadata ?? emptyMetadata;

    const metadataToDisplay =
        toggleValue === 'proposedMetadata'
            ? proposedMetadata
            : existingMetadata;

    const isDaoMetadataAction = type === ProposalActionType.METADATA_UPDATE;

    const avatar =
        'avatar' in metadataToDisplay ? metadataToDisplay.avatar : undefined;
    const processKey =
        'processKey' in metadataToDisplay
            ? metadataToDisplay.processKey
            : undefined;
    const hasProcessKey =
        'processKey' in existingMetadata &&
        Boolean(existingMetadata.processKey);

    const descriptionTerm = isDaoMetadataAction
        ? 'descriptionTerm'
        : 'summaryTerm';

    return (
        <div className="flex w-full flex-col gap-2">
            <ToggleGroup
                isMultiSelect={false}
                onChange={handleToggleChange}
                value={toggleValue}
            >
                <Toggle
                    label={t(
                        'app.actions.core.updateMetadataActionDetails.proposedToggle',
                    )}
                    value="proposedMetadata"
                />
                <Toggle
                    label={t(
                        'app.actions.core.updateMetadataActionDetails.existingToggle',
                    )}
                    value="existingMetadata"
                />
            </ToggleGroup>
            <DefinitionList.Container>
                {isDaoMetadataAction && (
                    <DefinitionList.Item
                        className="md:items-center"
                        term={t(
                            'app.actions.core.updateMetadataActionDetails.logoTerm',
                        )}
                    >
                        <Avatar
                            alt="dao-logo"
                            responsiveSize={{ md: 'md', sm: 'sm' }}
                            src={ipfsUtils.cidToSrc(avatar)}
                        />
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item
                    term={t(
                        'app.actions.core.updateMetadataActionDetails.nameTerm',
                    )}
                >
                    <p className="text-base text-neutral-800 leading-tight">
                        {metadataToDisplay.name}
                    </p>
                </DefinitionList.Item>
                {!isDaoMetadataAction && hasProcessKey && (
                    <DefinitionList.Item
                        term={t(
                            'app.actions.core.updateMetadataActionDetails.processKeyTerm',
                        )}
                    >
                        <p className="text-base text-neutral-800 leading-tight">
                            {processKey}
                        </p>
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item
                    term={t(
                        `app.actions.core.updateMetadataActionDetails.${descriptionTerm}`,
                    )}
                >
                    <p className="text-base text-neutral-800 leading-tight">
                        {metadataToDisplay.description}
                    </p>
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t(
                        'app.actions.core.updateMetadataActionDetails.linkTerm',
                    )}
                >
                    <ul>
                        {metadataToDisplay.links?.map((link, index) => (
                            <li key={`${link.url}-${index.toString()}`}>
                                <Link
                                    href={link.url}
                                    isExternal={true}
                                    showUrl={true}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </DefinitionList.Item>
            </DefinitionList.Container>
        </div>
    );
};
