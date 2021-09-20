import { CommandClient, CommandClientOptions, event } from "../deps.ts";
import SyncCommand from "./commands/SyncCommand.ts";
import Config, {
  DiscordConfiguration,
  GithubConfiguration,
} from "./types/Config.ts";
import GithubIntegration from "./github/integration.ts";

export default class SynthesisClient extends CommandClient {
  // cache here
  public readonly config: Config;
  public readonly github: GithubIntegration;

  constructor(options: CommandClientOptions) {
    super(options);

    this.config = JSON.parse(
      Deno.readTextFileSync("../secrets/config.json"),
    );

    this.github = new GithubIntegration(this.config.github);

    this.commands.add(SyncCommand);
  }

  public get discordConfig(): DiscordConfiguration {
    return this.config.discord;
  }

  public get githubConfig(): GithubConfiguration {
    return this.config.github;
  }

  @event()
  ready(): void {
    console.log(`Ready! User: ${this.user?.tag}`);
  }
}
