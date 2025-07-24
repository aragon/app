import dynamic from 'next/dynamic';

export const AdminProcessBodyField = dynamic(() =>
    import('./adminProcessBodyField').then((mod) => mod.AdminProcessBodyField),
);

export type { IAdminProcessBodyFieldProps } from './adminProcessBodyField';
