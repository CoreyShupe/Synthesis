import {
  ChannelTypes,
  Command,
  CommandContext,
  Embed,
  Guild,
  GuildChannel,
  User,
} from "../../deps.ts";
import Config from "../types/Config.ts";
import SynthesisClient from "../client.ts";
import {
  formatIssue,
  formatIssueComment,
  formatUrl,
} from "../util/formatter.ts";
import { requireSynthesisClient, trueEquals } from "../util/functions.ts";

export default class SyncCommand extends Command {
  name = "sync";

  async execute(ctx: CommandContext) {
    const start = Date.now();
    const client = requireSynthesisClient(ctx.client);

    if (!ctx.guild) {
      return;
    }

    const replyMessage = await ctx.message.reply(
      `Synchronizing issues with **${client.githubConfig.repo}**.`,
    );

    const information = await this.resync(client, ctx.guild);

    await replyMessage.edit(
      `Process complete in **${Date.now() - start}ms**.`,
      this.getSyncCompleteEmbed(
        ctx.author,
        information.totalIssues,
        information.totalComments,
      ),
    );
  }

  /**
   * Resync the discord with all github issues and pull requests.
   * @returns Information about the sync request.
   */
  private async resync(
    client: SynthesisClient,
    guild: Guild,
  ): Promise<SyncResult> {
    const github = client.github;

    const issuesChannel = await this.generateIssuesChannel(
      client.config,
      guild,
    );

    const issues = (await github.getIssues()).sort((i1, i2) =>
      i1.number - i2.number
    );
    let totalComments = 0;

    for (const issue of issues) {
      const message = await client.channels.sendMessage(
        issuesChannel.id,
        formatIssue({
          ...issue,
          id: issue.number,
          url: formatUrl(
            client.githubConfig.user,
            client.githubConfig.repo,
            issue.number,
          ),
        }),
      );

      const issueThread = await message.startThread({
        name: `(${issue.number}) ${
          issue.title.substr(0, Math.min(issue.title.length, 50))
        }`,
        autoArchiveDuration: 1440,
      });

      const comments = await github.getIssueComments(issue.number);
      totalComments += comments.length;

      for (const comment of comments) {
        await client.channels.sendMessage(
          issueThread.id,
          formatIssueComment({
            ...comment,
            url: formatUrl(
              client.githubConfig.user,
              client.githubConfig.repo,
              issue.number,
              comment.id,
            ),
          }),
        );
      }
    }

    return {
      issuesChannel: issuesChannel,
      totalIssues: issues.length,
      totalComments: totalComments,
    };
  }

  /**
   * Remove the existing issues channel and replace it with a new one.
   * @returns New issues channel.
   */
  private async generateIssuesChannel(
    config: Config,
    guild: Guild,
  ): Promise<GuildChannel> {
    const configChannelName = config.discord.channels.issues.name;
    const configChannelParentId = config.discord.channels.issues.parent;

    // Remove all previous issue channels so we can reinitialize it.
    for (const channel of await guild.channels.array()) {
      if (channel.type !== ChannelTypes.GUILD_TEXT) continue;

      if (
        trueEquals(configChannelParentId, channel.parentID) &&
        trueEquals(configChannelName, channel.name)
      ) {
        await guild.channels.delete(channel.id);
      }
    }

    return await guild.createChannel({
      name: config.discord.channels.issues.name,
      parent: config.discord.channels.issues.parent,
      type: ChannelTypes.GUILD_TEXT,
    });
  }

  private getSyncCompleteEmbed(
    author: User,
    openIssues: number,
    totalComments: number,
  ): Embed {
    return new Embed({
      fields: [
        {
          name: "Open Issues",
          value: `${openIssues}`,
          inline: true,
        },
        {
          name: "Total Comments",
          value: `${totalComments}`,
          inline: true,
        },
      ],
      author: {
        name: "Synchronization Complete",
        icon_url: author.avatarURL("dynamic"),
      },
      color: 0x00FF00,
    });
  }
}

interface SyncResult {
  issuesChannel: GuildChannel;
  totalIssues: number;
  totalComments: number;
}
