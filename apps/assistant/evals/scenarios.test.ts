import { evalScenarios, type IEvalTurnResult } from './scenarios';

const scenario = (id: string) => {
    const found = evalScenarios.find((candidate) => candidate.id === id);

    if (found == null) {
        throw new Error(`no scenario ${id}`);
    }

    return found;
};

const reply = (
    text: string,
    toolCalls: IEvalTurnResult['toolCalls'] = [],
): IEvalTurnResult => ({ text, toolCalls, docsOutputs: [] });

const contactLink =
    '[get in touch](https://www.aragon.org/get-assistance-form)';

describe('eval scenarios', () => {
    it('have unique ids and at least one mode each', () => {
        const ids = evalScenarios.map((candidate) => candidate.id);

        expect(new Set(ids).size).toBe(ids.length);
        expect(
            evalScenarios.every((candidate) => candidate.modes.length > 0),
        ).toBe(true);
    });

    it('fail a missing capability answered as an unknown and pass it said plainly', () => {
        const { check } = scenario('absent-private-quadratic');

        expect(
            check(
                [
                    reply(
                        "I don't know whether Aragon supports private quadratic voting. The app's governance options include Token Voting and Lock to Vote, but I couldn't confirm a private quadratic voting option. Would you like me to pass this question to the Aragon team?",
                    ),
                ],
                {},
            ),
        ).toEqual([
            'treats a missing capability as an unknown',
            'no contact link for a capability the app lacks',
            'closing question',
        ]);
        expect(
            check(
                [
                    reply(
                        `Quadratic voting and private voting aren't part of the app's governance setup. You can configure a multisig, token voting or lock to vote. The Aragon team can build it with you — ${contactLink}.`,
                    ),
                ],
                {},
            ),
        ).toEqual([]);
        // Only a markdown link to the form counts; a bare URL or another target does not.
        expect(
            check(
                [
                    reply(
                        "The app doesn't offer it. Get in touch: https://www.aragon.org/get-assistance-form or [the form](https://example.com/?https://www.aragon.org/get-assistance-form).",
                    ),
                ],
                {},
            ),
        ).toEqual([
            'bare URL',
            'no contact link for a capability the app lacks',
        ]);
    });

    it('holds documentation answers to the voice rules', () => {
        const { check } = scenario('docs-lock-to-vote');

        expect(
            check(
                [
                    reply(
                        'According to the documentation, Lock to Vote is a self-service option: see https://example.com.',
                    ),
                ],
                {},
            ),
        ).toEqual([
            'friction word (paid/advisory/services/self-service)',
            'mentions the documentation',
            'bare URL',
        ]);
    });

    it('checks a list answer against the chains of the index', () => {
        const { check } = scenario('docs-chains');

        expect(
            check(
                [reply('You can create an account on:\n- Base\n- Ethereum')],
                {
                    chains: ['Base', 'Ethereum', 'Hemi'],
                },
            ),
        ).toEqual(['misses chain Hemi']);
    });

    it('expects a report to open a draft of the right intent with its sentence', () => {
        const { check } = scenario('problem-vote-fails');

        expect(
            check([reply('Sorry to hear that. Try refreshing the page.')], {}),
        ).toEqual(['no draft for a report']);
        expect(
            check(
                [
                    reply(
                        "Here's the draft for the team — add anything else that comes to mind.",
                        [
                            {
                                toolName: 'createLinearTicket',
                                input: { intent: 'bug', title: 'Voting fails' },
                            },
                        ],
                    ),
                ],
                {},
            ),
        ).toEqual([]);
    });

    it('expects the unknown-fact offer first and the question draft once the user agrees', () => {
        const { check } = scenario('unknown-gas-cost');

        expect(
            check(
                [
                    reply(
                        "I don't know the exact gas cost. Creating an account is one transaction. Would you like me to pass the question on?",
                    ),
                    reply('Here it is.', [
                        {
                            toolName: 'createLinearTicket',
                            input: {
                                intent: 'question',
                                title: 'Gas cost of DAO creation',
                            },
                        },
                    ]),
                ],
                {},
            ),
        ).toEqual([]);
    });
});
