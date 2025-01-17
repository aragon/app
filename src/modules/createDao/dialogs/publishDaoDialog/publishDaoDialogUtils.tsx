import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
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

    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, metadataCid, connectedAddress } = params;
        const { network } = values;

        const { addresses } = networkDefinitions[network];
        const { daoFactory, adminPluginRepo } = addresses;

        const daoSettings = this.buildDaoSettingsParams(metadataCid);
        const pluginSettings = this.buildPluginSettingsParams(adminPluginRepo, connectedAddress);

        const transactionData = encodeFunctionData({
            abi: daoFactoryAbi,
            functionName: 'createDao',
            args: [daoSettings, pluginSettings],
        });

        const transaction: TransactionDialogPrepareReturn = {
            to: daoFactory,
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

    private buildPluginSettingsParams = (adminPluginRepo: Hex, connectedAddress: string) => {
        const pluginSettingsData = encodeAbiParameters(adminPluginSetupAbi, [
            connectedAddress as Hex,
            { target: zeroAddress, operation: 0 },
        ]);

        const pluginSettingsParams = {
            pluginSetupRef: {
                pluginSetupRepo: adminPluginRepo,
                versionTag: { release: 1, build: 6 },
            },
            data: pluginSettingsData,
        };

        return [pluginSettingsParams];
    };
}

export const publishDaoDialogUtils = new PublishDaoDialogUtils();
