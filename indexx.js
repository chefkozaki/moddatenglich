const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: "samplekey" });

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const allowedUserIds = ['sampleuserid']; 

let system = 'samplesystemprompt';

client.once('ready', () => {
  console.log(`🤖 Bot đã đăng nhập với tên: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!system ')) {
    if (!allowedUserIds.includes(message.author.id)) {
      return message.reply('⛔ Bạn không có quyền thay đổi system prompt!');
    }

    const newSystem = message.content.slice(8).trim();
    if (!newSystem) {
      return message.reply('⚠️ Hãy cung cấp nội dung mới cho system!');
    }

    system = newSystem;
    return message.reply('✅ Đã cập nhật system prompt mới!');
  }
  if (message.content === '!getsys') {
    return message.reply(`🧠 System hiện tại:\n\`\`\`${system}\`\`\``);
  }

  if (message.mentions.has(client.user)) {
    const prompt = message.content.replace(/<@!?\d+>/, '').trim();

    if (!prompt) {
      return message.reply('Bạn cần nói gì đó sau khi ping mình nhé!');
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: system + ' ' + prompt,
      });

      const reply = response.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ Gemini.';

      const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle('💬 Mod Đạt trả lời:')
        .setDescription(reply)
        .setFooter({ text: 'Sử dụng Gemini API bởi Kozaki' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.error('❌ Lỗi khi gọi Gemini API:', err);
      await message.reply('Có lỗi xảy ra khi gọi AI.');
    }
  }
});

client.login("samplebotapi");
