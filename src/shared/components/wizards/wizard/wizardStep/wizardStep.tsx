import { appUtils } from '@/shared/utils/appUtils';
import classNames from 'classnames';
import { useEffect, type ComponentProps } from 'react';
import { useWizardContext, type IWizardStepperStep } from '../wizardProvider';

export interface IWizardStepProps extends IWizardStepperStep, Omit<ComponentProps<'div'>, 'id'> {
    /**
     * Hides the step when set to true.
     */
    hidden?: boolean;
}

export const WizardStep: React.FC<IWizardStepProps> = (props) => {
    const { id, hidden, meta, order, children, className, ...otherProps } = props;

    const { activeStep, registerStep, unregisterStep } = useWizardContext();

    useEffect(() => {
        if (hidden) {
            unregisterStep(id);
        } else {
            registerStep({ id, order, meta });
        }
    }, [hidden, unregisterStep, registerStep, id, order, meta]);

    useEffect(() => {
        if (activeStep === id) {
            appUtils.scrollToTop();
        }
    }, [activeStep, id]);

    if (activeStep !== id) {
        return null;
    }

    return (
        <div className={classNames('flex', className)} {...otherProps}>
            {children}
        </div>
    );
};
