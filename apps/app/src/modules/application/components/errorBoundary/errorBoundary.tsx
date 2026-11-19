'use client';

import { usePathname } from 'next/navigation';
import { ErrorFeedback } from '@/shared/components/errorFeedback';
import { useOptionalFeatureFlags } from '@/shared/components/featureFlagsProvider/featureFlagsProvider';
import {
    ErrorBoundaryClass,
    type IErrorBoundaryClassProps,
} from './errorBoundaryClass';

export interface IErrorBoundaryProps
    extends Omit<IErrorBoundaryClassProps, 'pathname'> {}

export const ErrorBoundary: React.FC<IErrorBoundaryProps> = (props) => {
    const { fallback, ...otherProps } = props;
    const pathname = usePathname();
    const featureFlags = useOptionalFeatureFlags();
    const exploreHref =
        featureFlags?.isEnabled('workspaces') === false ? '/' : '/explore';

    return (
        <ErrorBoundaryClass
            fallback={fallback ?? <ErrorFeedback exploreHref={exploreHref} />}
            pathname={pathname}
            {...otherProps}
        />
    );
};
