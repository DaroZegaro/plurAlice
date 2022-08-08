import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { sDatabase } from "src/constants/interfaces";
import fs from "node:fs";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changeheadmatedata")
    .setDescription("Change data of one of your headmates")
    .addStringOption((option) =>
      option
        .setName("headmatename")
        .setDescription("Name of the headmates you want to change the name of")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("data")
        .setDescription("Data of the headmate you wish to change")
        .addChoices(
          { name: "Display Name", value: "display_name" },
          { name: "Birthday", value: "birthday" },
          { name: "Pronouns", value: "pronouns" },
          { name: "Color", value: "color" },
          { name: "Description", value: "description" }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("value")
        .setDescription("The new value of the thing you wish to change")
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

    const headmateName = interaction.options.get("headmatename")
      ?.value as string;

    const headmate = userSystem.members.find(
      (member) => member.name === headmateName
    );
    if (headmate === undefined)
      return interaction.reply({
        content: "You don't have a headmate with this name...",
        ephemeral: true,
      });

    const newValue = interaction.options.get("value")?.value as string;
    const thingToChange = interaction.options.get("data")?.value as
      | "display_name"
      | "birthday"
      | "pronouns"
      | "description"
      | "color";

    const systemUuid = database.registeredUsers.find(
      (user) => user.userId === Number(interaction.user.id)
    )?.systemUuid;

    database.systems[
      database.systems.findIndex((system) => system.uuid === systemUuid)
    ].members[
      userSystem.members.findIndex((member) => member.name === headmateName)
    ][thingToChange] = newValue;

    fs.writeFileSync("./parse/systemDatabase.json", JSON.stringify(database));

    return interaction.reply("Succesfully changed the data!");
  },
};
