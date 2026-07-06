import { isDelegateStatement } from './delegateStatement.api';

describe('isDelegateStatement', () => {
    it('accepts a fully-formed v1 statement', () => {
        const valid = {
            version: 1,
            type: 'statement',
            format: 'markdown',
            content: 'I will vote for long-term protocol health.',
        };
        expect(isDelegateStatement(valid)).toBe(true);
    });

    it.each([
        { label: 'null', value: null },
        { label: 'undefined', value: undefined },
        { label: 'empty object', value: {} },
        {
            label: 'wrong version',
            value: {
                version: 2,
                type: 'statement',
                format: 'markdown',
                content: '',
            },
        },
        {
            label: 'wrong type discriminator',
            value: {
                version: 1,
                type: 'statements',
                format: 'markdown',
                content: '',
            },
        },
        {
            label: 'wrong format',
            value: {
                version: 1,
                type: 'statement',
                format: 'html',
                content: '',
            },
        },
        {
            label: 'non-string content',
            value: {
                version: 1,
                type: 'statement',
                format: 'markdown',
                content: 42,
            },
        },
    ])('rejects $label', ({ value }) => {
        expect(isDelegateStatement(value)).toBe(false);
    });
});
