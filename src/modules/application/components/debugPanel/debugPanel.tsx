'use client';

import { type IDebugContextControl } from '@/shared/components/debugProvider';
import { useDebugContext } from '@/shared/components/debugProvider/debugProvider';
import { Button, Heading, IconType, InputText, Switch } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';

export interface IDebugPanelProps {}

export const DebugPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const panelRef = useRef<HTMLDivElement>(null);
    const { controls, values, updateValue, registerControl } = useDebugContext();

    const togglePanel = () => setIsOpen((current) => !current);

    const groupedControls = Object.groupBy(controls, (control) => control.group ?? 'Global');

    const handleValueChange = (name: string, value: unknown, onChange?: IDebugContextControl['onChange']) => {
        updateValue(name, value);
        onChange?.(value);
    };

    useEffect(() => {
        registerControl({ name: 'displayKeys', type: 'boolean', label: 'Display keys' });
        registerControl({ name: 'highlightSlot', type: 'boolean', label: 'Highlight slots' });
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
                                {groupedControls[group]?.map(({ type, name, label, onChange }) => (
                                    <React.Fragment key={name}>
                                        {type === 'boolean' && (
                                            <Switch
                                                checked={values[name] as boolean}
                                                onCheckedChanged={(event) => handleValueChange(name, event, onChange)}
                                                inlineLabel={label}
                                            />
                                        )}
                                        {type === 'string' && (
                                            <InputText
                                                value={(values[name] as string | undefined) ?? ''}
                                                onChange={({ target }) =>
                                                    handleValueChange(name, target.value, onChange)
                                                }
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
