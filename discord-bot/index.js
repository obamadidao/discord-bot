const { 
  Client, 
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

const Database = require('better-sqlite3');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;
const REQUIRED_ROLE_NAME = "Verified";

// ===== DATABASE =====
const db = new Database('data.db');

db.prepare(`
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT,
  in_use INTEGER DEFAULT 0,
  used_by TEXT
)
`).run();

// ===== READY =====
client.once('clientReady', () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

// ===== HANDLE =====
client.on('interactionCreate', async interaction => {

  // ===== SLASH COMMAND =====
  if (interaction.isChatInputCommand()) {

    const member = interaction.member;

    // 🔥 CHECK ROLE
    const hasRole = member.roles.cache.some(role => role.name === REQUIRED_ROLE_NAME);

    if (!hasRole) {
      return interaction.reply({
        content: "❌ Bạn cần role Verified để dùng bot",
        ephemeral: true
      });
    }

    // ===== MENU =====
    if (interaction.commandName === 'acc') {

      const menu = new StringSelectMenuBuilder()
        .setCustomId('acc_menu')
        .setPlaceholder('Chọn chức năng')
        .addOptions([
          { label: '📥 Thêm acc', value: 'add' },
          { label: '📋 Xem acc', value: 'list' },
          { label: '🎮 Lấy acc', value: 'use' },
          { label: '♻️ Trả acc', value: 'release' },
          { label: '📊 Trạng thái', value: 'status' }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      return interaction.reply({
        content: '👉 Chọn chức năng:',
        components: [row]
      });
    }

    // ===== ADD =====
    if (interaction.commandName === 'add') {
      const username = interaction.options.getString('username');
      const password = interaction.options.getString('password');

      db.prepare(`INSERT INTO accounts (username, password) VALUES (?, ?)`)
        .run(username, password);

      return interaction.reply("✅ Đã thêm acc");
    }

    // ===== LIST =====
    if (interaction.commandName === 'list') {
      const rows = db.prepare(`SELECT * FROM accounts WHERE in_use = 0`).all();

      if (rows.length === 0) {
        return interaction.reply("❌ Không có acc trống");
      }

      let msg = rows.map(r => `ID: ${r.id} | ${r.username}`).join('\n');
      return interaction.reply(msg);
    }

    // ===== USE =====
    if (interaction.commandName === 'use') {
      const id = interaction.options.getInteger('id');

      const acc = db.prepare(`SELECT * FROM accounts WHERE id = ?`).get(id);

      if (!acc) return interaction.reply("❌ Không tồn tại");
      if (acc.in_use) return interaction.reply("❌ Acc đang được dùng");

      db.prepare(`
        UPDATE accounts 
        SET in_use = 1, used_by = ? 
        WHERE id = ?
      `).run(interaction.user.id, id);

      return interaction.reply(`✅ Bạn đang dùng acc: ${acc.username}`);
    }

    // ===== RELEASE =====
    if (interaction.commandName === 'release') {
      const id = interaction.options.getInteger('id');

      db.prepare(`
        UPDATE accounts 
        SET in_use = 0, used_by = NULL 
        WHERE id = ?
      `).run(id);

      return interaction.reply("✅ Đã trả acc");
    }

    // ===== STATUS =====
    if (interaction.commandName === 'status') {
      const rows = db.prepare(`SELECT * FROM accounts WHERE in_use = 1`).all();

      if (rows.length === 0) {
        return interaction.reply("✅ Không có acc nào đang dùng");
      }

      let msg = rows.map(r =>
        `ID: ${r.id} | ${r.username} | User: <@${r.used_by}>`
      ).join('\n');

      return interaction.reply(msg);
    }
  }

  // ===== MENU CLICK =====
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === 'acc_menu') {

      const choice = interaction.values[0];

      if (choice === 'list') {
        const rows = db.prepare(`SELECT * FROM accounts WHERE in_use = 0`).all();

        if (rows.length === 0) {
          return interaction.reply({ content: "❌ Không có acc trống", ephemeral: true });
        }

        let msg = rows.map(r => `ID: ${r.id} | ${r.username}`).join('\n');
        return interaction.reply({ content: msg, ephemeral: true });
      }

      if (choice === 'status') {
        const rows = db.prepare(`SELECT * FROM accounts WHERE in_use = 1`).all();

        if (rows.length === 0) {
          return interaction.reply({ content: "✅ Không có acc nào đang dùng", ephemeral: true });
        }

        let msg = rows.map(r =>
          `ID: ${r.id} | ${r.username} | User: <@${r.used_by}>`
        ).join('\n');

        return interaction.reply({ content: msg, ephemeral: true });
      }

      return interaction.reply({
        content: "👉 Dùng lệnh /add /use /release để thao tác",
        ephemeral: true
      });
    }
  }

});

client.login(TOKEN);
