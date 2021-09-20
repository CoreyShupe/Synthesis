import { Octokit } from "../../deps.ts";
import { GithubConfiguration } from "../types/Config.ts";
import Issue from "../types/Issue.ts";
import IssueComment from "../types/IssueComment.ts";

export default class GithubIntegration {
  private octokit: Octokit;

  // TODO: Add interface for Github config.
  private readonly githubConfig: GithubConfiguration;

  constructor(config: GithubConfiguration) {
    this.octokit = new Octokit({ auth: config.token });

    this.githubConfig = config;
  }

  async getIssues(): Promise<Issue[]> {
    return (await this.octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner: this.githubConfig.user,
      repo: this.githubConfig.repo,
    })).data as Issue[];
  }

  async getIssueComments(
    id: number,
  ): Promise<IssueComment[]> {
    return (await this.octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner: this.githubConfig.user,
        repo: this.githubConfig.repo,
        issue_number: id,
      },
    )).data as IssueComment[];
  }
}
