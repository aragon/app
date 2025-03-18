import { useDebugContext } from '@/shared/components/debugProvider';
import { useEffect } from 'react';

export const CreateDaoFormDebug: React.FC = () => {
    const { registerControl, unregisterControl } = useDebugContext();

    useEffect(() => {
        registerControl({
            name: 'daoFactoryAddress',
            type: 'string',
            group: 'Create DAO Form',
            label: 'DAO Factory Address',
        });

        return () => {
            unregisterControl('daoFactoryAddress');
        };
    }, [registerControl, unregisterControl]);

    return null;
};
