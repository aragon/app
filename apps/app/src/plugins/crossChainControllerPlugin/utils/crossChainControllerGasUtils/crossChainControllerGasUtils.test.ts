import { crossChainControllerGas } from '../../constants/crossChainControllerGas';
import { crossChainControllerGasUtils } from './crossChainControllerGasUtils';

describe('crossChainControllerGas utils', () => {
    describe('applyBuffer', () => {
        it('adds the given margin', () => {
            expect(
                crossChainControllerGasUtils.applyBuffer(BigInt(200_000), 50),
            ).toEqual(BigInt(300_000));
        });

        it('returns the input unchanged for a zero margin', () => {
            expect(
                crossChainControllerGasUtils.applyBuffer(BigInt(200_000), 0),
            ).toEqual(BigInt(200_000));
        });

        it('rounds up so integer division never erodes the margin', () => {
            // 7 * 1.5 = 10.5, which must not truncate to 10.
            expect(
                crossChainControllerGasUtils.applyBuffer(BigInt(7), 50),
            ).toEqual(BigInt(11));
        });
    });

    describe('resolveGasLimit', () => {
        const { bufferPercent, minGasLimit, maxGasLimit } =
            crossChainControllerGas;

        it('applies the configured margin to the measured requirement', () => {
            const requiredGas = BigInt(228_100);

            const result = crossChainControllerGasUtils.resolveGasLimit({
                requiredGas,
            });

            expect(result).toEqual({
                gasLimit: crossChainControllerGasUtils.applyBuffer(
                    requiredGas,
                    bufferPercent,
                ),
                isMarginReduced: false,
                exceedsMaxGasLimit: false,
            });
        });

        it('raises a very small requirement to the floor', () => {
            const result = crossChainControllerGasUtils.resolveGasLimit({
                requiredGas: BigInt(1000),
            });

            expect(result).toEqual({
                gasLimit: BigInt(minGasLimit),
                isMarginReduced: false,
                exceedsMaxGasLimit: false,
            });
        });

        it('clamps to the cap and flags the reduced margin when the full margin does not fit', () => {
            // Fits under the cap on its own, but not once the margin is added.
            const result = crossChainControllerGasUtils.resolveGasLimit({
                requiredGas: BigInt(2_500_000),
            });

            expect(result).toEqual({
                gasLimit: BigInt(maxGasLimit),
                isMarginReduced: true,
                exceedsMaxGasLimit: false,
            });
        });

        it('still covers the measured requirement when clamped', () => {
            const requiredGas = BigInt(2_500_000);

            const { gasLimit } = crossChainControllerGasUtils.resolveGasLimit({
                requiredGas,
            });

            expect(gasLimit).toBeGreaterThanOrEqual(requiredGas);
        });

        it('flags an unfixable requirement when it exceeds the cap on its own, before any margin', () => {
            const result = crossChainControllerGasUtils.resolveGasLimit({
                requiredGas: BigInt(3_500_000),
            });

            expect(result).toEqual({
                gasLimit: BigInt(maxGasLimit),
                isMarginReduced: true,
                exceedsMaxGasLimit: true,
            });
        });
    });
});
