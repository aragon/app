'use client';

import { useDebugContext } from '@/shared/components/debugProvider/debugProvider';
import { Button, Heading, IconType, InputText, Switch } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';

export interface IDebugPanelProps {}

// TODO: Object.groupBy is supported on Node v21, update code to use Object.groupBy and update engines.node version to 22 (APP-3603)
const groupBy = <TItem extends object>(iterable: TItem[], fn: (item: TItem) => string | number) => {
    return [...iterable].reduce<Record<string, TItem[]>>((groups, curr) => {
        const key = fn(curr);
        const group = groups[key] ?? [];
        group.push(curr);

        return { ...groups, [key]: group };
    }, {});
};

export const DebugPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const panelRef = useRef<HTMLDivElement>(null);
    const { controls, values, updateValue, registerControl } = useDebugContext();

    const togglePanel = () => setIsOpen((current) => !current);

    const groupedControls = groupBy(controls, (control) => control.group ?? 'Global');

    useEffect(() => {
        registerControl({ name: 'displayKeys', type: 'boolean', label: 'Display keys' });
    }, [registerControl]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && !panelRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <>
            <Button
                className="fixed bottom-2 right-2"
                variant="secondary"
                iconLeft={IconType.BLOCKCHAIN_BLOCK}
                onClick={togglePanel}
                size="md"
            />
            <div
                ref={panelRef}
                className={classNames('fixed right-0 z-50 h-full w-[480px] bg-neutral-0 px-4 py-2 shadow-neutral', {
                    hidden: !isOpen,
                })}
            >
                <div className="flex flex-row justify-between">
                    <Heading size="h2">Debug Panel</Heading>
                    <Button size="md" iconLeft={IconType.CLOSE} onClick={togglePanel} variant="ghost" />
                </div>
                <div className="flex flex-col gap-4">
                    {Object.keys(groupedControls).map((group) => (
                        <div className="flex flex-col gap-2" key={group}>
                            <Heading size="h3">{group}</Heading>
                            <div className="flex flex-col gap-1">
                                {groupedControls[group].map(({ type, name, label }) => (
                                    <React.Fragment key={name}>
                                        {type === 'boolean' && (
                                            <Switch
                                                checked={values[name] as boolean}
                                                onCheckedChanged={(event) => updateValue(name, event)}
                                                inlineLabel={label}
                                            />
                                        )}
                                        {type === 'string' && (
                                            <InputText
                                                value={(values[name] as string | undefined) ?? ''}
                                                onChange={(event) => updateValue(name, event.target.value)}
                                                label={label}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
