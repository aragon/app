import { NextResponse } from 'next/server';

const mask = (val: unknown): string => {
    if (typeof val !== 'string') {
        return `[${typeof val}]`;
    }
    if (val.length <= 6) {
        return '***';
    }
    return `${val.slice(0, 3)}...${val.slice(-3)} (len=${val.length})`;
};

const STATIC_DRPC = process.env.NEXT_SECRET_DRPC_RPC_KEY;
const STATIC_ALCHEMY = process.env.NEXT_SECRET_RPC_KEY;
const STATIC_ANKR = process.env.NEXT_SECRET_ANKR_RPC_KEY;
const STATIC_BACKEND = process.env.ARAGON_BACKEND_URL;

const dynamicKey = 'NEXT_SECRET_DRPC_RPC_KEY';

export const GET = () => {
    const dynamicDrpc = process.env[dynamicKey];

    return NextResponse.json({
        static: {
            NEXT_SECRET_DRPC_RPC_KEY: mask(STATIC_DRPC),
            NEXT_SECRET_RPC_KEY: mask(STATIC_ALCHEMY),
            NEXT_SECRET_ANKR_RPC_KEY: mask(STATIC_ANKR),
            ARAGON_BACKEND_URL: STATIC_BACKEND ?? '[undefined]',
        },
        dynamic: {
            NEXT_SECRET_DRPC_RPC_KEY: mask(dynamicDrpc),
        },
        match: STATIC_DRPC === dynamicDrpc,
    });
};
