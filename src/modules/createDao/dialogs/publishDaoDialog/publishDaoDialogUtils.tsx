import { adminPlugin } from '@/plugins/adminPlugin/constants/adminPlugin';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { transactionUtils, type ITransactionRequest } from '@/shared/utils/transactionUtils';
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
    /**
     * Custom DAO factory address to use for the transaction.
     */
    daoFactoryAddress?: Hex;
}

class PublishDaoDialogUtils {
    prepareMetadata = (formValues: ICreateDaoFormData, avatarCid?: string) => {
        const { name, description, resources } = formValues;
        const processedAvatar = ipfsUtils.cidToUri(avatarCid);

        return {
            name,
            description,
            links: resources,
            avatar: processedAvatar,
        };
    };

    buildTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { values, metadataCid, connectedAddress, daoFactoryAddress } = params;
        const { network } = values;

        const { daoFactory } = networkDefinitions[network].addresses;
        const adminPluginRepo = adminPlugin.repositoryAddresses[network];

        const daoSettings = this.buildDaoSettingsParams(metadataCid);
        const pluginSettings = this.buildPluginSettingsParams(adminPluginRepo, connectedAddress);

        const transactionData = encodeFunctionData({
            abi: daoFactoryAbi,
            functionName: 'createDao',
            args: [daoSettings, pluginSettings],
        });

        const transaction: TransactionDialogPrepareReturn = {
            to: daoFactoryAddress?.length ? daoFactoryAddress : daoFactory,
            data: transactionData,
            value: BigInt(0),
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

    private buildPluginSettingsParams = (adminPluginRepo: Hex, connectedAddress: string) => {
        const pluginSettingsData = encodeAbiParameters(adminPluginSetupAbi, [
            connectedAddress as Hex,
            { target: zeroAddress, operation: 0 },
        ]);

        const pluginSettingsParams = {
            pluginSetupRef: {
                pluginSetupRepo: adminPluginRepo,
                versionTag: adminPlugin.installVersion,
            },
            data: pluginSettingsData,
        };

        return [pluginSettingsParams];
    };
}

export const publishDaoDialogUtils = new PublishDaoDialogUtils();
