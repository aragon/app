import {
    addressUtils,
    type IProposalActionInputDataParameter,
} from '@aragon/gov-ui-kit';

class GaugeVoterActionParser {
    parseInputData = (
        params: IProposalActionInputDataParameter[],
    ): { gaugeAddress: string } => {
        const [gaugeAddress] = params.map((param) => param.value);

        return {
            gaugeAddress:
                typeof gaugeAddress === 'string' &&
                addressUtils.isAddress(gaugeAddress)
                    ? gaugeAddress
                    : '',
        };
    };
}

export const gaugeVoterActionParser = new GaugeVoterActionParser();
