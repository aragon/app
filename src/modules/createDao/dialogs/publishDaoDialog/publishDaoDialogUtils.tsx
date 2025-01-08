import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import {
    encodeAbiParameters,
    encodeFunctionData,
    parseEventLogs,
    zeroAddress,
    type Hex,
    type TransactionReceipt,
} from 'viem';
import type { ICreateDaoFormData } from '../../components/createDaoForm';
import { adminPluginSetupAbi } from './adminPluginSetupAbi';
import { daoFactoryAbi } from './daoFactoryAbi';
import { daoRegistryAbi } from './daoRegistryAbi';

export interface IBuildTransactionParams {
    /**
     * Values of the create-dao form.
     */
    values: ICreateDaoFormData;
    /**
     * CID of the DAO metadata pinned on IPFS.
     */
    metadataCid: string;
    /**
     * Connected user to be used as admin.
     */
    connectedAddress: string;
}

class PublishDaoDialogUtils {
    prepareMetadata = (formValues: ICreateDaoFormData, logoCid?: string) => {
        const { name, description, resources } = formValues;
        return {
            name,
            description,
            links: resources,
            avatar: logoCid ? `ipfs://${logoCid}` : undefined,
        };
    };

    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, metadataCid, connectedAddress } = params;
        const { adminPluginRepo, factoryAddress } = values;

        const daoSettings = this.buildDaoSettingsParams(metadataCid);
        const pluginSettings = this.buildPluginSettingsParams(adminPluginRepo, connectedAddress);

        const transactionData = encodeFunctionData({
            abi: daoFactoryAbi,
            functionName: 'createDao',
            args: [daoSettings, pluginSettings],
        });

        const transaction: TransactionDialogPrepareReturn = {
            to: factoryAddress as Hex,
            data: transactionData,
        };

        return Promise.resolve(transaction);
    };

    getDaoAddress = (receipt: TransactionReceipt) => {
        const [daoCreationLog] = parseEventLogs({
            abi: daoRegistryAbi,
            eventName: 'DAORegistered',
            logs: receipt.logs,
            strict: false,
        });

        const { dao: daoAddress } = daoCreationLog.args;

        return daoAddress;
    };

    private buildDaoSettingsParams = (metadataCid: string) => {
        const metadata = transactionUtils.cidToHex(metadataCid);

        const createDaoParams = {
            subdomain: '',
            metadata,
            daoURI: '',
            trustedForwarder: zeroAddress,
        };

        return createDaoParams;
    };

    private buildPluginSettingsParams = (adminPluginRepo: string, connectedAddress: string) => {
        const pluginSettingsData = encodeAbiParameters(adminPluginSetupAbi, [
            connectedAddress as Hex,
            { target: zeroAddress, operation: 0 },
        ]);

        const pluginSettingsParams = {
            pluginSetupRef: {
                pluginSetupRepo: adminPluginRepo as Hex,
                versionTag: { release: 1, build: 6 },
            },
            data: pluginSettingsData,
        };

        return [pluginSettingsParams];
    };
}

export const publishDaoDialogUtils = new PublishDaoDialogUtils();
