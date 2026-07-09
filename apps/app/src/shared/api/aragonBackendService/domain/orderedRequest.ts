import type { OrderDirection } from './enum/orderDirection';

export interface IOrderedRequest {
    /**
     * Property to use to order the response.
     */
    sort?: string;
    /**
     * Order direction.
     */
    order?: OrderDirection;
}
