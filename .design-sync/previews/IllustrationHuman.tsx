import { IllustrationHuman } from '@aragon/gov-ui-kit';

export const Default = () => (
    <IllustrationHuman
        body="ARAGON"
        expression="SMILE_WINK"
        style={{ width: 200 }}
    />
);

export const Expressions = () => (
    <div className="flex flex-wrap items-end gap-4">
        <IllustrationHuman
            body="VOTING"
            expression="DECIDED"
            style={{ width: 140 }}
        />
        <IllustrationHuman
            body="BLOCKS"
            expression="EXCITED"
            style={{ width: 140 }}
        />
        <IllustrationHuman
            body="ELEVATING"
            expression="SMILE"
            style={{ width: 140 }}
        />
        <IllustrationHuman
            body="COMPUTER"
            expression="SURPRISED"
            style={{ width: 140 }}
        />
    </div>
);

export const WithAccessories = () => (
    <div className="flex flex-wrap items-end gap-4">
        <IllustrationHuman
            body="RELAXED"
            expression="CASUAL"
            hairs="CURLY"
            style={{ width: 140 }}
            sunglasses="BIG_ROUNDED"
        />
        <IllustrationHuman
            accessory="EARRINGS_CIRCLE"
            body="CHART"
            expression="SMILE"
            hairs="LONG"
            style={{ width: 140 }}
        />
        <IllustrationHuman
            body="SENDING_LOVE"
            expression="SMILE_WINK"
            hairs="BUN"
            style={{ width: 140 }}
        />
    </div>
);

export const WithObject = () => (
    <div className="flex flex-wrap items-end gap-4">
        <IllustrationHuman
            body="VOTING"
            expression="SMILE"
            object="WALLET"
            objectPosition="right"
            style={{ width: 160 }}
        />
        <IllustrationHuman
            body="COMPUTER_CORRECT"
            expression="DECIDED"
            object="SETTINGS"
            objectPosition="left"
            style={{ width: 160 }}
        />
    </div>
);
