'use client';

import {
    DefinitionList,
    type IProposalAction,
    type IProposalActionComponentProps,
    Toggle,
    ToggleGroup,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { IProposalActionChangeSettings } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IChangeSettingsActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

export const ChangeSettingsActionDetails: React.FC<
    IChangeSettingsActionDetailsProps
> = (props) => {
    const { action } = props;

    const { t } = useTranslations();

    const [toggleValue, setToggleValue] = useState<
        'proposedSettings' | 'existingSettings'
    >('proposedSettings');

    // Clicking the selected toggle emits an empty value, keep the current selection instead of clearing it.
    const handleToggleChange = (value?: string) => {
        if (value === 'proposedSettings' || value === 'existingSettings') {
            setToggleValue(value);
        }
    };

    const { proposedSettings, existingSettings } =
        action as unknown as IProposalActionChangeSettings;

    const settingsToDisplay =
        toggleValue === 'proposedSettings'
            ? proposedSettings
            : existingSettings;

    return (
        <div className="flex w-full flex-col gap-2">
            <ToggleGroup
                isMultiSelect={false}
                onChange={handleToggleChange}
                value={toggleValue}
            >
                <Toggle
                    label={t(
                        'app.actions.core.changeSettingsActionDetails.proposedToggle',
                    )}
                    value="proposedSettings"
                />
                <Toggle
                    label={t(
                        'app.actions.core.changeSettingsActionDetails.existingToggle',
                    )}
                    value="existingSettings"
                />
            </ToggleGroup>
            <DefinitionList.Container>
                {settingsToDisplay.map((setting) => (
                    <DefinitionList.Item key={setting.term} term={setting.term}>
                        {setting.definition}
                    </DefinitionList.Item>
                ))}
            </DefinitionList.Container>
        </div>
    );
};
