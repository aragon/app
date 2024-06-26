import { render, screen } from '@testing-library/react';
import { PageHeaderStat, type IPageHeaderStatProps } from './pageHeaderStat';

describe('<PageHeaderStat /> component', () => {
    const createTestComponent = (props?: Partial<IPageHeaderStatProps>) => {
        const completeProps: IPageHeaderStatProps = {
            value: 'value',
            label: 'label',
            ...props,
        };

        return <PageHeaderStat {...completeProps} />;
    };

    it('renders the specified stat label and value', () => {
        const label = 'stat-label';
        const value = '5';
        render(createTestComponent({ label, value }));
        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByText(value)).toBeInTheDocument();
    });

    it('renders the stat suffix when defined', () => {
        const suffix = 'USD';
        render(createTestComponent({ suffix }));
        expect(screen.getByText(suffix)).toBeInTheDocument();
    });

    it('defaults the value to 0 when undefiend', () => {
        const value = undefined;
        render(createTestComponent({ value }));
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('defaults the value to 0 when null', () => {
        const value = null;
        render(createTestComponent({ value }));
        expect(screen.getByText('0')).toBeInTheDocument();
    });
});
