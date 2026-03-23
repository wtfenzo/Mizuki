import { handleInteractionCommand } from '@functions/handleInteractionCommand.js';
import type { BotEvent } from '@interfaces/Event.js';

export default {
    name: 'interactionCreate',
    async run(client, interaction) {
        if (interaction.isChatInputCommand()) {
            await handleInteractionCommand(client, interaction);
        }
    },
} satisfies BotEvent<'interactionCreate'>;