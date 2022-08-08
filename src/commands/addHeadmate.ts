import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { sDatabase } from "src/constants/interfaces";
import { v4 as uuidv4 } from "uuid";
import fs from "node:fs";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addheadmate")
    .setDescription(
      "Creates a new headmate in your system with your chosen name and default values"
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of the headmate")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const database: sDatabase = require("../../parse/systemDatabase.json");

    const userId = interaction.user.id;

    if (
      !database.registeredUsers.some((user) => user.userId === Number(userId))
    )
      return interaction.reply({
        content: "You need to register a system first",
        ephemeral: true,
      });

    const userSystemUuid = database.registeredUsers.find(
      (user) => user.userId === Number(userId)
    )?.systemUuid;

    const userSystem = database.systems.find(
      (system) => system.uuid === userSystemUuid
    );

    if (userSystem === undefined)
      return interaction.reply({
        content: "Something went wrong...",
        ephemeral: true,
      });
    const name = interaction.options.get("name")?.value as string;

    const privacy = {
      visibility: "public",
      name_privacy: "public",
      description_privacy: "public",
      birthday_privacy: "public",
      pronoun_privacy: "public",
      avatar_privacy: "public",
      metadata_privacy: "public",
    };

    userSystem.members.push({
      avatar_url: null,
      banner: null,
      birthday: null,
      color: null,
      created: new Date(),
      description: null,
      display_name: null,
      id: "",
      keep_proxy: false,
      name: name,
      privacy: privacy,
      pronouns: null,
      proxy_tags: [],
      uuid: uuidv4(),
    });

    database.systems[
      database.systems.findIndex((system) => system.uuid === userSystem.uuid)
    ] = userSystem;
    fs.writeFileSync("./parse/systemDatabase.json", JSON.stringify(database));

    return interaction.reply("Succesfully added a headmate!");
  },
};
