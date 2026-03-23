import { type Dirent, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path, { extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { ExtendedClient } from '@core/client.js';
import { HybridCommand, PrefixCommand, SlashCommand } from '@structures/Command.js';
import logger from '@utils/logger.js';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

type AnyCommand = SlashCommand | PrefixCommand | HybridCommand;

export class CommandLoader {
    private readonly client: ExtendedClient;
    private readonly baseDir: string;

    constructor(client: ExtendedClient) {
        this.client = client;
        this.baseDir = path.join(__dirname, '../../commands');
        if (!existsSync(this.baseDir)) {
            mkdirSync(this.baseDir, { recursive: true });
            logger.info(`Created missing commands folder: ${this.baseDir}`, 'CommandLoader');
        }
    }

    public async loadAll(): Promise<void> {
        const dirs: Dirent[] = readdirSync(this.baseDir, { withFileTypes: true });
        for (const dir of dirs) {
            if (dir.isDirectory()) {
                await this.loadCategory(join(this.baseDir, dir.name));
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
            const module = await import(`${pathToFileURL(filePath).toString()}?update=${Date.now()}`);
            const command: AnyCommand = module.default;

            if (
                !command ||
                !(
                    command instanceof SlashCommand ||
                    command instanceof PrefixCommand ||
                    command instanceof HybridCommand
                )
            ) {
                logger.warn(`Invalid or improperly exported command in ${filePath}`, 'CommandLoader');
                return;
            }

            this.client.commands.set(command.name, command);
            logger.info(`Loaded command: ${command.name}`, 'CommandLoader');

            if (Array.isArray(command.aliases)) {
                for (const alias of command.aliases) {
                    this.client.aliases.set(alias, command);
                }
            }
        } catch (error) {
            logger.error(
                `Failed to load command at ${filePath}: ${error instanceof Error ? `${error.message}\n${error.stack}` : String(error)
                }`,
                'CommandLoader'
            );
        }
    }
}