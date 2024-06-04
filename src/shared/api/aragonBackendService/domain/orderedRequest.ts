import type { OrderDirection } from './enum/orderDirection';

export interface IOrderedRequest {
    /**
     * Property to use to order the response.
     */
    orderProp?: string;
    /**
     * Order direction.
     */
    order?: OrderDirection;
}
