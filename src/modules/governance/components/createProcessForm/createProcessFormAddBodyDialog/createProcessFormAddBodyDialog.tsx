import { Card, Dialog } from '@aragon/ods';
import { useState } from 'react';

export interface ICreateProcessFormAddBodyDialogProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}

const StepOne = () => <Card className="p-6">STEP 1</Card>;
const StepTwo = () => <Card className="p-6">STEP 2</Card>;
const StepThree = () => <Card className="p-6">STEP 3</Card>;

export const CreateProcessFormAddBodyDialog: React.FC<ICreateProcessFormAddBodyDialogProps> = (props) => {
    const [step, setStep] = useState(0);
    const { open, setOpen } = props;
    const handleStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <StepOne />;
            case 1:
                return <StepTwo />;
            case 2:
                return <StepThree />;
            default:
                return <StepOne />;
        }
    };

    return (
        <Dialog.Root containerClassName="!max-w-[640px]" open={open} onOpenChange={() => setOpen(false)}>
            <Dialog.Header title="Add voting body" />
            <Dialog.Content className="flex flex-col gap-6">{handleStepContent(step)}</Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: step === 0 ? 'Cancel' : 'Back',
                    onClick: step === 0 ? () => setOpen(false) : () => setStep(step - 1),
                }}
                secondaryAction={{
                    label: step === 2 ? 'Save' : 'Next',
                    onClick: step === 2 ? () => setOpen(false) : () => setStep(step + 1),
                }}
            />
        </Dialog.Root>
    );
};
