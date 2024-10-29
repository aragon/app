import { type ITransaction } from '@/modules/finance/api/financeService/';
import { generateAsset, generateToken } from '@/modules/finance/testUtils';
import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { generatePaginatedResponse } from '@/shared/testUtils';
import type { IAsset } from './domain';
import type { IGetAssetListParams, IGetTransactionListParams } from './financeService.api';

class FinanceService extends AragonBackendService {
    private urls = {
        assets: '/assets',
        transactions: '/transactions',
    };

    getAssetList = async (params: IGetAssetListParams): Promise<IPaginatedResponse<IAsset>> => {
        // const result = await this.request<IPaginatedResponse<IAsset>>(this.urls.assets, params);

        const data = [
            generateAsset({
                amount: '5',
                token: generateToken({
                    priceUsd: '2000.00',
                    priceChangeOnDayUsd: '100.00',
                    name: 'Ethereum',
                    symbol: 'ETH',
                }),
            }),
            generateAsset({
                amount: '3',
                token: generateToken({
                    priceUsd: '1000.00',
                    priceChangeOnDayUsd: '-150.00',
                    name: 'TestToken',
                    symbol: 'TTK',
                }),
            }),
            generateAsset({
                amount: '7',
                token: generateToken({
                    priceUsd: '2000.00',
                    priceChangeOnDayUsd: '0.00',
                    name: 'StableToken',
                    symbol: 'STK',
                }),
            }),
            generateAsset({
                amount: '10',
                token: generateToken({
                    priceUsd: '0.00',
                    priceChangeOnDayUsd: '50.00',
                    name: 'ZeroToken',
                    symbol: 'ZTK',
                }),
            }),
        ];

        const result = generatePaginatedResponse<IAsset>({ data });

        return result;
    };

    getTransactionList = async (params: IGetTransactionListParams): Promise<IPaginatedResponse<ITransaction>> => {
        const result = await this.request<IPaginatedResponse<ITransaction>>(this.urls.transactions, params);

        return result;
    };
}

export const financeService = new FinanceService();
