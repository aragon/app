import { IllustrationHuman } from '@aragon/gov-ui-kit';

export const Default = () => <IllustrationHuman body="ARAGON" expression="SMILE_WINK" style={{ width: 200 }} />;

export const Expressions = () => (
    <div className="flex flex-wrap items-end gap-4">
        <IllustrationHuman body="VOTING" expression="DECIDED" style={{ width: 140 }} />
        <IllustrationHuman body="BLOCKS" expression="EXCITED" style={{ width: 140 }} />
        <IllustrationHuman body="ELEVATING" expression="SMILE" style={{ width: 140 }} />
        <IllustrationHuman body="COMPUTER" expression="SURPRISED" style={{ width: 140 }} />
    </div>
);

export const WithAccessories = () => (
    <div className="flex flex-wrap items-end gap-4">
        <IllustrationHuman
            body="RELAXED"
            expression="CASUAL"
            hairs="CURLY"
            sunglasses="BIG_ROUNDED"
            style={{ width: 140 }}
        />
        <IllustrationHuman
            body="CHART"
            expression="SMILE"
            hairs="LONG"
            accessory="EARRINGS_CIRCLE"
            style={{ width: 140 }}
        />
        <IllustrationHuman body="SENDING_LOVE" expression="SMILE_WINK" hairs="BUN" style={{ width: 140 }} />
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
