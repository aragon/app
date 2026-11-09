'use client';

import { usePathname } from 'next/navigation';
import { ErrorFeedback } from '@/shared/components/errorFeedback';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import {
    ErrorBoundaryClass,
    type IErrorBoundaryClassProps,
} from './errorBoundaryClass';

export interface IErrorBoundaryProps
    extends Omit<IErrorBoundaryClassProps, 'pathname'> {}

export const ErrorBoundary: React.FC<IErrorBoundaryProps> = (props) => {
    const { fallback, ...otherProps } = props;
    const pathname = usePathname();
    const { isEnabled } = useFeatureFlags();
    const exploreHref = isEnabled('workspaces') ? '/explore' : '/';

    return (
        <ErrorBoundaryClass
            fallback={fallback ?? <ErrorFeedback exploreHref={exploreHref} />}
            pathname={pathname}
            {...otherProps}
        />
    );
};
