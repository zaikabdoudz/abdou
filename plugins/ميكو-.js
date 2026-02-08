import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    // اجلب البيانات من ملف الميكو
    let res = await axios.get('https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/anime-miku.json')
    let list = res.data
    if (!Array.isArray(list) || list.length === 0) throw '❌ لا توجد صور متاحة حاليًا.'

    // اختر صورة عشوائية
    let url = list[Math.floor(Math.random() * list.length)]

    // أرسل الصورة مع الزر
    await conn.sendButton(
      m.chat,
      `🥷 ⇦ ≺مــيــكــو 🌚≻`,
      author || '',
      url,
      [['الـجـايه يـا 𝙰𝚁𝚃𝙷𝚄𝚁 🔥', `${usedPrefix + command}`]],
      m
    )

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '❌ ⇦ ≺حدث خطأ أثناء جلب الصورة، حاول مجددًا لاحقًا≻', m)
  }
}

handler.help = ['miku']
handler.tags = ['anime']
handler.command = /^(miku|ميكو)$/i

export default handler