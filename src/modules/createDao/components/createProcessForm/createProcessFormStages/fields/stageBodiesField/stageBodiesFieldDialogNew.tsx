import { DialogRootHiddenElement } from '@/shared/components/dialogRoot';
import { type IWizardStepperStep, Wizard } from '@/shared/components/wizard';
import { Dialog } from '@aragon/gov-ui-kit';
import type { ICreateProcessFormBody } from '../../../createProcessFormDefinitions';

export interface IStageBodiesFieldDialogNewProps {
    /**
     * Callback triggered when dialog is closed.
     */
    onClose: () => void;
    /**
     * Callback called on form submit.
     */
    onSubmit: (values: ICreateProcessFormBody) => void;
    /**
     * Label for the submit button.
     */
    submitLabel: string;
}

const steps: IWizardStepperStep[] = [
    { id: '1', order: 1, meta: { name: '1' } },
    { id: '2', order: 2, meta: { name: '2' } },
];

const formId = 'stageBodies';

export const StageBodiesFieldDialogNew: React.FC<IStageBodiesFieldDialogNewProps> = (props) => {
    const { onClose, onSubmit, submitLabel } = props;

    return (
        <Dialog.Root size="lg" open={true} onOpenChange={onClose}>
            <Wizard.Root submitLabel={submitLabel} initialSteps={steps}>
                <Dialog.Header title="Add voting body" />
                <DialogRootHiddenElement
                    type="description"
                    labelKey="app.createDao.createProcessForm.stages.timing.dialog.title"
                />
                <Dialog.Content>
                    <Wizard.Form onSubmit={onSubmit} displayProgress={false} id={formId}>
                        <Wizard.Step id="1" order={1} meta={{ name: 'step 1' }}>
                            <p>Step 1</p>
                        </Wizard.Step>
                        <Wizard.Step id="2" order={2} meta={{ name: 'step 2' }}>
                            <p>Step 2</p>
                        </Wizard.Step>
                    </Wizard.Form>
                </Dialog.Content>
                {/* TODO: This should be a Dialog.Footer component */}
                <div>
                    <Wizard.Footer formId={formId} />
                </div>
            </Wizard.Root>
        </Dialog.Root>
    );
};
