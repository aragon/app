import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { render, screen } from '@testing-library/react';
import { PluginSingleComponent, type IPluginSingleComponentProps } from './pluginSingleComponent';

describe('<PluginSingleComponent /> component', () => {
    const getSlotComponentSpy = jest.spyOn(pluginRegistryUtils, 'getSlotComponent');

    afterEach(() => {
        getSlotComponentSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IPluginSingleComponentProps>) => {
        const completeProps: IPluginSingleComponentProps = {
            slotId: 'slot-test',
            pluginId: 'plugin-test',
            ...props,
        };

        return <PluginSingleComponent {...completeProps} />;
    };

    it('renders the registered slot component for the given plugin-id and slot-id`', () => {
        const pluginId = 'plugin-id';
        const slotId = 'slot-id';
        const slotComponent = () => <div data-testid="slot-component-test" />;
        getSlotComponentSpy.mockReturnValue(slotComponent);
        render(createTestComponent({ pluginId, slotId }));

        expect(getSlotComponentSpy).toHaveBeenCalledWith({ slotId, pluginId });
        expect(screen.getByTestId('slot-component-test')).toBeInTheDocument();
    });

    it('returns null when no slot component is found and no children are provided', () => {
        getSlotComponentSpy.mockReturnValue(undefined);
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the fallback component when no plugin component is found and children is a valid React element', () => {
        getSlotComponentSpy.mockReturnValue(undefined);
        const FallbackComponent = () => <div data-testid="fallback-component-test" />;
        render(createTestComponent({ children: <FallbackComponent /> }));
        expect(screen.getByTestId('fallback-component-test')).toBeInTheDocument();
    });

    it('does not render the fallback component when the plugin component is found', () => {
        const pluginId = 'plugin-id';
        const slotId = 'slot-id';
        const slotComponent = () => <div data-testid="slot-component-test" />;
        getSlotComponentSpy.mockReturnValue(slotComponent);
        const FallbackComponent = () => <div data-testid="fallback-component-test" />;

        render(createTestComponent({ pluginId, slotId, children: <FallbackComponent /> }));

        expect(screen.getByTestId('slot-component-test')).toBeInTheDocument();
        expect(screen.queryByTestId('fallback-component-test')).not.toBeInTheDocument();
    });
});
