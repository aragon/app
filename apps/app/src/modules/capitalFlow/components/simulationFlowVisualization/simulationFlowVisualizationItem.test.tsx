import { ChainEntityType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IAddressDelta } from '../../utils/simulationTypes';
import {
    type ISimulationFlowVisualizationItemProps,
    SimulationFlowVisualizationItem,
} from './simulationFlowVisualizationItem';

describe('<SimulationFlowVisualizationItem /> component', () => {
    const address = '0x1234567890123456789012345678901234567890';
    const truncatedAddress = '0x1234…7890';

    const createTestComponent = (
        props?: Partial<ISimulationFlowVisualizationItemProps>,
    ) => {
        const item: IAddressDelta = {
            address,
            label: 'Treasury',
            role: 'wallet',
            isKnown: true,
            tokens: [],
            ...props?.item,
        };

        const completeProps: ISimulationFlowVisualizationItemProps = {
            groupKind: 'external',
            ...props,
            item,
        };

        return <SimulationFlowVisualizationItem {...completeProps} />;
    };

    it('renders the fallback address as valid phrasing content inside its paragraph', () => {
        const errors: string[] = [];
        jest.spyOn(console, 'error').mockImplementation(
            (...args: unknown[]) => {
                errors.push(args.map(String).join(' '));
            },
        );

        const { container } = render(createTestComponent());

        expect(screen.getByText(truncatedAddress)).toBeInTheDocument();
        expect(container.querySelector('p div')).toBeNull();
        expect(
            errors.filter((error) => /cannot be a descendant/i.test(error)),
        ).toEqual([]);
    });

    it('renders a single copy control for the address when a block-explorer link is available', () => {
        const href = 'https://etherscan.io/address/1234';
        const buildEntityUrl = jest.fn(
            (params: { type: ChainEntityType; id?: string }) =>
                params.type === ChainEntityType.ADDRESS ? href : undefined,
        );

        const { container } = render(createTestComponent({ buildEntityUrl }));

        expect(screen.getByRole('link')).toHaveAttribute('href', href);
        expect(screen.getAllByText(truncatedAddress)).toHaveLength(1);
        expect(
            container.querySelectorAll('button[aria-label="Copy"]'),
        ).toHaveLength(1);
    });
});
