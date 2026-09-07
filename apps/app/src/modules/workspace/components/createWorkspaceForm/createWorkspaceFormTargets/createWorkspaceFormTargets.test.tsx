import { GukModulesProvider, IconType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FormWrapper, ReactQueryWrapper } from '@/shared/testUtils';
import { createWorkspaceFormDefaultValues } from '../createWorkspaceFormDefinitions';
import {
    CreateWorkspaceFormTargets,
    type ICreateWorkspaceFormTargetsProps,
} from './createWorkspaceFormTargets';

describe('<CreateWorkspaceFormTargets /> component', () => {
    const createTestComponent = (
        props?: Partial<ICreateWorkspaceFormTargetsProps>,
    ) => {
        const completeProps: ICreateWorkspaceFormTargetsProps = { ...props };

        return (
            <ReactQueryWrapper>
                <GukModulesProvider>
                    <FormWrapper
                        defaultValues={createWorkspaceFormDefaultValues}
                    >
                        <CreateWorkspaceFormTargets {...completeProps} />
                    </FormWrapper>
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    it('renders no target row by default', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/createWorkspaceForm.targets.label/),
        ).toBeInTheDocument();
        expect(screen.getByText('Optional')).toBeInTheDocument();
        expect(
            screen.queryByPlaceholderText(
                /createWorkspaceForm.address.placeholder/,
            ),
        ).not.toBeInTheDocument();
    });

    it('appends a target row on add', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /createWorkspaceForm.targets.add/,
            }),
        );

        expect(
            screen.getAllByPlaceholderText(
                /createWorkspaceForm.address.placeholder/,
            ),
        ).toHaveLength(1);
    });

    it('removes the selected target row', async () => {
        render(createTestComponent());

        const addButton = screen.getByRole('button', {
            name: /createWorkspaceForm.targets.add/,
        });
        await userEvent.click(addButton);
        await userEvent.click(addButton);

        expect(
            screen.getAllByPlaceholderText(
                /createWorkspaceForm.address.placeholder/,
            ),
        ).toHaveLength(2);

        await userEvent.click(screen.getAllByTestId(IconType.DOTS_VERTICAL)[1]);
        await userEvent.click(
            screen.getByText(/createWorkspaceForm.targets.remove/),
        );

        expect(
            screen.getAllByPlaceholderText(
                /createWorkspaceForm.address.placeholder/,
            ),
        ).toHaveLength(1);
    });
});
