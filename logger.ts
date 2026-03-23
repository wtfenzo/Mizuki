import { handleMessageCommand } from '@functions/handleMessageCommand.js';
import type { BotEvent } from '@interfaces/Event.js';

export default {
    name: 'messageCreate',
    async run(client, message) {
        await Promise.all([
            handleMessageCommand(client, message),
        ])
    },
} satisfies BotEvent<'messageCreate'>;