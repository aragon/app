import type { Hex } from 'viem';
import type { IActionViewDescriptor } from './actionViewRegistry.api';

export class ActionViewRegistry {
    private views: IActionViewDescriptor[] = [];

    register = (descriptor: IActionViewDescriptor): void => {
        if (this.views.find((view) => view.id === descriptor.id)) {
            throw new Error(`Action view with id "${descriptor.id}" is already registered`);
        }

        if (!descriptor.functionSelector && !descriptor.permissionId) {
            throw new Error(
                `Action view "${descriptor.id}" must provide at least one matching criterion: functionSelector or permissionId`,
            );
        }

        this.views.push(descriptor);
    };

    getViewBySelector = (selector: Hex): IActionViewDescriptor | undefined => {
        return this.views.find((view) => view.functionSelector === selector);
    };

    getViewsByPermissionId = (permissionId: string): IActionViewDescriptor[] => {
        return this.views.filter((view) => view.permissionId === permissionId);
    };
}

export const actionViewRegistry = new ActionViewRegistry();
