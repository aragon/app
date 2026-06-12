const https = require('node:https');
const fs = require('node:fs');

// Slack message timestamps are strictly `seconds.microseconds` with exactly 6
// fractional digits (e.g. `1234567890.123456`). Reject anything else before
// writing to GITHUB_OUTPUT so a poisoned API response cannot inject extra keys.
const isValidSlackTs = (ts) =>
    typeof ts === 'string' && /^\d{10}\.\d{6}$/.test(ts);

// Convert GitHub Markdown to Slack mrkdwn
const markdownToMrkdwn = (text) => {
    return (
        text
            // Convert links: [text](url) -> <url|text>
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<$2|$1>')
            // Convert headers: ## Header -> *Header*
            .replace(/^#{1,6}\s+(.+)$/gm, '*$1*')
            // Convert list items: - item -> • item
            .replace(/^-\s+/gm, '• ')
    );
};

// Posts a new message, or edits an existing one when `updateTs` is set
// (chat.update) — used to reflect lifecycle status (started → cancelled →
// completed) in the release's head message rather than only as thread replies.
const sendMessage = (token, channel, text, threadTs, updateTs) =>
    new Promise((resolve, reject) => {
        const isUpdate = Boolean(updateTs);
        const payload = isUpdate
            ? { channel, ts: updateTs, text }
            : { channel, text };
        if (!isUpdate && threadTs) {
            payload.thread_ts = threadTs;
        }

        const data = JSON.stringify(payload);

        const options = {
            hostname: 'slack.com',
            port: 443,
            path: isUpdate ? '/api/chat.update' : '/api/chat.postMessage',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(data),
            },
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(body);
                        if (parsed.ok) {
                            resolve(parsed.ts);
                        } else {
                            reject(
                                new Error(`Slack API error: ${parsed.error}`),
                            );
                        }
                    } catch (e) {
                        reject(new Error('Failed to parse Slack response', e));
                    }
                } else {
                    reject(
                        new Error(`Slack request failed: ${res.statusCode}`),
                    );
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });

// Standalone runner
if (require.main === module) {
    const token = process.env.SLACK_BOT_TOKEN;
    const channel = process.env.SLACK_CHANNEL_ID;
    const threadTs = process.env.SLACK_THREAD_TS;
    const updateTs = process.env.SLACK_UPDATE_TS;

    // Get message from args (3rd arg)
    const message = process.argv[2];

    if (!(token && channel)) {
        console.log('Skipping Slack notification: Missing token or channel.');
        process.exit(0);
    }

    if (!message) {
        console.error('Missing message argument.');
        process.exit(1);
    }

    console.log('Sending Slack notification.');

    sendMessage(token, channel, markdownToMrkdwn(message), threadTs, updateTs)
        .then((ts) => {
            if (!isValidSlackTs(ts)) {
                console.error('Slack returned an invalid ts.');
                process.exit(1);
            }
            console.log('Message sent.');
            const outputFile = process.env.GITHUB_OUTPUT;
            if (outputFile) {
                fs.appendFileSync(outputFile, `ts=${ts}\n`);
            } else {
                console.log(`::set-output name=ts::${ts}`);
            }
        })
        .catch(() => {
            console.error('Failed to send Slack message.');
            process.exit(1);
        });
}
