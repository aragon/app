import { generateFormContext, generateWizardContext } from '@/shared/testUtils';
import { Button } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as ReactHookForm from 'react-hook-form';
import * as WizardProvider from '../wizardProvider';
import { type IWizardFormProps, WizardForm } from './wizardForm';

describe('<WizardForm /> component', () => {
    const useWizardContextSpy = jest.spyOn(WizardProvider, 'useWizardContext');
    const useFormContextSpy = jest.spyOn(ReactHookForm, 'useFormContext');

    beforeEach(() => {
        useWizardContextSpy.mockReturnValue(generateWizardContext());
        useFormContextSpy.mockReturnValue(generateFormContext());
    });

    afterEach(() => {
        useWizardContextSpy.mockReset();
        useFormContextSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWizardFormProps>) => {
        const completeProps: IWizardFormProps = { ...props };

        return <WizardForm {...completeProps} />;
    };

    it('renders a form with the children content', () => {
        const children = 'test-content';
        const name = 'form-name';
        render(createTestComponent({ children, name }));
        expect(screen.getByText(children)).toBeInTheDocument();
        expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('triggers the nextStep function when current is not the last step on form submit', async () => {
        const children = <Button type="submit" />;
        const nextStep = jest.fn();
        const handleSubmit = jest.fn(() => jest.fn());
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasNext: true, nextStep }));
        useFormContextSpy.mockReturnValue(generateFormContext({ handleSubmit }));
        render(createTestComponent({ children }));
        await userEvent.click(screen.getByRole('button'));
        expect(handleSubmit).toHaveBeenCalledWith(nextStep);
    });

    it('triggers the onSubmit property when current is the last step on form submit', async () => {
        const children = <Button type="submit" />;
        const handleSubmit = jest.fn(() => jest.fn());
        const onSubmit = jest.fn();
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasNext: false }));
        useFormContextSpy.mockReturnValue(generateFormContext({ handleSubmit }));
        render(createTestComponent({ children, onSubmit }));
        await userEvent.click(screen.getByRole('button'));
        expect(handleSubmit).toHaveBeenCalledWith(onSubmit);
    });

    it('does not throw error when the onSubmit property is not defined', async () => {
        const children = <Button type="submit" />;
        const handleSubmit = ((callback: () => void) => () => callback()) as ReactHookForm.UseFormHandleSubmit<object>;
        const onSubmit = undefined;
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasNext: false }));
        useFormContextSpy.mockReturnValue(generateFormContext({ handleSubmit }));
        render(createTestComponent({ children, onSubmit }));
        await expect(userEvent.click(screen.getByRole('button'))).resolves.toBeUndefined();
    });
});
