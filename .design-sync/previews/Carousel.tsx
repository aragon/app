import { Carousel } from '@aragon/gov-ui-kit';

const featuredDaos = [
    {
        name: 'Builders Collective',
        members: '1.2k members',
        proposals: '48 proposals',
    },
    {
        name: 'Aragon Grants',
        members: '640 members',
        proposals: '31 proposals',
    },
    {
        name: 'Treasury Guild',
        members: '215 members',
        proposals: '12 proposals',
    },
    {
        name: 'Ecosystem Fund',
        members: '3.4k members',
        proposals: '96 proposals',
    },
    { name: 'Ops Council', members: '18 members', proposals: '54 proposals' },
];

const DaoCard = (props: {
    name: string;
    members: string;
    proposals: string;
}) => (
    <div className="flex w-64 shrink-0 flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-5 shadow-neutral-sm">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-500">
            {props.name.slice(0, 1)}
        </div>
        <p className="font-semibold text-base text-neutral-800">{props.name}</p>
        <p className="text-neutral-500 text-sm">
            {props.members} · {props.proposals}
        </p>
    </div>
);

export const Default = () => (
    <div className="w-full">
        <Carousel gap={16} initialOffset={0} isDraggable={true}>
            {featuredDaos.map((dao) => (
                <DaoCard key={dao.name} {...dao} />
            ))}
        </Carousel>
    </div>
);

export const Marquee = () => (
    <div className="w-full">
        <Carousel gap={16} speed={40} speedOnHoverFactor={0.2}>
            {featuredDaos.slice(0, 4).map((dao) => (
                <DaoCard key={dao.name} {...dao} />
            ))}
        </Carousel>
    </div>
);
