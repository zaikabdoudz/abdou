import axios from "axios";
import pkg from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg;

const api_obito = "https://mr-obito-api.vercel.app/api";

let handler = async function (m, { text, conn }) {
  if (!conn.aki) conn.aki = {};
  const sessionKey = `${m.chat}-${m.sender}`;
  const session = conn.aki[sessionKey];

  // القائمة الأولى
  if (!text) {
    const buttons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({ display_text: "📘 المساعدة", id: ".مارد المساعدة" }),
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({ display_text: "🎮 بدء اللـعبة", id: ".مارد ابدا" }),
      },
    ];

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: "🧞‍هل تريد بدء لعبة مارد؟",
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "اختر احد الخيارات التالية :",
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: false,
                title: "لعبة المارد الازرق..🧞",
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons,
              }),
            }),
          },
        },
      },
      {}
    );

    return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  }

  // شرح المساعدة
  if (text === "المساعدة") {
    return m.reply(`📘 شرح أوامر لعبة مارد :\n\n-.مارد ابدا → بدء اللعبة\n-.مارد نعم / لا / لا أعرف / ربما / ربما لا → إرسال إجابة\n-.مارد رجوع → الرجوع للسؤال السابق\n-.مارد حذف → حذف الجلسة الحالية`);
  }

  // بدء اللعبة
  if (text === "ابدا") {
    try {
      const { data } = await axios.post(`${api_obito}/akinator_start`);
      if (!data.session || !data.signature) return m.reply("فشل بدء الجلسة.");

      conn.aki[sessionKey] = {
        session: data.session,
        signature: data.signature,
        step: 0,
        progression: 0,
      };

      return sendQuestion(m.chat, data.question, data.akitude_url || null, m);
    } catch (err) {
      console.error(err);
      return m.reply("حدث خطأ أثناء بدء اللعبة");
    }
  }

  // حذف الجلسة
  if (text === "حذف") {
    if (!session) return m.reply("لا توجد جلسة نشطة");
    delete conn.aki[sessionKey];
    return m.reply("تم حذف الجلسة بنجاح");
  }

  // الرجوع
  if (text === "رجوع") {
    if (!session) return m.reply("لا توجد جلسة نشطة");
    try {
      const { data } = await axios.post(`${api_obito}/akinator_back`, {
        session: session.session,
        signature: session.signature,
        step: session.step,
        progression: session.progression,
        cm: "false",
      });

      conn.aki[sessionKey].step = data.step;
      conn.aki[sessionKey].progression = data.progression;

      return sendQuestion(m.chat, data.question, data.akitude_url || null, m);
    } catch (err) {
      console.error(err);
      return m.reply("لا يمكن الرجوع حالياً");
    }
  }

  // الإجابات
  const answers = { "نعم": 0, "لا": 1, "لا أعرف": 2, "ربما": 3, "ربما لا": 4 };
  if (answers.hasOwnProperty(text)) {
    if (!session) return m.reply("لا توجد جلسه نشطه حاليا،ابدأ جلسه عبر .مارد ابدا");

    try {
      const { data } = await axios.post(`${api_obito}/akinator_answer`, {
        session: session.session,
        signature: session.signature,
        step: session.step,
        progression: session.progression,
        answer: answers[text],
        cm: "false",
        sid: "NaN",
        question_filter: "string",
      });

      if (data.name_proposition) {
        delete conn.aki[sessionKey];
        return conn.sendMessage(
          m.chat,
          {
            image: { url: data.photo },
            caption: `🧞 على ما أظن أنك تفكر بـ:\n${data.name_proposition}\n${data.description_proposition || "بدون وصف"}`,
          },
          { quoted: m }
        );
      }

      conn.aki[sessionKey].step = data.step;
      conn.aki[sessionKey].progression = data.progression;

      return sendQuestion(m.chat, data.question, data.akitude_url || null, m);
    } catch (err) {
      console.error(err);
      return m.reply("حدث خطأ أثناء الإجابة");
    }
  }

  // الدالة الخاصة بإرسال السؤال مع الأزرار
  async function sendQuestion(jid, question, imgUrl, quoted) {
    try {
      const buttons = [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☽✰ ¦ نـعـم 🐤 ¦ ✰☾", id: ".مارد نعم" }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☽✰ ¦ لا 🐤 ¦ ✰☾", id: ".مارد لا" }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☽✰ ¦ مـش عـارف 🐤 ¦ ✰☾", id: ".مارد لا أعرف" }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☽✰ ¦ ربـمـا 🐤 ¦ ✰☾", id: ".مارد ربما" }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☽✰ ¦ لا ربـمـا 🐤 ¦ ✰☾", id: ".مارد ربما لا" }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☽✰ ¦ رجَـوع خـطـوه 🐤 ¦ ✰☾", id: ".مارد رجوع" }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☽✰ ¦ الـغـاء الـعـبة 🐤 ¦ ✰☾", id: ".مارد حذف" }) },
      ];

      const media = imgUrl
        ? await prepareWAMessageMedia({ image: { url: imgUrl } }, { upload: conn.waUploadToServer })
        : null;

      const msg = generateWAMessageFromContent(
        jid,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: proto.Message.InteractiveMessage.create({
                body: proto.Message.InteractiveMessage.Body.create({
                  text: `*𝙰𝚁𝚃𝙷𝚄𝚁 يـقـول🐤:\n${question}*`,
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: "جـاري الـتـخـمـين....🔥",
                }),
                header: proto.Message.InteractiveMessage.Header.create({
                  ...(media ? { hasMediaAttachment: true, ...media } : { hasMediaAttachment: false }),
                  title: "لـعـبه الـمـارد 𝙰𝚁𝚃𝙷𝚄𝚁",
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons,
                }),
              }),
            },
          },
        },
        {}
      );

      return await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    } catch (e) {
      console.error(e);
      return conn.sendMessage(jid, { text: question }, { quoted });
    }
  }
};

handler.command = /^مارد$/i;
export default handler;