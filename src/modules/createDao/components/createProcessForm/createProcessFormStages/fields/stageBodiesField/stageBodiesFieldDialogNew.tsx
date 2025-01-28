import { type IWizardStepperStep } from '@/shared/components/wizards/wizard';
import { WizardDialog, type IWizardDialogContainerProps } from '@/shared/components/wizards/wizardDialog';

export interface IStageBodiesFieldDialogNewProps
    extends Omit<IWizardDialogContainerProps, 'formId' | 'title' | 'description'> {}

const steps: IWizardStepperStep[] = [
    { id: '1', order: 1, meta: { name: '1' } },
    { id: '2', order: 2, meta: { name: '2' } },
];

export const StageBodiesFieldDialogNew: React.FC<IStageBodiesFieldDialogNewProps> = (props) => {
    return (
        <WizardDialog.Container
            title="Add voting body"
            description="app.shared.wizardDetailsDialog.infoLabel"
            formId="stageBodies"
            initialSteps={steps}
            {...props}
        >
            <WizardDialog.Step id="1" order={1} meta={{ name: '1' }}>
                <p>Step 1</p>
            </WizardDialog.Step>
            <WizardDialog.Step id="2" order={2} meta={{ name: '2' }}>
                <p>Step 2</p>
            </WizardDialog.Step>
        </WizardDialog.Container>
    );
};
