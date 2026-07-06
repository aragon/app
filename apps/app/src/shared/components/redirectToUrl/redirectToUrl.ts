'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RedirectToUrlProps {
    url: string;
}

export const RedirectToUrl: React.FC<RedirectToUrlProps> = ({ url }) => {
    const router = useRouter();

    useEffect(() => {
        router.push(url);
    }, [router, url]);

    return null;
};
