'use client';

import { Component, type ReactNode } from 'react';
import { ErrorBoundaryFeedback } from './errorBoundaryFeedback';

export interface IErrorBoundaryState {
    /**
     * Indicates if an error has occurred.
     */
    hasError: boolean;
    /**
     * The error that occurred.
     */
    error?: Error;
}

export interface IErrorBoundaryProps {
    /**
     * The children to render.
     */
    children?: ReactNode;
}

export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
    constructor(props: IErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): IErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
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
