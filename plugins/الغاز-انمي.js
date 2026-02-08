import fs from "fs";
import fetch from "node-fetch";
import { prepareWAMessageMedia, generateWAMessageFromContent } from "@whiskeysockets/baileys";

const timeout = 60000; // الوقت المسموح للإجابة
const points = 500; // الجائزة
const THUMB_URL = "https://files.catbox.moe/ms4bml.jpg"; // صورة العرض

let handler = async (m, { conn, command }) => {
  if (command.startsWith("انمي_")) {
    // التحقق من وجود لعبة نشطة
    let id = m.chat;
    let game = conn.animeGame[id];
    if (!game) {
      return conn.reply(
        m.chat,
        "*╮───── • ◈ • ─────╭*\n〘💬〙⇦ لا توجد لعبة نشطة الآن!\n*╯───── • ◈ • ─────╰*",
        m
      );
    }

    let selected = parseInt(command.split("_")[1]);
    if (isNaN(selected) || selected < 1 || selected > 4) {
      return conn.reply(m.chat, "*〘⚠️〙⇦ اختيار غير صالح!*", m);
    }

    let chosenAnswer = game.options[selected - 1];
    let isCorrect = game.correct === chosenAnswer;

    if (isCorrect) {
      await conn.reply(
        m.chat,
        `*╮───── • ◈ • ─────╭*\n〘✅〙⇦ إجابة صحيحة!\n〘💎〙⇦ الجائزة: ${points} نقطة\n*╯───── • ◈ • ─────╰*`,
        m
      );
      global.db.data.users[m.sender].exp += points;
      clearTimeout(game.timer);
      delete conn.animeGame[id];
    } else {
      game.attempts -= 1;
      if (game.attempts > 0) {
        await conn.reply(
          m.chat,
          `*╮───── • ◈ • ─────╭*\n〘❌〙⇦ إجابة خاطئة!\n〘🕓〙⇦ تبقّى لك ${game.attempts} محاولة.\n*╯───── • ◈ • ─────╰*`,
          m
        );
      } else {
        await conn.reply(
          m.chat,
          `*╮───── • ◈ • ─────╭*\n〘😢〙⇦ انتهت محاولاتك!\n〘📍〙⇦ الإجابة الصحيحة: ${game.correct}\n*╯───── • ◈ • ─────╰*`,
          m
        );
        clearTimeout(game.timer);
        delete conn.animeGame[id];
      }
    }
  } else {
    try {
      conn.animeGame = conn.animeGame || {};
      let id = m.chat;

      if (conn.animeGame[id]) {
        return conn.reply(
          m.chat,
          "*╮───── • ◈ • ─────╭*\n〘⚠️〙⇦ لا يمكنك بدء لعبة جديدة قبل إنهاء الحالية!\n*╯───── • ◈ • ─────╰*",
          m
        );
      }

      // تحميل الأسئلة من ملف JSON
      let data = JSON.parse(fs.readFileSync("./src/game/لغز-انمي.json"));
      let q = data[Math.floor(Math.random() * data.length)];

      // توليد خيارات عشوائية
      let options = [q.response];
      while (options.length < 4) {
        let random = data[Math.floor(Math.random() * data.length)].response;
        if (!options.includes(random)) options.push(random);
      }
      options.sort(() => Math.random() - 0.5);

      // تجهيز الصورة والرسالة التفاعلية
      const media = await prepareWAMessageMedia(
        { image: { url: THUMB_URL } },
        { upload: conn.waUploadToServer }
      );

      const interactiveMessage = {
        body: {
          text: `*╮───── • ◈ • ─────╭*\n〘❓〙⇦ ${q.question}\n\n〘👤 اللاعب〙⇦ @${
            m.sender.split("@")[0]
          }\n〘🕓 الوقت〙⇦ ${(timeout / 1000).toFixed(
            0
          )} ثانية\n〘💎 الجائزة〙⇦ ${points} نقطة\n*╯───── • ◈ • ─────╰*`,
        },
        footer: { text: "الـمـطـور : مـونـتـي 💚" },
        header: {
          title: "لعبـه ألـغـاز الأنمـي 🎌",
          subtitle: "اختر الإجابة الصحيحة 👇",
          hasMediaAttachment: true,
          imageMessage: media.imageMessage,
        },
        nativeFlowMessage: {
          buttons: options.map((option, index) => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: `┊${index + 1}┊⇦ ${option}`,
              id: `.انمي_${index + 1}`,
            }),
          })),
        },
      };

      const msg = generateWAMessageFromContent(
        m.chat,
        { viewOnceMessage: { message: { interactiveMessage } } },
        { userJid: conn.user.jid, quoted: m }
      );

      conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

      conn.animeGame[id] = {
        correct: q.response,
        options,
        timer: setTimeout(async () => {
          if (conn.animeGame[id]) {
            await conn.reply(
              m.chat,
              `*〘⌛〙⇦ انتهى الوقت!*\n*〘✅ الإجابة الصحيحة〙⇦ ${q.response}*`,
              m
            );
            delete conn.animeGame[id];
          }
        }, timeout),
        attempts: 2,
      };
    } catch (err) {
      console.error(err);
      conn.reply(m.chat, "❌ حدث خطأ أثناء تشغيل اللعبة.", m);
    }
  }
};

handler.help = ["لغز-انمي"];
handler.tags = ["game"];
handler.command = /^(لغز-انمي|انمي_\d+)$/i;

export default handler;