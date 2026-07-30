import { SafeHtml } from '@aragon/gov-ui-kit';

const richHtml = `
<p><strong>Delegation statement</strong></p>
<p>I have been an active contributor to the protocol since 2024 and vote on <em>every</em> proposal. My priorities:</p>
<ul>
    <li>Sustainable treasury spending with quarterly reporting</li>
    <li>Security first — audits before any upgrade reaches a vote</li>
    <li>Lowering participation barriers for small token holders</li>
</ul>
<p>Read my full voting history on the <a href="https://forum.aragon.org/u/delegate">forum</a>.</p>
`;

const untrustedHtml = `
<p onmouseover="alert('xss')">Quarterly report: treasury grew <b>12%</b> to 4.2M USDC.</p>
<script>document.cookie</script>
<img src="https://evil.example/pixel.png" />
`;

export const RichVariant = () => (
    <div className="max-w-lg rounded-xl border border-neutral-100 p-4 text-neutral-600 text-sm leading-normal">
        <SafeHtml html={richHtml} variant="rich" />
    </div>
);

export const StrictVariant = () => (
    <div className="max-w-lg rounded-xl border border-neutral-100 p-4 text-neutral-600 text-sm leading-normal">
        <SafeHtml html={untrustedHtml} />
    </div>
);
