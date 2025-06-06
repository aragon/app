import { useTranslations } from '@/shared/components/translationsProvider';
import {
    Avatar,
    Button,
    DataList,
    DateFormat,
    formatterUtils,
    Heading,
    Tag,
    type TagVariant,
} from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import type { ITokenLock } from '../../api/tokenService';
import type { ITokenVeLocksDialogParams, VeLockStatus } from './tokenVeLocksDialog';
import { tokenVeLocksDialogUtils } from './tokenVeLocksDialogUtils';

export interface ITokenVeLocksDataListItemProps extends Pick<ITokenVeLocksDialogParams, 'votingEscrow' | 'token'> {
    /**
     * VE lock to display.
     */
    lock: ITokenLock;
}

const statusToVariant: Record<VeLockStatus, TagVariant> = {
    active: 'primary',
    cooldown: 'info',
    available: 'success',
};

export const TokenVeLocksListItem: React.FC<ITokenVeLocksDataListItemProps> = (props) => {
    const { lock, votingEscrow, token } = props;
    const { t } = useTranslations();

    const { status, timeLeft } = tokenVeLocksDialogUtils.getLockStatusAndTiming(lock);
    const { amount } = lock;
    const { multiplier, votingPower } = tokenVeLocksDialogUtils.getMultiplierAndVotingPower(lock);
    const minLockTime = tokenVeLocksDialogUtils.getMinLockTime(lock, votingEscrow);
    const now = DateTime.now().toSeconds();

    return (
        <DataList.Item className="flex flex-col gap-4 py-4 md:py-6">
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
                            {t('app.plugins.token.tokenVeLocksList.item.timeLeftSuffix')}
                        </p>
                    )}
                    <Tag
                        label={t(`app.plugins.token.tokenVeLocksList.item.statusLabel.${status}`)}
                        variant={statusToVariant[status]}
                    />
                </div>
            </div>
            <hr className="border-neutral-100" />
            <div className="grid grid-cols-3 gap-4 text-base leading-tight text-neutral-800 md:text-lg">
                {[
                    {
                        label: t('app.plugins.token.tokenVeLocksList.item.metrics.locked'),
                        value: amount,
                    },
                    {
                        label: t('app.plugins.token.tokenVeLocksList.item.metrics.multiplier'),
                        value: `${multiplier.toString()}x`,
                        hidden: multiplier <= 1,
                    },
                    {
                        label: t('app.plugins.token.tokenVeLocksList.item.metrics.votingPower'),
                        value: votingPower,
                    },
                ]
                    .filter((metric) => !metric.hidden)
                    .map(({ label, value }) => (
                        <div key="label" className="flex flex-col">
                            <div className="text-sm text-neutral-500 md:text-base">{label}</div>
                            <div>{value}</div>
                        </div>
                    ))}
            </div>
            <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
                {/* TODO: try to simplify buttons!. */}
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
                            {t(`app.plugins.token.tokenVeLocksList.item.actions.unlock`, {
                                underlyingSymbol: token.symbol,
                            })}
                        </Button>
                        {now < minLockTime && (
                            <p className="text-sm leading-normal text-neutral-500">
                                {formatterUtils.formatDate((minLockTime - now) * 1000, {
                                    format: DateFormat.DURATION,
                                })}{' '}
                                {t('app.plugins.token.tokenVeLocksList.item.minLockTimeLeftSuffix')}
                            </p>
                        )}
                    </>
                )}
                {status === 'cooldown' && (
                    <>
                        <Button className="w-full md:w-auto" variant="tertiary" size="md" disabled={true}>
                            {t(`app.plugins.token.tokenVeLocksList.item.actions.withdraw`, {
                                underlyingSymbol: token.symbol,
                            })}
                        </Button>

                        <p className="text-sm leading-normal text-neutral-500">
                            {formatterUtils.formatDate(timeLeft! * 1000, {
                                format: DateFormat.DURATION,
                            })}{' '}
                            {t('app.plugins.token.tokenVeLocksList.item.withdrawTimeLeftSuffix')}
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
                        {t(`app.plugins.token.tokenVeLocksList.item.actions.withdraw`, {
                            underlyingSymbol: token.symbol,
                        })}
                    </Button>
                )}
            </div>
        </DataList.Item>
    );
};
