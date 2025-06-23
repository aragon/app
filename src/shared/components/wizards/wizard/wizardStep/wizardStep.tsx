import classNames from 'classnames';
import { useEffect, type ComponentProps } from 'react';
import { useWizardContext, type IWizardStepperStep } from '../wizardProvider';

export interface IWizardStepProps extends IWizardStepperStep, Omit<ComponentProps<'div'>, 'id'> {
    /**
     * Hides the step when set to true.
     */
    hidden?: boolean;
    /**
     * Flag to override the default scroll behavior of the wizard step, primarily when step is inside a dialog.
     */
    disableScrollToTop?: boolean;
}

export const WizardStep: React.FC<IWizardStepProps> = (props) => {
    const { id, hidden, meta, order, children, className, disableScrollToTop, ...otherProps } = props;

    const { activeStep, registerStep, unregisterStep } = useWizardContext();

    useEffect(() => {
        if (hidden) {
            unregisterStep(id);
        } else {
            registerStep({ id, order, meta });
        }
    }, [hidden, unregisterStep, registerStep, id, order, meta]);

    useEffect(() => {
        if (activeStep === id && !disableScrollToTop) {
            window.scrollTo(0, 0);
        }
    }, [activeStep, id, disableScrollToTop]);

    if (activeStep !== id) {
        return null;
    }

    return (
        <div className={classNames('flex', className)} {...otherProps}>
            {children}
        </div>
    );
};
