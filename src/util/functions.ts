import { CommandClient, CommandContext } from "../../deps.ts";
import SynthesisClient from "../client.ts";
import Config from "../types/Config.ts";

export const trueEquals = (a: unknown, b: unknown): boolean =>
  (!a && !b) || (a === b);

export const requireSynthesisConfigFromClient = (
  client: CommandClient,
): Config => {
  return requireSynthesisClient(client).config;
};

export const requireSynthesisConfig = (ctx: CommandContext): Config =>
  requireSynthesisConfigFromClient(ctx.client);

export const requireSynthesisClient = (client: CommandClient) => {
  if (client instanceof SynthesisClient) {
    return client as SynthesisClient;
  } else {
    throw new Error("Client isn't an instanceof SynthesisClient.");
  }
};
