import { generateTabComponentPlugin } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PluginTabComponent } from './pluginTabComponent';
import type { IPluginTabComponentProps } from './pluginTabComponent.api';

describe('<PluginTabComponent /> component', () => {
    const getSlotComponentSpy = jest.spyOn(pluginRegistryUtils, 'getSlotComponent');

    afterEach(() => {
        getSlotComponentSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IPluginTabComponentProps>) => {
        const completeProps: IPluginTabComponentProps = {
            slotId: 'slot-id',
            ...props,
        };

        return <PluginTabComponent {...completeProps} />;
    };

    it('returns empty container when no plugin component is found', () => {
        const plugins = [generateTabComponentPlugin()];
        getSlotComponentSpy.mockReturnValue(undefined);
        const { container } = render(createTestComponent({ plugins }));
        expect(container).toBeEmptyDOMElement();
    });

    it('does not render the tabs when having only one slot component registered', () => {
        const plugins = [generateTabComponentPlugin()];
        const component = () => <div data-testid="component-mock" />;
        getSlotComponentSpy.mockReturnValue(component);
        render(createTestComponent({ plugins }));
        expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
        expect(screen.getByTestId('component-mock')).toBeInTheDocument();
    });

    it('renders all the slot components as tabs when having multiple slot components registered', () => {
        const plugins = [
            generateTabComponentPlugin({ id: 'token', uniqueId: '1', label: 'Token' }),
            generateTabComponentPlugin({ id: 'multisig', uniqueId: '2', label: 'Multisig' }),
        ];
        const tokenComponent = () => <div data-testid="token-component" />;
        const multisigComponent = () => <div data-testid="multisig-component" />;
        getSlotComponentSpy.mockImplementation((params: { pluginId: string }) =>
            params.pluginId === 'token' ? tokenComponent : multisigComponent,
        );
        render(createTestComponent({ plugins }));
        expect(screen.getByRole('tablist')).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: plugins[0].label })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: plugins[1].label })).toBeInTheDocument();
        expect(screen.getByTestId('token-component')).toBeInTheDocument();
    });

    it('defaults the tab label to the plugin id when label is not set', () => {
        const plugins = [
            generateTabComponentPlugin({ id: 'token-id', uniqueId: '1' }),
            generateTabComponentPlugin({ uniqueId: '2' }),
        ];
        getSlotComponentSpy.mockReturnValue(() => <div />);
        render(createTestComponent({ plugins }));
        expect(screen.getByRole('tab', { name: 'token-id' })).toBeInTheDocument();
    });

    it('updates the active tab and calls the onValueChange property on tab click', async () => {
        const onValueChange = jest.fn();
        const plugins = [
            generateTabComponentPlugin({ id: '1', uniqueId: '1' }),
            generateTabComponentPlugin({ id: '2', uniqueId: '2' }),
        ];
        getSlotComponentSpy.mockImplementation((params: { pluginId: string }) => () => `component-${params.pluginId}`);
        render(createTestComponent({ plugins, onValueChange }));
        expect(screen.getByText('component-1')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('tab', { name: '2' }));
        expect(screen.getByText('component-2')).toBeInTheDocument();
        expect(onValueChange).toHaveBeenCalledWith(plugins[1]);
    });
});
