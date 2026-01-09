const https = require('node:https');
const fs = require('node:fs');

const postMessage = (token, channel, text, threadTs) =>
    new Promise((resolve, reject) => {
        const payload = {
            channel,
            text,
        };
        if (threadTs) {
            payload.thread_ts = threadTs;
        }

        const data = JSON.stringify(payload);

        const options = {
            hostname: 'slack.com',
            port: 443,
            path: '/api/chat.postMessage',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'Content-Length': data.length,
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

    console.log(
        `Sending Slack notification: "${message}"${threadTs ? ` (Thread: ${threadTs})` : ''}`,
    );

    postMessage(token, channel, message, threadTs)
        .then((ts) => {
            console.log(`Message sent. TS: ${ts}`);
            const outputFile = process.env.GITHUB_OUTPUT;
            if (outputFile) {
                fs.appendFileSync(outputFile, `ts=${ts}\n`);
            } else {
                console.log(`::set-output name=ts::${ts}`);
            }
        })
        .catch((err) => {
            console.error('Failed to send Slack message:', err);
            process.exit(1);
        });
}
