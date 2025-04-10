import { Network } from '@/shared/api/daoService';
import { type IDebugContextControl, useDebugContext } from '@/shared/components/debugProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import type { Hex } from 'viem';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';

const daoFactoryAddressDebugControl: IDebugContextControl = {
    name: 'daoFactoryAddress',
    type: 'string',
    group: 'Create DAO',
    label: 'DAO Factory Address',
};

export const CreateDaoFormDebug: React.FC = () => {
    const { registerControl, unregisterControl } = useDebugContext();

    const networkField = useWatch<ICreateDaoFormData, 'network'>({
        name: 'network',
        defaultValue: Network.ETHEREUM_SEPOLIA,
    });

    useEffect(() => {
        const { daoFactory } = networkDefinitions[networkField].addresses;

        registerControl({
            ...daoFactoryAddressDebugControl,
            value: daoFactory,
            onChange: (value) => {
                networkDefinitions[networkField].addresses.daoFactory = value as Hex;
            },
        });

        return () => unregisterControl(daoFactoryAddressDebugControl.name);
    }, [networkField, registerControl, unregisterControl]);

    return null;
};
