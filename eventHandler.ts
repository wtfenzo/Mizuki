import logger from '@utils/logger.js';
import { ActivityType } from 'discord.js';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const baseConfig = {
    prefix: '.',
    color: '#E9A0B9',
    ownerIds: ['840896867473948672'],
    status: 'idle',
    activities: [
        {
            name: '{serverCount} Servers',
            type: ActivityType.Watching,
        },
        {
            name: '{userCount} Users',
            type: ActivityType.Watching,
        },
    ],
};

const ActivitySchema = z.object({
    name: z.string(),
    state: z.string().optional(),
    url: z.string().optional(),
    type: z.enum(ActivityType).optional(),
});

const ActivitiesSchema = z.array(ActivitySchema);

const OwnerIdsSchema = z.preprocess(
    (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val !== 'string') return val;
        return val
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);
    },
    z.array(z.string().min(1)).default([])
);

const BotConfigSchema = z.object({
    token: z.string().min(1),
    clientId: z.string().min(1),
    prefix: z.string().min(1).default('.'),
    color: z.string().optional(),
    ownerIds: OwnerIdsSchema,
    status: z.enum(['dnd', 'invisible', 'online', 'idle']),
    activities: ActivitiesSchema,
    databaseUrl: z.string(),
    redisUrl: z.string(),
    environment: z.enum(['development', 'production']).default('development'),
});

export type ActivityOptions = z.infer<typeof ActivitySchema>;
export type BotConfig = z.infer<typeof BotConfigSchema>;

let _config: BotConfig | null = null;

export function loadConfig(): BotConfig {
    if (_config) return _config;

    logger.info('Loading configuration', 'Config');

    const result = BotConfigSchema.safeParse({
        token: process.env.TOKEN,
        clientId: process.env.CLIENT_ID,
        prefix: baseConfig.prefix || process.env.PREFIX,
        color: baseConfig.color || process.env.COLOR,
        ownerIds: baseConfig.ownerIds || process.env.OWNER_IDS,
        status: baseConfig.status,
        activities: baseConfig.activities,
        databaseUrl: process.env.DATABASE_URL,
        redisUrl: process.env.REDIS_URL,
        environment: process.env.NODE_ENV,
    });

    if (!result.success) {
        logger.error('Configuration validation failed', 'Config');

        const errorsByField = new Map<string, string[]>();

        result.error.issues.forEach((issue) => {
            const field = issue.path.join('.') || 'root';
            const arr = errorsByField.get(field);
            if (arr) arr.push(issue.message);
            else errorsByField.set(field, [issue.message]);
        });

        errorsByField.forEach((messages, field) => {
            logger.error(`Validation error in "${field}": ${messages.join(', ')}`, 'Config');
        });

        logger.error(
            `Found ${result.error.issues.length} configuration error(s). Check your .env`,
            'Config'
        );
        process.exit(1);
    }

    _config = result.data;
    logger.info(`Configuration loaded successfully (${_config.environment})`, 'Config');
    return _config;
}

export function getConfig(): BotConfig {
    if (!_config) throw new Error('Config not loaded. Call loadConfig() first');
    return _config;
}

export function reloadConfig(): BotConfig {
    _config = null;
    logger.info('Reloading configuration', 'Config');
    dotenv.config({ override: true });
    return loadConfig();
}

export default loadConfig();
