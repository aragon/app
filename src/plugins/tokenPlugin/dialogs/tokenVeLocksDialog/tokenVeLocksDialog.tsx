import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    Avatar,
    Button,
    DataList,
    DateFormat,
    Dialog,
    formatterUtils,
    Heading,
    invariant,
    Tag,
    type TagVariant,
} from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';
import type { IToken } from '../../../../modules/finance/api/financeService';
import type { ITokenPluginSettings, ITokenVeLock } from '../../types';

export interface ITokenVeLocksDialogParams {
    /**
     * Action to be performed.
     */
    locks: ITokenVeLock[];
    /**
     * Token for which the ve locks are displayed.
     */
    token: IToken;
    /**
     * Settings of the token plugin.
     */
    settings: ITokenPluginSettings;
}

export interface ITokenVeLocksDialogProps extends IDialogComponentProps<ITokenVeLocksDialogParams> {}

export type VeLockStatus = 'warmup' | 'active' | 'cooldown' | 'available';

const statusToVariant: Record<VeLockStatus, TagVariant> = {
    warmup: 'info',
    active: 'primary',
    cooldown: 'info',
    available: 'success',
};

export const TokenVeLocksDialog: React.FC<ITokenVeLocksDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenVeLocksDialog: required parameters must be set.');

    const { locks, token, settings } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const getLockStatusAndTiming = (lock: ITokenVeLock): { status: VeLockStatus; timeLeft?: number } => {
        invariant(
            settings.votingEscrow != null,
            'TokenVeLocksDialog(getLockStatusAndTiming): votingEscrow settings must exist.',
        );
        const { warmupPeriod } = settings.votingEscrow;
        const { epochStartAt, lockExit } = lock;

        const activeAt = epochStartAt + warmupPeriod;
        const now = DateTime.now().toSeconds();

        if (now < activeAt) {
            return { status: 'warmup', timeLeft: activeAt - now };
        }

        if (!lockExit.status) {
            return { status: 'active' };
        }

        if (lockExit.exitDateAt != null && now < lockExit.exitDateAt) {
            return { status: 'cooldown', timeLeft: lockExit.exitDateAt - now };
        }

        return { status: 'available' };
    };

    const calcMultiplier = (lock: ITokenVeLock): number => {
        invariant(
            settings.votingEscrow != null,
            'TokenVeLocksDialog(calcMultiplier): votingEscrow settings must exist.',
        );

        const { warmupPeriod, maxTime, slope } = settings.votingEscrow;
        const { epochStartAt, amount } = lock;
        // TODO: is this ok? Is amount a big number? How do we handle big number arithmetic?
        const lockedAmount = Number(amount);
        const now = DateTime.now().toSeconds();
        const activeAt = epochStartAt + warmupPeriod;
        const activePeriod = now - activeAt;
        const votingPower = Math.min(activePeriod, maxTime) * lockedAmount * slope;
        const multiplier = Math.max(votingPower / lockedAmount, 1);

        return multiplier;
    };

    const getMinLockTime = (lock: ITokenVeLock): number => {
        invariant(
            settings.votingEscrow != null,
            'TokenVeLocksDialog(getMinLockTime): votingEscrow settings must exist.',
        );

        const { warmupPeriod, minLockTime } = settings.votingEscrow;
        const { epochStartAt } = lock;
        const activeAt = epochStartAt + warmupPeriod;
        // TODO: is it activeAt + minLockTime or lockedAt + minLockTime? (we don't have lockedAt coming from backend?)
        const minLockTimeAt = activeAt + minLockTime;

        return minLockTimeAt;
    };

    return (
        <>
            <Dialog.Header title={t('app.plugins.token.tokenVeLocksDialog.title')} />
            <Dialog.Content
                description={t('app.plugins.token.tokenVeLocksDialog.description')}
                className="pb-4 md:pb-6"
            >
                <DataList.Root
                    entityLabel={t('app.plugins.token.tokenVeLocksDialog.entityLabel')}
                    pageSize={3}
                    itemsCount={locks.length}
                    // onLoadMore={fetchNextPage}
                    // state={state}
                >
                    <DataList.Container>
                        {locks.map((lock) => {
                            const { status, timeLeft } = getLockStatusAndTiming(lock);
                            const { amount } = lock;
                            const multiplier = calcMultiplier(lock);
                            const votingPower = Number(amount) * multiplier;
                            const minLockTime = getMinLockTime(lock);
                            const now = DateTime.now().toSeconds();

                            return (
                                <DataList.Item key={lock.id} className="flex flex-col gap-4 py-4 md:py-6">
                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <Avatar src={token.logo} size="md" className="shrink-0" />
                                            <Heading size="h4">ID: {lock.tokenId}</Heading>
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-3">
                                            {timeLeft && (
                                                <p className="text-sm leading-tight text-neutral-500 md:text-base">
                                                    {formatterUtils.formatDate(timeLeft * 1000, {
                                                        format: DateFormat.DURATION,
                                                    })}{' '}
                                                    {t('app.plugins.token.tokenVeLocksDialog.timeLeftSuffix')}
                                                </p>
                                            )}
                                            <Tag
                                                label={t(`app.plugins.token.tokenVeLocksDialog.statusLabel.${status}`)}
                                                variant={statusToVariant[status]}
                                            />
                                        </div>
                                    </div>
                                    <hr className="border-neutral-100" />
                                    <div className="grid grid-cols-3 gap-4 text-base leading-tight text-neutral-800 md:text-lg">
                                        {[
                                            {
                                                label: t('app.plugins.token.tokenVeLocksDialog.metrics.locked'),
                                                value: amount,
                                            },
                                            {
                                                label: t('app.plugins.token.tokenVeLocksDialog.metrics.multiplier'),
                                                value: `${multiplier.toString()}x`,
                                                hidden: multiplier <= 1,
                                            },
                                            {
                                                label: t('app.plugins.token.tokenVeLocksDialog.metrics.votingPower'),
                                                value: votingPower,
                                            },
                                        ]
                                            .filter((val) => !val.hidden)
                                            .map(({ label, value }) => (
                                                <div key="label" className="flex flex-col">
                                                    <div className="text-sm text-neutral-500 md:text-base">{label}</div>
                                                    <div>{value}</div>
                                                </div>
                                            ))}
                                    </div>
                                    <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
                                        {/* TODO: simplify buttons! too verbose and with duplication.  */}
                                        {status === 'active' && (
                                            <>
                                                <Button
                                                    className="w-full md:w-auto"
                                                    variant="secondary"
                                                    size="md"
                                                    disabled={now < minLockTime}
                                                    onClick={() => {
                                                        // handle unlock action
                                                    }}
                                                >
                                                    {t(`app.plugins.token.tokenVeLocksDialog.actions.unlock`, {
                                                        underlyingSymbol: token.symbol,
                                                    })}
                                                </Button>
                                                {now < minLockTime && (
                                                    <p className="text-sm leading-normal text-neutral-500">
                                                        {formatterUtils.formatDate((minLockTime - now) * 1000, {
                                                            format: DateFormat.DURATION,
                                                        })}{' '}
                                                        {t(
                                                            'app.plugins.token.tokenVeLocksDialog.minLockTimeLeftSuffix',
                                                        )}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                        {status === 'cooldown' && (
                                            <>
                                                <Button
                                                    className="w-full md:w-auto"
                                                    variant="tertiary"
                                                    size="md"
                                                    disabled={true}
                                                >
                                                    {t(`app.plugins.token.tokenVeLocksDialog.actions.withdraw`, {
                                                        underlyingSymbol: token.symbol,
                                                    })}
                                                </Button>

                                                <p className="text-sm leading-normal text-neutral-500">
                                                    {formatterUtils.formatDate(timeLeft! * 1000, {
                                                        format: DateFormat.DURATION,
                                                    })}{' '}
                                                    {t('app.plugins.token.tokenVeLocksDialog.withdrawTimeLeftSuffix')}
                                                </p>
                                            </>
                                        )}
                                        {status === 'available' && (
                                            <Button
                                                className="w-full md:w-auto"
                                                variant="tertiary"
                                                size="md"
                                                onClick={() => {
                                                    // handle withdraw action
                                                }}
                                            >
                                                {t(`app.plugins.token.tokenVeLocksDialog.actions.withdraw`, {
                                                    underlyingSymbol: token.symbol,
                                                })}
                                            </Button>
                                        )}
                                    </div>
                                </DataList.Item>
                            );
                        })}
                    </DataList.Container>
                    <DataList.Pagination />
                </DataList.Root>
            </Dialog.Content>
        </>
    );
};
