import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { sDatabase } from "src/constants/interfaces";
import { v4 as uuidv4 } from "uuid";
import fs from "node:fs";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addsystem")
    .setDescription("Creates a system with a chosen name")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of your system")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const database: sDatabase = require("../../parse/systemDatabase.json");

    if (
      database.registeredUsers.some(
        (user) => user.userId === Number(interaction.user.id)
      )
    )
      return interaction.reply("You already have a registered system");

    const systemName = interaction.options.get("name")?.value as string;

    const uuid = uuidv4();
    database.systems.push({
      accounts: [Number(interaction.user.id)],
      avatar_url: null,
      banner: null,
      color: null,
      config: {
        description_templates: [],
        group_default_private: false,
        group_limit: 250,
        latch_timeout: null,
        member_default_private: false,
        member_limit: 1000,
        pings_enabled: true,
        show_private_info: false,
        timezone: "UTC+0",
      },
      created: new Date(),
      description: null,
      id: "",
      members: [],
      name: systemName,
      privacy: {
        description_privacy: "public",
        pronoun_privacy: "public",
        member_list_privacy: "public",
        group_list_privacy: "public",
        front_privacy: "public",
        front_history_privacy: "public",
      },
      pronouns: null,
      tag: null,
      uuid: uuid,
      webhook_url: null,
    });
    database.registeredUsers.push({
      systemUuid: uuid,
      userId: Number(interaction.user.id),
    });
    fs.writeFileSync("./parse/systemDatabase.json", JSON.stringify(database));

    return interaction.reply("Succesfully registered your system!");
  },
};
