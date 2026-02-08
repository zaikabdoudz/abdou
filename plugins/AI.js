import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {

  if (!text) {
    return conn.reply(
      m.chat,
      `هٓـات مـقـوله يـا اوتـشـيهـا 🥷 ${m.mentionedJid?.length ? "@" + m.mentionedJid[0].split("@")[0] : ""}`,
      m,
      { mentions: m.mentionedJid }
    );
  }

  try {
    let textLower = text.toLowerCase();
    let prompt = "";

    if (textLower.includes("لوفي") || textLower.includes("مادارا") || textLower.includes("ساسكي") || textLower.includes("ناروتو")) {
      prompt = `أجب كشخصية إيتاتشي أوتشيها من أنمي ناروتو، بالعربية الفصحى مع بعض التشكيل. 
يجب أن توحي بالقوة والغموض، ورد بأن إيتاتشي أقوى من ${text}. 
استخدم نبرة الحكمة والهدوء والهيبة.`;
    } else {
      prompt = `أجب كشخصية إيتاتشي أوتشيها من أنمي ناروتو، بالعربية الفصحى المشكّلة. 
كن غامضًا، حكيمًا، وتحدث كنينجا يفهم عمق الألم. 
السؤال هو: ${text}`;
    }

    const apiUrl = "https://alakreb.vercel.app/api/ai/gpt?q=";
    const response = await fetch(apiUrl + encodeURIComponent(prompt));
    const data = await response.json();

    if (!data.message) throw new Error("no_response");

    const reply = `مـرًحـبا بـك وسـط عـشـيـره الاوتـشـيـها 🥷 مـعـك ايَـتـاتـشْـي شـخـصـيـا 🥷
╮ ⊰✫⊱─⊰✫⊱─⊰✫⊱╭
${data.message}
┘⊰✫⊱─⊰✫⊱─⊰✫⊱└`;

    await conn.reply(m.chat, reply, m);

  } catch (e) {
    await conn.reply(m.chat, "🥷 حَدَثَ خَطَأ فِي الـرّد، أَعِدِ المُحَاوَلَة بَعدَ قَلِيل.", m);
  }
};

handler.help = ["ايتاتشي"];
handler.tags = ["ai"];
handler.command = ["ايتاتشي"];

export default handler;