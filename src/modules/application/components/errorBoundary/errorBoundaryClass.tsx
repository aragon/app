'use client';

import { Component, type ReactNode } from 'react';
import { ErrorBoundaryFeedback } from './errorBoundaryFeedback';

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
     * The children to render.
     */
    children?: ReactNode;
}

export class ErrorBoundaryClass extends Component<IErrorBoundaryClassProps, IErrorBoundaryClassState> {
    constructor(props: IErrorBoundaryClassProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): IErrorBoundaryClassState {
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
        // TODO: Report the error to an error reporting service (APP-3107)
    }

    render() {
        if (this.state.hasError) {
            return <ErrorBoundaryFeedback />;
        }

        return this.props.children;
    }
}
