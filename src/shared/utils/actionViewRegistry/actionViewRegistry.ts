import { invariant } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import type { TranslationFunction } from '../../components/translationsProvider';
import type { IActionGroupDescriptor, IActionViewDescriptor } from './actionViewRegistry.api';

export class ActionViewRegistry {
    private views: IActionViewDescriptor[] = [];
    private groups: IActionGroupDescriptor[] = [];

    register = (descriptor: IActionViewDescriptor): this => {
        if (this.views.find((view) => view.actionType === descriptor.actionType)) {
            return this;
        }

        invariant(
            !!descriptor.functionSelector || !!descriptor.permissionId,
            `ActionViewRegistry->register: Action view "${descriptor.actionType}" must provide at least one matching criterion: functionSelector or permissionId`,
        );

        this.views.push(descriptor);

        return this;
    };

    registerGroup(groupDescriptor: IActionGroupDescriptor): this {
        this.groups.push(groupDescriptor);

        return this;
    }

    getViewBySelector = (selector?: Hex): IActionViewDescriptor | undefined => {
        if (!selector) {
            return undefined;
        }

        return this.views.find((view) => view.functionSelector === selector);
    };

    getViewsByPermissionId = (permissionId: string): IActionViewDescriptor[] => {
        return this.views.filter((view) => view.permissionId === permissionId);
    };

    getActionsForPermissionId = (permissionId: string, contractAddress: string, t: TranslationFunction) => {
        const groupDescriptor = this.groups.find((group) => group.permissionId === permissionId);
        const group = groupDescriptor ? groupDescriptor.getGroup({ contractAddress, t }) : undefined;
        const views = this.getViewsByPermissionId(permissionId);
        const items = views.map((view) => view.getItem({ contractAddress, t }));
        const components = views.reduce((acc, cur) => {
            return { ...acc, [cur.actionType]: cur.componentCreate };
        }, {});

        return { group, items, components };
    };
}

export const actionViewRegistry = new ActionViewRegistry();
