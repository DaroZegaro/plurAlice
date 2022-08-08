const { SlashCommandBuilder } = require("@discordjs/builders");
import { CommandInteraction } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Says alive, checks if the bot is alive"),

  async execute(interaction: CommandInteraction) {
    console.log("test");
    await interaction.reply("Hi I am in fact, alive");
  },
};
