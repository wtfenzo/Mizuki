import config from '@config/config.js';
import emojis from '@config/emojis.js';
import { handleCrash } from '@core/handlers/antiCrash.js';
import { CommandLoader } from '@core/handlers/commandHandler.js';
import { EventLoader } from '@core/handlers/eventHandler.js';
import { prisma } from '@lib/prisma.js';
import redisClient from '@lib/redis.js';
import type { HybridCommand, PrefixCommand, SlashCommand } from '@structures/Command.js';
import logger from '@utils/logger.js';
import { Client, GatewayIntentBits, Partials } from 'discord.js';

type AnyCommand = SlashCommand | PrefixCommand | HybridCommand;

class ExtendedClient extends Client<true> {
    public commands = new Map<string, AnyCommand>();
    public aliases = new Map<string, AnyCommand>();
    public prisma = prisma;
    public readonly redisClient = redisClient;
    private readonly commandLoader = new CommandLoader(this);
    private readonly eventLoader = new EventLoader(this);
    public readonly config = config;
    public readonly emoji = emojis;
    public readonly color = config.color;
    public readonly owners = config.ownerIds;

    constructor() {
        super({
            allowedMentions: {
                parse: [],
                repliedUser: false,
            },
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.AutoModerationConfiguration,
                GatewayIntentBits.AutoModerationExecution,
            ],
            partials: [
                Partials.GuildMember,
                Partials.User,
                Partials.Message,
                Partials.Channel,
                Partials.Reaction,
                Partials.GuildScheduledEvent,
            ],
        });
    }

    public async start() {
        try {
            logger.info(`Bot Start Initialized`, 'Client');
            if (this.config.environment === 'development') {
                logger.info('Project is running in development mode.', 'Client');
            }
            await this.loadHandlers();
            this.prisma
                .$connect()
                .catch((err: unknown) => {
                    logger.error(`Failed to connect to the database: ${String(err)}`, 'Database');
                    process.exit(1);
                })
                .then(() => {
                    logger.info(`Connected to the database successfully`, 'Database');
                });

            await this.login(this.config.token);
        } catch (error) {
            logger.error(`An error occurred while starting the bot: ${String(error)}`, 'Client');
            process.exit(1);
        }
    }

    public async stop() {
        try {
            logger.info(`Shutting down the bot...`, 'Client');
            await this.prisma.$disconnect();
            logger.info(`Disconnected from the database successfully`, 'Database');
            this.redisClient.destroy();
            logger.info(`Disconnected from redis successfully`, 'Redis');
            this.removeAllListeners();
            await this.destroy();
            logger.info(`Bot has been shut down successfully`, 'Client');
        } catch (error) {
            logger.error(`An error occurred while stopping the bot: ${String(error)}`, 'Client');
        }
        process.exit(0);
    }

    private async loadHandlers() {
        handleCrash();
        await this.eventLoader.loadAll();
        await this.commandLoader.loadAll();
    }
}

export { ExtendedClient };
