import config from '@config/config.js';
import type { BotEvent } from '@interfaces/Event.js';
import logger from '@utils/logger.js';

export default {
    name: 'clientReady',
    async run(client) {
        logger.info(`Logged in as ${client.user.tag}`, 'Client');

        let i = 0;

        const setActivity = () => {
            const activity = config.activities[i];

            if (!activity) return;

            const name = activity.name
                .replace('{serverCount}', client.guilds.cache.size.toString())
                .replace(
                    '{userCount}',
                    client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toString()
                );

            client.user.setPresence({
                activities: [{ name, ...(activity.type ? { type: activity.type } : {}) }],
                status: config.status,
            });

            i = (i + 1) % config.activities.length;
        };

        setActivity();
        setInterval(setActivity, 5 * 60 * 1000);
    },
} satisfies BotEvent<'clientReady'>;
