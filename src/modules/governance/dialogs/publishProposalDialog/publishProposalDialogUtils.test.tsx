import { DateTime } from 'luxon';
import {
    generateCreateProposalFormData,
    generateProposalActionChangeMembers,
    generateProposalActionUpdateMetadata,
} from '../../testUtils';
import { publishProposalDialogUtils } from './publishProposalDialogUtils';

describe('publishProposalDialog utils', () => {
    describe('prepareMetadata', () => {
        it('correctly map form values to metadata object', () => {
            const formValues = generateCreateProposalFormData({
                title: 'Title',
                summary: 'Short summary',
                body: '<p>Proposal body</p>',
                resources: [{ name: 'Name', url: 'https://aragon.org' }],
            });

            expect(publishProposalDialogUtils.prepareMetadata(formValues)).toEqual({
                title: formValues.title,
                summary: formValues.summary,
                description: formValues.body,
                resources: formValues.resources,
            });
        });
    });

    describe('buildTransaction', () => {
        it('', () => {
            // TODO
        });
    });

    describe('getProposalId', () => {
        it('', () => {
            // TODO
        });
    });

    describe('parseStartDate', () => {
        it('', () => {
            // TODO
        });
    });

    describe('parseEndDate', () => {
        it('', () => {
            // TODO
        });
    });

    describe('parseFixedDate', () => {
        it('returns a DateTime object from the given date and time', () => {
            const date = '2024-08-29';
            const time = '16:47';
            const parsedDate = publishProposalDialogUtils['parseFixedDate']({ date, time });
            expect(parsedDate.toISO()).toEqual('2024-08-29T16:47:00.000+00:00');
        });
    });

    describe('dateToSeconds', () => {
        it('parses the given DateTime object to an integer number representing its seconds', () => {
            const date = DateTime.fromISO('2016-05-25T09:08:34.123');
            expect(publishProposalDialogUtils['dateToSeconds'](date)).toEqual(1464167314);
        });
    });

    describe('metadataToHex', () => {
        it('parses the metadata cid to hex format', () => {
            const metadataCid = 'QmT8PDLFQDWaAUoKw4BYziWQNVKChJY3CGi5eNpECi7ufD';
            const expectedValue =
                '0x697066733a2f2f516d543850444c465144576141556f4b773442597a6957514e564b43684a593343476935654e7045436937756644';
            expect(publishProposalDialogUtils['metadataToHex'](metadataCid)).toEqual(expectedValue);
        });
    });

    describe('formToProposalActions', () => {
        it('correctly maps the form actions to the ones needed for the transaction', () => {
            const actionsBaseData = [
                { to: '0x123', value: '10', data: '0x1234' },
                { to: '0x456', value: '0', data: '0x' },
            ];
            const actions = [
                generateProposalActionChangeMembers(actionsBaseData[0]),
                generateProposalActionUpdateMetadata(actionsBaseData[1]),
            ];
            expect(publishProposalDialogUtils['formToProposalActions'](actions)).toEqual(actionsBaseData);
        });
    });
});
