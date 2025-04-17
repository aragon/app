'use client';

import { useDebugContext } from '@/shared/components/debugProvider/debugProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Heading, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { DebugPanelControl } from './debugPanelControl';

export interface IDebugPanelProps {}

export const DebugPanel: React.FC<IDebugPanelProps> = () => {
    const [isOpen, setIsOpen] = useState(false);

    const { controls, registerControl } = useDebugContext();
    const { t } = useTranslations();

    const panelRef = useRef<HTMLDivElement>(null);

    const togglePanel = () => setIsOpen((current) => !current);

    useEffect(
        () => registerControl({ name: 'highlightSlots', type: 'boolean', label: 'Highlight slot components' }),
        [registerControl],
    );

    useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            const isOutsideClick = !panelRef.current?.contains(event.target as Node);
            setIsOpen((current) => (current && isOutsideClick ? false : current));
        };

        document.addEventListener('mousedown', handleMouseDown);

        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [isOpen]);

    const groupedControls = Object.groupBy(controls, ({ group }) => group ?? 'Global');

    return (
        <>
            <Button
                id="debug-button"
                className="pointer-events-auto fixed bottom-5 right-5 z-30"
                variant="secondary"
                iconLeft={IconType.SETTINGS}
                onClick={togglePanel}
                size="md"
            />
            <div
                id="debug-panel"
                ref={panelRef}
                className={classNames(
                    'pointer-events-auto fixed right-0 z-40 flex h-full w-[480px] flex-col gap-4 border-l border-neutral-100 bg-neutral-0 px-4 py-2',
                    { hidden: !isOpen },
                )}
            >
                <div className="flex flex-row justify-between">
                    <Heading size="h2">{t('app.application.debugPanel.title')}</Heading>
                    <Button size="md" iconLeft={IconType.CLOSE} onClick={togglePanel} variant="ghost" />
                </div>
                <div className="flex flex-col gap-4">
                    {Object.keys(groupedControls).map((group) => (
                        <div className="flex flex-col gap-2" key={group}>
                            <Heading size="h3">{group}</Heading>
                            <div className="flex flex-col gap-2">
                                {groupedControls[group]?.map((control) => (
                                    <DebugPanelControl control={control} key={control.name} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
