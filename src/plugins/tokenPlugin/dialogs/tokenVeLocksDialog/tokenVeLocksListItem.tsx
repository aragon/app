import type { IToken } from '@/modules/finance/api/financeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Avatar, Button, DataList, DateFormat, formatterUtils, Heading, Tag } from '@aragon/gov-ui-kit';
import type { ITokenVeLock } from '../../types';

export interface ITokenVeLocksDataListItemProps {
    /**
     * Lock to display.
     */
    lock: ITokenVeLock;
    /**
     * Token for which the ve locks are displayed.
     */
    token: IToken;
}

export const TokenVeLocksListItem: React.FC<ITokenVeLocksDataListItemProps> = ({ token, lock }) => {
    const { t } = useTranslations();

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
                                {t('app.plugins.token.tokenVeLocksDialog.minLockTimeLeftSuffix')}
                            </p>
                        )}
                    </>
                )}
                {status === 'cooldown' && (
                    <>
                        <Button className="w-full md:w-auto" variant="tertiary" size="md" disabled={true}>
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
};
