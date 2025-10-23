import type { Hex } from 'viem';
import type { TranslationFunction } from '../../components/translationsProvider';
import type { IActionGroupDescriptor, IActionViewDescriptor } from './actionViewRegistry.api';

export class ActionViewRegistry {
    private views: IActionViewDescriptor[] = [];
    private groups: IActionGroupDescriptor[] = [];

    register = (descriptor: IActionViewDescriptor): this => {
        if (this.views.find((view) => view.id === descriptor.id)) {
            // throw new Error(`Action view with id "${descriptor.id}" is already registered`);
            return this;
        }

        if (!descriptor.functionSelector && !descriptor.permissionId) {
            throw new Error(
                `Action view "${descriptor.id}" must provide at least one matching criterion: functionSelector or permissionId`,
            );
        }

        this.views.push(descriptor);

        return this;
    };

    registerGroup(groupDescriptor: IActionGroupDescriptor): this {
        this.groups.push(groupDescriptor);

        return this;
    }

    getViewBySelector = (selector: Hex): IActionViewDescriptor | undefined => {
        return this.views.find((view) => view.functionSelector === selector);
    };

    getViewByTextSignature = (textSignature: string): IActionViewDescriptor | undefined => {
        return this.views.find((view) => view.textSignature === textSignature);
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
            return { ...acc, ...cur.component };
        }, {});

        return { group, items, components };
    };
}

export const actionViewRegistry = new ActionViewRegistry();
