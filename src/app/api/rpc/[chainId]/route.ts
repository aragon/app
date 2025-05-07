import { ProxyRpcUtils } from '@/modules/application/utils/proxyRpcUtils';

const proxyRpcUtils = new ProxyRpcUtils();

export const POST = proxyRpcUtils.request;
