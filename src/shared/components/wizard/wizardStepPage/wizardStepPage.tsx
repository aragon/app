import { Heading } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { WizardFooter } from '../wizardFooter';
import { type IWizardStepProps, WizardStep } from '../wizardStep';

export interface IWizardStepPageProps extends IWizardStepProps {
    /**
     * Title of the step.
     */
    title: string;
    /**
     * Description of the step.
     */
    description: string;
}

export const WizardStepPage: React.FC<IWizardStepPageProps> = (props) => {
    const { title, description, children, className, ...otherProps } = props;

    return (
        <WizardStep
            className={classNames('flex h-full flex-col justify-between gap-10 md:gap-20', className)}
            {...otherProps}
        >
            <div className="flex flex-col gap-6 md:gap-12">
                <div className="flex flex-col gap-2">
                    <Heading size="h1">{title}</Heading>
                    <p className="text-base font-normal leading-normal text-neutral-500 md:text-lg">{description}</p>
                </div>
                {children}
            </div>
            <WizardFooter />
        </WizardStep>
    );
};
