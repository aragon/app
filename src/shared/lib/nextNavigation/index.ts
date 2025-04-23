'use client';

import { useRouter as useRouterWithTopLoader } from 'nextjs-toploader/app';
import { useMemo } from 'react';
export { useParams, usePathname, useSearchParams } from 'next/navigation-original';

// override the default useRouter from next/navigation to enable the top loader
export const useRouter = () => {
    const routerInstance = useRouterWithTopLoader();

    // Memoize the router to ensure referential stability - temp hack until a fix is applied to nextjs-toploader package
    // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/unbound-method
    return useMemo(() => routerInstance, [routerInstance.push, routerInstance.replace]);
};
