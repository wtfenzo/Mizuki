import { HybridCommand } from '@structures/Command.js';
import components from '@utils/components.js';
import { getDbPing } from '@utils/getDbPing.js';
import {
    ContainerBuilder,
    MessageFlags,
    SectionBuilder,
    SlashCommandBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from 'discord.js';

export default new HybridCommand({
    name: 'ping',
    description: 'Check bot latency and uptime',
    category: 'meta',
    data: new SlashCommandBuilder().setName('ping').setDescription('Check bot latency and uptime'),

    run: async ({ client, ctx, self }) => {
        self.msg = await ctx.reply({
            components: [components.Loading('Measuring latency...')],
            flags: MessageFlags.IsComponentsV2,
        });

        const apiPing = Math.round(client.ws.ping);
        const dbPing = await getDbPing(client);

        const redisStart = performance.now();
        const redisPing = await client.redisClient
            .ping()
            .then(() => Math.round(performance.now() - redisStart));

        const up = `<t:${Math.floor(Date.now() / 1000 - client.uptime / 1000)}:R>`;

        const container = new ContainerBuilder().addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `## 🏓 Pong!\n\n` +
                        `> **Api Latency:** \`${apiPing}ms\`\n` +
                        `> **DB Latency:** \`${dbPing}ms\`\n` +
                        `> **Redis Latency:** \`${redisPing}ms\`\n` +
                        `> **Uptime:** ${up}`
                    )
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder({
                        media: { url: client.user.displayAvatarURL() },
                    })
                )
        );

        await self.msg.edit({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    },
});