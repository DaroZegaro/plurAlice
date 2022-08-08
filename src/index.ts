import {
  ChannelType,
  GatewayIntentBits,
  MessageType,
} from "discord-api-types/v10";
import {
  CategoryChannel,
  Client as BotClient,
  Interaction,
  Message,
  TextChannel,
} from "discord.js";
import { sDatabase, system } from "./constants/interfaces";

const path = require("node:path");
const fs = require("node:fs");
const { Client, Intents, WebhookClient, Collection } = require("discord.js");
const { token } = require("../config.json");

// const Aviary: system = require("../parse/aviarySystem.json");
interface CommandClient extends BotClient {
  commands: typeof Collection;
}
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
}); // as CommandClient;
client.commands = new Collection();
const commandsPath = path.join(__dirname, "../dist/commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file: string) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  console.log(`Loading ${command.data.name}...`);
  client.commands.set(command.data.name, command);
}

const viablePrefixes: { prefix: string; uuid: string }[] = [];

client.once("ready", async () => {
  console.log("Ready!");
  // Aviary.members.forEach((member) => {
  //   member.proxy_tags.forEach((tags) => {
  //     viablePrefixes.push({ prefix: tags.prefix || " ", uuid: member.uuid });
  //   });
  // });
  // console.log(
  //   `Cached a total of ${viablePrefixes.length} prefixes from The Aviary!`
  // );
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot || message.webhookId) return;

  const database: sDatabase = require("../parse/systemDatabase.json");
  if (
    database.registeredUsers.some(
      (user) => user.userId === Number(message.member?.id)
    )
  ) {
    const data = database.registeredUsers.find(
      (user) => user.userId === Number(message.member?.id)
    );
    const userSystem = database.systems.find(
      (system) => system.uuid === data?.systemUuid
    );
    if (userSystem === undefined) return;
    const viablePrefixes: { prefix: string; uuid: string }[] = [];

    userSystem?.members.forEach((member) => {
      member.proxy_tags.forEach((tag) => {
        if (tag.prefix !== null)
          viablePrefixes.push({ prefix: tag.prefix, uuid: member.uuid });
      });
    });

    viablePrefixes.forEach((prefix) => {
      if (message.content.startsWith(prefix.prefix)) {
        proxyThings(message, userSystem, prefix);
      }
    });
  }
});

async function proxyThings(
  message: Message,
  userSystem: system,
  data: { prefix: string; uuid: string }
) {
  const headmate = userSystem.members.find(
    (member) => member.uuid === data.uuid
  );

  const webhookChannel = message.channel;
  if (webhookChannel.type === ChannelType.DM || webhookChannel.isThread())
    return;

  const hooks = await webhookChannel.fetchWebhooks();

  const hook = hooks?.find((wh) => wh.token !== undefined);

  const messageNoPrefix = message.content.slice(data.prefix.length);

  if (messageNoPrefix === "" && message.attachments.size === 0) return;
  console.log(message.attachments);
  if (!hook) {
    await webhookChannel
      .createWebhook({
        avatar: headmate?.avatar_url,
        name: headmate?.display_name || "???",
      })
      .then((webhook) => {
        webhook.send({
          content: messageNoPrefix,
          embeds: message.embeds,
        });
      });
    message.delete();
  } else {
    await hook.send({
      content: messageNoPrefix || ".",
      username:
        headmate?.display_name || headmate?.name || "Display name error",
      avatarURL: headmate?.avatar_url || "",
      files: message.attachments.toJSON(),
    });
    message.delete();
  }
}
client.login(token);
