import { MpcCreateSystemFormCeremony } from './mpcCreateSystemFormCeremony';
import { MpcCreateSystemFormDetails } from './mpcCreateSystemFormDetails';
import { MpcCreateSystemFormPolicy } from './mpcCreateSystemFormPolicy';

export const MpcCreateSystemForm = {
    Details: MpcCreateSystemFormDetails,
    Ceremony: MpcCreateSystemFormCeremony,
    Policy: MpcCreateSystemFormPolicy,
};

export type { IMpcCreateSystemFormData } from './mpcCreateSystemForm.api';
export type {
    IMpcCeremonyState,
    IMpcCreateSystemFormCeremonyProps,
    MpcCeremonyStatus,
} from './mpcCreateSystemFormCeremony';
export type { IMpcCreateSystemFormDetailsProps } from './mpcCreateSystemFormDetails';
export type { IMpcCreateSystemFormPolicyProps } from './mpcCreateSystemFormPolicy';
