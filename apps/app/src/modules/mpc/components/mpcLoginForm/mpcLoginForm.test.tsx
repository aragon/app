import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mpcService } from '@/modules/mpc/api/mpcService';
import { generateMpcSession, generateMpcUser } from '@/modules/mpc/testUtils';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { type IMpcLoginFormProps, MpcLoginForm } from './mpcLoginForm';

describe('<MpcLoginForm /> component', () => {
    const loginSpy = jest.spyOn(mpcService, 'login');
    const registerSpy = jest.spyOn(mpcService, 'register');

    afterEach(() => {
        loginSpy.mockReset();
        registerSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IMpcLoginFormProps>) => {
        const completeProps: IMpcLoginFormProps = { mode: 'login', ...props };

        return (
            <ReactQueryWrapper>
                <MpcLoginForm {...completeProps} />
            </ReactQueryWrapper>
        );
    };

    it('renders the username and password fields with the submit button', () => {
        render(createTestComponent());
        expect(
            screen.getByRole('textbox', {
                name: /mpcLoginForm.username.label/,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(/mpcLoginForm.password.label/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /mpcLoginForm.submit.login/ }),
        ).toBeInTheDocument();
    });

    it('calls the login mutation with the form values on submit', async () => {
        const session = generateMpcSession({
            user: generateMpcUser({ username: 'alice' }),
        });
        loginSpy.mockResolvedValue(session);
        const onSuccess = jest.fn();
        render(createTestComponent({ onSuccess }));

        await userEvent.type(
            screen.getByRole('textbox', {
                name: /mpcLoginForm.username.label/,
            }),
            'alice',
        );
        await userEvent.type(
            screen.getByLabelText(/mpcLoginForm.password.label/),
            'supersecret',
        );
        await userEvent.click(
            screen.getByRole('button', { name: /mpcLoginForm.submit.login/ }),
        );

        await waitFor(() =>
            expect(loginSpy).toHaveBeenCalledWith({
                body: { username: 'alice', password: 'supersecret' },
            }),
        );
        await waitFor(() => expect(onSuccess).toHaveBeenCalled());
        expect(onSuccess.mock.calls[0][0]).toEqual(session);
        expect(registerSpy).not.toHaveBeenCalled();
    });

    it('calls the register mutation when the mode is register', async () => {
        registerSpy.mockResolvedValue(
            generateMpcSession({ user: generateMpcUser({ username: 'bob' }) }),
        );
        render(createTestComponent({ mode: 'register' }));

        await userEvent.type(
            screen.getByRole('textbox', {
                name: /mpcLoginForm.username.label/,
            }),
            'bob',
        );
        await userEvent.type(
            screen.getByLabelText(/mpcLoginForm.password.label/),
            'supersecret',
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: /mpcLoginForm.submit.register/,
            }),
        );

        await waitFor(() =>
            expect(registerSpy).toHaveBeenCalledWith({
                body: { username: 'bob', password: 'supersecret' },
            }),
        );
        expect(loginSpy).not.toHaveBeenCalled();
    });

    it('does not submit when the fields are empty', async () => {
        render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', { name: /mpcLoginForm.submit.login/ }),
        );
        expect(loginSpy).not.toHaveBeenCalled();
    });
});
