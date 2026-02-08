import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    // 🏦 جلب البيانات من GitHub
    let { data } = await axios.get('https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/anime-kaori.json')

    if (!Array.isArray(data) || data.length === 0)
      return conn.reply(m.chat, '🏦 ⇦ ≺تعذر العثور على صور كــاوري حاليا😔≻', m)

    // ❄️ اختيار صورة عشوائية
    let url = data[Math.floor(Math.random() * data.length)]

    // ❄️ إرسال الصورة مع زر “التالي”
    await conn.sendButton(
      m.chat,
      `🐉 ⇦ ≺كـــاوري 🤗≻`,
      author,
      url,
      [
        ['الـي بـعـدو يـا  𝙰𝚁𝚃𝙷𝚄𝚁', `${usedPrefix + command}`]
      ],
      m
    )

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '🏦 ⇦ ≺حدث خطأ أثناء تحميل صورة كـــاوري، حاول لاحقًا≻', m)
  }
}

handler.help = ['kaori', 'كاوري']
handler.tags = ['anime']
handler.command = /^(kaori|كاوري)$/i

export default handler