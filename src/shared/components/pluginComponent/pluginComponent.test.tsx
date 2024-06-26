import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { render, screen } from '@testing-library/react';
import { PluginComponent, type IPluginComponentProps } from './pluginComponent';

describe('<PluginComponent />', () => {
    const getSlotComponentSpy = jest.spyOn(pluginRegistryUtils, 'getSlotComponent');

    afterEach(() => {
        getSlotComponentSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IPluginComponentProps>) => {
        const completeProps: IPluginComponentProps = {
            slotId: 'test',
            pluginIds: [],
            ...props,
        };

        return <PluginComponent {...completeProps} />;
    };

    it('renders the registered slot component for the given plugin-id and slot-id`', () => {
        const pluginId = 'plugin-id';
        const slotId = 'slot-id';
        const slotComponent = () => <div data-testid="slot-component-test" />;
        getSlotComponentSpy.mockReturnValue(slotComponent);
        render(createTestComponent({ pluginIds: [pluginId], slotId }));

        expect(getSlotComponentSpy).toHaveBeenCalledWith({ slotId, pluginId });
        expect(screen.getByTestId('slot-component-test')).toBeInTheDocument();
    });

    it('returns null when no slot component is found', () => {
        getSlotComponentSpy.mockReturnValue(undefined);
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('only renders the first non-null slot component found', () => {
        const pluginIds = ['unknown', 'multisig', 'tokenVoting'];
        const slotId = 'member-list';
        getSlotComponentSpy
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(() => <div data-testid="multisig-slot-component" />)
            .mockReturnValueOnce(() => <div data-testid="tokenvoting-slot-component" />);
        render(createTestComponent({ pluginIds, slotId }));

        expect(screen.getByTestId('multisig-slot-component')).toBeInTheDocument();
        expect(screen.queryByTestId('tokenvoting-slot-component')).not.toBeInTheDocument();
    });
});
