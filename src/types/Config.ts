export interface GithubConfiguration {
  token: string;
  user: string;
  repo: string;
}

export interface DiscordConfiguration {
  secret: string;
  channels: {
    logs: string;
    issues: {
      parent?: string;
      name: string;
    };
  };
}

export default interface Config {
  discord: DiscordConfiguration;
  github: GithubConfiguration;
}

export const config: Config = JSON.parse(
  Deno.readTextFileSync("../secrets/config.json"),
);
