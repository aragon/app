import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { AddressesInputItem } from '../addressesInputItem';
import {
    AddressesInputContainer,
    type IAddressesInputContainerProps,
} from './addressesInputContainer';

describe('<AddressesInputContainer /> component', () => {
    const createTestComponent = (
        props?: Partial<IAddressesInputContainerProps>,
        rows: ReactNode = <div>row 0</div>,
    ) => {
        const completeProps: IAddressesInputContainerProps = {
            name: 'members',
            label: 'Members',
            ...props,
        };

        const Harness = () => {
            const form = useForm({
                defaultValues: { members: [{ address: '' }] },
            });

            return (
                <FormProvider {...form}>
                    <AddressesInputContainer {...completeProps}>
                        {rows}
                    </AddressesInputContainer>
                </FormProvider>
            );
        };

        return <Harness />;
    };

    it('exposes the address list as a group named by the label', () => {
        render(createTestComponent());

        const group = screen.getByRole('group', { name: 'Members' });

        expect(group).toBeInTheDocument();
        expect(group).toHaveTextContent('row 0');
    });

    it('focuses the first member input when the label is clicked', async () => {
        render(
            <GukModulesProvider>
                <ReactQueryWrapper>
                    {createTestComponent(
                        undefined,
                        <AddressesInputItem index={0} />,
                    )}
                </ReactQueryWrapper>
            </GukModulesProvider>,
        );

        await userEvent.click(screen.getByText('Members'));

        expect(screen.getByRole('textbox')).toHaveFocus();
    });
});
