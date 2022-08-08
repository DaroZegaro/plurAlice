import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { sDatabase } from "src/constants/interfaces";
import fs from "node:fs";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addprefix")
    .setDescription("Add a proxy to one of your headmates")
    .addStringOption((option) =>
      option
        .setName("headmatename")
        .setDescription("Name of the headmates you want to add the proxy to")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("prefix")
        .setDescription("The prefix to add to the headmate")
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

    const prefix = interaction.options.get("prefix")?.value as string;
    const newProxy = headmate.proxy_tags;
    newProxy.push({ prefix, suffix: null });

    const systemUuid = database.registeredUsers.find(
      (user) => user.userId === Number(interaction.user.id)
    )?.systemUuid;
    database.systems[
      database.systems.findIndex((system) => system.uuid === systemUuid)
    ].members[
      userSystem.members.findIndex((member) => member.name === headmateName)
    ].proxy_tags = newProxy;

    fs.writeFileSync("./parse/systemDatabase.json", JSON.stringify(database));

    return interaction.reply("Succesfully added new prefix!");
  },
};
