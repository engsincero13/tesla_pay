export type CollaboratorName = 'Fabio' | 'Giba' | 'João' | 'Abner' | 'Pablo' | 'Geovany';

type RuleSegment = {
    start: number;
    end?: number;
    startValue: number;
    incrementPerFiveThousand: number;
    label: string;
};

export type CollaboratorRemuneration = {
    name: CollaboratorName;
    amount: number;
    label: string;
    minimumReference: number;
};

type CollaboratorConfig = {
    name: CollaboratorName;
    minimumReference: number;
    pisoValue?: number;
    segments: RuleSegment[];
};

const FIVE_THOUSAND = 5000;
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const collaboratorConfigs: CollaboratorConfig[] = [
    {
        name: 'Fabio',
        minimumReference: 110000,
        segments: [
            { start: 110000, end: 145000, startValue: 5200, incrementPerFiveThousand: 300, label: '+R$ 300 a cada R$ 5 mil' },
            { start: 145000, end: 150000, startValue: 7300, incrementPerFiveThousand: 700, label: 'gatilho de +R$ 700 entre R$ 145 mil e R$ 150 mil' },
            { start: 150000, end: 250000, startValue: 8000, incrementPerFiveThousand: 300, label: '+R$ 300 a cada R$ 5 mil' },
            { start: 250000, startValue: 14000, incrementPerFiveThousand: 200, label: '+R$ 200 a cada R$ 5 mil acima de R$ 250 mil' },
        ],
    },
    {
        name: 'Giba',
        minimumReference: 110000,
        segments: [
            { start: 110000, end: 115000, startValue: 4200, incrementPerFiveThousand: 200, label: '+R$ 200 a cada R$ 5 mil' },
            { start: 115000, end: 145000, startValue: 4400, incrementPerFiveThousand: 150, label: '+R$ 150 a cada R$ 5 mil' },
            { start: 145000, end: 150000, startValue: 5300, incrementPerFiveThousand: 700, label: 'gatilho de +R$ 700 entre R$ 145 mil e R$ 150 mil' },
            { start: 150000, end: 195000, startValue: 6000, incrementPerFiveThousand: 150, label: '+R$ 150 a cada R$ 5 mil' },
            { start: 195000, end: 200000, startValue: 7350, incrementPerFiveThousand: 650, label: 'gatilho de +R$ 650 entre R$ 195 mil e R$ 200 mil' },
            { start: 200000, end: 245000, startValue: 8000, incrementPerFiveThousand: 200, label: '+R$ 200 a cada R$ 5 mil' },
            { start: 245000, end: 250000, startValue: 9800, incrementPerFiveThousand: 1200, label: 'gatilho de +R$ 1.200 entre R$ 245 mil e R$ 250 mil' },
            { start: 250000, end: 295000, startValue: 11000, incrementPerFiveThousand: 150, label: '+R$ 150 a cada R$ 5 mil' },
            { start: 295000, end: 300000, startValue: 12350, incrementPerFiveThousand: 1150, label: 'gatilho de +R$ 1.150 entre R$ 295 mil e R$ 300 mil' },
            { start: 300000, startValue: 13500, incrementPerFiveThousand: 150, label: '+R$ 150 a cada R$ 5 mil acima de R$ 300 mil' },
        ],
    },
    {
        name: 'João',
        minimumReference: 110000,
        segments: [
            { start: 110000, end: 115000, startValue: 4200, incrementPerFiveThousand: 200, label: '+R$ 200 a cada R$ 5 mil' },
            { start: 115000, end: 145000, startValue: 4400, incrementPerFiveThousand: 150, label: '+R$ 150 a cada R$ 5 mil' },
            { start: 145000, end: 150000, startValue: 5300, incrementPerFiveThousand: 700, label: 'gatilho de +R$ 700 entre R$ 145 mil e R$ 150 mil' },
            { start: 150000, end: 195000, startValue: 6000, incrementPerFiveThousand: 150, label: '+R$ 150 a cada R$ 5 mil' },
            { start: 195000, end: 200000, startValue: 7350, incrementPerFiveThousand: 650, label: 'gatilho de +R$ 650 entre R$ 195 mil e R$ 200 mil' },
            { start: 200000, end: 245000, startValue: 8000, incrementPerFiveThousand: 200, label: '+R$ 200 a cada R$ 5 mil' },
            { start: 245000, end: 250000, startValue: 9800, incrementPerFiveThousand: 1200, label: 'gatilho de +R$ 1.200 entre R$ 245 mil e R$ 250 mil' },
            { start: 250000, end: 295000, startValue: 11000, incrementPerFiveThousand: 150, label: '+R$ 150 a cada R$ 5 mil' },
            { start: 295000, end: 300000, startValue: 12350, incrementPerFiveThousand: 1150, label: 'gatilho de +R$ 1.150 entre R$ 295 mil e R$ 300 mil' },
            { start: 300000, startValue: 13500, incrementPerFiveThousand: 150, label: '+R$ 150 a cada R$ 5 mil acima de R$ 300 mil' },
        ],
    },
    {
        name: 'Abner',
        minimumReference: 110000,
        segments: [
            { start: 110000, end: 115000, startValue: 3100, incrementPerFiveThousand: 150, label: '+R$ 150 a cada R$ 5 mil' },
            { start: 115000, end: 250000, startValue: 3250, incrementPerFiveThousand: 250, label: '+R$ 250 a cada R$ 5 mil' },
            { start: 250000, startValue: 10000, incrementPerFiveThousand: 100, label: '+R$ 100 a cada R$ 5 mil acima de R$ 250 mil' },
        ],
    },
    {
        name: 'Pablo',
        minimumReference: 200000,
        segments: [
            { start: 200000, startValue: 5200, incrementPerFiveThousand: 37.5, label: '+R$ 37,50 a cada R$ 5 mil' },
        ],
    },
    {
        name: 'Geovany',
        minimumReference: 250000,
        pisoValue: 2750,
        segments: [
            { start: 250000, end: 295000, startValue: 2800, incrementPerFiveThousand: 50, label: '+R$ 50 a cada R$ 5 mil' },
            { start: 295000, startValue: 3250, incrementPerFiveThousand: 65, label: '+R$ 65 a cada R$ 5 mil acima de R$ 295 mil' },
        ],
    },
];

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const calculateSegmentAmount = (segment: RuleSegment, revenue: number) =>
    segment.startValue + ((revenue - segment.start) / FIVE_THOUSAND) * segment.incrementPerFiveThousand;

export const calculateCollaboratorRemuneration = (config: CollaboratorConfig, revenue: number): CollaboratorRemuneration => {
    if (revenue <= config.minimumReference) {
        return {
            name: config.name,
            amount: config.pisoValue ?? config.segments[0].startValue,
            label: `piso da tabela aplicado ate ${currencyFormatter.format(config.minimumReference)}`,
            minimumReference: config.minimumReference,
        };
    }

    const currentSegment =
        config.segments.find((segment) => segment.end === undefined || revenue <= segment.end) ??
        config.segments[config.segments.length - 1];

    return {
        name: config.name,
        amount: roundCurrency(calculateSegmentAmount(currentSegment, revenue)),
        label: currentSegment.label,
        minimumReference: config.minimumReference,
    };
};

export const calculateAllCollaboratorRemunerations = (revenue: number) =>
    collaboratorConfigs.map((config) => calculateCollaboratorRemuneration(config, revenue));
