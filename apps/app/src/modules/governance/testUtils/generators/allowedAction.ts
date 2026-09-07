import type { IAllowedAction } from '../../api/executeSelectorsService';

export const generateAllowedAction = (
    action?: Partial<IAllowedAction>,
): IAllowedAction => ({
    selector: '0x12345678',
    target: '0x123',
    isAllowed: true,
    id: 'test-id',
    conditionAddress: '0xCondition',
    ...action,
});
