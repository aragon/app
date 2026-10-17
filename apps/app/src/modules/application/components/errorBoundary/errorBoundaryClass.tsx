// The `next/navigation` alias points to the client-hooks wrapper, which does not re-export this helper.
import { unstable_rethrow } from 'next/navigation-original';
import { Component, type ReactNode } from 'react';
import { ErrorFeedback } from '@/shared/components/errorFeedback';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

export interface IErrorBoundaryClassState {
    /**
     * Indicates if an error has occurred.
     */
    hasError: boolean;
    /**
     * The error that occurred.
     */
    error?: Error;
}

export interface IErrorBoundaryClassProps {
    /**
     * Current pathname of the application. Error state is reset on pathname change.
     */
    pathname?: string;
    /**
     * Rendered instead of the default error feedback when an error occurs.
     */
    fallback?: ReactNode;
    /**
     * The children to render.
     */
    children?: ReactNode;
}

export class ErrorBoundaryClass extends Component<
    IErrorBoundaryClassProps,
    IErrorBoundaryClassState
> {
    constructor(props: IErrorBoundaryClassProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): IErrorBoundaryClassState {
        // `notFound()` and `redirect()` work by throwing, and Next has boundaries of its own waiting for them.
        // Catching those here would show the error state instead of the not-found page or the redirect, so they
        // are handed straight back; `unstable_rethrow` rethrows only Next's own control flow and returns for a
        // real error.
        unstable_rethrow(error);

        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidUpdate(prevProps: Readonly<IErrorBoundaryClassProps>): void {
        // Reset error state on route change
        if (this.props.pathname !== prevProps.pathname) {
            this.setState({ hasError: false });
        }
    }

    componentDidCatch() {
        monitoringUtils.logError(this.state.error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? <ErrorFeedback />;
        }

        return this.props.children;
    }
}
