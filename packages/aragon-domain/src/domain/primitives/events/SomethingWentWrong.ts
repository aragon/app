import { DomainEventBase, defineEvent } from 'ddd-core-ts';

export const SomethingWentWrong = defineEvent(
    class SomethingWentWrong extends DomainEventBase {
        static readonly code = 'SomethingWentWrong';

        constructor(readonly error: Error) {
            super();
        }
    },
);

export type SomethingWentWrong = InstanceType<typeof SomethingWentWrong>;
