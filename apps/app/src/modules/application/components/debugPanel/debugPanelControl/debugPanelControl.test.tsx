import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
    IDebugContext,
    IDebugContextControl,
} from '@/shared/components/debugProvider';
import * as debugProvider from '@/shared/components/debugProvider';
import { DebugPanelControl } from './debugPanelControl';
import type { IDebugPanelControlProps } from './debugPanelControl.api';

describe('<DebugPanelControl /> component', () => {
    const mockUpdateValue = jest.fn();
    const useDebugContextSpy = jest.spyOn(debugProvider, 'useDebugContext');

    beforeEach(() => {
        useDebugContextSpy.mockReturnValue({
            values: { theme: 'today' },
            registerControl: jest.fn(),
            unregisterControl: jest.fn(),
            controls: [],
            updateValue: mockUpdateValue,
        } as IDebugContext);
    });

    afterEach(() => {
        mockUpdateValue.mockReset();
        useDebugContextSpy.mockReset();
    });

    const selectControl: IDebugContextControl = {
        name: 'theme',
        type: 'select',
        label: 'Theme',
        options: [
            { label: 'Today', value: 'today' },
            { label: 'Next', value: 'next' },
        ],
    };

    const createTestComponent = (props?: Partial<IDebugPanelControlProps>) => {
        const completeProps: IDebugPanelControlProps = {
            control: selectControl,
            ...props,
        };

        return <DebugPanelControl {...completeProps} />;
    };

    it('renders a select control as one radio per option with the current value checked', () => {
        render(createTestComponent());

        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Today' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Next' })).not.toBeChecked();
    });

    it('updates the value and calls the control callback when an option is selected', async () => {
        const onChange = jest.fn();
        render(
            createTestComponent({ control: { ...selectControl, onChange } }),
        );

        await userEvent.click(screen.getByRole('radio', { name: 'Next' }));

        expect(mockUpdateValue).toHaveBeenCalledWith('theme', 'next');
        expect(onChange).toHaveBeenCalledWith('next');
    });
});
