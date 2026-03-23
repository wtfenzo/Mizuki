import { type Dirent, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path, { extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { ExtendedClient } from '@core/client.js';
import type { BotEvent } from '@interfaces/Event.js';
import logger from '@utils/logger.js';
import type { ClientEvents } from 'discord.js';

type EventName = keyof ClientEvents;

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

export class EventLoader {
    private readonly client: ExtendedClient;
    private readonly baseDir: string;

    constructor(client: ExtendedClient) {
        this.client = client;
        this.baseDir = path.join(__dirname, '../../events');
        if (!existsSync(this.baseDir)) {
            mkdirSync(this.baseDir, { recursive: true });
            logger.info(`Created missing events folder: ${this.baseDir}`, 'EventLoader');
        }
    }

    public async loadAll(): Promise<void> {
        const entries: Dirent[] = readdirSync(this.baseDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(this.baseDir, entry.name);
            if (entry.isDirectory()) {
                await this.loadCategory(fullPath);
            } else if (entry.isFile() && ['.ts', '.js'].includes(extname(entry.name))) {
                await this.loadSingle(fullPath);
            }
        }
    }

    private async loadCategory(categoryPath: string): Promise<void> {
        const files: Dirent[] = readdirSync(categoryPath, { withFileTypes: true });
        for (const file of files) {
            if (file.isFile() && ['.ts', '.js'].includes(extname(file.name))) {
                await this.loadSingle(join(categoryPath, file.name));
            }
        }
    }

    private async loadSingle(filePath: string): Promise<void> {
        try {
            const module = await import(pathToFileURL(filePath).toString());
            const event: BotEvent<EventName> = module.default;

            if (!event?.name || typeof event.run !== 'function') {
                logger.warn(`Invalid event in ${filePath}`, 'EventLoader');
                return;
            }

            const eventName = event.name;
            const handler = (...args: ClientEvents[typeof eventName]) => event.run(this.client, ...args);

            if (event.once) this.client.once(eventName, handler);
            else this.client.on(eventName, handler);

            logger.info(`Loaded Event: ${eventName}`, 'EventLoader');
        } catch (error) {
            logger.error(
                `Failed to load event at ${filePath}: ${error instanceof Error ? `${error.message}\n${error.stack}` : String(error)
                }`,
                'EventLoader'
            );
        }
    }
}