// plugins/cute.js
import fs from 'fs';
import fetch from 'node-fetch';

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

let handler = async (m, { conn, command }) => {
  let file = './data/pinimg.txt';

  if (!fs.existsSync(file)) 
    return conn.reply(m.chat, '⚠️ ملف الروابط غير موجود: data/pinimg.txt', m);

  // قراءة جميع الروابط
  let lines = fs.readFileSync(file, 'utf-8')
    .split('\n')
    .map(v => v.trim())
    .filter(v => v);

  if (lines.length === 0)
    return conn.reply(m.chat, '⚠️ لا يوجد أي رابط داخل pinimg.txt', m);

  // رابط عشوائي
  const original = pickRandom(lines);

  // تحويل الرابط عبر API يتخطى التايم اوت
  const url = `https://images.weserv.nl/?url=${encodeURIComponent(original)}`;

  try {
    let res = await fetch(url, { timeout: 15000 });
    if (!res.ok) throw new Error('فشل تحميل الرابط');
    let buffer = await res.arrayBuffer();

    // إرسال الصورة + زر التالي
    await conn.sendMessage(
      m.chat,
      {
        image: Buffer.from(buffer),
        caption: '*Nyaww~ 🐾💗*',
        buttons: [
          {
            buttonId: `/${command}`,
            buttonText: { displayText: 'التالي 🆕' },
            type: 1,
          }
        ]
      },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, '⚠️ حدث خطأ أثناء جلب الصورة', m);
  }
};

handler.command = /^(كيوت)$/i;
handler.tags = ['anime'];
handler.help = ['كيوت'];

export default handler;