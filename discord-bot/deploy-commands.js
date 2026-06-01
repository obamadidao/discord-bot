const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = "MTUxMDY1NjQ4NDU3OTQ3OTYxMg.GnluUX.-409vaRmQwhblIzcOmESWVBzCiH7RkkqKNBRhc";
const CLIENT_ID = "1510656484579479612";
const GUILD_ID = "699871348629045308";

const commands = [

  new SlashCommandBuilder()
    .setName('acc')
    .setDescription('Mở menu'),

  new SlashCommandBuilder()
    .setName('add')
    .setDescription('Thêm acc')
    .addStringOption(o => 
      o.setName('username')
       .setDescription('Tên tài khoản')
       .setRequired(true))
    .addStringOption(o => 
      o.setName('password')
       .setDescription('Mật khẩu')
       .setRequired(true)),

  new SlashCommandBuilder()
    .setName('list')
    .setDescription('Xem acc'),

  new SlashCommandBuilder()
    .setName('use')
    .setDescription('Lấy acc')
    .addIntegerOption(o => 
      o.setName('id')
       .setDescription('ID acc')
       .setRequired(true)),

  new SlashCommandBuilder()
    .setName('release')
    .setDescription('Trả acc')
    .addIntegerOption(o => 
      o.setName('id')
       .setDescription('ID acc')
       .setRequired(true)),

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Trạng thái'),

  new SlashCommandBuilder()
    .setName('approve')
    .setDescription('Duyệt user')
    .addUserOption(o => 
      o.setName('user')
       .setDescription('Người cần duyệt')
       .setRequired(true)),

].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log("⏳ Đang tạo slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Đã tạo lệnh thành công!");
  } catch (err) {
    console.error(err);
  }
})();