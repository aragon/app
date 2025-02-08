import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { testLogger } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import { GlobalError, type IGlobalErrorProps } from './globalError';

describe('<GlobalError /> component', () => {
    const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');

    beforeEach(() => {
        // Suppress "<html> cannot be a child of <div>" error
        testLogger.suppressErrors();
    });

    afterEach(() => {
        logErrorSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IGlobalErrorProps>) => {
        const completeProps: IGlobalErrorProps = {
            error: new Error(),
            ...props,
        };

        return <GlobalError {...completeProps} />;
    };

    it('renders an error feedback', () => {
        render(createTestComponent());
        expect(screen.getByText(/errorFeedback.title/)).toBeInTheDocument();
    });

    it('logs the error to the monitoring service', () => {
        const error = new Error('test-error');
        render(createTestComponent({ error }));
        expect(logErrorSpy).toHaveBeenCalledWith(error);
    });
});
