import type { IMember } from '../../api/governanceService';
import { generateMemberMetrics } from './memberMetrics';

export const generateMember = (member?: Partial<IMember>): IMember => ({
    address: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
    ens: null,
    type: 'unknown',
    metrics: generateMemberMetrics(),
    ...member,
});
