'use client';

export { useParams, usePathname, useSearchParams } from 'next/navigation-original';
// override the default useRouter from next/navigation to enable the top loader
export { useRouter } from 'nextjs-toploader/app';
