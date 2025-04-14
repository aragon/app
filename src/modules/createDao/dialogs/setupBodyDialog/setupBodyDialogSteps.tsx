import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { useWatch } from 'react-hook-form';
import type { ISetupBodyForm } from './setupBodyDialogDefinitions';
import { SetupBodyDialogGovernance } from './setupBodyDialogGovernance';
import { SetupBodyDialogMemberhip } from './setupBodyDialogMembership';
import { SetupBodyDialogMetadata } from './setupBodyDialogMetadata';
import { externalPluginId, SetupBodyDialogSelect } from './setupBodyDialogSelect';
import { SetupBodyDialogExternalAddress } from './setupBodySialogExternalAddress';

export interface ISetupBodyDialogStepsProps {
    /**
     * Initial values for the form.
     */
    initialValues?: ISetupBodyForm;
    /**
     * Defines if the body is being added to the governance process as a sub-plugin or not.
     */
    isSubPlugin?: boolean;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

const setupBodySteps = [
    { id: 'select', order: 1, meta: { name: '' } },
    { id: 'metadata', order: 2, meta: { name: '' } },
    { id: 'externalAddress', order: 2, meta: { name: '' } },
    { id: 'membership', order: 3, meta: { name: '' } },
    { id: 'governance', order: 4, meta: { name: '' } },
];

export const SetupBodyDialogSteps: React.FC<ISetupBodyDialogStepsProps> = (props) => {
    const { initialValues, isSubPlugin, daoId } = props;

    const selectedPlugin = useWatch<ISetupBodyForm, 'plugin'>({ name: 'plugin' });
    const isExternalPlugin = selectedPlugin === externalPluginId;

    const [selectStep, metadataStep, externalAddress, membershipStep, governanceStep] = setupBodySteps;

    return (
        <>
            <WizardDialog.Step {...selectStep} hidden={initialValues != null}>
                <SetupBodyDialogSelect />
            </WizardDialog.Step>
            <WizardDialog.Step {...metadataStep} hidden={!isSubPlugin || isExternalPlugin}>
                <SetupBodyDialogMetadata />
            </WizardDialog.Step>
            <WizardDialog.Step {...externalAddress} hidden={!isExternalPlugin}>
                <SetupBodyDialogExternalAddress />
            </WizardDialog.Step>
            <WizardDialog.Step {...membershipStep} hidden={isExternalPlugin}>
                <SetupBodyDialogMemberhip daoId={daoId} />
            </WizardDialog.Step>
            <WizardDialog.Step {...governanceStep} hidden={isExternalPlugin}>
                <SetupBodyDialogGovernance isSubPlugin={isSubPlugin} />
            </WizardDialog.Step>
        </>
    );
};
